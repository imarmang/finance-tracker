import { Category, CategoryGroup, Expense, Income, PaymentMethod } from './model';
import { money, r2 } from './format';

export function sum(values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}

/** Take-home pay after taxes and deductions. */
export function netOf(income: Income): number {
  return r2(income.gross - income.fed - income.ss - income.medicare - income.stateTax - income.sdi);
}

/** Multiplier a card gives for a category: a bonus rule if one exists, otherwise the card's default. */
export function multFor(cards: PaymentMethod[], cardName: string, category: string): number {
  const card = cards.find((c) => c.name === cardName);
  if (!card) return 0;
  const rule = card.rules[category];
  return rule !== undefined ? rule : card.defaultMult;
}

export interface CardTotals {
  spent: number;
  pts: number;
}

export interface MonthSummary {
  key: string;
  expenses: Expense[];
  income: Income[];
  spent: number;
  net: number;
  gross: number;
  tax: number;
  profit: number;
  /** Savings rate as a fraction of take-home pay, or null when there is no income. */
  rate: number | null;
  pts: number;
  value: number;
  byCat: Record<string, number>;
  byCard: Record<string, CardTotals>;
  any: boolean;
}

export function summarize(
  key: string,
  expenses: Expense[],
  income: Income[],
  cpp: number,
): MonthSummary {
  const ex = expenses.filter((e) => e.date.slice(0, 7) === key);
  const inc = income.filter((i) => i.date.slice(0, 7) === key);
  const spent = sum(ex.map((e) => e.amount));
  const net = sum(inc.map(netOf));
  const pts = sum(ex.map((e) => e.amount * e.mult));

  const byCat: Record<string, number> = {};
  const byCard: Record<string, CardTotals> = {};
  for (const e of ex) {
    byCat[e.category] = (byCat[e.category] ?? 0) + e.amount;
    const card = (byCard[e.card] ??= { spent: 0, pts: 0 });
    card.spent += e.amount;
    card.pts += e.amount * e.mult;
  }

  return {
    key,
    expenses: ex,
    income: inc,
    spent,
    net,
    gross: sum(inc.map((i) => i.gross)),
    tax: sum(inc.map((i) => i.gross - netOf(i))),
    profit: net - spent,
    rate: net > 0 ? (net - spent) / net : null,
    pts,
    value: (pts * cpp) / 100,
    byCat,
    byCard,
    any: ex.length + inc.length > 0,
  };
}

/** One row in the transaction list, for either an expense or an income entry. */
export interface TxView {
  kind: 'expense' | 'income';
  id: number;
  date: string;
  title: string;
  sub: string;
  card: string;
  pts: string;
  amount: number;
  isIncome: boolean;
  category: string;
  note: string;
}

export function transactionsOf(s: MonthSummary): TxView[] {
  const expenses = s.expenses.map((e): TxView => ({
    kind: 'expense',
    id: e.id,
    date: e.date,
    title: e.vendor,
    sub: e.category,
    card: e.card,
    pts: e.mult ? `${Math.round(e.amount * e.mult).toLocaleString()} pts` : '–',
    amount: e.amount,
    isIncome: false,
    category: e.category,
    note: e.note,
  }));
  const income = s.income.map((i): TxView => ({
    kind: 'income',
    id: i.id,
    date: i.date,
    title: i.source,
    sub: i.note || 'Income',
    card: i.source === 'Paycheck' ? 'Net of taxes' : '',
    pts: '',
    amount: netOf(i),
    isIncome: true,
    category: '',
    note: i.note,
  }));
  return [...expenses, ...income].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id,
  );
}

export interface BudgetRow {
  name: string;
  actual: number;
  budget: number;
  over: boolean;
  pct: number;
  status: string;
  trackClass: '' | 'over' | 'none';
}

/** Budget-vs-spent rows, busiest categories first. Only categories with a budget or spending are included. */
export function budgetRows(
  s: MonthSummary,
  budget: Record<string, number>,
  categories: Category[],
  limit?: number,
): { rows: BudgetRow[]; total: number } {
  const names = categories
    .map((c) => c.name)
    .filter((n) => (budget[n] || 0) > 0 || (s.byCat[n] || 0) > 0)
    .sort((a, b) => (s.byCat[b] || 0) - (s.byCat[a] || 0));
  const shown = limit ? names.slice(0, limit) : names;

  const rows = shown.map((name): BudgetRow => {
    const actual = s.byCat[name] || 0;
    const b = budget[name] || 0;
    const over = b > 0 && actual > b + 0.004;
    const pct = b > 0 ? Math.min(actual / b, 1) * 100 : actual > 0 ? 100 : 0;
    const status =
      b <= 0
        ? 'No budget set'
        : over
          ? `▲ Over by ${money(actual - b)}`
          : actual === 0
            ? 'Nothing yet'
            : `${money(b - actual)} left`;
    return {
      name,
      actual,
      budget: b,
      over,
      pct,
      status,
      trackClass: b <= 0 ? 'none' : over ? 'over' : '',
    };
  });

  return { rows, total: names.length };
}

export interface TaxLine {
  name: string;
  amount: number;
}

export interface SpendLine {
  name: string;
  group: CategoryGroup;
  amount: number;
}

/**
 * Where one month's gross pay went. Every amount is a dollar figure; the view turns them into
 * shares of `base`, which is gross pay (or total money in when there is no income).
 */
export interface Breakdown {
  gross: number;
  taxes: TaxLine[];
  taxTotal: number;
  net: number;
  spent: number;
  /** Take-home minus spending. Negative when the month was overspent. */
  kept: number;
  /** Denominator for every share: gross pay, or spent + taxes when that is larger (overspent months). */
  base: number;
  spending: SpendLine[];
}

const TAX_LINES: { name: string; field: keyof Pick<Income, 'fed' | 'ss' | 'medicare' | 'stateTax' | 'sdi'> }[] = [
  { name: 'Federal income tax', field: 'fed' },
  { name: 'Social Security', field: 'ss' },
  { name: 'Medicare', field: 'medicare' },
  { name: 'State tax', field: 'stateTax' },
  { name: 'SDI', field: 'sdi' },
];

/** Splits a month's pay into taxes, spending by category, and what was kept. Largest spending first. */
export function breakdownOf(s: MonthSummary, categories: Category[]): Breakdown {
  const taxes = TAX_LINES.map(({ name, field }) => ({
    name,
    amount: r2(sum(s.income.map((i) => i[field]))),
  })).filter((t) => t.amount > 0);
  const taxTotal = r2(sum(taxes.map((t) => t.amount)));
  const groups = new Map(categories.map((c) => [c.name, c.group]));
  const spending = Object.entries(s.byCat)
    .filter(([, amount]) => amount > 0)
    .map(([name, amount]) => ({ name, group: groups.get(name) ?? 'variable', amount: r2(amount) }))
    .sort((a, b) => b.amount - a.amount);
  const kept = r2(s.net - s.spent);
  return {
    gross: s.gross,
    taxes,
    taxTotal,
    net: s.net,
    spent: s.spent,
    kept,
    base: Math.max(s.gross, taxTotal + s.spent),
    spending,
  };
}
