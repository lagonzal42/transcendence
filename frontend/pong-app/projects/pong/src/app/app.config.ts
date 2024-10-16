import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), 
    provideClientHydration(),
    provideHttpClient(),
    importProvidersFrom(JwtModule.forRoot(
      {
        config:
        {
          tokenGetter: () => localStorage.getItem('token') //define tokenGetter function in jwt module
        }
      }))
  ],
};
