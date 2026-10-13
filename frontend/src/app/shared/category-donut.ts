import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MonthSummary } from '../core/finance';
import { donutSlices } from '../core/charts';
import { TooltipService } from '../core/feedback.service';
import { money0 } from '../core/format';

@Component({
  selector: 'app-category-donut',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <h2>Where the money went</h2>
      <p class="sub">Top categories this month. Hover a slice for details.</p>
      <div class="donutwrap">
        <svg class="chart donut" viewBox="0 0 200 200" role="img" aria-label="Spending by category">
          @for (sl of slices(); track sl.name) {
            @if (sl.circle) {
              <circle
                cx="100"
                cy="100"
                r="71"
                fill="none"
                [attr.stroke]="sl.color"
                stroke-width="30"
                (pointermove)="tooltip.show(sl.tip, $event)"
                (pointerleave)="tooltip.hide()"
              />
            } @else {
              <path
                [attr.d]="sl.path"
                [attr.fill]="sl.color"
                stroke="var(--surface)"
                stroke-width="2"
                stroke-linejoin="round"
                (pointermove)="tooltip.show(sl.tip, $event)"
                (pointerleave)="tooltip.hide()"
              />
            }
          }
          <text class="val" x="100" y="102" text-anchor="middle" style="font-size: 19px">
            {{ money0(summary().spent) }}
          </text>
          <text x="100" y="120" text-anchor="middle">spent</text>
        </svg>
        <div class="dleg">
          @for (sl of slices(); track sl.name) {
            <div class="dl">
              <span><i class="dot" [style.background]="sl.color"></i>{{ sl.name }}</span>
              <span class="mono"
                >{{ money0(sl.amount) }} <span class="faint">{{ sl.pct }}%</span></span
              >
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class CategoryDonut {
  readonly summary = input.required<MonthSummary>();

  protected readonly tooltip = inject(TooltipService);
  protected readonly slices = computed(() => donutSlices(this.summary()));
  protected readonly money0 = money0;
}
