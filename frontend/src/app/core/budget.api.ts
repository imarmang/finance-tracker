import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

/** One month's budget as the backend stores it. */
export interface MonthBudgetDto {
  month: string;
  expectedIncome: number;
  categories: Record<string, number>;
}

/** Talks to the backend's /api/budgets endpoints. The dev server proxies /api to the backend. */
@Injectable({ providedIn: 'root' })
export class BudgetApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/budgets';

  list(): Promise<MonthBudgetDto[]> {
    return lastValueFrom(this.http.get<MonthBudgetDto[]>(this.base));
  }

  save(month: string, input: Pick<MonthBudgetDto, 'expectedIncome' | 'categories'>): Promise<MonthBudgetDto> {
    return lastValueFrom(this.http.put<MonthBudgetDto>(`${this.base}/${month}`, input));
  }
}
