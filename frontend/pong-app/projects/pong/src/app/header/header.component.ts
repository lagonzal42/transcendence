import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TranslationService } from '../services/translation.service';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, LanguageSelectorComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUsername: string = '';
  isLoggedIn: boolean = false;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translationService: TranslationService
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
    this.router.navigate(['']);
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }
}
