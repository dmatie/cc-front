import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OtherDocumentService } from '../abstract/other-document-service.abstract';
import {
  OtherDocumentsResponse,
  GetOtherDocumentsByUserFilteredQuery,
  GetOtherDocumentsWithFiltersQuery,
  CreateOtherDocumentCommand,
  CreateOtherDocumentResponse,
  OtherDocumentTypeDto,
} from '../../models/other-document.model';
import { ErrorHandlerService } from '../error-handler.service';

@Injectable()
export class OtherDocumentApiService extends OtherDocumentService {
  private readonly http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);

  private readonly baseUrl = `${environment.apiUrl}/OtherDocuments`;
  private readonly projectsUrl = `${environment.apiUrl}/Projects`;

  override getOtherDocumentsByUserFiltered(
    query: GetOtherDocumentsByUserFilteredQuery
  ): Observable<OtherDocumentsResponse> {
    let params = new HttpParams();

    if (query.status !== undefined) {
      params = params.set('status', query.status.toString());
    }
    if (query.otherDocumentTypeId) {
      params = params.set('otherDocumentTypeId', query.otherDocumentTypeId);
    }
    if (query.sapCode) {
      params = params.set('sapCode', query.sapCode);
    }
    if (query.year) {
      params = params.set('year', query.year);
    }
    if (query.createdFrom) {
      params = params.set('createdFrom', query.createdFrom);
    }
    if (query.createdTo) {
      params = params.set('createdTo', query.createdTo);
    }
    if (query.pageNumber !== undefined) {
      params = params.set('pageNumber', query.pageNumber.toString());
    }
    if (query.pageSize !== undefined) {
      params = params.set('pageSize', query.pageSize.toString());
    }

    return this.http.get<OtherDocumentsResponse>(
      `${this.baseUrl}/by-user-filtered`,
      { params }
    ).pipe(
      catchError(this.errorHandler.handleApiErrorRx('OtherDocumentService'))
    );
  }

  override getOtherDocumentsWithFilters(
    query: GetOtherDocumentsWithFiltersQuery
  ): Observable<OtherDocumentsResponse> {
    let params = new HttpParams();

    if (query.status !== undefined) {
      params = params.set('status', query.status.toString());
    }
    if (query.otherDocumentTypeId) {
      params = params.set('otherDocumentTypeId', query.otherDocumentTypeId);
    }
    if (query.sapCode) {
      params = params.set('sapCode', query.sapCode);
    }
    if (query.year) {
      params = params.set('year', query.year);
    }
    if (query.createdFrom) {
      params = params.set('createdFrom', query.createdFrom);
    }
    if (query.createdTo) {
      params = params.set('createdTo', query.createdTo);
    }
    if (query.pageNumber !== undefined) {
      params = params.set('pageNumber', query.pageNumber.toString());
    }
    if (query.pageSize !== undefined) {
      params = params.set('pageSize', query.pageSize.toString());
    }

    return this.http.get<OtherDocumentsResponse>(
      `${this.baseUrl}/with-filters`,
      { params }
    ).pipe(
      catchError(this.errorHandler.handleApiErrorRx('OtherDocumentService'))
    );
  }

  override createOtherDocument(
    command: CreateOtherDocumentCommand
  ): Observable<CreateOtherDocumentResponse> {
    const formData = new FormData();
    formData.append('otherDocumentTypeId', command.otherDocumentTypeId);
    formData.append('name', command.name);
    formData.append('sapCode', command.sapCode);
    formData.append('loanNumber', command.loanNumber);

    if (command.files && command.files.length > 0) {
      command.files.forEach(file => {
        formData.append('files', file);
      });
    }

    return this.http.post<CreateOtherDocumentResponse>(this.baseUrl, formData).pipe(
      catchError(this.errorHandler.handleApiErrorRx('OtherDocumentService'))
    );
  }

  override getOtherDocumentTypes(): Observable<OtherDocumentTypeDto[]> {
    return this.http.get<OtherDocumentTypeDto[]>(`${this.baseUrl}/types`).pipe(
      catchError(this.errorHandler.handleApiErrorRx('OtherDocumentService'))
    );
  }

  override downloadFile(otherDocumentId: string): Observable<Blob> {
    const params = new HttpParams().set('otherDocumentId', otherDocumentId);

    return this.http.get(`${this.baseUrl}/DownloadFile`, {
      params,
      responseType: 'blob'
    }).pipe(
      catchError(this.errorHandler.handleApiErrorRx('OtherDocumentService'))
    );
  }
}
