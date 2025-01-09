import { Injectable, Inject , PLATFORM_ID} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { UserInterface } from './login/interfaces/user.interface';
import { map, catchError, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public readonly API_URL = 'http://localhost:8000';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isAuthenticatedAparte = new BehaviorSubject<boolean>(false);
  private authDone : boolean;
  private authCheckInterval: any;
  private isRefreshing = false;

  constructor(private httpClient: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isAuthenticatedAparte.next(this.checkAuthStatus());
    this.authDone = false;
  }

  private jwtHelper = new JwtHelperService();

  public startAuthCheckInterval(): void {
    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval);
    }
    
    this.authCheckInterval = setInterval(() => {
      if (!this.isRefreshing) {
        this.isAuthDone();
        this.isAuthenticatedSubject.next(this.authDone);
      }
    }, 10000); // 5 minutes
  }

  checkAuthStatus(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      return token ? !this.jwtHelper.isTokenExpired(token) : false;
    }
    return false;
  }

  public isAuthDone(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.authDone = false;
      return;
    }

    let token: string = localStorage.getItem('access_token') || '';
    
    if (token.length > 0) {
      if (!this.jwtHelper.isTokenExpired(token)) {
        this.authDone = true;
      } else {
        console.log("Token expired, attempting refresh");
        this.refreshToken().subscribe({
          next: (status) => {
            if (status === 0) {
              this.authDone = true;
            } else {
              this.authDone = false;
            }
          },
          error: () => {
            this.authDone = false;
            this.logout();
          }
        });
      }
    } else {
      this.authDone = false;
    }
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  login(userCredentials: UserInterface) : Observable<number>
  {
    return (this.httpClient.post('http://localhost:8000/accounts/login/', userCredentials).pipe(
      map((response: any) => {
        if (isPlatformBrowser(this.platformId))
        {
          console.log('response: ' + response.message);
          localStorage.setItem('username', userCredentials.username);
          localStorage.setItem('sessionid', response.sessionid);
          this.isAuthenticatedSubject.next(true);
        }
        this.router.navigate(['']);
        return (0);
      }),
      catchError((error: any) => {
        console.log("Falla aqui" + error);
        return throwError(() => error);
      })
    ));
  }

  logout() : void
  {
    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval);
    }
    if (isPlatformBrowser(this.platformId))
    {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('username');
      this.authDone = false;
      this.isAuthenticatedSubject.next(false);
    }
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<number> {
    console.log('Starting token refresh...');
    
    if (this.isRefreshing) {
        return of(0);
    }

    this.isRefreshing = true;

    if (!isPlatformBrowser(this.platformId)) {
        return of(401);
    }
    
    const refresh_token = localStorage.getItem('refresh_token');
    console.log('Refresh token present:', !!refresh_token);
    
    if (!refresh_token) {
        this.isRefreshing = false;
        return of(401);
    }

    return this.httpClient.post<any>('http://localhost:8000/accounts/account-refresh/', {
        refresh: refresh_token
    }).pipe(
        map((response: any) => {
            if (response.access && response.refresh) {
                localStorage.setItem('access_token', response.access);
                localStorage.setItem('refresh_token', response.refresh);
                this.authDone = true;
                this.isRefreshing = false;
                return 0;
            } else {
                throw new Error('Invalid token response');
            }
        }),
        catchError((error: any) => {
            console.error('Refresh failed:', error);
            // If refresh fails, clear tokens and force re-login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            this.authDone = false;
            this.isRefreshing = false;
            this.router.navigate(['/login']);
            return of(error.status);
        })
    );
  }

  getCurrentUser(): Observable<UserInterface> {
    return this.httpClient.get<UserInterface>(`http://localhost:8000/accounts/me/`);
  }
 
  updateProfile(formData: FormData, username: string): Observable<any> {
    return this.httpClient.put(`http://localhost:8000/accounts/users/${username}/update/`, formData);
  }

  getAccessToken(): string | null {
    if (isPlatformBrowser(this.platformId)){
      this.isAuthDone();
      return localStorage.getItem('access_token');
    }
    return null;
  }

  validateCredentials(username: string, password: string): Observable<boolean> {
    return this.httpClient.post<any>('http://localhost:8000/accounts/validate-credentials/', {
      username: username,
      password: password
    }).pipe(
      map(response => {
        return response.valid === true;
      }),
      catchError(error => {
        console.error('Credential validation error: ', error);
        return of(false);
      })
    )
  }

} 