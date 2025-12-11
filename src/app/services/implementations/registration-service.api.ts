import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, retry, timeout } from 'rxjs/operators';
import { AbstractRegistrationService } from '../abstract/registration-service.abstract';
import { RegistrationRequest, RegistrationResponse, RegistrationStatus, ValidationError, RegistrationDetail, AmendRegistrationRequest, RegistrationResponseAll, ApproveRequest, RejectRequest } from '../../models/registration.model';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from '../error-handler.service';
import { App } from '../../../main';

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
    private errorHandler: ErrorHandlerService
  ) {
    super();
  }

  submitRegistration(request: RegistrationRequest): Observable<RegistrationResponse> {
    console.log('📤 [API] Submitting registration request:', request);

    return this.http.post<RegistrationResponse>(`${this.apiUrl}`, request)
      .pipe(
        timeout(this.timeout),
        map(response => this.processResponse(response)),
        catchError(this.errorHandler.handleApiErrorRx('RegistrationService'))
      );
  }

  getRegistrationStatus(requestId: string): Observable<RegistrationStatus> {
    console.log('🔍 [API] Checking registration status for:', requestId);

    return this.http.get<RegistrationStatus>(`${this.apiUrl}/status/${requestId}`).pipe(
      timeout(this.timeout),
      catchError(this.errorHandler.handleApiErrorRx('RegistrationService'))
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

    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-email/${encodeURIComponent(email)}`).pipe(
      map(response => response.exists),
      catchError(() => throwError(() => false))
    );
  }

  getRegistrationByEmail(email: string): Observable<RegistrationDetail | null> {
    console.log('🔍 [API] Getting registration by email:', email);

    return this.http.get<RegistrationDetail>(`${this.apiUrl}/by-email/?email=${encodeURIComponent(email)}`).pipe(
      timeout(this.timeout),
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        return this.errorHandler.handleApiErrorRx('RegistrationService')(error);
      })
    );
  }

  getRegistrationById(id: string): Observable<RegistrationDetail | null> {
    console.log('🔍 [API] Getting registration by ID:', id);

    return this.http.get<RegistrationDetail>(`${this.apiUrl}/${encodeURIComponent(id)}`).pipe(
      timeout(this.timeout),
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        return this.errorHandler.handleApiErrorRx('RegistrationService')(error);
      })
    );
  }

  sendVerificationCode(email: string, isEmailExist: boolean): Observable<{ success: boolean; message: string; }> {
    console.log('📧 [API] Sending verification code to:', email);

    const body = { email: email, isEmailExist: isEmailExist };
    return this.http.post<{ success: boolean; message: string; }>(`${this.apiUrl}/GenerateOtp`, body).pipe(
      timeout(this.timeout),
      map(response => {
        // Si la réponse est vide, retourne success: true
        if (!response || Object.keys(response).length === 0) {
          return { success: true, message: '' };
        }
        // Sinon, retourne la réponse telle quelle (en ajoutant success: true si absent)
        return { success: response.success ?? true, message: response.message ?? '' };
      }),
      catchError(this.errorHandler.handleApiErrorRx('RegistrationService'))
    );
  }

  verifyCode(email: string, code: string): Observable<boolean> {
    console.log('🔐 [API] Verifying code for email:', email);

    const body = { email: email, code: code };
    return this.http.post<boolean>(`${this.apiUrl}/verify-otp`, body).pipe(
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

    return this.http.delete<{ success: boolean; message: string; }>(`${this.apiUrl}/${id}/abandon`).pipe(
      timeout(this.timeout),
      catchError(this.errorHandler.handleApiErrorRx('RegistrationService'))
    );
  }

  updateRegistration(request: AmendRegistrationRequest): Observable<RegistrationResponse> {
    console.log('📝 [API] Updating registration:', request);

    return this.http.patch<RegistrationResponse>(`${this.apiUrl}`, request).pipe(
      timeout(this.timeout),
      map(response => this.processResponse(response)),
      catchError(this.errorHandler.handleApiErrorRx('RegistrationService'))
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

    return this.http.get<RegistrationResponseAll>(`${this.apiUrl}`, { params }).pipe(
      timeout(this.timeout),
      catchError(this.errorHandler.handleApiErrorRx('RegistrationService'))
    );
  }

  approveRegistration(requestId: string, approveContent: ApproveRequest): Observable<{ success: boolean; message: string; }> {
    console.log('✅ [API] Approving registration:', requestId, approveContent);

    return this.http.post<{ success: boolean; message: string; }>(`${this.apiUrl}/${requestId}/approve-byapp`, approveContent).pipe(
      timeout(this.timeout),
      catchError(this.errorHandler.handleApiErrorRx('RegistrationService'))
    );
  }

  rejectRegistration(requestId: string, rejectContent: RejectRequest): Observable<{ success: boolean; message: string; }> {
    console.log('❌ [API] Rejecting registration:', requestId, rejectContent);

    return this.http.post<{ success: boolean; message: string; }>(`${this.apiUrl}/${requestId}/reject-byapp`, rejectContent).pipe(
      timeout(this.timeout),
      catchError(this.errorHandler.handleApiErrorRx('RegistrationService'))
    );
  }

  getApprovedAccessRequests(filters: {
    countryId?: string;
    projectCode?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<RegistrationResponseAll> {
    console.log('✅ [API] Getting approved access requests with filters:', filters);

    let params = new HttpParams();
    if (filters.countryId) params = params.set('countryId', filters.countryId);
    if (filters.projectCode) params = params.set('projectCode', filters.projectCode);
    if (filters.pageNumber) params = params.set('pageNumber', filters.pageNumber.toString());
    if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());

    return this.http.get<RegistrationResponseAll>(`${this.apiUrl}/approved`, { params }).pipe(
      timeout(this.timeout),
      catchError(this.errorHandler.handleApiErrorRx('RegistrationService'))
    );
  }

  submitAccessRequest(id: string, registrationCode: string, document: File): Observable<RegistrationResponse> {
    console.log('📤 [API] Submitting access request:', id);

    const formData = new FormData();
    formData.append('AccessRequestId', id);
    formData.append('RegistrationCode', registrationCode);
    formData.append('Document', document);

    return this.http.post<RegistrationResponse>(`${this.apiUrl}/${id}/submit`, formData).pipe(
      timeout(this.timeout),
      catchError(this.errorHandler.handleApiErrorRx('RegistrationService'))
    );
  }

  downloadSignedForm(requestId: string): Observable<Blob> {
    console.log('📥 [API] Downloading signed form for request:', requestId);

    return this.http.get(`${this.apiUrl}/downloadsignedform?Id=${requestId}`, {
      responseType: 'blob'
    }).pipe(
      timeout(this.timeout),
      catchError(this.errorHandler.handleApiErrorRx('RegistrationService'))
    );
  }

  // MÉTHODES PRIVÉES

  private processResponse(response: RegistrationResponse): RegistrationResponse {
    console.log('✅ [API] Response received:', response);
    return response;
  }
}