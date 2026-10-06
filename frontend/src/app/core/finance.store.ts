import { computed, inject, Injectable, signal } from '@angular/core';
import {
  CATEGORIES,
  Card,
  DEFAULT_CARDS,
  DrawerState,
  EntryType,
  Expense,
  ExpenseInput,
  Filters,
  Income,
  IncomeInput,
} from './model';
import { daysIn, MONTHS, pad, TODAY, TODAY_MONTH } from './format';
import { multFor, summarize } from './finance';
import { ExpenseApi } from './expense.api';
import { ToastService } from './feedback.service';

/**
 * Holds every piece of app state. Expenses are loaded from and saved to the backend;
 * income, cards and budgets live in memory only, so a page reload clears them.
 */
@Injectable({ providedIn: 'root' })
export class FinanceStore {
  private readonly api = inject(ExpenseApi);
  private readonly toast = inject(ToastService);
  private nextId = 1;

  readonly categories = CATEGORIES;
  readonly months = MONTHS;

  readonly cards = signal<Card[]>(DEFAULT_CARDS);
  readonly expenses = signal<Expense[]>([]);
  readonly income = signal<Income[]>([]);
  readonly budgets = signal<Record<string, Record<string, number>>>({});
  readonly expected = signal<Record<string, number>>({});
  readonly cpp = signal(1);
  readonly month = signal(TODAY_MONTH);
  readonly filters = signal<Filters>({ q: '', type: 'all', cat: '', card: '' });
  readonly drawer = signal<DrawerState | null>(null);

  readonly summary = computed(() =>
    summarize(this.month(), this.expenses(), this.income(), this.cpp()),
  );
  readonly yearSummaries = computed(() =>
    MONTHS.map((key) => summarize(key, this.expenses(), this.income(), this.cpp())),
  );
  readonly vendors = computed(() => [...new Set(this.expenses().map((e) => e.vendor))].sort());
  readonly budgetForMonth = computed(() => this.budgets()[this.month()] ?? {});
  readonly budgetTotal = computed(() =>
    Object.values(this.budgetForMonth()).reduce((t, v) => t + v, 0),
  );
  readonly expectedForMonth = computed(() => this.expected()[this.month()] ?? 0);

  multFor(cardName: string, category: string): number {
    return multFor(this.cards(), cardName, category);
  }

  /** The most recent purchase at a vendor, used to pre-fill the form. */
  lastPurchaseFrom(vendor: string): Expense | undefined {
    const name = vendor.trim().toLowerCase();
    if (!name) return undefined;
    return this.expenses()
      .filter((e) => e.vendor.toLowerCase() === name)
      .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  }

  /** Date a new entry starts on: today in the current month, otherwise the last day of the month shown. */
  defaultDate(): string {
    const month = this.month();
    return month === TODAY_MONTH ? TODAY : `${month}-${pad(daysIn(month))}`;
  }

  /** Latest date a transaction can have: today, or the last day of the month being viewed if that is earlier. */
  readonly maxDate = computed(() => {
    const monthEnd = `${this.month()}-${pad(daysIn(this.month()))}`;
    return monthEnd < TODAY ? monthEnd : TODAY;
  });

  setMonth(key: string): void {
    this.month.set(key);
  }

  shiftMonth(step: number): void {
    const i = MONTHS.indexOf(this.month()) + step;
    if (i >= 0 && i < MONTHS.length) this.month.set(MONTHS[i]);
  }

  openDrawer(type: EntryType = 'expense', id: number | null = null): void {
    this.drawer.set({ type, id });
  }

  closeDrawer(): void {
    this.drawer.set(null);
  }

  /** Fetches every expense from the backend. Shows a toast if the request fails. */
  async loadExpenses(): Promise<void> {
    try {
      this.expenses.set(await this.api.list());
    } catch {
      this.toast.show('Could not load transactions. Check that the backend is running.');
    }
  }

  async saveExpense(input: ExpenseInput, id: number | null): Promise<Expense> {
    if (id !== null) {
      const updated = await this.api.update(id, input);
      this.expenses.update((list) => list.map((e) => (e.id === id ? updated : e)));
      return updated;
    }
    const created = await this.api.create(input);
    this.expenses.update((list) => [...list, created]);
    return created;
  }

