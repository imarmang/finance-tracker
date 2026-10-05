import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FinanceStore } from '../core/finance.store';
import { TxView } from '../core/finance';
import { money, shortDate } from '../core/format';

@Component({
  selector: 'app-tx-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="tx"
      type="button"
      [attr.aria-label]="'Edit ' + tx().title + ' ' + money(tx().amount)"
      (click)="edit()"
    >
      <span class="d">{{ shortDate(tx().date) }}</span>
      <span class="v">
        {{ tx().title }}
        <span class="c" [attr.data-date]="shortDate(tx().date)">{{ tx().sub }}</span>
      </span>
      <span class="cd">{{ tx().card }}</span>
      <span class="p">{{ tx().pts }}</span>
      <span class="a" [class.in]="tx().isIncome"
        >{{ tx().isIncome ? '+' : '' }}{{ money(tx().amount) }}</span
      >
    </button>
  `,
})
export class TxRow {
  private readonly store = inject(FinanceStore);

  readonly tx = input.required<TxView>();

  protected readonly money = money;
  protected readonly shortDate = shortDate;

  protected edit(): void {
    this.store.openDrawer(this.tx().kind, this.tx().id);
  }
}
