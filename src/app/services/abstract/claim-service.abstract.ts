import { Observable } from 'rxjs';
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

export abstract class ClaimService {
  abstract getClaims(params?: ClaimQueryParams): Observable<GetClaimsResponse>;
  abstract getClaimsByUser(params: UserClaimQueryParams): Observable<GetClaimsResponse>;
  abstract getClaimById(id: string): Observable<GetClaimResponse>;
  abstract createClaim(dto: CreateClaimDto): Observable<CreateClaimResponse>;
  abstract createClaimProcess(claimId: string, dto: CreateClaimProcessDto): Observable<Claim>;
}
