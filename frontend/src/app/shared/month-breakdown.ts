import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { breakdownOf, MonthSummary } from '../core/finance';
import { TooltipService, TipContent } from '../core/feedback.service';
import { money, money0, monthLabel } from '../core/format';
import { CATEGORIES } from '../core/model';

/** Share of the base as a whole-number percentage. Tiny non-zero shares read as "<1%". */
function shareText(amount: number, base: number): string {
  if (base <= 0) return '–';
  const pct = (amount / base) * 100;
  if (pct > 0 && pct < 1) return '<1%';
  return `${Math.round(pct)}%`;
}

function widthOf(amount: number, base: number): number {
  return base > 0 ? Math.max(0, Math.min(amount / base, 1)) * 100 : 0;
}

@Component({
  selector: 'app-month-breakdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <h2>Where the pay went</h2>
      <p class="sub">
        Every dollar of gross pay in {{ monthName() }}, split into taxes, spending and what you kept.
        All bars share one scale: their share of gross pay.
      </p>

      @if (b().base > 0) {
        <div class="bd-stack" role="img" [attr.aria-label]="summaryLabel()">
          @if (b().taxTotal > 0) {
            <span
              class="bd-seg taxes"
              [style.width.%]="widthOf(b().taxTotal)"
              (pointermove)="tip($event, taxTip())"
              (pointerleave)="tooltip.hide()"
            ></span>
          }
          @if (b().spent > 0) {
            <span
              class="bd-seg spent"
              [style.width.%]="widthOf(b().spent)"
              (pointermove)="tip($event, spentTip())"
              (pointerleave)="tooltip.hide()"
            ></span>
          }
          @if (b().kept > 0) {
            <span
              class="bd-seg kept"
              [style.width.%]="widthOf(b().kept)"
              (pointermove)="tip($event, keptTip())"
              (pointerleave)="tooltip.hide()"
            ></span>
          }
        </div>

        <div class="bd-legend">
          <span><i class="dot taxes"></i>Taxes {{ money0(b().taxTotal) }} · {{ shareText(b().taxTotal) }}</span>
          <span><i class="dot spent"></i>Spent {{ money0(b().spent) }} · {{ shareText(b().spent) }}</span>
          @if (b().kept >= 0) {
            <span class="good"
              ><i class="dot kept"></i>▲ Kept {{ money0(b().kept) }} · {{ shareText(b().kept) }}</span
            >
          } @else {
            <span class="over">▼ Over by {{ money0(-b().kept) }}</span>
          }
        </div>

        <h3 class="bd-h">Taxes &amp; deductions</h3>
        @if (b().taxes.length) {
          @for (t of b().taxes; track t.name) {
            <div class="brow">
              <span class="nm">{{ t.name }}</span>
              <div class="track" role="img" [attr.aria-label]="t.name + ': ' + money(t.amount)">
                <i
                  class="taxes"
                  [style.width.%]="widthOf(t.amount)"
                  (pointermove)="tip($event, lineTip(t.name, t.amount))"
                  (pointerleave)="tooltip.hide()"
                ></i>
              </div>
              <span class="amt">{{ money(t.amount) }} <span class="faint">{{ shareText(t.amount) }}</span></span>
            </div>
          }
        } @else {
          <p class="hint">No taxes recorded for this month.</p>
        }

        <div class="bd-total">
          <span>Take-home pay</span>
          <span class="mono">{{ money(b().net) }}</span>
        </div>

        <h3 class="bd-h">Spending by category</h3>
        @if (b().spending.length) {
          @for (c of b().spending; track c.name) {
            <div class="brow">
              <span class="nm">{{ c.name }} <span class="faint tag">{{ c.group === 'fixed' ? 'Fixed' : 'Variable' }}</span></span>
              <div class="track" role="img" [attr.aria-label]="c.name + ': ' + money(c.amount)">
                <i
                  class="spent"
                  [style.width.%]="widthOf(c.amount)"
                  (pointermove)="tip($event, lineTip(c.name, c.amount))"
                  (pointerleave)="tooltip.hide()"
                ></i>
              </div>
              <span class="amt">{{ money(c.amount) }} <span class="faint">{{ shareText(c.amount) }}</span></span>
            </div>
          }
        } @else {
          <p class="hint">No spending recorded for this month.</p>
        }

        <div class="bd-total">
          <span>{{ b().kept >= 0 ? 'Left over' : 'Over budget' }}</span>
          <span class="mono" [class.over]="b().kept < 0">{{ money(b().kept) }}</span>
        </div>
      } @else {
        <p class="hint">
          No pay recorded for {{ monthName() }} yet, so there is nothing to split. Add a paycheck to see the breakdown.
        </p>
        @if (b().spending.length) {
          <p class="hint">Spent so far: {{ money(b().spent) }}.</p>
        }
      }
    </div>
  `,
})
export class MonthBreakdown {
  readonly summary = input.required<MonthSummary>();

  protected readonly tooltip = inject(TooltipService);
  protected readonly b = computed(() => breakdownOf(this.summary(), CATEGORIES));

  protected readonly money = money;
  protected readonly money0 = money0;
  protected readonly shareText = (amount: number) => shareText(amount, this.b().base);
  protected readonly widthOf = (amount: number) => widthOf(amount, this.b().base);

  protected monthName(): string {
    return monthLabel(this.summary().key);
  }

  protected summaryLabel(): string {
    const b = this.b();
    return `Gross pay ${money0(b.gross)}: taxes ${money0(b.taxTotal)}, spent ${money0(b.spent)}, kept ${money0(Math.max(b.kept, 0))}`;
  }

  protected tip(event: PointerEvent, content: TipContent): void {
    this.tooltip.show(content, event);
  }

  protected lineTip(name: string, amount: number): TipContent {
    return { title: name, lines: [money(amount), `${shareText(amount, this.b().base)} of gross pay`] };
  }

  protected taxTip(): TipContent {
    const b = this.b();
    return { title: 'Taxes & deductions', lines: [money(b.taxTotal), `${shareText(b.taxTotal, b.base)} of gross pay`] };
  }

  protected spentTip(): TipContent {
    const b = this.b();
    return { title: 'Spent', lines: [money(b.spent), `${shareText(b.spent, b.base)} of gross pay`] };
  }

  protected keptTip(): TipContent {
    const b = this.b();
    return { title: 'Kept', lines: [money(b.kept), `${shareText(b.kept, b.base)} of gross pay`] };
  }
}
