import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { filter, switchMap } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent, FooterComponent, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  isReady: boolean = false;
  private authSubscription?: Subscription;
  isTutorialVisible = false;

  constructor(
    private authService: AuthService, private translate: TranslateService ) {
      this.translate.addLangs(['fr', 'en', 'es']);
      this.translate.setDefaultLang('en');
      this.translate.use('en');
  }

  onLogout() : void {
    this.authService.logout();
  }

  ngOnInit() {
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
