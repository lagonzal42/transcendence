import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

interface User {
  username: string;
  email: string;
  tournament_name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public readonly API_URL = 'http://localhost:8000';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isBrowser: boolean;
  
  constructor(private http: HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.isAuthenticatedSubject.next(!!this.getAccessToken());
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${this.API_URL}/accounts/login/`, {
      username,
      password
    }).pipe(
      tap(response => {
        if (response.tokens) {
          sessionStorage.setItem('access_token', response.tokens.access);
          sessionStorage.setItem('refresh_token', response.tokens.refresh);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  logout() {
    const refresh = this.getRefreshToken();
    if (refresh) {
      // Call backend logout endpoint
      return this.http.post(`${this.API_URL}/accounts/logout/`, { refresh }).pipe(
        tap(() => {
          if (this.isBrowser) {
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('refresh_token');
          }
          this.isAuthenticatedSubject.next(false);
        })
      ).subscribe({
        error: (error) => {
          console.error('Logout error:', error);
          // Clean up local storage even if server request fails
          if (this.isBrowser) {
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('refresh_token');
          }
          this.isAuthenticatedSubject.next(false);
        }
      });
    }
    
    // If no refresh token, just clean up local storage
    if (this.isBrowser) {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
    }
    this.isAuthenticatedSubject.next(false);
    return new Observable(subscriber => subscriber.complete());
  }

  private getRefreshToken(): string | null {
    return this.isBrowser ? sessionStorage.getItem('refresh_token') : null;
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

  // searchUsers(query: string): Observable<any> {
  //   return this.http.get(`${this.API_URL}/accounts/users/search/?query=${query}`);
  // }

  // sendFriendRequest(to_username: string): Observable<any> {
  //   return this.http.post(`${this.API_URL}/accounts/friend-requests/send/`, {
  //     to_username: to_username
  //   }, {
  //     headers: {
  //       'Content-Type': 'application/json'
  //     }
  //   });
  // }

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

  getCurrentUser() {
    return this.http.get<User>(`${this.API_URL}/accounts/me/`);
  }



  getUserStats(username: string): Observable<any> {
    return this.http.get(`${this.API_URL}/accounts/users/${username}/stats/`);
  }
} 