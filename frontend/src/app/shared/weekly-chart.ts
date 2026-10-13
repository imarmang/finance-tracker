import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MonthSummary } from '../core/finance';
import { weeklyView } from '../core/charts';
import { TooltipService } from '../core/feedback.service';

@Component({
  selector: 'app-weekly-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <h2>Spending by week</h2>
      <p class="sub">Hover a bar for the dates.</p>
      <svg
        class="chart"
        viewBox="0 0 380 196"
        role="img"
        aria-label="Spending by week of the month"
      >
        <line
          class="base"
          x1="6"
          x2="374"
          [attr.y1]="view().baseY"
          [attr.y2]="view().baseY"
          stroke-width="1"
        />
        @for (b of view().bars; track b.index) {
          @if (b.path) {
            <path
              [attr.d]="b.path"
              fill="var(--s1)"
              (pointermove)="tooltip.show(b.tip, $event)"
              (pointerleave)="tooltip.hide()"
            />
          }
          <text
            class="val"
            [attr.x]="b.cx"
            [attr.y]="b.valueY"
            text-anchor="middle"
            [style.fill]="b.value > 0 ? null : 'var(--ink-3)'"
          >
            {{ b.valueText }}
          </text>
          <text
            [attr.x]="b.cx"
            [attr.y]="view().baseY + 16"
            text-anchor="middle"
            [style.fill]="b.future ? 'var(--ink-3)' : 'var(--ink-2)'"
          >
            Week {{ b.index + 1 }}
          </text>
          <text
            [attr.x]="b.cx"
            [attr.y]="view().baseY + 30"
            text-anchor="middle"
            style="fill: var(--ink-3)"
          >
            {{ b.range }}
          </text>
        }
      </svg>
    </div>
  `,
})
export class WeeklyChart {
  readonly summary = input.required<MonthSummary>();

  protected readonly tooltip = inject(TooltipService);
  protected readonly view = computed(() => weeklyView(this.summary()));
}
