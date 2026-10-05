import { multFor, netOf, summarize } from './finance';
import { DEFAULT_CARDS, Expense, Income } from './model';

describe('finance calculations', () => {
  it('takes every deduction out of gross pay', () => {
    const pay = { gross: 1000, fed: 100, ss: 50, medicare: 10, stateTax: 20, sdi: 5 } as Income;
    expect(netOf(pay)).toBe(815);
  });

  it('uses a bonus rule when the card has one, otherwise the default', () => {
    expect(multFor(DEFAULT_CARDS, 'Apple Card', 'Travel')).toBe(3);
    expect(multFor(DEFAULT_CARDS, 'Apple Card', 'Rent')).toBe(1);
    expect(multFor(DEFAULT_CARDS, 'Unknown card', 'Rent')).toBe(0);
  });

  it('summarizes one month of expenses and income', () => {
    const expense = {
      id: 1,
      date: '2026-07-03',
      vendor: 'Target',
      category: 'Groceries',
      amount: 50,
      card: 'Discover It',
      mult: 1,
      note: '',
    } as Expense;
    const pay = {
      id: 2,
      date: '2026-07-04',
      source: 'Paycheck',
      gross: 1000,
      fed: 100,
      ss: 50,
      medicare: 10,
      stateTax: 20,
      sdi: 5,
      note: '',
    } as Income;
    const s = summarize('2026-07', [expense], [pay], 1);
    expect(s.any).toBe(true);
    expect(s.spent).toBe(50);
    expect(s.net).toBe(815);
    expect(s.profit).toBe(765);
  });
});
