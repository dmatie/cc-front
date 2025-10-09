import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout, retry, map } from 'rxjs/operators';
import { AbstractDropdownService } from '../abstract/dropdown-service.abstract';
import { Country, UserFunction, BusinessProfile, DropdownResponse, DropdownFilter, FinancingType } from '../../models/dropdown.model';
import { environment } from '../../../environments/environment';

/**
 * Implémentation API du service dropdown
 */

export class ApiDropdownService extends AbstractDropdownService {
  
  private readonly apiUrl = `${environment.apiUrl}/references`;
  private readonly timeout = 30000; // 30 secondes

  constructor(private http: HttpClient) {
    super();
  }

  getCountries(filter?: DropdownFilter): Observable<DropdownResponse<Country>> {
    console.log('[API] Fetching countries with filter:', filter);

    const params = this.buildHttpParams(filter);
    return this.http.get<{countries: Country[], totalCount: number}>(`${this.apiUrl}/countries`, { params }).pipe(
      timeout(this.timeout),
      retry(2),
      map(response => ({
        success: true,
        data: response.countries,
        total: response.totalCount,
        message: 'Countries loaded successfully'
      })),
      catchError(error => this.handleError('countries', error))
    );
  }

  getFunctions(filter?: DropdownFilter): Observable<DropdownResponse<UserFunction>> {
    console.log('[API] Fetching functions with filter:', filter);

    const params = this.buildHttpParams(filter);
    return this.http.get<{functions: UserFunction[], totalCount: number}>(`${this.apiUrl}/functions`, { params }).pipe(
      timeout(this.timeout),
      retry(2),
      map(response => ({
        success: true,
        data: response.functions,
        total: response.totalCount,
        message: 'Functions loaded successfully'
      })),
      catchError(error => this.handleError('functions', error))
    );
  }

  getBusinessProfiles(filter?: DropdownFilter): Observable<DropdownResponse<BusinessProfile>> {
    console.log('Fetching business profiles with filter:', filter);

    const params = this.buildHttpParams(filter);
    return this.http.get<{businessProfiles: BusinessProfile[], totalCount: number}>(`${this.apiUrl}/business-profiles`, { params }).pipe(
      timeout(this.timeout),
      retry(2),
      map(response => ({
        success: true,
        data: response.businessProfiles,
        total: response.totalCount,
        message: 'Business profiles loaded successfully'
      })),
      catchError(error => this.handleError('business-profiles', error))
    );
  }

  getFinancingTypes(filter?: DropdownFilter): Observable<DropdownResponse<FinancingType>> {
    console.log('[API] Fetching business profiles with filter:', filter);

    const params = this.buildHttpParams(filter);
    return this.http.get<{financingTypes: FinancingType[], totalCount: number}>(`${this.apiUrl}/financing-types`, { params }).pipe(
      timeout(this.timeout),
      retry(2),
      map(response => ({
        success: true,
        data: response.financingTypes,
        total: response.totalCount,
        message: 'Business profiles loaded successfully'
      })),
      catchError(error => this.handleError('financing-types', error))
    );
  }

  getCountryById(id: string): Observable<Country | null> {
    console.log('[API] Fetching country by ID:', id);

    return this.http.get<Country>(`${this.apiUrl}/countries/${id}`).pipe(
      timeout(this.timeout),
      catchError(error => {
        if (error.status === 404) {
          return throwError(() => null);
        }
        return this.handleError('country', error);
      })
    );
  }

  getFunctionById(id: string): Observable<UserFunction | null> {
    console.log('[API] Fetching function by ID:', id);

    return this.http.get<UserFunction>(`${this.apiUrl}/functions/${id}`).pipe(
      timeout(this.timeout),
      catchError(error => {
        if (error.status === 404) {
          return throwError(() => null);
        }
        return this.handleError('function', error);
      })
    );
  }

  getBusinessProfileById(id: string): Observable<BusinessProfile | null> {
    console.log('[API] Fetching business profile by ID:', id);

    return this.http.get<BusinessProfile>(`${this.apiUrl}/business-profiles/${id}`).pipe(
      timeout(this.timeout),
      catchError(error => {
        if (error.status === 404) {
          return throwError(() => null);
        }
        return this.handleError('business-profile', error);
      })
    );
  }

  getFInancingTypeById(id: string): Observable<FinancingType | null> {
    console.log('[API] Financing types by ID:', id);

    return this.http.get<FinancingType>(`${this.apiUrl}/financing-types/${id}`).pipe(
      timeout(this.timeout),
      catchError(error => {
        if (error.status === 404) {
          return throwError(() => null);
        }
        return this.handleError('financing-types', error);
      })
    );
  }

  // MÉTHODES PRIVÉES

  private buildHttpParams(filter?: DropdownFilter): HttpParams {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.search) params = params.set('search', filter.search);
      if (filter.isActive !== undefined) params = params.set('isActive', filter.isActive.toString());
      if (filter.category) params = params.set('category', filter.category);
      if (filter.sector) params = params.set('sector', filter.sector);
      if (filter.region) params = params.set('region', filter.region);
    }
    
    return params;
  }

  private handleError(endpoint: string, error: any): Observable<never> {
    console.error(`[API] Error fetching ${endpoint}:`, error);
    
    let errorMessage = 'Une erreur inattendue s\'est produite';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur réseau: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = 'Paramètres de requête invalides';
          break;
        case 401:
          errorMessage = 'Non autorisé';
          break;
        case 403:
          errorMessage = 'Accès interdit';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 429:
          errorMessage = 'Trop de requêtes. Veuillez réessayer plus tard';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
    }

    const errorResponse: DropdownResponse<any> = {
      success: false,
      data: [],
      total: 0,
      message: errorMessage
    };

    return throwError(() => errorResponse);
  }
}