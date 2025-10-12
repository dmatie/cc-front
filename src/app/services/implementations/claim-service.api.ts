import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ClaimService } from '../abstract/claim-service.abstract';
import {
  Claim,
  ClaimQueryParams,
  UserClaimQueryParams,
  CreateClaimDto,
  CreateClaimResponse,
  CreateClaimProcessDto
} from '../../models/claim.model';

@Injectable({
  providedIn: 'root'
})
export class ClaimServiceApi extends ClaimService {
  private readonly apiUrl = `${environment.apiUrl}/Claims`;

  constructor(private http: HttpClient) {
    super();
  }

  getClaims(params?: ClaimQueryParams): Observable<Claim[]> {
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

    return this.http.get<Claim[]>(this.apiUrl, { params: httpParams });
  }

  getClaimsByUser(params: UserClaimQueryParams): Observable<Claim[]> {
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

    const url = `${this.apiUrl}/user/${params.userId}`;
    return this.http.get<Claim[]>(url, { params: httpParams });
  }

  getClaimById(id: string): Observable<Claim> {
    return this.http.get<Claim>(`${this.apiUrl}/${id}`);
  }

  createClaim(dto: CreateClaimDto): Observable<CreateClaimResponse> {
    return this.http.post<CreateClaimResponse>(this.apiUrl, dto);
  }

  createClaimProcess(claimId: string, dto: CreateClaimProcessDto): Observable<Claim> {
    const url = `${this.apiUrl}/${claimId}/responses`;
    return this.http.post<Claim>(url, dto);
  }
}
