import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
//import { TranslationService } from '../services/language.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="language-switcher">
    <select 
      class="form-select" 
      (change)="switchLanguage($event)" 
      [value]="currentLanguage">
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
    </select>  
    </div>
  `,
  styles: [`
    .language-switcher {
      margin: 10px;
    }
    .form-select {
      width: auto;
      min-width: 120px;
    }
  `]
})
export class LanguageSwitcherComponent {
  currentLanguage: string;

  constructor(
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.currentLanguage = this.translateService.currentLang || 'en';
  }

  switchLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const lang = target.value;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('selectedLanguage', lang);
    }
    this.translateService.use(lang);
  }
}
