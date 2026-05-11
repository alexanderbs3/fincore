import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AccountRequest, AccountResponse, Page, PageParams } from '../models/models';
import { normalizePage } from '../utils/pagination.utils';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/accounts`;

  findAll(params: PageParams = {}): Observable<Page<AccountResponse>> {
    let p = new HttpParams()
      .set('page', params.page ?? 0)
      .set('size', params.size ?? 10);
    if (params.sort) p = p.set('sort', params.sort);

    return this.http.get<unknown>(this.base, { params: p }).pipe(
      map(raw => normalizePage<AccountResponse>(raw))
    );
  }

  create(request: AccountRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(this.base, request);
  }
}
