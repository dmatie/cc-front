import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, retry, timeout } from 'rxjs/operators';
import { AbstractRegistrationService } from '../abstract/registration-service.abstract';
import { RegistrationRequest, RegistrationResponse, RegistrationStatus, ValidationError, RegistrationDetail, AmendRegistrationRequest, RegistrationResponseAll } from '../../models/registration.model';
import { environment } from '../../../environments/environment';
import { ErrorTranslationService } from '../error-translation.service';

/**
 * Implémentation API du service d'enregistrement
 */
@Injectable({
  providedIn: 'root'
})
export class ApiRegistrationService extends AbstractRegistrationService {

  private readonly apiUrl = `${environment.apiUrl}/AccessRequests`;
  private readonly timeout = 30000; // 30 secondes

  constructor(
    private http: HttpClient,
    private errorTranslation: ErrorTranslationService
  ) {
    super();
  }

  submitRegistration(request: RegistrationRequest): Observable<RegistrationResponse> {
    console.log('📤 [API] Submitting registration request:', request);

    const headers = this.getHeaders();

    return this.http.post<RegistrationResponse>(`${this.apiUrl}`, request, { headers })
      .pipe(
        timeout(this.timeout),
        map(response => this.processResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  getRegistrationStatus(requestId: string): Observable<RegistrationStatus> {
    console.log('🔍 [API] Checking registration status for:', requestId);

    return this.http.get<RegistrationStatus>(`${this.apiUrl}/status/${requestId}`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(error => this.handleError(error))
    );
  }

  validateRegistrationData(request: RegistrationRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!request.email || !emailRegex.test(request.email)) {
      errors.push({
        field: 'email',
        message: 'Format d\'email invalide',
        code: 'INVALID_EMAIL'
      });
    }

    // Validation du prénom
    if (!request.firstName || request.firstName.trim().length < 2) {
      errors.push({
        field: 'firstName',
        message: 'Le prénom doit contenir au moins 2 caractères',
        code: 'FIRSTNAME_TOO_SHORT'
      });
    }

    // Validation du nom
    if (!request.lastName || request.lastName.trim().length < 2) {
      errors.push({
        field: 'lastName',
        message: 'Le nom doit contenir au moins 2 caractères',
        code: 'LASTNAME_TOO_SHORT'
      });
    }

    // Validation de la fonction
    if (!request.functionId) {
      errors.push({
        field: 'functionId',
        message: 'La fonction est requise',
        code: 'FUNCTION_REQUIRED'
      });
    }

    // Validation du pays
    if (!request.countryId) {
      errors.push({
        field: 'countryId',
        message: 'Le pays est requis',
        code: 'COUNTRY_REQUIRED'
      });
    }

    // Validation du profil d'entreprise
    if (!request.businessProfileId) {
      errors.push({
        field: 'businessProfileId',
        message: 'Le profil d\'entreprise est requis',
        code: 'BUSINESS_PROFILE_REQUIRED'
      });
    }

    // Validation du type de financement
    if (!request.financingTypeId) {
      errors.push({
        field: 'financingTypeId',
        message: 'Le type de financement est requis',
        code: 'FINANCING_TYPE_REQUIRED'
      });
    }

    // Validation des projets sélectionnés
    if (!request.selectedProjectCodes || request.selectedProjectCodes.length === 0) {
      errors.push({
        field: 'selectedProjectCodes',
        message: 'Au moins un projet doit être sélectionné',
        code: 'PROJECTS_REQUIRED'
      });
    }

    return errors;
  }

  checkEmailExists(email: string): Observable<boolean> {
    console.log('📧 [API] Checking if email exists:', email);

    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-email/${encodeURIComponent(email)}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.exists),
      catchError(() => throwError(() => false))
    );
  }

