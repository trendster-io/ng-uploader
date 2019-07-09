import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

import { Observable } from 'rxjs';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessToken: string;
  private refreshToken: string;

  constructor(
    private httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    if (this.isBrowser()) {
      this.accessToken = localStorage.getItem('accessToken') || 'test_token';
      this.refreshToken = localStorage.getItem('refreshToken') || 'test_token';
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getAccessToken(): string {
    return this.accessToken;
  }

  setAccessToken(accessToken: string): void {
    if (this.isBrowser()) {
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      } else {
        localStorage.removeItem('accessToken');
      }
    }
    this.accessToken = accessToken;
  }

  getRefreshToken(): string {
    return this.refreshToken;
  }

  setRefreshToken(refreshToken: string): void {
    if (this.isBrowser()) {
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      } else {
        localStorage.removeItem('refreshToken');
      }
    }
    this.refreshToken = refreshToken;
  }

  isAuthenticated(): boolean {
    return Boolean(this.accessToken && this.refreshToken);
  }

  login(body): Observable<any> {
    return this.httpClient.post(
      `${environment.apiUrl}/authentication/login`,
      body
    );
  }

  refreshAccessToken(): Observable<any> {
    return this.httpClient.patch(
      `${environment.apiUrl}/authentication/refresh`,
      {
        refresh: this.refreshToken
      }
    );
  }

  logout(): void {
    this.setAccessToken(null);
    this.setRefreshToken(null);
  }
}
