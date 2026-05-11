import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  DepositRequest, TransferRequest,
  TransactionResponse, Page, PageParams
} from '../models/models';
import { normalizePage } from '../utils/pagination.utils';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/transactions`;

  deposit(request: DepositRequest): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.base}/deposit`, request);
  }

  transfer(request: TransferRequest): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.base}/transfer`, request);
  }

  getStatement(accountUuid: string, params: PageParams = {}): Observable<Page<TransactionResponse>> {
    let p = new HttpParams()
      .set('page', params.page ?? 0)
      .set('size', params.size ?? 20);
    if (params.sort) p = p.set('sort', params.sort);

    return this.http.get<unknown>(`${this.base}/statement/${accountUuid}`, { params: p }).pipe(
      map(raw => normalizePage<TransactionResponse>(raw))
    );
  }
}
