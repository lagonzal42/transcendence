import '@angular/common/locales/global/es';
import '@angular/common/locales/global/fr';

// If you specifically need fr-FR variants
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';

registerLocaleData(localeFr, 'fr-FR', localeFrExtra);