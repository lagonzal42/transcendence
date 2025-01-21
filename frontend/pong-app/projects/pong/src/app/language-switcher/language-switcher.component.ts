import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  template: `
    <select (change)="switchLanguage($event.target.value)">
      <option *ngFor="let lang of languages" [value]="lang">{{ lang }}</option>
    </select>
  `
})
export class LanguageSwitcherComponent {
  languages = ['en-US', 'es-PR', 'fr-FR'];

  constructor(private translate: TranslateService) {
    translate.addLangs(this.languages);
    translate.setDefaultLang('en-US');
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }
}