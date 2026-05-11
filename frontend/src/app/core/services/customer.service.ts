import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CustomerRequest, CustomerResponse, Page, PageParams } from '../models/models';
import { normalizePage } from '../utils/pagination.utils';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/customers`;

  findAll(params: PageParams = {}): Observable<Page<CustomerResponse>> {
    let p = new HttpParams()
      .set('page', params.page ?? 0)
      .set('size', params.size ?? 10);
    if (params.sort) p = p.set('sort', params.sort);

    return this.http.get<unknown>(this.base, { params: p }).pipe(
      map(raw => normalizePage<CustomerResponse>(raw))
    );
  }

  create(request: CustomerRequest): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(this.base, request);
  }
}
