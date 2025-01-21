import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-switcher">
      <select 
        class="form-select" 
        (change)="switchLanguage($event)" 
        [value]="currentLanguage">
        <option value="en-US">English</option>
        <option value="es-PR">Español</option>
        <option value="fr-FR">Français</option>
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
export class LanguageSwitcherComponent implements OnInit {
  currentLanguage: string = 'en-US';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.currentLanguage = localStorage.getItem('locale') || 'en-US';
    }
  }

  switchLanguage(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      const newLocale = event.target.value;
      localStorage.setItem('locale', newLocale);
      this.router.navigate([newLocale]);
    }
  }
}