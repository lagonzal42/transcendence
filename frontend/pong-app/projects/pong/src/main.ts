import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeFr from '@angular/common/locales/fr';
import localeEnUs from '@angular/common/locales/en';
import '@angular/localize/init';

// Get the stored locale or default to en-US
const locale = localStorage.getItem('locale') || 'en-US';

// Register all locales
registerLocaleData(localeEs, 'es-PR');
registerLocaleData(localeFr, 'fr-FR');
registerLocaleData(localeEnUs, 'en-US');

// Update the HTML lang attribute
document.documentElement.lang = locale;

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));/// <reference types="@angular/localize" />
