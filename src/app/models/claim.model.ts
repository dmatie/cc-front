import { PaginationFields } from "./list.shared.model";

export interface Claim {
  id: string;
  claimTypeId: string;
  claimTypeName: string;
  claimTypeNameFr: string;
  countryId: string;
  countryName: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  userFullName: string;
  userEmail: string;
  status: ClaimStatus;
  closedAt: string | null;
  comment: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  processes: ClaimProcess[];
}

export interface ClaimProcess {
  id: string;
  claimId: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  userFullName: string;
  status: ClaimStatus;
  comment: string;
  createdAt: string;
  createdBy: string;
}

export enum ClaimStatus {
  Submitted = 1,
  InProgress = 2,
  Closed = 3
}

export interface ClaimType {
  id: string;
  name: string;
  nameFr: string;
  description: string;
  createdAt: string;
}

export interface ClaimTypesResponse {
  claimTypes: ClaimType[];
  totalCount: number;
}

export interface CreateClaimDto {
  claimTypeId: string;
  comment: string;
}

export interface CreateClaimResponse {
  claim: Claim;
  message: string;
}

export interface CreateClaimProcessDto {
  claimId: string;
  status: ClaimStatus;
  comment: string;
}

export interface ClaimQueryParams {
  status?: ClaimStatus;
  claimTypeId?: string;
  countryId?: string;
  createdFrom?: string;
  createdTo?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface UserClaimQueryParams extends ClaimQueryParams {
}

export interface GetClaimsResponse extends PaginationFields {
  claims: Claim[];
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface GetClaimResponse {
  claim: Claim;
}

export function getClaimStatusLabel(status: ClaimStatus, language: 'en' | 'fr' = 'en'): string {
  const labels = {
    en: {
      [ClaimStatus.Submitted]: 'Submitted',
      [ClaimStatus.InProgress]: 'In Progress',
      [ClaimStatus.Closed]: 'Closed'
    },
    fr: {
      [ClaimStatus.Submitted]: 'Soumis',
      [ClaimStatus.InProgress]: 'En Cours',
      [ClaimStatus.Closed]: 'Clôturé'
    }
  };

  return labels[language][status] || 'Unknown';
}
