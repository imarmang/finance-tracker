import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { PaymentMethod, PaymentMethodInput } from './model';

/** Talks to the backend's /api/payment-methods endpoints. The dev server proxies /api to the backend. */
@Injectable({ providedIn: 'root' })
export class PaymentMethodApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/payment-methods';

  list(): Promise<PaymentMethod[]> {
    return lastValueFrom(this.http.get<PaymentMethod[]>(this.base));
  }

  create(input: PaymentMethodInput): Promise<PaymentMethod> {
    return lastValueFrom(this.http.post<PaymentMethod>(this.base, input));
  }

  update(id: number, input: PaymentMethodInput): Promise<PaymentMethod> {
    return lastValueFrom(this.http.put<PaymentMethod>(`${this.base}/${id}`, input));
  }

  remove(id: number): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }
}
