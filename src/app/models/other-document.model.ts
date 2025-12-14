export enum OtherDocumentStatus {
  Draft = 1,
  Submitted = 2,
  Consulted = 3
}

export interface OtherDocumentTypeDto {
  id: string;
  name: string;
  nameFr: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface OtherDocumentFileDto {
  id: string;
  otherDocumentId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  uploadedBy: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface OtherDocumentDto {
  id: string;
  otherDocumentTypeId: string;
  name: string;
  year: string;
  userId: string;
  status: OtherDocumentStatus;
  sapCode: string;
  loanNumber: string;
  otherDocumentType?: OtherDocumentTypeDto;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  files: OtherDocumentFileDto[];
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface GetOtherDocumentsByUserFilteredQuery {
  status?: OtherDocumentStatus;
  otherDocumentTypeId?: string;
  sapCode?: string;
  year?: string;
  createdFrom?: string;
  createdTo?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetOtherDocumentsWithFiltersQuery {
  status?: OtherDocumentStatus;
  otherDocumentTypeId?: string;
  sapCode?: string;
  year?: string;
  createdFrom?: string;
  createdTo?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface OtherDocumentsResponse {
  otherDocuments: OtherDocumentDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateOtherDocumentCommand {
  otherDocumentTypeId: string;
  name: string;
  sapCode: string;
  loanNumber: string;
  files: File[];
}

export interface CreateOtherDocumentResponse {
  otherDocument: OtherDocumentDto;
  message: string;
}

export interface ProjectLoanNumberDto {
  sapCode: string;
  loanNumber: string;
}

export interface GetProjectLoanNumberResponse {
  projectLoanNumbers: ProjectLoanNumberDto[];
  totalCount: number;
}