  getRegistrationByEmail(email: string): Observable<RegistrationDetail | null> {
    console.log('🔍 [API] Getting registration by email:', email);

    return this.http.get<RegistrationDetail>(`${this.apiUrl}/by-email/?email=${encodeURIComponent(email)}`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        return this.handleError(error);
      })
    );
  }

  getRegistrationById(id: string): Observable<RegistrationDetail | null> {
    console.log('🔍 [API] Getting registration by ID:', id);

    return this.http.get<RegistrationDetail>(`${this.apiUrl}/${encodeURIComponent(id)}`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        return this.handleError(error);
      })
    );
  }

  sendVerificationCode(email: string, isEmailExist: boolean): Observable<{ success: boolean; message: string; }> {
    console.log('📧 [API] Sending verification code to:', email);

    const body = { email: email, isEmailExist: isEmailExist };
    return this.http.post<{ success: boolean; message: string; }>(`${this.apiUrl}/GenerateOtp`, body, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      map(response => {
        // Si la réponse est vide, retourne success: true
        if (!response || Object.keys(response).length === 0) {
          return { success: true, message: '' };
        }
        // Sinon, retourne la réponse telle quelle (en ajoutant success: true si absent)
        return { success: response.success ?? true, message: response.message ?? '' };
      }),
      catchError(error => this.handleError(error))
    );
  }

  verifyCode(email: string, code: string): Observable<boolean> {
    console.log('🔐 [API] Verifying code for email:', email);

    const body = { email: email, code: code };
    return this.http.post<boolean>(`${this.apiUrl}/verify-otp`, body, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      map(response => response),
      catchError(error => {
        console.error('❌ [API] Code verification failed:', error);
        return of(false);
      })
    );
  }

  abandonRegistration(id: string): Observable<{ success: boolean; message: string; }> {
    console.log('🗑️ [API] Abandoning registration:', id);

    return this.http.delete<{ success: boolean; message: string; }>(`${this.apiUrl}/${id}/abandon`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(error => this.handleError(error))
    );
  }

  updateRegistration(request: AmendRegistrationRequest): Observable<RegistrationResponse> {
    console.log('📝 [API] Updating registration:', request);

    return this.http.patch<RegistrationResponse>(`${this.apiUrl}`, request, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      map(response => this.processResponse(response)),
      catchError(error => this.handleError(error))
    );
  }

  getAllRegistrations(filter?: { status?: string; dateFrom?: Date; dateTo?: Date; search?: string; }): Observable<RegistrationResponseAll> {
    console.log('📋 [API] Getting all registrations with filter:', filter);

    let params = new HttpParams();
    if (filter) {
      if (filter.status) params = params.set('status', filter.status);
      if (filter.dateFrom) params = params.set('dateFrom', filter.dateFrom.toISOString());
      if (filter.dateTo) params = params.set('dateTo', filter.dateTo.toISOString());
      if (filter.search) params = params.set('search', filter.search);
    }

    return this.http.get<RegistrationResponseAll>(`${this.apiUrl}`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      timeout(this.timeout),
      catchError(error => this.handleError(error))
    );
  }

  approveRegistration(requestId: string, approverNotes?: string): Observable<{ success: boolean; message: string; }> {
    console.log('✅ [API] Approving registration:', requestId, approverNotes);

    const body = { approverNotes };
    return this.http.post<{ success: boolean; message: string; }>(`${this.apiUrl}/${requestId}/approve`, body, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(error => this.handleError(error))
    );
  }

  rejectRegistration(requestId: string, rejectionReason: string): Observable<{ success: boolean; message: string; }> {
    console.log('❌ [API] Rejecting registration:', requestId, rejectionReason);

    const body = { rejectionReason };
    return this.http.post<{ success: boolean; message: string; }>(`${this.apiUrl}/${requestId}/reject`, body, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(error => this.handleError(error))
    );
  }

  // MÉTHODES PRIVÉES

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }


    return new HttpHeaders(headers);
  }

  private processResponse(response: RegistrationResponse): RegistrationResponse {
    console.log('✅ [API] Response received:', response);
    return response;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ [API] Error during registration:', error);

    let errorMessage = 'Une erreur inattendue s\'est produite';
    let errors: ValidationError[] = [];

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur réseau: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Données invalides';
          errors = (error.error?.errors || []).map((err: any) => ({
            field: err.field,
            error: err.error,
            message: this.errorTranslation.translateErrorCode(err.error),
            code: err.error
          }));
          break;
        case 409:
          errorMessage = 'Un compte avec cet email existe déjà';
          break;
        case 429:
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard';
          break;
      }
    }

    return throwError(() => ({ message: errorMessage, errors }));
  }
}