import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
//import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import '@angular/localize/init';

// if (environment.production) {
//   enableProdMode();
// }

const locale = localStorage.getItem('locale') || 'en-US';
if (locale === 'es-PR') {
  registerLocaleData(localeEs);
}
else if (locale === 'fr-FR') {
  registerLocaleData(localeEs);
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));/// <reference types="@angular/localize" />
