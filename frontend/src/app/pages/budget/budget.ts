import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FinanceStore } from '../../core/finance.store';
import { eventValue, money, money0, monthLabel, parseNumber } from '../../core/format';
import { CATEGORIES } from '../../core/model';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Budget {
  protected readonly store = inject(FinanceStore);

  protected readonly fixed = CATEGORIES.filter((c) => c.group === 'fixed');
  protected readonly variable = CATEGORIES.filter((c) => c.group === 'variable');

  /** Previous month key, used by the "Copy from" button. Null for the first month. */
  protected readonly previous = computed(() => {
    const i = this.store.months.indexOf(this.store.month());
    return i > 0 ? this.store.months[i - 1] : null;
  });

  protected readonly stillExpected = computed(() => {
    const received = this.store.summary().net;
    return Math.max(this.store.expectedForMonth() - received, 0);
  });

  protected readonly money = money;
  protected readonly money0 = money0;
  protected readonly monthLabel = monthLabel;

  protected actual(name: string): number {
    return this.store.summary().byCat[name] || 0;
  }

  protected left(name: string): number {
    return (this.store.budgetForMonth()[name] || 0) - this.actual(name);
  }

  protected hasLeftValue(name: string): boolean {
    return (this.store.budgetForMonth()[name] || 0) > 0 || this.actual(name) > 0;
  }

  protected isOver(name: string): boolean {
    return (this.store.budgetForMonth()[name] || 0) > 0 && this.left(name) < 0;
  }

  protected totalBudget(): number {
    return this.store.budgetTotal();
  }

  protected totalLeft(): number {
    return this.store.budgetTotal() - this.store.summary().spent;
  }

  protected numberOf(event: Event): number {
    return parseNumber(eventValue(event));
  }
}
