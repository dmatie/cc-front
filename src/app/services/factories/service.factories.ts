import { HttpClient } from '@angular/common/http';
import { AbstractDropdownService } from '../abstract/dropdown-service.abstract';
import { AbstractRegistrationService } from '../abstract/registration-service.abstract';
import { MockDropdownService } from '../implementations/dropdown-service.mock';
import { ApiDropdownService } from '../implementations/dropdown-service.api';
import { MockRegistrationService } from '../implementations/registration-service.mock';
import { ApiRegistrationService } from '../implementations/registration-service.api';
import { environment } from '../../../environments/environment';
import { ErrorTranslationService } from '../error-translation.service';
import { AbstractProjectsService } from '../abstract/projects-service.abstract';
import { MockProjectsService } from '../implementations/projects-service.mock';
import { ApiProjectsService } from '../implementations/projects-service.api';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { MsalInterceptorConfiguration } from '@azure/msal-angular';

/**
 * Factory pour le service dropdown
 * Retourne l'implémentation appropriée selon l'environnement
 */
export function dropdownServiceFactory(http: HttpClient): AbstractDropdownService {
  if (environment.features.enableMockData) {
    console.log('🔧 [FACTORY] Using MOCK Dropdown Service');
    return new MockDropdownService();
  } else {
    console.log('🔧 [FACTORY] Using API Dropdown Service');
    return new ApiDropdownService(http);
  }
}

/**
 * Factory pour le service d'enregistrement
 * Retourne l'implémentation appropriée selon l'environnement
 */
export function registrationServiceFactory(http: HttpClient, errorTranslation: ErrorTranslationService): AbstractRegistrationService {
  if (environment.features.enableMockData) {
    console.log('🔧 [FACTORY] Using MOCK Registration Service');
    return new MockRegistrationService(errorTranslation);
  } else {
    console.log('🔧 [FACTORY] Using API Registration Service');
    return new ApiRegistrationService(http, errorTranslation);
  }
}

/**
 * Factory pour le service projets
 * Retourne l'implémentation appropriée selon l'environnement
 */
export function projectsServiceFactory(http: HttpClient): AbstractProjectsService {
  if (environment.features.enableMockData) {
    console.log('🔧 [FACTORY] Using MOCK Projects Service');
    return new MockProjectsService();
  } else {
    console.log('🔧 [FACTORY] Using API Projects Service');
    return new ApiProjectsService(http);
  }
}

/**
 * Utilitaires pour forcer l'utilisation d'implémentations spécifiques (pour les tests)
 */
export const ServiceFactoryUtils = {
  /**
   * Force l'utilisation des services mock
   */
  createMockServices(http: HttpClient, errorTranslation: ErrorTranslationService): {
    dropdownService: AbstractDropdownService;
    registrationService: AbstractRegistrationService;
  } {
    console.log('🔧 [FACTORY] Forcing MOCK services');
    return {
      dropdownService: new MockDropdownService(),
      registrationService: new MockRegistrationService(errorTranslation)
    };
  },

  /**
   * Force l'utilisation des services API
   */
  createApiServices(http: HttpClient, errorTranslation: ErrorTranslationService): {
    dropdownService: AbstractDropdownService;
    registrationService: AbstractRegistrationService;
  } {
    console.log('🔧 [FACTORY] Forcing API services');
    return {
      dropdownService: new ApiDropdownService(http),
      registrationService: new ApiRegistrationService(http, errorTranslation)
    };
  }
};


export function MSALInstanceFactory() {
  return new PublicClientApplication({
      auth: {
        clientId: environment.azureAd.clientId,
        authority: environment.azureAd.authority,
        redirectUri: environment.azureAd.redirectUri,
        postLogoutRedirectUri: environment.azureAd.postLogoutRedirectUri
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false
      }
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set('https://localhost:7242/api/*', [environment.azureAd.backendScope]);
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}