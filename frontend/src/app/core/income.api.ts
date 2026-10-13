import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Income, IncomeInput } from './model';

/** Talks to the backend's /api/income endpoints. The dev server proxies /api to the backend. */
@Injectable({ providedIn: 'root' })
export class IncomeApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/income';

  list(): Promise<Income[]> {
    return lastValueFrom(this.http.get<Income[]>(this.base));
  }

  create(input: IncomeInput): Promise<Income> {
    return lastValueFrom(this.http.post<Income>(this.base, input));
  }

  update(id: number, input: IncomeInput): Promise<Income> {
    return lastValueFrom(this.http.put<Income>(`${this.base}/${id}`, input));
  }

  remove(id: number): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }
}
