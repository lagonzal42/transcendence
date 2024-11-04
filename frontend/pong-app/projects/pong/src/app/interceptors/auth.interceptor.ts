import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Add token to request if available
  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap((response: any) => {
            if (response.access) {
              localStorage.setItem('access_token', response.access);
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.access}`
                }
              });
              return next(newReq);
            }
            // If refresh fails, redirect to login
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => new Error('Session expired'));
          }),
          catchError((refreshError) => {
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
}; 