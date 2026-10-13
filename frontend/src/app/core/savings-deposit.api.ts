import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { SavingsDeposit, SavingsDepositInput } from './model';

/** Talks to the backend's /api/savings-deposits endpoints. The dev server proxies /api to the backend. */
@Injectable({ providedIn: 'root' })
export class SavingsDepositApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/savings-deposits';

  list(): Promise<SavingsDeposit[]> {
    return lastValueFrom(this.http.get<SavingsDeposit[]>(this.base));
  }

  create(input: SavingsDepositInput): Promise<SavingsDeposit> {
    return lastValueFrom(this.http.post<SavingsDeposit>(this.base, input));
  }

  update(id: number, input: SavingsDepositInput): Promise<SavingsDeposit> {
    return lastValueFrom(this.http.put<SavingsDeposit>(`${this.base}/${id}`, input));
  }

  remove(id: number): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }
}
