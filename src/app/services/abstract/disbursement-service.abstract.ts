import { Observable } from 'rxjs';
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

export abstract class DisbursementService {
  abstract getAllDisbursements(): Observable<DisbursementDto[]>;

  abstract getDisbursementById(id: string): Observable<DisbursementDto>;

  abstract createDisbursement(
    command: CreateDisbursementCommand
  ): Observable<CreateDisbursementResponse>;

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

  abstract getDisbursementTypes(): Observable<DisbursementTypeDto[]>;

  abstract getCurrencies(): Observable<CurrencyDto[]>;
}
