import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    console.log('auth guard')
    if (this.authService.checkAuthStatus())
      {
        console.log('auth true')
        return (true);
        
      }
    else
    {
      console.log('auth false')
      this.router.navigate(['/login']);
      return (false);
    }
  }
}