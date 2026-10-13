import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Expense, ExpenseInput } from './model';

/** Talks to the backend's /api/expenses endpoints. The dev server proxies /api to the backend. */
@Injectable({ providedIn: 'root' })
export class ExpenseApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/expenses';

  list(): Promise<Expense[]> {
    return lastValueFrom(this.http.get<Expense[]>(this.base));
  }

  create(input: ExpenseInput): Promise<Expense> {
    return lastValueFrom(this.http.post<Expense>(this.base, input));
  }

  update(id: number, input: ExpenseInput): Promise<Expense> {
    return lastValueFrom(this.http.put<Expense>(`${this.base}/${id}`, input));
  }

  remove(id: number): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }
}
