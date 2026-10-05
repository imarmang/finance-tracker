import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Dashboard } from './dashboard';
import { FinanceStore } from '../../core/finance.store';
import { TODAY } from '../../core/format';

describe('Dashboard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows the empty state when nothing is recorded', () => {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.card.empty')).toBeTruthy();
    expect(el.querySelector('.hero')).toBeFalsy();
  });

  it('renders the hero, charts and budget once a month has data', () => {
    const store = TestBed.inject(FinanceStore);
    store.saveExpense(
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
    store.saveIncome(
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
