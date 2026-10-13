import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Transactions } from './pages/transactions/transactions';
import { Budget } from './pages/budget/budget';
import { Cards } from './pages/cards/cards';
import { Savings } from './pages/savings/savings';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: Dashboard },
  { path: 'transactions', component: Transactions },
  { path: 'budget', component: Budget },
  { path: 'savings', component: Savings },
  { path: 'cards', component: Cards },
  { path: '**', redirectTo: 'dashboard' },
];
