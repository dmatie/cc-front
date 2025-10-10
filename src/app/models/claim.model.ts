export interface Claim {
  id: string;
  claimType: string;
  user: string;
  country: string;
  comment: string;
  status: ClaimStatus;
  createdAt: Date;
}

export interface ClaimProcess {
  id: string;
  claimId: string;
  user: string;
  status: ClaimStatus;
  comment: string;
  createdAt: Date;
}

export enum ClaimStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED'
}

export interface CreateClaimDto {
  claimType: string;
  country: string;
  comment: string;
}

export interface CreateClaimProcessDto {
  claimId: string;
  status: ClaimStatus;
  comment: string;
}
