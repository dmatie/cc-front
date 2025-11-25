import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DisbursementService } from '../abstract/disbursement-service.abstract';
import {
  DisbursementDto,
  CreateDisbursementCommand,
  CreateDisbursementResponse,
  EditDisbursementCommand,
  EditDisbursementResponse,
  SubmitDisbursementCommand,
  SubmitDisbursementResponse,
  ApproveDisbursementCommand,
  ApproveDisbursementResponse,
  RejectDisbursementCommand,
  RejectDisbursementResponse,
  BackToClientDisbursementCommand,
  BackToClientDisbursementResponse,
  ReSubmitDisbursementCommand,
  ReSubmitDisbursementResponse,
  DisbursementTypeDto,
  CurrencyDto,
  DisbursementPermissionsDto,
} from '../../models/disbursement.model';
import { ErrorHandlerService } from '../error-handler.service';

@Injectable()
export class DisbursementApiService extends DisbursementService {
  private readonly http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);
  
  private readonly baseUrl = `${environment.apiUrl}/Disbursements`;

  override getAllDisbursements(): Observable<DisbursementDto[]> {
    return this.http.get<DisbursementDto[]>(this.baseUrl).pipe(
          catchError(this.errorHandler.handleApiErrorRx('DisbursementsService'))
        );
  }

  override getAllUserDisbursements(): Observable<DisbursementDto[]> {
    return this.http.get<DisbursementDto[]>(`${this.baseUrl}/by-user`).pipe(
      catchError(this.errorHandler.handleApiErrorRx('DisbursementsService'))
    );
  }


  override getDisbursementById(id: string): Observable<DisbursementDto> {
    return this.http.get<DisbursementDto>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.errorHandler.handleApiErrorRx('DisbursementsService'))
    );
  }

  override createDisbursement(
    command: CreateDisbursementCommand
  ): Observable<CreateDisbursementResponse> {
    const formData = this.buildCreateDisbursementFormData(command);
    return this.http.post<CreateDisbursementResponse>(this.baseUrl, formData).pipe(
      catchError(this.errorHandler.handleApiErrorRx('DisbursementsService'))
    );
  }

  override editDisbursement(
    command: EditDisbursementCommand
  ): Observable<EditDisbursementResponse> {
    const formData = this.buildEditDisbursementFormData(command);
    return this.http.put<EditDisbursementResponse>(`${this.baseUrl}/${command.id}`, formData).pipe(
      catchError(this.errorHandler.handleApiErrorRx('DisbursementsService'))
    );
  }

  override submitDisbursement(
    command: SubmitDisbursementCommand
  ): Observable<SubmitDisbursementResponse> {
    const formData = new FormData();

    if (command.additionalDocuments && command.additionalDocuments.length > 0) {
      command.additionalDocuments.forEach((file) => {
        formData.append('additionalDocuments', file, file.name);
      });
    }

    return this.http.post<SubmitDisbursementResponse>(
      `${this.baseUrl}/${command.disbursementId}/submit`,
      formData
    ).pipe(
      catchError(this.errorHandler.handleApiErrorRx('DisbursementsService'))
    );
  }

  override approveDisbursement(
    command: ApproveDisbursementCommand
  ): Observable<ApproveDisbursementResponse> {
    return this.http.post<ApproveDisbursementResponse>(
      `${this.baseUrl}/${command.disbursementId}/approve`,
      {}
    ).pipe(
      catchError(this.errorHandler.handleApiErrorRx('DisbursementsService'))
    );
  }

  override rejectDisbursement(
    command: RejectDisbursementCommand
  ): Observable<RejectDisbursementResponse> {
    return this.http.post<RejectDisbursementResponse>(
      `${this.baseUrl}/${command.disbursementId}/reject`,
      { comment: command.comment }
    ).pipe(
      catchError(this.errorHandler.handleApiErrorRx('DisbursementsService'))
    );
  }

  override backToClientDisbursement(
    command: BackToClientDisbursementCommand
  ): Observable<BackToClientDisbursementResponse> {
    const formData = new FormData();
    formData.append('comment', command.comment);

    if (command.additionalDocuments && command.additionalDocuments.length > 0) {
      command.additionalDocuments.forEach((file) => {
        formData.append('additionalDocuments', file, file.name);
      });
    }

    return this.http.post<BackToClientDisbursementResponse>(
      `${this.baseUrl}/${command.disbursementId}/back-to-client`,
      formData
    ).pipe(
      catchError(this.errorHandler.handleApiErrorRx('DisbursementsService'))
    );
  }

  override resubmitDisbursement(
    command: ReSubmitDisbursementCommand
  ): Observable<ReSubmitDisbursementResponse> {
    const formData = new FormData();
    formData.append('comment', command.comment);

    if (command.additionalDocuments && command.additionalDocuments.length > 0) {
      command.additionalDocuments.forEach((file) => {
        formData.append('additionalDocuments', file, file.name);
      });
    }

    return this.http.post<ReSubmitDisbursementResponse>(
      `${this.baseUrl}/${command.disbursementId}/resubmit`,
      formData
    ).pipe(
      catchError(this.errorHandler.handleApiErrorRx('DisbursementsService'))
    );
  }

  override getDisbursementTypes(): Observable<DisbursementTypeDto[]> {
    return this.http.get<DisbursementTypeDto[]>(`${environment.apiUrl}/DisbursementTypes`).pipe(
      catchError(this.errorHandler.handleApiErrorRx('DisbursementsService'))
    );
  }

  override getCurrencies(): Observable<CurrencyDto[]> {
    return this.http.get<CurrencyDto[]>(`${environment.apiUrl}/Currencies`).pipe(
      catchError(this.errorHandler.handleApiErrorRx('DisbursementsService'))
    );
  }

  override downloadDocument(
    referenceNumber: string,
    fileName: string
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('ReferenceNumber', referenceNumber)
      .set('FileName', fileName);

    return this.http.get(`${this.baseUrl}/DownloadDocument`, {
      params,
      responseType: 'blob'
    }).pipe(
      catchError(this.errorHandler.handleApiErrorRx('DisbursementsService'))
    );
  }

  override getMyPermissions(): Observable<DisbursementPermissionsDto> {
    return this.http.get<DisbursementPermissionsDto>(`${this.baseUrl}/me/permissions`).pipe(
      catchError(this.errorHandler.handleApiErrorRx('DisbursementsService'))
    );
  }

  private buildCreateDisbursementFormData(command: CreateDisbursementCommand): FormData {
    const formData = new FormData();

    formData.append('sapCodeProject', command.sapCodeProject);
    formData.append('loanGrantNumber', command.loanGrantNumber);
    formData.append('disbursementTypeId', command.disbursementTypeId);
    formData.append('currencyId', command.currencyId);

    if (command.disbursementA1) {
      Object.entries(command.disbursementA1).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`disbursementA1.${key}`, value.toString());
        }
      });
    }

    if (command.disbursementA2) {
      Object.entries(command.disbursementA2).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`disbursementA2.${key}`, value.toString());
        }
      });
    }

    if (command.disbursementA3) {
      Object.entries(command.disbursementA3).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`disbursementA3.${key}`, value.toString());
        }
      });
    }

    if (command.disbursementB1) {
      Object.entries(command.disbursementB1).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`disbursementB1.${key}`, value.toString());
        }
      });
    }

    if (command.documents && command.documents.length > 0) {
      command.documents.forEach((file) => {
        formData.append('documents', file, file.name);
      });
    }

    return formData;
  }

  private buildEditDisbursementFormData(command: EditDisbursementCommand): FormData {
    const formData = new FormData();

    formData.append('id', command.id);
    formData.append('sapCodeProject', command.sapCodeProject);
    formData.append('loanGrantNumber', command.loanGrantNumber);
    formData.append('disbursementTypeId', command.disbursementTypeId);
    formData.append('currencyId', command.currencyId);

    if (command.disbursementA1) {
      Object.entries(command.disbursementA1).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`disbursementA1.${key}`, value.toString());
        }
      });
    }

    if (command.disbursementA2) {
      Object.entries(command.disbursementA2).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`disbursementA2.${key}`, value.toString());
        }
      });
    }

    if (command.disbursementA3) {
      Object.entries(command.disbursementA3).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`disbursementA3.${key}`, value.toString());
        }
      });
    }

    if (command.disbursementB1) {
      Object.entries(command.disbursementB1).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`disbursementB1.${key}`, value.toString());
        }
      });
    }

    if (command.documents && command.documents.length > 0) {
      command.documents.forEach((file) => {
        formData.append('documents', file, file.name);
      });
    }

    return formData;
  }
}
