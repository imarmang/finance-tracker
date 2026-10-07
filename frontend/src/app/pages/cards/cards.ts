import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FinanceStore } from '../../core/finance.store';
import { ToastService } from '../../core/feedback.service';
import { eventValue, money, monthShort, parseNumber, points } from '../../core/format';
import { kindLabel, PAYMENT_KINDS, PaymentKind, PaymentMethod } from '../../core/model';

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
  protected readonly newKind = signal<PaymentKind>('CREDIT_CARD');
  protected readonly newDef = signal(1);

  protected readonly kinds = PAYMENT_KINDS;
  protected readonly kindLabel = kindLabel;
  protected readonly money = money;
  protected readonly points = points;
  protected readonly monthShort = monthShort;

  protected ruleEntries(rules: Record<string, number>): [string, number][] {
    return Object.entries(rules);
  }

  protected async addCard(): Promise<void> {
    const name = this.newName().trim();
    if (!name) {
      this.toast.show('Enter a name for the payment method.');
      return;
    }
    const kind = this.newKind();
    try {
      await this.store.addCard({
        name,
        kind,
        defaultMult: kind === 'CREDIT_CARD' ? this.newDef() : 0,
        rules: {},
      });
    } catch (error) {
      this.toast.show(this.addFailure(error, name));
      return;
    }
    this.newName.set('');
    this.newKind.set('CREDIT_CARD');
    this.newDef.set(1);
  }

  protected async removeCard(index: number): Promise<void> {
    const name = this.store.cards()[index].name;
    if (this.store.cardInUse(name)) {
      this.toast.show(this.inUseMessage(name));
      return;
    }
    let removed: PaymentMethod;
    try {
      removed = await this.store.removeCard(index);
    } catch (error) {
      this.toast.show(
        error instanceof HttpErrorResponse && error.status === 409
          ? this.inUseMessage(name)
          : 'Could not remove that. Try again.',
      );
      return;
    }
    this.toast.show(`${removed.name} removed`, 'Undo', () => void this.undoRemove(index, removed));
  }

  protected setDefault(index: number, event: Event): void {
    this.saved(this.store.setCardDefault(index, this.numberOf(event)));
  }

  protected setRule(index: number, category: string, event: Event): void {
    this.saved(this.store.setCardRule(index, category, this.numberOf(event)));
  }

  protected renameRule(index: number, from: string, event: Event): void {
    this.saved(this.store.renameCardRule(index, from, this.textOf(event)));
  }

  protected removeRule(index: number, category: string): void {
    this.saved(this.store.removeCardRule(index, category));
  }

  protected addRule(index: number): void {
    this.saved(this.store.addCardRule(index));
  }

  protected textOf(event: Event): string {
    return eventValue(event);
  }

  protected kindOf(event: Event): PaymentKind {
    return eventValue(event) as PaymentKind;
  }

  protected numberOf(event: Event): number {
    return parseNumber(eventValue(event));
  }

  private async undoRemove(index: number, card: PaymentMethod): Promise<void> {
    try {
      await this.store.restoreCard(index, card);
    } catch {
      this.toast.show('Could not undo. Try again.');
    }
  }

  /** Shows a toast if a saved change fails. The store has already rolled the change back. */
  private saved(change: Promise<void>): void {
    change.catch(() => this.toast.show('Could not save that change. Try again.'));
  }

  private inUseMessage(name: string): string {
    return `${name} has transactions paid with it, so it cannot be deleted.`;
  }

  private addFailure(error: unknown, name: string): string {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      return `A payment method named ${name} already exists.`;
    }
    return 'Could not save that. Try again.';
  }
}
