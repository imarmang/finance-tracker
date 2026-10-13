import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

/** One month's savings summary as the backend computes it. */
export interface SavingsSummaryDto {
  month: string;
  totalSaved: number;
  savedByAccount: { accountId: number; name: string; amount: number }[];
  profit: number;
  notYetSaved: number;
}

/** Talks to the backend's /api/savings-summary endpoint. The dev server proxies /api to the backend. */
@Injectable({ providedIn: 'root' })
export class SavingsSummaryApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/savings-summary';

  get(month: string): Promise<SavingsSummaryDto> {
    return lastValueFrom(this.http.get<SavingsSummaryDto>(this.base, { params: { month } }));
  }
}
