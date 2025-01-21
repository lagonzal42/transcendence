import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LanguageSwitcherComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUsername: string = '';
  isLoggedIn: boolean = false;
  isReady: boolean = false;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // First wait for auth to be ready
    this.authSubscription = this.authService.isAuthReady().pipe(
      filter(ready => ready),
      switchMap(() => this.authService.isAuthenticated())
    ).subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
      if (isAuthenticated) {
        this.loadCurrentUser();
      } else {
        this.currentUsername = '';
      }
      this.isReady = true;
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadCurrentUser() {
    if (this.authService.checkAuthStatus())
    {  
      this.authService.getCurrentUser().subscribe({
        next: (user) => {
          this.currentUsername = user.username;
        },
        error: (error) => {
          console.error('Error loading current user:', error);
        }
      });
    }
  }

  navigateToProfile() {
    this.currentUsername = localStorage.getItem('username')!;
    if (this.currentUsername) {
      this.router.navigate(['/profile', this.currentUsername]);
    }
  }

  navigateToUpdateProfile() {
    this.currentUsername = localStorage.getItem('username')!
    if (this.currentUsername) {
      this.router.navigate(['/profile', this.currentUsername, 'update']);
    }
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.currentUsername = '';
    this.router.navigate(['/login']);
  }
}
