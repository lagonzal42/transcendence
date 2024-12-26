import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  currentUsername: string = '';
  isLoggedIn: boolean = false;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,

  ) {}

  onLogout() : void {
    this.authService.logout();
  }

  ngOnInit() {
    this.authSubscription = this.authService.isAuthenticated().subscribe( isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
    });
  }
}
