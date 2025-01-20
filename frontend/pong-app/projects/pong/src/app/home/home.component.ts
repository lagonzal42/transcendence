import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  isReady: boolean = false;
  private authSubscription?: Subscription;
  isTutorialVisible = false;
  activation_link: boolean = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute

  ) {}

  onLogout() : void {
    this.authService.logout();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const activated = params['activate-link'];
      this.activation_link = activated;
    })

    this.authSubscription = this.authService.isAuthReady().pipe(
      filter(ready => ready),
      switchMap(() => this.authService.isAuthenticated())
    ).subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
      this.isReady = true;
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
