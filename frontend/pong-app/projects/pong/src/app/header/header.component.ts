import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUsername: string = '';
  isLoggedIn: boolean = false;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.isAuthenticated().subscribe( isAuthenticated => {
      
      this.isLoggedIn = isAuthenticated;
        if (isAuthenticated) {
          this.loadCurrentUser();
        } else {
          this.currentUsername = '';
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadCurrentUser() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUsername = user.username;
      },
      error: (error) => {
        console.error('Error loading current user:', error);
      }
    });
  }

  navigateToProfile() {
    if (this.currentUsername) {
      this.router.navigate(['/profile', this.currentUsername]);
    }
  }

  navigateToUpdateProfile() {
    if (this.currentUsername) {
      this.router.navigate(['/profile', this.currentUsername, 'update']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }
}
