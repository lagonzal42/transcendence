import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// import { HomeComponent } from './home/home.component';
// import { AboutComponent } from './about/about.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LayoutComponent, HeaderComponent, FooterComponent, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'pong';
  
  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.translate.addLangs(['fr', 'en', 'es']);
    this.translate.setDefaultLang('en');
    
    // Get stored language or default to 'en'
    let savedLanguage = 'en';
    if (isPlatformBrowser(this.platformId)) {
      savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    }
    this.translate.use(savedLanguage);
  }
}
