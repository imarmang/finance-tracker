import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FinanceStore } from '../core/finance.store';
import { yearView } from '../core/charts';
import { TooltipService } from '../core/feedback.service';
import { money, RANGE_LABEL } from '../core/format';

@Component({
  selector: 'app-year-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="legend">
      <span><i class="dot" style="background: var(--s1)"></i>Take-home income</span>
      <span><i class="dot" style="background: var(--s2)"></i>Spent</span>
    </div>

    <svg
      class="chart"
      viewBox="0 0 760 250"
      role="img"
      [attr.aria-label]="'Income and spending for each month, ' + rangeLabel"
    >
      <g class="grid">
        @for (g of view().grid; track g.y) {
          <line x1="44" x2="752" [attr.y1]="g.y" [attr.y2]="g.y" stroke-width="1" />
          <text x="36" [attr.y]="g.y + 4" text-anchor="end">{{ g.label }}</text>
        }
      </g>
      <line class="base" x1="44" x2="752" y1="222" y2="222" stroke-width="1" />
      @for (b of view().bars; track b.key) {
        @if (b.selected) {
          <rect
            class="sel"
            [attr.x]="b.hitX + 2"
            y="12"
            [attr.width]="b.hitW - 4"
            height="210"
            rx="6"
          />
        }
        @if (b.netPath) {
          <path [attr.d]="b.netPath" fill="var(--s1)" />
        }
        @if (b.spentPath) {
          <path [attr.d]="b.spentPath" fill="var(--s2)" />
        }
        <text
          [attr.x]="b.cx"
          y="238"
          text-anchor="middle"
          [style.fill]="b.selected ? 'var(--ink)' : null"
          [style.font-weight]="b.selected ? '600' : null"
        >
          {{ b.label }}
        </text>
        <rect
          class="hit"
          [attr.x]="b.hitX"
          y="12"
          [attr.width]="b.hitW"
          height="238"
          (pointermove)="tooltip.show(b.tip, $event)"
          (pointerleave)="tooltip.hide()"
          (click)="store.setMonth(b.key)"
        />
      }
    </svg>

    <div class="tabtoggle">
      <button
        class="link"
        type="button"
        [attr.aria-expanded]="tableOpen()"
        (click)="tableOpen.set(!tableOpen())"
      >
        {{ tableOpen() ? 'Hide table' : 'View as table' }}
      </button>
    </div>

    @if (tableOpen()) {
      <div class="scroll-x">
        <table class="tbl">
          <thead>
            <tr>
              <th>Month</th>
              <th>Net income</th>
              <th>Spent</th>
              <th>Profit</th>
              <th>Savings rate</th>
              <th>Points value</th>
            </tr>
          </thead>
          <tbody>
            @for (r of view().table; track r.key) {
              <tr>
                <td>{{ r.label }}</td>
                <td>{{ money(r.net) }}</td>
                <td>{{ money(r.spent) }}</td>
                <td>{{ money(r.profit) }}</td>
                <td>{{ r.rate }}</td>
                <td>{{ money(r.value) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class YearChart {
  protected readonly store = inject(FinanceStore);
  protected readonly tooltip = inject(TooltipService);
  protected readonly tableOpen = signal(false);
  protected readonly view = computed(() =>
    yearView(this.store.yearSummaries(), this.store.month()),
  );
  protected readonly money = money;
  protected readonly rangeLabel = RANGE_LABEL;
}
