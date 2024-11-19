import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUsername: string = '';
  isLoggedIn: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated().subscribe({
      next: (isAuthenticated) => {
        this.isLoggedIn = isAuthenticated;
        if (isAuthenticated) {
          this.loadCurrentUser();
        } else {
          this.currentUsername = '';
        }
      }
    });
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
