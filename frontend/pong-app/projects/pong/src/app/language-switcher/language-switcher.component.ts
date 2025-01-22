import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../services/language.service';

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
export class LanguageSwitcherComponent {
  currentLanguage: string;

  constructor(private translationService: TranslationService) {
    this.currentLanguage = this.translationService.getCurrentLocale();
  }

  switchLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const locale = target.value;
    this.translationService.setLocale(locale);
  }
}
