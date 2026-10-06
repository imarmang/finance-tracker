import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FinanceStore } from '../core/finance.store';
import { netOf } from '../core/finance';
import { money, monthLabel, points, r2, TODAY, YESTERDAY } from '../core/format';
import {
  CATEGORIES,
  DrawerState,
  EntryType,
  ExpenseInput,
  INCOME_SOURCES,
  IncomeInput,
} from '../core/model';
import { ToastService } from '../core/feedback.service';

/** Smallest amount an expense can be; the amount must be more than this. */
const MIN_EXPENSE_AMOUNT = 0.25;

/** Rejects amounts that are not above the minimum. Empty is left to Validators.required. */
function amountAboveMinimum(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value === null || value === '') return null;
  return Number(value) > MIN_EXPENSE_AMOUNT ? null : { amountTooLow: true };
}

@Component({
  selector: 'app-transaction-drawer',
  imports: [ReactiveFormsModule],
  templateUrl: './transaction-drawer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionDrawer {
  private readonly store = inject(FinanceStore);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly variable = CATEGORIES.filter((c) => c.group === 'variable');
  protected readonly bills = CATEGORIES.filter((c) => c.group === 'fixed');
  protected readonly sources = INCOME_SOURCES;
  protected readonly TODAY = TODAY;
  protected readonly YESTERDAY = YESTERDAY;
  protected readonly money = money;

  protected readonly open = computed(() => this.store.drawer() !== null);
  protected readonly type = computed<EntryType>(() => this.store.drawer()?.type ?? 'expense');
  protected readonly editing = computed(() => (this.store.drawer()?.id ?? null) !== null);
  protected readonly title = computed(() =>
    this.editing() ? 'Edit transaction' : 'Add transaction',
  );

  protected readonly submitted = signal(false);
  protected readonly deleteArmed = signal(false);
  protected readonly saving = signal(false);
  protected readonly vendorHint = signal<string | null>(null);

  private editId: number | null = null;
  /** Once the user edits the multiplier by hand, changing card or category no longer overwrites it. */
  private multTouched = false;

  protected readonly expenseForm = this.fb.group({
    amount: this.fb.control<string | null>(null, [Validators.required, amountAboveMinimum]),
    date: this.fb.control<string | null>(TODAY, Validators.required),
    vendor: this.fb.control<string | null>('', [
      Validators.required,
      Validators.maxLength(100),
      Validators.pattern(/\S/),
    ]),
    category: this.fb.control<string | null>(null, Validators.required),
    card: this.fb.control<string | null>(null, Validators.required),
    mult: this.fb.control<number | null>(1, [Validators.required, Validators.min(0)]),
    note: this.fb.control<string | null>('', Validators.maxLength(200)),
  });

  protected readonly incomeForm = this.fb.group({
    source: this.fb.control<string | null>('Paycheck', Validators.required),
    gross: this.fb.control<string | null>(null, [Validators.required, amountAboveMinimum]),
    fed: this.fb.control<number | null>(null, Validators.min(0)),
    ss: this.fb.control<number | null>(null, Validators.min(0)),
    medicare: this.fb.control<number | null>(null, Validators.min(0)),
    stateTax: this.fb.control<number | null>(null, Validators.min(0)),
    sdi: this.fb.control<number | null>(null, Validators.min(0)),
    date: this.fb.control<string | null>(TODAY, Validators.required),
    note: this.fb.control<string | null>('', Validators.maxLength(200)),
  });

  private readonly expenseValue = toSignal(this.expenseForm.valueChanges, {
    initialValue: this.expenseForm.getRawValue(),
  });
  private readonly incomeValue = toSignal(this.incomeForm.valueChanges, {
    initialValue: this.incomeForm.getRawValue(),
  });

  protected readonly preview = computed(() => {
    const v = this.expenseValue();
    const amount = Number(v.amount) || 0;
    const mult = v.mult ?? 0;
    if (mult === 0) return 'No points on this card.';
    if (amount > 0) {
      return `Earns ${points(amount * mult)} points, worth about ${money((amount * mult * this.store.cpp()) / 100)}.`;
    }
    return `Earns ${mult}× points on this purchase.`;
  });

  protected readonly billSelected = computed(() => {
    const category = this.expenseValue().category;
    return this.bills.some((b) => b.name === category);
  });

  protected readonly isPaycheck = computed(() => this.incomeValue().source === 'Paycheck');

  protected readonly taxes = computed(() => {
    const v = this.incomeValue();
    return (v.fed ?? 0) + (v.ss ?? 0) + (v.medicare ?? 0) + (v.stateTax ?? 0) + (v.sdi ?? 0);
  });

  protected readonly taxesTooHigh = computed(
    () => this.taxes() > (Number(this.incomeValue().gross) || 0),
  );

  protected readonly takeHome = computed(() =>
    money((Number(this.incomeValue().gross) || 0) - this.taxes()),
  );

  constructor() {
    effect(() => {
      const drawer = this.store.drawer();
      if (drawer) untracked(() => this.load(drawer));
    });

    const ex = this.expenseForm.controls;
    ex.category.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.autoMult());
    ex.card.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.autoMult());
    ex.vendor.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.fillFromLastPurchase());
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.store.closeDrawer();
  }

  protected invalid(control: AbstractControl): boolean {
    return control.invalid && (this.submitted() || control.touched);
  }

  /** Keeps only digits and one decimal point, with at most two decimal places. */
  protected onAmountInput(event: Event, control: AbstractControl): void {
    const input = event.target as HTMLInputElement;
    const [whole, ...decimals] = input.value.replace(/[^\d.]/g, '').split('.');
    const value = decimals.length ? `${whole}.${decimals.join('').slice(0, 2)}` : whole;
    input.value = value;
    control.setValue(value);
  }

  protected setType(type: EntryType): void {
    if (this.editing() || this.type() === type) return;
    this.store.openDrawer(type, null);
  }

  protected markMultTouched(): void {
    this.multTouched = true;
  }

  protected save(again: boolean): void {
    this.submitted.set(true);
    if (this.type() === 'expense') {
      void this.saveExpense(again);
    } else {
      this.saveIncome();
    }
  }

  protected async deleteEntry(): Promise<void> {
    if (!this.deleteArmed()) {
      this.deleteArmed.set(true);
      setTimeout(() => this.deleteArmed.set(false), 3000);
      return;
    }
    const id = this.editId;
    if (id === null) return;

    if (this.type() === 'expense') {
      const removed = await this.attempt(
        () => this.store.removeExpense(id),
        'Could not delete the transaction. Try again.',
      );
      if (!removed) return;
      this.store.closeDrawer();
      this.toast.show(
        'Transaction deleted',
        'Undo',
        this.undoable(() => this.store.restoreExpense(removed)),
      );
    } else {
      const removed = this.store.removeIncome(id);
      this.store.closeDrawer();
      if (removed)
        this.toast.show('Transaction deleted', 'Undo', () => this.store.restoreIncome(removed));
    }
  }

  private load(drawer: DrawerState, keep?: { card: string | null; date: string }): void {
    this.submitted.set(false);
    this.deleteArmed.set(false);
    this.vendorHint.set(null);
    this.editId = drawer.id;
    this.multTouched = drawer.id !== null;

    if (drawer.type === 'expense') {
      const e =
        drawer.id !== null ? this.store.expenses().find((x) => x.id === drawer.id) : undefined;
      const card = e?.card ?? keep?.card ?? this.store.cards()[0]?.name ?? null;
      this.expenseForm.reset({
        amount: e ? String(e.amount) : null,
        date: e?.date ?? keep?.date ?? this.store.defaultDate(),
        vendor: e?.vendor ?? '',
        category: e?.category ?? null,
        card,
        mult: e ? e.mult : this.store.multFor(card ?? '', ''),
        note: e?.note ?? '',
      });
    } else {
      const i =
        drawer.id !== null ? this.store.income().find((x) => x.id === drawer.id) : undefined;
      this.incomeForm.reset({
        source: i?.source ?? 'Paycheck',
        gross: i ? String(i.gross) : null,
        fed: i?.fed ?? null,
        ss: i?.ss ?? null,
        medicare: i?.medicare ?? null,
        stateTax: i?.stateTax ?? null,
        sdi: i?.sdi ?? null,
        date: i?.date ?? this.store.defaultDate(),
        note: i?.note ?? '',
      });
    }
  }

  /** Sets the multiplier from the chosen card and category, unless the user has typed one. */
  private autoMult(): void {
    if (this.multTouched) return;
    const { card, category } = this.expenseForm.getRawValue();
    if (card) this.expenseForm.controls.mult.setValue(this.store.multFor(card, category ?? ''));
  }

  /** Fills in category and card from the last purchase at the same vendor, if no category is picked yet. */
  private fillFromLastPurchase(): void {
    const v = this.expenseForm.getRawValue();
    const last = this.store.lastPurchaseFrom(v.vendor ?? '');
    if (last && !v.category) {
      this.expenseForm.patchValue({ category: last.category, card: last.card });
      this.vendorHint.set(
        `Filled in from your last ${last.vendor} purchase. Change anything that is different.`,
      );
    } else if (!last) {
      this.vendorHint.set(null);
    }
  }

  private async saveExpense(again: boolean): Promise<void> {
    const form = this.expenseForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    if (this.saving()) return;

    const v = form.getRawValue();
    const input: ExpenseInput = {
      date: v.date ?? '',
      vendor: (v.vendor ?? '').trim(),
      category: v.category ?? '',
      amount: r2(Number(v.amount)),
      card: v.card ?? '',
      mult: v.mult ?? 0,
      note: (v.note ?? '').trim(),
    };

    this.saving.set(true);
    const saved = await this.attempt(
      () => this.store.saveExpense(input, this.editId),
      'Could not save the transaction. Try again.',
    );
    this.saving.set(false);
    if (!saved) return;

    const isNew = this.editId === null;
    const label = isNew ? `Added ${saved.vendor} · ${money(saved.amount)}` : 'Changes saved';
    const undo = isNew ? this.undoable(() => this.store.removeExpense(saved.id)) : undefined;

    if (again && isNew) {
      this.load({ type: 'expense', id: null }, { card: saved.card, date: saved.date });
      this.toast.show(label, 'Undo', undo);
      return;
    }

    this.finish(saved.date, label, undo);
  }

  /** Runs a backend call and shows a toast with the failure message if it rejects. Resolves to undefined on failure. */
  private async attempt<T>(action: () => Promise<T>, failure: string): Promise<T | undefined> {
    try {
      return await action();
    } catch {
      this.toast.show(failure);
      return undefined;
    }
  }

  /** Wraps an Undo action so a failed request reports an error instead of failing silently. */
  private undoable(action: () => Promise<unknown>): () => void {
    return () => void this.attempt(action, 'Could not undo. Try again.');
  }

  private saveIncome(): void {
    const form = this.incomeForm;
    if (form.invalid || this.taxesTooHigh()) {
      form.markAllAsTouched();
      return;
    }
    const v = form.getRawValue();
    const input: IncomeInput = {
      date: v.date ?? '',
      source: v.source ?? 'Other',
      gross: r2(Number(v.gross)),
      fed: v.fed ?? 0,
      ss: v.ss ?? 0,
      medicare: v.medicare ?? 0,
      stateTax: v.stateTax ?? 0,
      sdi: v.sdi ?? 0,
      note: (v.note ?? '').trim(),
    };

    const saved = this.store.saveIncome(input, this.editId);
    const isNew = this.editId === null;
    const label = isNew
      ? `Added ${saved.source} · ${money(netOf(saved))} take-home`
      : 'Changes saved';
    this.finish(saved.date, label, isNew ? () => this.store.removeIncome(saved.id) : undefined);
  }

  /** Closes the drawer, moves to the saved entry's month if needed, and confirms with a toast. */
  private finish(date: string, label: string, undo?: () => unknown): void {
    const month = date.slice(0, 7);
    const other = month !== this.store.month();
    this.store.closeDrawer();
    if (other) this.store.setMonth(month);
    const message = other ? `${label} — showing ${monthLabel(month)}` : label;
    this.toast.show(message, undo ? 'Undo' : undefined, undo ? () => void undo() : undefined);
  }
}
