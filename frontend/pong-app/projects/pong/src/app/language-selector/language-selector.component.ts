import { Component } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-selector">
      <select (change)="onLanguageChange($event)" [value]="currentLang$ | async">
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </div>
  `,
  styles: [`
    .language-selector {
      margin: 0 10px;
    }
    select {
      padding: 5px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }
  `]
})
export class LanguageSelectorComponent {
  currentLang$ = this.translationService.currentLang$;

  constructor(private translationService: TranslationService) {}

  onLanguageChange(event: any) {
    this.translationService.setLanguage(event.target.value);
  }
}
