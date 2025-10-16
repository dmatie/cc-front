import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout, retry, map } from 'rxjs/operators';
import { AbstractDropdownService } from '../abstract/dropdown-service.abstract';
import { Country, UserFunction, BusinessProfile, DropdownResponse, DropdownFilter, FinancingType } from '../../models/dropdown.model';
import { ClaimTypesResponse } from '../../models/claim.model';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from '../error-handler.service';

/**
 * Implémentation API du service dropdown
 */

export class ApiDropdownService extends AbstractDropdownService {
  
  private readonly apiUrl = `${environment.apiUrl}/references`;
  private readonly timeout = 30000; // 30 secondes

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {
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
      catchError(this.errorHandler.handleApiErrorRx('DropdownService'))
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
      catchError(this.errorHandler.handleApiErrorRx('DropdownService'))
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
      catchError(this.errorHandler.handleApiErrorRx('DropdownService'))
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
      catchError(this.errorHandler.handleApiErrorRx('DropdownService'))
    );
  }

  getClaimTypes(): Observable<ClaimTypesResponse> {
    console.log('[API] Fetching claim types');

    return this.http.get<ClaimTypesResponse>(`${this.apiUrl}/claim-types`).pipe(
      timeout(this.timeout),
      retry(2),
      catchError(this.errorHandler.handleApiErrorRx('DropdownService'))
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
        return this.errorHandler.handleApiErrorRx('DropdownService')(error);
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
        return this.errorHandler.handleApiErrorRx('DropdownService')(error);
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
        return this.errorHandler.handleApiErrorRx('DropdownService')(error);
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
        return this.errorHandler.handleApiErrorRx('DropdownService')(error);
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
}