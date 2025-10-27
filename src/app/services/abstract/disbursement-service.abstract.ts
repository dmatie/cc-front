import { Observable } from 'rxjs';
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
} from '../../models/disbursement.model';

export abstract class DisbursementService {
  abstract getAllDisbursements(): Observable<DisbursementDto[]>;
  
  abstract getAllUserDisbursements(): Observable<DisbursementDto[]>;

  abstract getDisbursementById(id: string): Observable<DisbursementDto>;

  abstract createDisbursement(
    command: CreateDisbursementCommand
  ): Observable<CreateDisbursementResponse>;

  abstract editDisbursement(
    command: EditDisbursementCommand
  ): Observable<EditDisbursementResponse>;

  abstract submitDisbursement(
    command: SubmitDisbursementCommand
  ): Observable<SubmitDisbursementResponse>;

  abstract approveDisbursement(
    command: ApproveDisbursementCommand
  ): Observable<ApproveDisbursementResponse>;

  abstract rejectDisbursement(
    command: RejectDisbursementCommand
  ): Observable<RejectDisbursementResponse>;

  abstract backToClientDisbursement(
    command: BackToClientDisbursementCommand
  ): Observable<BackToClientDisbursementResponse>;

  abstract resubmitDisbursement(
    command: ReSubmitDisbursementCommand
  ): Observable<ReSubmitDisbursementResponse>;

  abstract getDisbursementTypes(): Observable<DisbursementTypeDto[]>;

  abstract getCurrencies(): Observable<CurrencyDto[]>;
}
