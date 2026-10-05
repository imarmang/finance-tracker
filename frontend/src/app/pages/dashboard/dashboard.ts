import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FinanceStore } from '../../core/finance.store';
import { budgetRows, transactionsOf } from '../../core/finance';
import { CATEGORIES } from '../../core/model';
import {
  money,
  money0,
  monthLabel,
  points,
  RANGE_LABEL,
  shortDate,
  TODAY,
  TODAY_MONTH,
} from '../../core/format';
import { BudgetBars } from '../../shared/budget-bars';
import { CategoryDonut } from '../../shared/category-donut';
import { TxRow } from '../../shared/tx-row';
import { WeeklyChart } from '../../shared/weekly-chart';
import { YearChart } from '../../shared/year-chart';

@Component({
  selector: 'app-dashboard',
  imports: [BudgetBars, CategoryDonut, TxRow, WeeklyChart, YearChart],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected readonly store = inject(FinanceStore);
  private readonly router = inject(Router);

  protected readonly hero = computed(() => {
    const s = this.store.summary();
    const neg = s.profit < 0;
    return {
      neg,
      rate: s.rate === null ? null : Math.round(s.rate * 100),
      inProgress: s.key === TODAY_MONTH,
      spentPct: s.net > 0 ? Math.min(s.spent / s.net, 1) * 100 : 100,
      kept: Math.max(s.profit, 0),
      totalBudget: this.store.budgetTotal(),
    };
  });

  protected readonly budget = computed(() =>
    budgetRows(this.store.summary(), this.store.budgetForMonth(), CATEGORIES, 9),
  );

  protected readonly billsDue = computed(() => {
    const s = this.store.summary();
    const bud = this.store.budgetForMonth();
    return CATEGORIES.filter(
      (c) => c.group === 'fixed' && (bud[c.name] || 0) > 0 && !((s.byCat[c.name] || 0) > 0),
    );
  });

  protected readonly recent = computed(() => transactionsOf(this.store.summary()).slice(0, 6));

  protected readonly money = money;
  protected readonly money0 = money0;
  protected readonly monthLabel = monthLabel;
  protected readonly shortDate = shortDate;
  protected readonly points = points;
  protected readonly TODAY = TODAY;
  protected readonly rangeLabel = RANGE_LABEL;

  protected go(path: string): void {
    this.router.navigateByUrl(`/${path}`);
  }
}
