import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withHashLocation } from '@angular/router';
import { provideHttpClient, HttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi, withInterceptors } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';

import { routes } from './app.routes';
import { I18nService } from './services/i18n.service';
import { AbstractDropdownService } from './services/abstract/dropdown-service.abstract';
import { AbstractRegistrationService } from './services/abstract/registration-service.abstract';
import { ErrorTranslationService } from './services/error-translation.service';
import { dropdownServiceFactory, MSALInstanceFactory, projectsServiceFactory, registrationServiceFactory } from './services/factories/service.factories';
import { AuthService } from './services/auth.service';
import { AbstractProjectsService } from './services/abstract/projects-service.abstract';
import { MSAL_INSTANCE, MsalService } from '@azure/msal-angular';
import { AuthInterceptor } from './interceptors/auth-interceptor';

// Register locales
registerLocaleData(localeEn, 'en');
registerLocaleData(localeFr, 'fr');

function getLocale(): string {
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale && ['fr', 'en'].includes(savedLocale)) {
    return savedLocale;
  }
  const browserLocale = navigator.language.split('-')[0];
  return ['fr', 'en'].includes(browserLocale) ? browserLocale : 'fr';
}


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withEnabledBlockingInitialNavigation()),
    provideHttpClient(
      withInterceptorsFromDi(),
    ),
    { provide: LOCALE_ID, useValue: getLocale() },
    I18nService,
    ErrorTranslationService,

    // 🏭 PROVIDERS AVEC FACTORIES
    {
      provide: AbstractDropdownService,
      useFactory: dropdownServiceFactory,
      deps: [HttpClient]
    },

    {
      provide: AbstractRegistrationService,
      useFactory: registrationServiceFactory,
      deps: [HttpClient, ErrorTranslationService]
    },
    {
      provide: AbstractProjectsService,
      useFactory: projectsServiceFactory,
      deps: [HttpClient]
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    MsalService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService) => () => auth.waitForInit(),
      deps: [AuthService],
      multi: true
    }
  ]
};