  async removeExpense(id: number): Promise<Expense | undefined> {
    const removed = this.expenses().find((e) => e.id === id);
    await this.api.remove(id);
    this.expenses.update((list) => list.filter((e) => e.id !== id));
    return removed;
  }

  /** Re-creates a deleted expense. The backend assigns it a new id. */
  async restoreExpense(expense: Expense): Promise<void> {
    const { id: _id, ...input } = expense;
    const created = await this.api.create(input);
    this.expenses.update((list) => [...list, created]);
  }

  saveIncome(input: IncomeInput, id: number | null): Income {
    if (id !== null) {
      const updated: Income = { ...input, id };
      this.income.update((list) => list.map((i) => (i.id === id ? updated : i)));
      return updated;
    }
    const created: Income = { ...input, id: this.nextId++ };
    this.income.update((list) => [...list, created]);
    return created;
  }

  removeIncome(id: number): Income | undefined {
    const removed = this.income().find((i) => i.id === id);
    this.income.update((list) => list.filter((i) => i.id !== id));
    return removed;
  }

  restoreIncome(income: Income): void {
    this.income.update((list) => [...list, income]);
  }

  setFilters(patch: Partial<Filters>): void {
    this.filters.update((f) => ({ ...f, ...patch }));
  }

  setBudget(category: string, amount: number): void {
    const key = this.month();
    this.budgets.update((all) => ({ ...all, [key]: { ...(all[key] ?? {}), [category]: amount } }));
  }

  copyBudgetFromPrevious(): void {
    const i = MONTHS.indexOf(this.month());
    if (i <= 0) return;
    const key = this.month();
    const prev = MONTHS[i - 1];
    this.budgets.update((all) => ({ ...all, [key]: { ...(all[prev] ?? {}) } }));
    this.expected.update((all) => ({ ...all, [key]: all[prev] ?? 0 }));
  }

  setExpected(amount: number): void {
    const key = this.month();
    this.expected.update((all) => ({ ...all, [key]: amount }));
  }

  setCpp(value: number): void {
    this.cpp.set(value);
  }

  setCardDefault(index: number, value: number): void {
    this.updateCard(index, (c) => ({ ...c, def: value }));
  }

  setCardRule(index: number, category: string, value: number): void {
    this.updateCard(index, (c) => ({ ...c, rules: { ...c.rules, [category]: value } }));
  }

  /** Moves a bonus to another category. Does nothing if that category already has a bonus. */
  renameCardRule(index: number, from: string, to: string): void {
    this.updateCard(index, (c) => {
      if (c.rules[to] !== undefined) return c;
      const rules = { ...c.rules };
      rules[to] = rules[from];
      delete rules[from];
      return { ...c, rules };
    });
  }

  removeCardRule(index: number, category: string): void {
    this.updateCard(index, (c) => {
      const rules = { ...c.rules };
      delete rules[category];
      return { ...c, rules };
    });
  }

  addCardRule(index: number): void {
    const card = this.cards()[index];
    const free = this.categories.find((k) => card.rules[k.name] === undefined);
    if (!free) return;
    this.setCardRule(index, free.name, Math.max(card.def, 1) + 1);
  }

  /** Adds a card with no bonus categories. Returns false if the name is empty or already used. */
  addCard(name: string, def: number): boolean {
    const trimmed = name.trim();
    if (!trimmed || this.cards().some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      return false;
    }
    this.cards.update((list) => [...list, { name: trimmed, def, rules: {} }]);
    return true;
  }

  removeCard(index: number): Card {
    const removed = this.cards()[index];
    this.cards.update((list) => list.filter((_, i) => i !== index));
    return removed;
  }

  /** Puts a removed card back at the position it had. */
  restoreCard(index: number, card: Card): void {
    this.cards.update((list) => [...list.slice(0, index), card, ...list.slice(index)]);
  }

  private updateCard(index: number, change: (card: Card) => Card): void {
    this.cards.update((list) => list.map((c, i) => (i === index ? change(c) : c)));
  }
}
