import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // For FormData requests, only add auth header, don't modify content-type
  if (req.body instanceof FormData) {
    // console.log('Interceptor detected FormData - preserving content type');
    const modifiedReq = req.clone({
      headers: req.headers
        .set('Authorization', `Bearer ${authService.getAccessToken()}`)
    });
    return next(modifiedReq);
  }
  
  // For regular requests, add content-type and auth headers
  let modifiedReq = req.clone({
    headers: req.headers
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
  });

  // Add Authorization header if needed
  if (!req.url.includes('/register/') && !req.url.includes('/login/')) {
    const token = authService.getAccessToken();
    if (token) {
      modifiedReq = modifiedReq.clone({
        headers: modifiedReq.headers.set('Authorization', `Bearer ${token}`)
      });
    }
  }

  return next(modifiedReq);
};