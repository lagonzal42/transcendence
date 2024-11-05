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
    if (this.isBrowser){
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
    }

    return this.http.post(`${this.API_URL}/api/auth/token/`, { username, password }).pipe(
      tap((response: any) => {
        console.log('Login response received:', response);
        if (this.isBrowser) {
          sessionStorage.setItem('access_token', response.access);
          sessionStorage.setItem('refresh_token', response.refresh);
        }
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  logout() {
    if (this.isBrowser) {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
    }
    this.isAuthenticatedSubject.next(false);
  }

  refreshToken() {
    const refresh = this.isBrowser ? sessionStorage.getItem('refresh_token') : null;
    return this.http.post(`${this.API_URL}/auth/token/refresh/`, { refresh });
  }

  getAccessToken(): string | null {
    return this.isBrowser ? sessionStorage.getItem('access_token') : null;
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  searchUsers(query: string): Observable<any> {
    return this.http.get(`${this.API_URL}/accounts/users/search/?query=${query}`);
  }

  sendFriendRequest(to_username: string): Observable<any> {
    return this.http.post(`${this.API_URL}/accounts/friend-requests/send/`, {
      to_username: to_username
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  getFriendRequests(): Observable<any> {
    return this.http.get(`${this.API_URL}/accounts/friend-requests/`);
  }

  acceptFriendRequest(fromUsername: string): Observable<any> {
    return this.http.post(`${this.API_URL}/accounts/friend-requests/accept/`, {
      from_username: fromUsername
    });
  }

  declineFriendRequest(requestId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/accounts/friend-requests/${requestId}/decline/`, {});
  }
} 