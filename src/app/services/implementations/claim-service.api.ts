import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ClaimService } from '../abstract/claim-service.abstract';
import { ErrorHandlerService } from '../error-handler.service';
import {
  Claim,
  ClaimQueryParams,
  UserClaimQueryParams,
  CreateClaimDto,
  CreateClaimResponse,
  CreateClaimProcessDto,
  GetClaimsResponse,
  GetClaimResponse
} from '../../models/claim.model';

@Injectable({
  providedIn: 'root'
})
export class ClaimServiceApi extends ClaimService {
  private readonly apiUrl = `${environment.apiUrl}/Claims`;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {
    super();
  }

  getClaims(params?: ClaimQueryParams): Observable<GetClaimsResponse> {
    let httpParams = new HttpParams();

    if (params?.status) {
      httpParams = httpParams.set('Status', params.status.toString());
    }
    if (params?.pageNumber) {
      httpParams = httpParams.set('PageNumber', params.pageNumber.toString());
    }
    if (params?.pageSize) {
      httpParams = httpParams.set('PageSize', params.pageSize.toString());
    }

    return this.http.get<GetClaimsResponse>(this.apiUrl, { params: httpParams }).pipe(
      catchError(this.errorHandler.handleApiErrorRx('ClaimService'))
    );
  }

  getClaimsWithFilters(params: ClaimQueryParams): Observable<GetClaimsResponse> {
    let httpParams = new HttpParams();

    if (params.status !== undefined && params.status !== null) {
      httpParams = httpParams.set('Status', params.status.toString());
    }
    if (params.claimTypeId) {
      httpParams = httpParams.set('ClaimTypeId', params.claimTypeId);
    }
    if (params.countryId) {
      httpParams = httpParams.set('CountryId', params.countryId);
    }
    if (params.createdFrom) {
      httpParams = httpParams.set('CreatedFrom', params.createdFrom);
    }
    if (params.createdTo) {
      httpParams = httpParams.set('CreatedTo', params.createdTo);
    }
    if (params.pageNumber) {
      httpParams = httpParams.set('PageNumber', params.pageNumber.toString());
    }
    if (params.pageSize) {
      httpParams = httpParams.set('PageSize', params.pageSize.toString());
    }

    const url = `${this.apiUrl}/with-filters`;
    return this.http.get<GetClaimsResponse>(url, { params: httpParams }).pipe(
      catchError(this.errorHandler.handleApiErrorRx('ClaimService'))
    );
  }

  getClaimsByUser(params: UserClaimQueryParams): Observable<GetClaimsResponse> {
    let httpParams = new HttpParams();

    if (params.status) {
      httpParams = httpParams.set('Status', params.status.toString());
    }
    if (params.pageNumber) {
      httpParams = httpParams.set('PageNumber', params.pageNumber.toString());
    }
    if (params.pageSize) {
      httpParams = httpParams.set('PageSize', params.pageSize.toString());
    }

    const url = `${this.apiUrl}/by-user`;
    return this.http.get<GetClaimsResponse>(url, { params: httpParams }).pipe(
      catchError(this.errorHandler.handleApiErrorRx('ClaimService'))
    );
  }

  getClaimsByUserFiltered(params: UserClaimQueryParams): Observable<GetClaimsResponse> {
    let httpParams = new HttpParams();

    if (params.status !== undefined && params.status !== null) {
      httpParams = httpParams.set('Status', params.status.toString());
    }
    if (params.claimTypeId) {
      httpParams = httpParams.set('ClaimTypeId', params.claimTypeId);
    }
    if (params.countryId) {
      httpParams = httpParams.set('CountryId', params.countryId);
    }
    if (params.createdFrom) {
      httpParams = httpParams.set('CreatedFrom', params.createdFrom);
    }
    if (params.createdTo) {
      httpParams = httpParams.set('CreatedTo', params.createdTo);
    }
    if (params.pageNumber) {
      httpParams = httpParams.set('PageNumber', params.pageNumber.toString());
    }
    if (params.pageSize) {
      httpParams = httpParams.set('PageSize', params.pageSize.toString());
    }

    const url = `${this.apiUrl}/by-user-filtered`;
    return this.http.get<GetClaimsResponse>(url, { params: httpParams }).pipe(
      catchError(this.errorHandler.handleApiErrorRx('ClaimService'))
    );
  }

  getClaimById(id: string): Observable<GetClaimResponse> {
    return this.http.get<GetClaimResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.errorHandler.handleApiErrorRx('ClaimService'))
    );
  }

  createClaim(dto: CreateClaimDto): Observable<CreateClaimResponse> {
    return this.http.post<CreateClaimResponse>(this.apiUrl, dto).pipe(
      catchError(this.errorHandler.handleApiErrorRx('ClaimService'))
    );
  }

  createClaimProcess(claimId: string, dto: CreateClaimProcessDto): Observable<Claim> {
    const url = `${this.apiUrl}/${claimId}/responses`;
    return this.http.post<Claim>(url, dto).pipe(
      catchError(this.errorHandler.handleApiErrorRx('ClaimService'))
    );
  }
}
