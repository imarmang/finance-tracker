export type CategoryGroup = 'fixed' | 'variable';

export interface Category {
  name: string;
  group: CategoryGroup;
}

export interface Card {
  name: string;
  /** Points per dollar for purchases that have no bonus rule. */
  def: number;
  /** Bonus multipliers keyed by category name. */
  rules: Record<string, number>;
}

export interface Expense {
  id: number;
  date: string;
  vendor: string;
  category: string;
  amount: number;
  card: string;
  mult: number;
  note: string;
}

export interface Income {
  id: number;
  date: string;
  source: string;
  gross: number;
  fed: number;
  ss: number;
  medicare: number;
  stateTax: number;
  sdi: number;
  note: string;
}

export type ExpenseInput = Omit<Expense, 'id'>;
export type IncomeInput = Omit<Income, 'id'>;
export type EntryType = 'expense' | 'income';
export type TypeFilter = 'all' | EntryType;

export interface Filters {
  q: string;
  type: TypeFilter;
  cat: string;
  card: string;
}

export interface DrawerState {
  type: EntryType;
  /** Set when editing an existing entry, null for a new one. */
  id: number | null;
}

const CATEGORY_GROUPS = [
  ['Rent', 'fixed'],
  ['Car Payment', 'fixed'],
  ['Car Insurance', 'fixed'],
  ['Electricity', 'fixed'],
  ['Water / Sewer', 'fixed'],
  ['Renters Insurance', 'fixed'],
  ['Phone Bill', 'fixed'],
  ['Subscriptions', 'fixed'],
  ['Health Insurance', 'fixed'],
  ['Dental Insurance', 'fixed'],
  ['Vision Insurance', 'fixed'],
  ['HSA Pretax', 'fixed'],
  ['Groceries', 'variable'],
  ['Dining', 'variable'],
  ['Gas For Car', 'variable'],
  ['Travel', 'variable'],
  ['Shopping', 'variable'],
  ['Drug Store', 'variable'],
  ['House Supplies', 'variable'],
  ['Coffee', 'variable'],
  ['Miscellaneous', 'variable'],
] as const;

export const CATEGORIES: Category[] = CATEGORY_GROUPS.map(([name, group]) => ({ name, group }));

export const INCOME_SOURCES = ['Paycheck', 'Tutoring', 'Interest – HYSA', 'Other'];

export const DEFAULT_CARDS: Card[] = [
  { name: 'Chase Freedom Unlimited', def: 1.5, rules: {} },
  { name: 'Discover It', def: 1, rules: {} },
  { name: 'Apple Card', def: 1, rules: { Travel: 3 } },
  { name: 'AMEX', def: 1, rules: { Dining: 4 } },
  { name: 'Debit', def: 0, rules: {} },
  { name: 'Check', def: 0, rules: {} },
];
