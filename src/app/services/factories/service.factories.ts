import { HttpClient } from '@angular/common/http';
import { AbstractDropdownService } from '../abstract/dropdown-service.abstract';
import { AbstractRegistrationService } from '../abstract/registration-service.abstract';
import { MockDropdownService } from '../implementations/dropdown-service.mock';
import { ApiDropdownService } from '../implementations/dropdown-service.api';
import { MockRegistrationService } from '../implementations/registration-service.mock';
import { ApiRegistrationService } from '../implementations/registration-service.api';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from '../error-handler.service';
import { AbstractProjectsService } from '../abstract/projects-service.abstract';
import { MockProjectsService } from '../implementations/projects-service.mock';
import { ApiProjectsService } from '../implementations/projects-service.api';
import { ClaimService } from '../abstract/claim-service.abstract';
import { ClaimServiceApi } from '../implementations/claim-service.api';
import { ClaimServiceMock } from '../implementations/claim-service.mock';
import { DisbursementService } from '../abstract/disbursement-service.abstract';
import { DisbursementApiService } from '../implementations/disbursement-service.api';
import { DisbursementMockService } from '../implementations/disbursement-service.mock';
import { AbstractDashboardService } from '../abstract/dashboard-service.abstract';
import { ApiDashboardService } from '../implementations/dashboard-service.api';
import { DashboardServiceMock } from '../implementations/dashboard-service.mock';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { MsalInterceptorConfiguration } from '@azure/msal-angular';

/**
 * Factory pour le service dropdown
 * Retourne l'implémentation appropriée selon l'environnement
 */
export function dropdownServiceFactory(http: HttpClient, errorHandler: ErrorHandlerService): AbstractDropdownService {
  if (environment.features.enableMockData) {
    console.log('🔧 [FACTORY] Using MOCK Dropdown Service');
    return new MockDropdownService();
  } else {
    console.log('🔧 [FACTORY] Using API Dropdown Service');
    return new ApiDropdownService(http, errorHandler);
  }
}

/**
 * Factory pour le service d'enregistrement
 * Retourne l'implémentation appropriée selon l'environnement
 */
export function registrationServiceFactory(http: HttpClient, errorHandler: ErrorHandlerService): AbstractRegistrationService {
  if (environment.features.enableMockData) {
    console.log('🔧 [FACTORY] Using MOCK Registration Service');
    return new MockRegistrationService(errorHandler);
  } else {
    console.log('🔧 [FACTORY] Using API Registration Service');
    return new ApiRegistrationService(http, errorHandler);
  }
}

/**
 * Factory pour le service projets
 * Retourne l'implémentation appropriée selon l'environnement
 */
export function projectsServiceFactory(http: HttpClient, errorHandler: ErrorHandlerService): AbstractProjectsService {
  if (environment.features.enableMockData) {
    console.log('🔧 [FACTORY] Using MOCK Projects Service');
    return new MockProjectsService();
  } else {
    console.log('🔧 [FACTORY] Using API Projects Service');
    return new ApiProjectsService(http, errorHandler);
  }
}

/**
 * Factory pour le service claims
 * Retourne l'implémentation appropriée selon l'environnement
 */
export function claimServiceFactory(http: HttpClient, errorHandler: ErrorHandlerService): ClaimService {
  if (environment.features.enableMockData) {
    console.log('🔧 [FACTORY] Using MOCK Claim Service');
    return new ClaimServiceMock();
  } else {
    console.log('🔧 [FACTORY] Using API Claim Service');
    return new ClaimServiceApi(http, errorHandler);
  }
}

/**
 * Factory pour le service disbursement
 * Retourne l'implémentation appropriée selon l'environnement
 */
export function disbursementServiceFactory(): DisbursementService {
   //return new DisbursementMockService();
  if (environment.features.enableMockData) {
    console.log('🔧 [FACTORY] Using MOCK Disbursement Service');
    return new DisbursementMockService();
  } else {
    console.log('🔧 [FACTORY] Using API Disbursement Service');
    return new DisbursementApiService();
  }
}

/**
 * Factory pour le service dashboard
 * Retourne l'implémentation appropriée selon l'environnement
 */
export function dashboardServiceFactory(http: HttpClient, errorHandler: ErrorHandlerService): AbstractDashboardService {
  if (environment.features.enableMockData) {
    console.log('🔧 [FACTORY] Using MOCK Dashboard Service');
    return new DashboardServiceMock();
  } else {
    console.log('🔧 [FACTORY] Using API Dashboard Service');
    return new ApiDashboardService(http, errorHandler);
  }
}

/**
 * Utilitaires pour forcer l'utilisation d'implémentations spécifiques (pour les tests)
 */
export const ServiceFactoryUtils = {
  /**
   * Force l'utilisation des services mock
   */
  createMockServices(http: HttpClient, errorHandler: ErrorHandlerService): {
    dropdownService: AbstractDropdownService;
    registrationService: AbstractRegistrationService;
  } {
    console.log('🔧 [FACTORY] Forcing MOCK services');
    return {
      dropdownService: new MockDropdownService(),
      registrationService: new MockRegistrationService(errorHandler)
    };
  },

  /**
   * Force l'utilisation des services API
   */
  createApiServices(http: HttpClient, errorHandler: ErrorHandlerService): {
    dropdownService: AbstractDropdownService;
    registrationService: AbstractRegistrationService;
  } {
    console.log('🔧 [FACTORY] Forcing API services');
    return {
      dropdownService: new ApiDropdownService(http, errorHandler),
      registrationService: new ApiRegistrationService(http, errorHandler)
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

  protectedResourceMap.set(environment.apiUrl, [environment.azureAd.backendScope]);

  console.log('🔧 [MSAL Interceptor] Protected resource map configured:', {
    url: `${environment.apiUrl}`,
    scope: environment.azureAd.backendScope
  });

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}