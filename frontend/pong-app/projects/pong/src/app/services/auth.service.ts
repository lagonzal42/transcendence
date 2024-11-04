import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public readonly API_URL = 'http://localhost:8000';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isBrowser: boolean;
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.isAuthenticatedSubject.next(!!this.getAccessToken());
  }

  login(username: string, password: string) {
    return this.http.post(`${this.API_URL}/api/auth/token/`, { username, password }).pipe(
      tap((response: any) => {
        if (this.isBrowser) {
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
        }
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    this.isAuthenticatedSubject.next(false);
  }

  refreshToken() {
    const refresh = this.isBrowser ? localStorage.getItem('refresh_token') : null;
    return this.http.post(`${this.API_URL}/auth/token/refresh/`, { refresh });
  }

  getAccessToken(): string | null {
    return this.isBrowser ? localStorage.getItem('access_token') : null;
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }
} 