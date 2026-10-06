import { breakdownOf, multFor, netOf, summarize } from './finance';
import { CATEGORIES, DEFAULT_CARDS, Expense, Income } from './model';

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

  it('splits a month into each tax, each spending category, and what was kept', () => {
    const expenses = [
      { id: 1, date: '2026-07-03', vendor: 'Landlord', category: 'Rent', amount: 400, card: 'Check', mult: 0, note: '' },
      { id: 2, date: '2026-07-05', vendor: 'Target', category: 'Groceries', amount: 100, card: 'Discover It', mult: 1, note: '' },
      { id: 3, date: '2026-07-09', vendor: 'Shell', category: 'Gas For Car', amount: 50, card: 'Debit', mult: 0, note: '' },
    ] as Expense[];
    const income = [
      { id: 4, date: '2026-07-04', source: 'Paycheck', gross: 1000, fed: 100, ss: 50, medicare: 10, stateTax: 20, sdi: 5, note: '' },
    ] as Income[];
    const b = breakdownOf(summarize('2026-07', expenses, income, 1), CATEGORIES);

    expect(b.taxes.map((t) => t.name)).toEqual(['Federal income tax', 'Social Security', 'Medicare', 'State tax', 'SDI']);
    expect(b.taxTotal).toBe(185);
    expect(b.net).toBe(815);
    expect(b.spent).toBe(550);
    expect(b.kept).toBe(265);
    expect(b.base).toBe(1000);
    expect(b.spending.map((c) => c.name)).toEqual(['Rent', 'Groceries', 'Gas For Car']);
    expect(b.spending[0].group).toBe('fixed');
    expect(b.spending[1].group).toBe('variable');
  });

  it('leaves out zero taxes and reports an overspent month against spent plus taxes', () => {
    const expenses = [
      { id: 1, date: '2026-07-03', vendor: 'Landlord', category: 'Rent', amount: 1200, card: 'Check', mult: 0, note: '' },
    ] as Expense[];
    const income = [{ id: 2, date: '2026-07-04', source: 'Paycheck', gross: 1000, fed: 100, ss: 0, medicare: 0, stateTax: 0, sdi: 0, note: '' }] as Income[];
    const b = breakdownOf(summarize('2026-07', expenses, income, 1), CATEGORIES);

    expect(b.taxes.map((t) => t.name)).toEqual(['Federal income tax']);
    expect(b.kept).toBe(-300);
    expect(b.base).toBe(1300);
  });
});
