import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { UserInterface } from './login/interfaces/user.interface';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient, private router: Router) { }

  jwtHelper = new JwtHelperService();

  login(userCredentials: UserInterface) : Observable<number>
  {
    return (this.httpClient.post('http://localhost:8000/accounts/account_login/', userCredentials).pipe(
      map((response: any) => {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('refresh', response.refresh_token);
        
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
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    this.router.navigate(['']);
  }

  isAuthenticated() : boolean
  {
    const token = localStorage.getItem('token');

    if (!token)
      return (false);
    return (!this.jwtHelper.isTokenExpired(token));
  }

  refreshToken() : Observable<number>
  {
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
