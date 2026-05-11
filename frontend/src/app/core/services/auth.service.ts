import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/auth`;
  private readonly TOKEN_KEY = 'fincore_token';

  readonly token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, request).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this.token.set(res.token);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, request);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.token.set(null);
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  decodedToken(): Record<string, unknown> | null {
    const t = this.token();
    if (!t) return null;
    try {
      const payload = t.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }
}
