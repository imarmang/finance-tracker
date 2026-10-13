import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { SavingsAccount, SavingsAccountInput } from './model';

/** Talks to the backend's /api/savings-accounts endpoints. The dev server proxies /api to the backend. */
@Injectable({ providedIn: 'root' })
export class SavingsAccountApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/savings-accounts';

  list(): Promise<SavingsAccount[]> {
    return lastValueFrom(this.http.get<SavingsAccount[]>(this.base));
  }

  create(input: SavingsAccountInput): Promise<SavingsAccount> {
    return lastValueFrom(this.http.post<SavingsAccount>(this.base, input));
  }

  update(id: number, input: SavingsAccountInput): Promise<SavingsAccount> {
    return lastValueFrom(this.http.put<SavingsAccount>(`${this.base}/${id}`, input));
  }

  remove(id: number): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }
}
