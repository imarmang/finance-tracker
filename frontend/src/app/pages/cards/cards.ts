import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FinanceStore } from '../../core/finance.store';
import { eventValue, money, monthShort, parseNumber, points } from '../../core/format';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cards {
  protected readonly store = inject(FinanceStore);

  protected readonly summary = computed(() => this.store.summary());

  protected readonly money = money;
  protected readonly points = points;
  protected readonly monthShort = monthShort;

  protected ruleEntries(rules: Record<string, number>): [string, number][] {
    return Object.entries(rules);
  }

  protected textOf(event: Event): string {
    return eventValue(event);
  }

  protected numberOf(event: Event): number {
    return parseNumber(eventValue(event));
  }
}
