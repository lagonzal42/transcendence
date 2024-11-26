import { Injectable, Inject , PLATFORM_ID} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { UserInterface } from './login/interfaces/user.interface';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public readonly API_URL = 'http://localhost:8000';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(private httpClient: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isAuthenticatedSubject.next(this.checkAuthStatus());
  }

  jwtHelper = new JwtHelperService();

  private checkAuthStatus(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access');
      return token ? !this.jwtHelper.isTokenExpired(token) : false;
    }
    return false;
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
          // console.log("response.access-->" + response.tokens.access);
          // console.log("response.refresh-->" + response.tokens.refresh);
          // console.log("response.username-->" + response.user.username);
          localStorage.setItem('access_token', response.tokens.access);
          localStorage.setItem('refresh_token', response.tokens.refresh);
          localStorage.setItem('username', response.user.username);
          console.log(response);
          this.isAuthenticatedSubject.next(true);
        }
        this.router.navigate(['']);
        return (0);
      }),
      catchError((error: any) => {
        return of(error.status);
      })
    ));
  }

  logout() : void
  {
    if (isPlatformBrowser(this.platformId))
    {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      this.isAuthenticatedSubject.next(false);
    }
    this.router.navigate(['/login']);
  }

  refreshToken() : Observable<number>
  {
    if (!isPlatformBrowser(this.platformId))
      return (of(401));
    const refresh = localStorage.getItem('refresh');

    if (!refresh)
      return (of(401));
    return (this.httpClient.post('http://localhost:8000/accounts/account_refresh/', {refresh: refresh}).pipe(
      map((response: any) => {
        localStorage.setItem('access', response.access);
        localStorage.setItem('refresh', response.refresh);
        return (0);
      }),
      catchError((error: any) => {
        return of(error.status);
      })
    ));
  }

  getCurrentUser() {
    return this.httpClient.get<UserInterface>(`http://localhost:8000/accounts/me/`);
  }
 
  updateProfile(formData: FormData, username: string): Observable<any> {
    return this.httpClient.put(`http://localhost:8000/accounts/users/${username}/update/`, formData);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

} 