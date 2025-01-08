import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationGuard implements CanActivate {
  private authResult : number;
  constructor(private authService: AuthService, private router: Router) {
    this.authResult = 0;
  }

  canActivate(): boolean {
    console.log('auth guard')
    this.authService.isAuthDone()
    if (this.authService.isAuthenticated())
      {
        console.log('auth true');
        return (true);
        
      }
    else
    {
      console.log('auth false');
      this.router.navigate(['/login']);
      return (false);;
    }
  }
}