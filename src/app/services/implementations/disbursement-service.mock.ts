import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
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
  DisbursementStatus,
} from '../../models/disbursement.model';

@Injectable()
export class DisbursementMockService extends DisbursementService {
  private mockDisbursements: DisbursementDto[] = [
    {
      id: '1',
      requestNumber: 'DISB-2024-001',
      sapCodeProject: 'P-MA-AAA-001',
      loanGrantNumber: 'LG-2024-001',
      currencyId: '1',
      currency: 'USD',
      disbursementTypeId: '1',
      disbursementTypeCode: 'A1',
      disbursementTypeName: 'Direct Payment',
      disbursementTypeNameFr: 'Paiement Direct',
      status: DisbursementStatus.Draft,
      createdByUserId: '1',
      createdByUserName: 'John Doe',
      createdByUserEmail: 'john.doe@example.com',
      createdAt: '2024-01-15T10:00:00Z',
      createdBy: 'john.doe@example.com',
      processes: [],
      documents: [],
      disbursementA1: {
        id: '1',
        disbursementId: '1',
        paymentPurpose: 'Equipment purchase',
        beneficiaryBpNumber: 'BP001',
        beneficiaryName: 'ABC Corporation',
        beneficiaryContactPerson: 'Jane Smith',
        beneficiaryAddress: '123 Main St',
        beneficiaryCountryId: '1',
        beneficiaryEmail: 'jane@abc.com',
        correspondentBankName: 'XYZ Bank',
        correspondentBankAddress: '456 Bank St',
        correspondentBankCountryId: '1',
        correspondantAccountNumber: '123456789',
        correspondentBankSwiftCode: 'XYZBUS33',
        amount: 50000,
        signatoryName: 'Mike Johnson',
        signatoryContactPerson: 'Mike Johnson',
        signatoryAddress: '789 Corporate Ave',
        signatoryCountryId: '1',
        signatoryEmail: 'mike@abc.com',
        signatoryPhone: '+1234567890',
        signatoryTitle: 'CFO',
      },
    },
    {
      id: '2',
      requestNumber: 'DISB-2024-002',
      sapCodeProject: 'P-TN-BBB-002',
      loanGrantNumber: 'LG-2024-002',
      currencyId: '2',
      currency: 'EUR',
      disbursementTypeId: '2',
      disbursementTypeCode: 'A2',
      disbursementTypeName: 'Reimbursement',
      disbursementTypeNameFr: 'Remboursement',
      status: DisbursementStatus.Submitted,
      createdByUserId: '2',
      createdByUserName: 'Alice Brown',
      createdByUserEmail: 'alice.brown@example.com',
      submittedAt: '2024-01-20T14:30:00Z',
      createdAt: '2024-01-18T09:00:00Z',
      createdBy: 'alice.brown@example.com',
      processes: [
        {
          id: '1',
          disbursementId: '2',
          status: DisbursementStatus.Submitted,
          processedByUserId: '2',
          processedByUserName: 'Alice Brown',
          processedByUserEmail: 'alice.brown@example.com',
          comment: 'Submitted for review',
          processedAt: '2024-01-20T14:30:00Z',
          createdBy: 'alice.brown@example.com',
          createdAt: '2024-01-20T14:30:00Z',
        },
      ],
      documents: [
        {
          id: '1',
          disbursementId: '2',
          fileName: 'invoice.pdf',
          fileUrl: '/files/invoice.pdf',
          contentType: 'application/pdf',
          fileSize: 256000,
          uploadedAt: '2024-01-18T09:00:00Z',
          createdBy: 'alice.brown@example.com',
          createdAt: '2024-01-18T09:00:00Z',
        },
      ],
      disbursementA2: {
        id: '2',
        disbursementId: '2',
        reimbursementPurpose: 'Construction materials',
        contractor: 'Build Corp',
        goodDescription: 'Cement and steel',
        goodOrginCountryId: '2',
        contractBorrowerReference: 'CBR-2024-001',
        contractAfDBReference: 'AFDB-2024-001',
        contractValue: '100000',
        contractBankShare: '80000',
        contractAmountPreviouslyPaid: 20000,
        invoiceRef: 'INV-2024-001',
        invoiceDate: '2024-01-15T00:00:00Z',
        invoiceAmount: 30000,
        paymentDateOfPayment: '2024-01-16T00:00:00Z',
        paymentAmountWithdrawn: 30000,
        paymentEvidenceOfPayment: 'Receipt #12345',
      },
    },
  ];

