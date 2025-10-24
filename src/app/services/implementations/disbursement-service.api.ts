import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DisbursementService } from '../abstract/disbursement-service.abstract';
import {
  DisbursementDto,
  CreateDisbursementCommand,
  CreateDisbursementResponse,
  SubmitDisbursementCommand,
  SubmitDisbursementResponse,
  ApproveDisbursementCommand,
  ApproveDisbursementResponse,
  RejectDisbursementCommand,
  RejectDisbursementResponse,
  BackToClientDisbursementCommand,
  BackToClientDisbursementResponse,
  DisbursementTypeDto,
  CurrencyDto,
} from '../../models/disbursement.model';

@Injectable()
export class DisbursementApiService extends DisbursementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Disbursements`;

  override getAllDisbursements(): Observable<DisbursementDto[]> {
    return this.http.get<DisbursementDto[]>(this.baseUrl);
  }

  override getDisbursementById(id: string): Observable<DisbursementDto> {
    return this.http.get<DisbursementDto>(`${this.baseUrl}/${id}`);
  }

  override createDisbursement(
    command: CreateDisbursementCommand
  ): Observable<CreateDisbursementResponse> {
    const formData = this.buildCreateDisbursementFormData(command);
    return this.http.post<CreateDisbursementResponse>(this.baseUrl, formData);
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
    );
  }

  override approveDisbursement(
    command: ApproveDisbursementCommand
  ): Observable<ApproveDisbursementResponse> {
    return this.http.post<ApproveDisbursementResponse>(
      `${this.baseUrl}/${command.disbursementId}/approve`,
      {}
    );
  }

  override rejectDisbursement(
    command: RejectDisbursementCommand
  ): Observable<RejectDisbursementResponse> {
    return this.http.post<RejectDisbursementResponse>(
      `${this.baseUrl}/${command.disbursementId}/reject`,
      { comment: command.comment }
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
    );
  }

  override getDisbursementTypes(): Observable<DisbursementTypeDto[]> {
    return this.http.get<DisbursementTypeDto[]>(`${environment.apiUrl}/DisbursementTypes`);
  }

  override getCurrencies(): Observable<CurrencyDto[]> {
    return this.http.get<CurrencyDto[]>(`${environment.apiUrl}/Currencies`);
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
}
