import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FinanceStore } from '../../core/finance.store';
import { ToastService } from '../../core/feedback.service';
import { savingsLedgerOf, sum } from '../../core/finance';
import {
  eventChecked,
  eventValue,
  money,
  money0,
  monthLabel,
  monthShort,
  parseNumber,
  shortDate,
} from '../../core/format';
import {
  SavingsAccount,
  SavingsAccountInput,
  SavingsDeposit,
  SavingsDirection,
} from '../../core/model';

@Component({
  selector: 'app-savings',
  templateUrl: './savings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Savings {
  protected readonly store = inject(FinanceStore);
  private readonly toast = inject(ToastService);

  protected readonly newName = signal('');
  protected readonly newBank = signal('');
  protected readonly newHysa = signal(false);
  protected readonly newOpening = signal(0);
  protected readonly newGoal = signal<number | null>(null);

  protected readonly ledgerQuery = signal('');
  protected readonly ledgerDirection = signal<'all' | SavingsDirection>('all');
  protected readonly ledgerAccountId = signal<number | null>(null);

  protected readonly directionOptions: ReadonlyArray<{
    value: 'all' | SavingsDirection;
    label: string;
  }> = [
    { value: 'all', label: 'All' },
    { value: 'deposit', label: 'Deposits' },
    { value: 'withdraw', label: 'Withdrawals' },
  ];

  protected readonly money = money;
  protected readonly money0 = money0;
  protected readonly monthLabel = monthLabel;
  protected readonly monthShort = monthShort;
  protected readonly shortDate = shortDate;

  /** This month's deposits, grouped by account, newest first. */
  private readonly depositsByAccount = computed(() => {
    const month = this.store.month();
    const byAccount = new Map<number, SavingsDeposit[]>();
    for (const d of this.store.savingsDeposits()) {
      if (d.date.slice(0, 7) !== month) continue;
      const list = byAccount.get(d.accountId) ?? [];
      list.push(d);
      byAccount.set(d.accountId, list);
    }
    for (const list of byAccount.values()) {
      list.sort((a, b) => (a.date < b.date ? 1 : -1));
    }
    return byAccount;
  });

  protected depositsFor(accountId: number): SavingsDeposit[] {
    return this.depositsByAccount().get(accountId) ?? [];
  }

  /** This month's total saved into an account. Comes from the server-computed summary. */
  protected depositTotalFor(accountId: number): number {
    return (
      this.store.savingsSummary()?.savedByAccount.find((s) => s.accountId === accountId)?.amount ?? 0
    );
  }

  /** Every deposit and withdrawal across every account, newest first, filtered by the ledger controls. */
  protected readonly ledger = computed(() => {
    const q = this.ledgerQuery().trim().toLowerCase();
    const direction = this.ledgerDirection();
    const accountId = this.ledgerAccountId();
    return savingsLedgerOf(this.store.savingsDeposits(), this.store.savingsAccounts()).filter((r) => {
      if (direction !== 'all' && r.direction !== direction) return false;
      if (accountId !== null && r.accountId !== accountId) return false;
      if (q && `${r.account} ${r.note}`.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  });

  protected readonly ledgerFooter = computed(() => {
    const rows = this.ledger();
    const deposits = rows.filter((r) => r.direction === 'deposit');
    const withdrawals = rows.filter((r) => r.direction === 'withdraw');
    const parts: string[] = [];
    if (deposits.length) parts.push(`+${this.money(sum(deposits.map((r) => r.amount)))}`);
    if (withdrawals.length) parts.push(`−${this.money(sum(withdrawals.map((r) => r.amount)))}`);
    return parts.join('   ');
  });

  protected setLedgerAccount(event: Event): void {
    const value = eventValue(event);
    this.ledgerAccountId.set(value ? Number(value) : null);
  }

  protected goalPct(account: SavingsAccount): number {
    if (!account.goalAmount || account.goalAmount <= 0) return 0;
    return Math.min((account.balance / account.goalAmount) * 100, 100);
  }

  protected openDeposit(accountId: number): void {
    this.store.openDrawer('savings', null, accountId, 'deposit');
  }

  protected openWithdrawal(accountId: number): void {
    this.store.openDrawer('savings', null, accountId, 'withdraw');
  }

  protected editDeposit(id: number): void {
    this.store.openDrawer('savings', id);
  }

  protected depositLabel(deposit: SavingsDeposit): string {
    return deposit.amount < 0
      ? `Withdrew ${this.money(-deposit.amount)}`
      : `Deposited ${this.money(deposit.amount)}`;
  }

  protected async removeDeposit(deposit: SavingsDeposit): Promise<void> {
    try {
      const removed = await this.store.removeSavingsDeposit(deposit.id);
      if (!removed) return;
      this.toast.show('Deposit deleted', 'Undo', () => void this.undoRemoveDeposit(removed));
    } catch {
      this.toast.show('Could not delete the deposit. Try again.');
    }
  }

  private async undoRemoveDeposit(deposit: SavingsDeposit): Promise<void> {
    try {
      await this.store.restoreSavingsDeposit(deposit);
    } catch {
      this.toast.show('Could not undo. Try again.');
    }
  }

  protected async addAccount(): Promise<void> {
    const name = this.newName().trim();
    if (!name) {
      this.toast.show('Enter a name for the savings account.');
      return;
    }
    const bank = this.newBank().trim();
    if (!bank) {
      this.toast.show('Enter the bank that holds this account.');
      return;
    }
    try {
      await this.store.addSavingsAccount({
        name,
        bank,
        hysa: this.newHysa(),
        openingBalance: this.newOpening(),
        goalAmount: this.newGoal(),
      });
    } catch (error) {
      this.toast.show(this.nameFailure(error, name));
      return;
    }
    this.newName.set('');
    this.newBank.set('');
    this.newHysa.set(false);
    this.newOpening.set(0);
    this.newGoal.set(null);
  }

  protected async removeAccount(account: SavingsAccount): Promise<void> {
    try {
      await this.store.removeSavingsAccount(account.id);
    } catch (error) {
      this.toast.show(
        error instanceof HttpErrorResponse && error.status === 409
          ? this.inUseMessage(account.name)
          : 'Could not remove that. Try again.',
      );
      return;
    }
    this.toast.show(`${account.name} removed`, 'Undo', () => void this.undoRemoveAccount(account));
  }

  private async undoRemoveAccount(account: SavingsAccount): Promise<void> {
    try {
      await this.store.restoreSavingsAccount(account);
    } catch {
      this.toast.show('Could not undo. Try again.');
    }
  }

  protected renameAccount(account: SavingsAccount, event: Event): void {
    const name = eventValue(event).trim();
    if (name) void this.update(account, { name });
  }

  protected setBank(account: SavingsAccount, event: Event): void {
    const bank = eventValue(event).trim();
    if (bank) void this.update(account, { bank });
  }

  protected setHysa(account: SavingsAccount, event: Event): void {
    void this.update(account, { hysa: eventChecked(event) });
  }

  protected setOpeningBalance(account: SavingsAccount, event: Event): void {
    void this.update(account, { openingBalance: this.numberOf(event) });
  }

  protected setGoal(account: SavingsAccount, event: Event): void {
    const raw = eventValue(event).trim();
    void this.update(account, { goalAmount: raw ? parseNumber(raw) : null });
  }

  protected textOf(event: Event): string {
    return eventValue(event);
  }

  protected numberOf(event: Event): number {
    return parseNumber(eventValue(event));
  }

  protected checkedOf(event: Event): boolean {
    return eventChecked(event);
  }

  private async update(account: SavingsAccount, patch: Partial<SavingsAccountInput>): Promise<void> {
    try {
      await this.store.updateSavingsAccount(account.id, { ...this.inputOf(account), ...patch });
    } catch (error) {
      this.toast.show(this.nameFailure(error, patch.name ?? account.name));
    }
  }

  private inputOf(a: SavingsAccount): SavingsAccountInput {
    return {
      name: a.name,
      bank: a.bank,
      hysa: a.hysa,
      openingBalance: a.openingBalance,
      goalAmount: a.goalAmount,
    };
  }

  private inUseMessage(name: string): string {
    return `${name} has deposits recorded against it, so it cannot be deleted.`;
  }

  private nameFailure(error: unknown, name: string): string {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      return `A savings account named ${name} already exists.`;
    }
    return 'Could not save that. Try again.';
  }
}
