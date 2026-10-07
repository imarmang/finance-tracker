import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Dashboard } from './dashboard';
import { FinanceStore } from '../../core/finance.store';
import { TODAY } from '../../core/format';
import { ExpenseApi } from '../../core/expense.api';
import { IncomeApi } from '../../core/income.api';
import { PaymentMethodApi } from '../../core/payment-method.api';
import { BudgetApi } from '../../core/budget.api';
import { ExpenseInput, IncomeInput } from '../../core/model';

/** Stands in for the backend so the store saves without a network call. */
const expenseApi = {
  list: () => Promise.resolve([]),
  create: (input: ExpenseInput) => Promise.resolve({ id: 1, ...input }),
};
const budgetApi = {
  list: () => Promise.resolve([]),
  save: () => Promise.resolve({}),
};
const paymentMethodApi = {
  list: () => Promise.resolve([]),
};
const incomeApi = {
  list: () => Promise.resolve([]),
  create: (input: IncomeInput) => Promise.resolve({ id: 2, ...input }),
};

describe('Dashboard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: ExpenseApi, useValue: expenseApi },
        { provide: IncomeApi, useValue: incomeApi },
        { provide: PaymentMethodApi, useValue: paymentMethodApi },
        { provide: BudgetApi, useValue: budgetApi },
      ],
    }).compileComponents();
  });

  it('shows the empty state when nothing is recorded', () => {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.card.empty')).toBeTruthy();
    expect(el.querySelector('.hero')).toBeFalsy();
  });

  it('renders the hero, charts and budget once a month has data', async () => {
    const store = TestBed.inject(FinanceStore);
    await store.saveExpense(
      {
        date: TODAY,
        vendor: 'Target',
        category: 'Groceries',
        amount: 50,
        card: 'Discover It',
        mult: 1,
        note: '',
      },
      null,
    );
    await store.saveIncome(
      {
        date: TODAY,
        source: 'Paycheck',
        gross: 1000,
        fed: 100,
        ss: 50,
        medicare: 10,
        stateTax: 20,
        sdi: 5,
        note: '',
      },
      null,
    );

    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.hero')).toBeTruthy();
    expect(el.querySelector('app-category-donut')).toBeTruthy();
    expect(el.querySelector('app-budget-bars')).toBeTruthy();
    expect(el.querySelectorAll('.tx').length).toBe(2);
  });
});
