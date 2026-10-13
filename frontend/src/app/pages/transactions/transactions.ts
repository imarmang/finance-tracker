import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FinanceStore } from '../../core/finance.store';
import { sum, transactionsOf } from '../../core/finance';
import { eventValue, money, monthLabel } from '../../core/format';
import { TypeFilter } from '../../core/model';
import { TxRow } from '../../shared/tx-row';

@Component({
  selector: 'app-transactions',
  imports: [TxRow],
  templateUrl: './transactions.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Transactions {
  protected readonly store = inject(FinanceStore);

  protected readonly typeOptions: ReadonlyArray<{ value: TypeFilter; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'expense', label: 'Expenses' },
    { value: 'income', label: 'Income' },
  ];

  protected readonly list = computed(() => {
    const f = this.store.filters();
    const q = f.q.trim().toLowerCase();
    return transactionsOf(this.store.summary()).filter((t) => {
      if (f.type !== 'all' && t.kind !== f.type) return false;
      if (f.cat && (t.kind !== 'expense' || t.category !== f.cat)) return false;
      if (f.card && (t.kind !== 'expense' || t.card !== f.card)) return false;
      if (q && `${t.title} ${t.note} ${t.category}`.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  });

  protected readonly footer = computed(() => {
    const list = this.list();
    const income = list.filter((t) => t.isIncome);
    const expenses = list.filter((t) => !t.isIncome);
    const parts: string[] = [];
    if (income.length) parts.push(`+${money(sum(income.map((t) => t.amount)))}`);
    if (expenses.length) parts.push(`−${money(sum(expenses.map((t) => t.amount)))}`);
    return parts.join('   ');
  });

  protected readonly money = money;
  protected readonly monthLabel = monthLabel;

  protected textOf(event: Event): string {
    return eventValue(event);
  }
}