  private mockDisbursementTypes: DisbursementTypeDto[] = [
    {
      id: '1',
      code: 'A1',
      name: 'Direct Payment',
      nameFr: 'Paiement Direct',
      description: 'Direct payment to beneficiary',
    },
    {
      id: '2',
      code: 'A2',
      name: 'Reimbursement',
      nameFr: 'Remboursement',
      description: 'Reimbursement of expenses',
    },
    {
      id: '3',
      code: 'A3',
      name: 'Special Commitment',
      nameFr: 'Engagement Spécial',
      description: 'Special commitment procedure',
    },
    {
      id: '4',
      code: 'B1',
      name: 'Letter of Credit',
      nameFr: 'Lettre de Crédit',
      description: 'Letter of credit issuance',
    },
  ];

  private mockCurrencies: CurrencyDto[] = [
    { id: '1', code: 'USD', name: 'US Dollar', symbol: '$' },
    { id: '2', code: 'EUR', name: 'Euro', symbol: '€' },
    { id: '3', code: 'GBP', name: 'British Pound', symbol: '£' },
    { id: '4', code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA' },
  ];

  override getAllDisbursements(): Observable<DisbursementDto[]> {
    return of(this.mockDisbursements).pipe(delay(500));
  }

  override getAllUserDisbursements(): Observable<DisbursementDto[]> {
    return of(this.mockDisbursements).pipe(delay(500));
  }

  override getDisbursementById(id: string): Observable<DisbursementDto> {
    const disbursement = this.mockDisbursements.find((d) => d.id === id);
    if (!disbursement) {
      return throwError(() => new Error('Disbursement not found'));
    }
    return of(disbursement).pipe(delay(300));
  }

  override createDisbursement(
    command: CreateDisbursementCommand
  ): Observable<CreateDisbursementResponse> {
    const newDisbursement: DisbursementDto = {
      id: (this.mockDisbursements.length + 1).toString(),
      requestNumber: `DISB-2024-${String(this.mockDisbursements.length + 1).padStart(3, '0')}`,
      sapCodeProject: command.sapCodeProject,
      loanGrantNumber: command.loanGrantNumber,
      currencyId: command.currencyId,
      currency: this.mockCurrencies.find((c) => c.id === command.currencyId)?.code || 'USD',
      disbursementTypeId: command.disbursementTypeId,
      disbursementTypeCode:
        this.mockDisbursementTypes.find((t) => t.id === command.disbursementTypeId)?.code || 'A1',
      disbursementTypeName:
        this.mockDisbursementTypes.find((t) => t.id === command.disbursementTypeId)?.name ||
        'Direct Payment',
      disbursementTypeNameFr:
        this.mockDisbursementTypes.find((t) => t.id === command.disbursementTypeId)?.nameFr ||
        'Paiement Direct',
      status: DisbursementStatus.Draft,
      createdByUserId: '1',
      createdByUserName: 'Current User',
      createdByUserEmail: 'current.user@example.com',
      createdAt: new Date().toISOString(),
      createdBy: 'current.user@example.com',
      processes: [],
      documents: [],
    };

    this.mockDisbursements.push(newDisbursement);

    const response: CreateDisbursementResponse = {
      disbursement: newDisbursement,
      message: 'Disbursement created successfully',
    };

    return of(response).pipe(delay(500));
  }

  override submitDisbursement(
    command: SubmitDisbursementCommand
  ): Observable<SubmitDisbursementResponse> {
    const disbursement = this.mockDisbursements.find((d) => d.id === command.disbursementId);
    if (!disbursement) {
      return throwError(() => new Error('Disbursement not found'));
    }

    disbursement.status = DisbursementStatus.Submitted;
    disbursement.submittedAt = new Date().toISOString();

    const response: SubmitDisbursementResponse = {
      disbursement,
      message: 'Disbursement submitted successfully',
    };

    return of(response).pipe(delay(500));
  }

  override approveDisbursement(
    command: ApproveDisbursementCommand
  ): Observable<ApproveDisbursementResponse> {
    const disbursement = this.mockDisbursements.find((d) => d.id === command.disbursementId);
    if (!disbursement) {
      return throwError(() => new Error('Disbursement not found'));
    }

    disbursement.status = DisbursementStatus.Approved;
    disbursement.processedAt = new Date().toISOString();
    disbursement.processedByUserId = '3';
    disbursement.processedByUserName = 'Admin User';
    disbursement.processedByUserEmail = 'admin@example.com';

    const response: ApproveDisbursementResponse = {
      disbursement,
      message: 'Disbursement approved successfully',
    };

    return of(response).pipe(delay(500));
  }

  override rejectDisbursement(
    command: RejectDisbursementCommand
  ): Observable<RejectDisbursementResponse> {
    const disbursement = this.mockDisbursements.find((d) => d.id === command.disbursementId);
    if (!disbursement) {
      return throwError(() => new Error('Disbursement not found'));
    }

    disbursement.status = DisbursementStatus.Rejected;
    disbursement.processedAt = new Date().toISOString();
    disbursement.processedByUserId = '3';
    disbursement.processedByUserName = 'Admin User';
    disbursement.processedByUserEmail = 'admin@example.com';

    disbursement.processes.push({
      id: (disbursement.processes.length + 1).toString(),
      disbursementId: disbursement.id,
      status: DisbursementStatus.Rejected,
      processedByUserId: '3',
      processedByUserName: 'Admin User',
      processedByUserEmail: 'admin@example.com',
      comment: command.comment,
      processedAt: new Date().toISOString(),
      createdBy: 'admin@example.com',
      createdAt: new Date().toISOString(),
    });

    const response: RejectDisbursementResponse = {
      disbursement,
      message: 'Disbursement rejected successfully',
    };

    return of(response).pipe(delay(500));
  }

  override backToClientDisbursement(
    command: BackToClientDisbursementCommand
  ): Observable<BackToClientDisbursementResponse> {
    const disbursement = this.mockDisbursements.find((d) => d.id === command.disbursementId);
    if (!disbursement) {
      return throwError(() => new Error('Disbursement not found'));
    }

    disbursement.status = DisbursementStatus.BackedToClient;
    disbursement.processedAt = new Date().toISOString();
    disbursement.processedByUserId = '3';
    disbursement.processedByUserName = 'Admin User';
    disbursement.processedByUserEmail = 'admin@example.com';

    disbursement.processes.push({
      id: (disbursement.processes.length + 1).toString(),
      disbursementId: disbursement.id,
      status: DisbursementStatus.BackedToClient,
      processedByUserId: '3',
      processedByUserName: 'Admin User',
      processedByUserEmail: 'admin@example.com',
      comment: command.comment,
      processedAt: new Date().toISOString(),
      createdBy: 'admin@example.com',
      createdAt: new Date().toISOString(),
    });

    const response: BackToClientDisbursementResponse = {
      disbursement,
      message: 'Disbursement sent back to client successfully',
    };

    return of(response).pipe(delay(500));
  }

  override getDisbursementTypes(): Observable<DisbursementTypeDto[]> {
    return of(this.mockDisbursementTypes).pipe(delay(300));
  }

  override getCurrencies(): Observable<CurrencyDto[]> {
    return of(this.mockCurrencies).pipe(delay(300));
  }
}
