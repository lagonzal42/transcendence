import { Injectable, Inject , PLATFORM_ID} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { UserInterface } from './login/interfaces/user.interface';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) { }

  jwtHelper = new JwtHelperService();

  login(userCredentials: UserInterface) : Observable<number>
  {
    return (this.httpClient.post('http://localhost:8000/accounts/account_login/', userCredentials).pipe(
      map((response: any) => {
        if (isPlatformBrowser(this.platformId))
        {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('refresh', response.refresh_token);
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
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
    }
    this.router.navigate(['/login']);
  }

  isAuthenticated() : boolean
  {
    if (isPlatformBrowser(this.platformId))
    {
      const token = localStorage.getItem('token');

      if (!token)
        return (false);
      return (!this.jwtHelper.isTokenExpired(token));
    }
    return (false);
  }

  refreshToken() : Observable<number>
  {
    if (!isPlatformBrowser(this.platformId))
      return (of(401));
    const refresh = localStorage.getItem('refresh');

    if (!refresh)
      return (of(401));
    return (this.httpClient.post('http://localhost:8000/accounts/account_refresh/', {refresh_token: refresh}).pipe(
      map((response: any) => {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('refresh', response.refresh_token);
        return (0);
      }),
      catchError((error: any) => {
        return of(error.status);
      })
    ));
  }


}
