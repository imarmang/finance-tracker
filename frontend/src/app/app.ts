import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { FinanceStore } from './core/finance.store';
import { ToastService, TooltipService } from './core/feedback.service';
import { eventValue, monthLabel } from './core/format';
import { TransactionDrawer } from './drawer/transaction-drawer';

export interface NavItem {
  path: string;
  label: string;
  short: string;
}

export const NAV: NavItem[] = [
  { path: 'dashboard', label: 'Dashboard', short: 'Dashboard' },
  { path: 'transactions', label: 'Transactions', short: 'Transactions' },
  { path: 'budget', label: 'Budget', short: 'Budget' },
  { path: 'cards', label: 'Payment methods', short: 'Payments' },
];

@Component({
  selector: 'app-root',
  imports: [NgTemplateOutlet, RouterOutlet, TransactionDrawer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly store = inject(FinanceStore);
  protected readonly tooltip = inject(TooltipService);
  protected readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly nav = NAV;
  protected readonly months = this.store.months;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly currentPath = computed(() => this.url().split('/')[1] || 'dashboard');
  protected readonly title = computed(
    () => NAV.find((n) => n.path === this.currentPath())?.label ?? 'Dashboard',
  );
  protected readonly monthIndex = computed(() => this.months.indexOf(this.store.month()));

  protected readonly monthLabel = monthLabel;

  constructor() {
    this.store.loadExpenses();
    this.store.loadIncome();
    this.store.loadCards();
  }

  protected go(path: string): void {
    this.router.navigateByUrl(`/${path}`);
  }

  protected monthFromEvent(event: Event): void {
    this.store.setMonth(eventValue(event));
  }
}
