import { Observable } from 'rxjs';
import {
  Claim,
  ClaimQueryParams,
  UserClaimQueryParams,
  CreateClaimDto,
  CreateClaimResponse,
  CreateClaimProcessDto
} from '../../models/claim.model';

export abstract class ClaimService {
  abstract getClaims(params?: ClaimQueryParams): Observable<Claim[]>;
  abstract getClaimsByUser(params: UserClaimQueryParams): Observable<Claim[]>;
  abstract getClaimById(id: string): Observable<Claim>;
  abstract createClaim(dto: CreateClaimDto): Observable<CreateClaimResponse>;
  abstract createClaimProcess(claimId: string, dto: CreateClaimProcessDto): Observable<Claim>;
}
