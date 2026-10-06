import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FinanceStore } from '../../core/finance.store';
import { ToastService } from '../../core/feedback.service';
import { eventValue, money, monthShort, parseNumber, points } from '../../core/format';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cards {
  protected readonly store = inject(FinanceStore);
  private readonly toast = inject(ToastService);

  protected readonly summary = computed(() => this.store.summary());

  protected readonly newName = signal('');
  protected readonly newDef = signal(1);

  protected readonly money = money;
  protected readonly points = points;
  protected readonly monthShort = monthShort;

  protected ruleEntries(rules: Record<string, number>): [string, number][] {
    return Object.entries(rules);
  }

  protected addCard(): void {
    const name = this.newName().trim();
    if (!name) {
      this.toast.show('Enter a name for the card.');
      return;
    }
    if (!this.store.addCard(name, this.newDef())) {
      this.toast.show(`A card named ${name} already exists.`);
      return;
    }
    this.newName.set('');
    this.newDef.set(1);
  }

  protected removeCard(index: number): void {
    const card = this.store.removeCard(index);
    this.toast.show(`${card.name} removed`, 'Undo', () => this.store.restoreCard(index, card));
  }

  protected textOf(event: Event): string {
    return eventValue(event);
  }

  protected numberOf(event: Event): number {
    return parseNumber(eventValue(event));
  }
}
