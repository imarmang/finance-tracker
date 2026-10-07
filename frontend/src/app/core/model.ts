export type CategoryGroup = 'fixed' | 'variable';

export interface Category {
  name: string;
  group: CategoryGroup;
}

/** A way the user pays: credit card, debit card, checking account, cash, or other. */
export type PaymentKind = 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHECKING' | 'CASH' | 'OTHER';

export interface PaymentMethod {
  id: number;
  name: string;
  kind: PaymentKind;
  /** Points per dollar for purchases that have no bonus rule. Only credit cards earn points. */
  defaultMult: number;
  /** Bonus multipliers keyed by category name. */
  rules: Record<string, number>;
}

export type PaymentMethodInput = Omit<PaymentMethod, 'id'>;

const CATEGORY_GROUPS = [
  ['Rent', 'fixed'],
  ['Car Payment', 'fixed'],
  ['Car Insurance', 'fixed'],
  ['Electricity', 'fixed'],
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

export const PAYMENT_KINDS: { value: PaymentKind; label: string }[] = [
  { value: 'CREDIT_CARD', label: 'Credit card' },
  { value: 'DEBIT_CARD', label: 'Debit card' },
  { value: 'CHECKING', label: 'Checking account' },
  { value: 'CASH', label: 'Cash' },
  { value: 'OTHER', label: 'Other' },
];

export function kindLabel(kind: PaymentKind): string {
  return PAYMENT_KINDS.find((k) => k.value === kind)?.label ?? 'Other';
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


export const INCOME_SOURCES = ['Paycheck', 'Tutoring', 'Interest – HYSA', 'Other'];

