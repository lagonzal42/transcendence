import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private currentLocale = new BehaviorSubject<string>('en-US');
  currentLocale$ = this.currentLocale.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private getStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? window.localStorage : null;
  }

  setLocale(locale: string): void {
    const storage = this.getStorage();
    if (storage) {
      storage.setItem('locale', locale);
      
      // Map locales to ports
      const portMap: { [key: string]: number } = {
        'en-US': 4200,
        'es-PR': 4201,
        'fr-FR': 4202
      };

      // Get the port for the selected locale
      const port = portMap[locale];
      if (port) {
        // Keep the same path but change the port
        const currentPath = window.location.pathname;
        const newUrl = `${window.location.protocol}//${window.location.hostname}:${port}${currentPath}`;
        window.location.href = newUrl;
      }
    }
  }

  getCurrentLocale(): string {
    const storage = this.getStorage();
    return storage ? storage.getItem('locale') || 'en-US' : 'en-US';
  }
}
