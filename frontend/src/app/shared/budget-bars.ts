import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BudgetRow } from '../core/finance';
import { money, money0 } from '../core/format';

@Component({
  selector: 'app-budget-bars',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (row of rows(); track row.name) {
      <div class="brow">
        <span class="nm">{{ row.name }}</span>
        <div
          class="track"
          role="img"
          [attr.aria-label]="
            row.name + ': ' + money(row.actual) + (row.budget > 0 ? ' of ' + money(row.budget) : '')
          "
        >
          <i [class]="row.trackClass" [style.width.%]="row.pct"></i>
        </div>
        <span class="amt">
          {{ money(row.actual) }}
          @if (row.budget > 0) {
            <span class="faint">/ {{ money0(row.budget) }}</span>
          }
        </span>
        <span class="st" [class.over]="row.over">{{ row.status }}</span>
      </div>
    }
  `,
})
export class BudgetBars {
  readonly rows = input.required<BudgetRow[]>();

  protected readonly money = money;
  protected readonly money0 = money0;
}
