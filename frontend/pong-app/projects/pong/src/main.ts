import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeFr from '@angular/common/locales/fr';
import '@angular/localize/init';

const locale = localStorage.getItem('locale') || 'en-US';
if (locale === 'es-PR') {
  registerLocaleData(localeEs);
}
else if (locale === 'fr-FR') {
  registerLocaleData(localeFr);
}

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));/// <reference types="@angular/localize" />
