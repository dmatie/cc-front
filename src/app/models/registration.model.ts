export enum StatusEnum {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Completed = 10,
  Cancelled = 20,
  Abandoned = 30,
}

export type StatusType = 'pending' | 'approved' | 'rejected' | 'abandoned'|'completed' | 'cancelled';

export const StatusMapper: Record<StatusEnum, StatusType> = {
  [StatusEnum.Pending]: 'pending',
  [StatusEnum.Approved]: 'approved',
  [StatusEnum.Rejected]: 'rejected',
  [StatusEnum.Abandoned]: 'abandoned',
  [StatusEnum.Completed]: 'completed',
  [StatusEnum.Cancelled]: 'cancelled',
};

export interface ProjectRequest {
  sapCode: string;
  projectTitle: string;
}

export interface RegistrationRequest {
  email: string;
  firstName: string;
  lastName: string;
  functionId: string;
  countryId: string;
  businessProfileId: string;
  financingTypeId: string;
  selectedProjectCodes?: string[];
  Projects: ProjectRequest[];
}

export interface AccessRequest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: number;
  requestedDate: string;
  processedDate?: string;
  processedById?: string;
  processingComments?: string;
  entraIdObjectId?: string;
  functionId: string;
  countryId: string;
  businessProfileId: string;
  financingTypeId: string;
  functionName: string;
  countryName: string;
  businessProfileName: string;
  financingTypeName: string;
  approversEmail: string[];
  fullName: string;
  canBeProcessed: boolean;
  isProcessed: boolean;
  hasEntraIdAccount: boolean;
}

export interface RegistrationResponse {
  accessRequest: AccessRequest;
  message: string;
}

export interface AmendRegistrationRequest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  functionId: string;
  countryId: string;
  businessProfileId: string;
  financingTypeId: string;
  selectedProjectCodes?: string[];
  Projects: ProjectRequest[];
}

export interface ApproveRequest {
  accessRequestId: string;
  comment: string;
  isFromApplication: boolean;
  approverEmail: string;
}

export interface RejectRequest {
  accessRequestId: string;
  rejectionReason: string;
  isFromApplication: boolean;
  approverEmail: string;
}


export interface AccessRequestDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  functionId: string;
  countryId: string;
  businessProfileId: string;
  financingTypeId: string;
  selectedProjectCodes: string[];
  status: StatusEnum;
  processingComments?: string;
  submissionDate: Date;
  processedDate?: Date;
  functionName: string;
  countryName: string;
  businessProfileName: string;
  financingTypeName: string;
}

export interface RegistrationResponseAll {
  accessRequests: AccessRequestDetail[],
  pageNumber: number,
  pageSize: number,
  totalCount: number,
  totalPages: number,
}

export interface RegistrationDetail {
  accessRequest: AccessRequestDetail;
}

// Types de financement (à récupérer via API)
export interface FinancingType {
  id: string;
  name: string;
  nameFr?: string;
  isActive: boolean;
}

// Ancienne interface pour compatibilité (à supprimer progressivement)
export interface LegacyRegistrationRequest {
  financingType: 'public' | 'private' | 'others';
  name: string;
  email: string;
  function: string;
  
  // Conditional fields (only if financingType !== 'others')
  country?: string;
  businessProfile?: string;
  projectsRequested?: string;
  
  // Security
  captchaAnswer: string;
  captchaQuestion: string;
  
  // Metadata
  submissionDate?: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface LegacyRegistrationResponse {
  success: boolean;
  message: string;
  requestId?: string;
  estimatedProcessingTime?: string;
  nextSteps?: string[];
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  error?: string;
  message?: string;
  code?: string;
}

export interface RegistrationStatus {
  requestId: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submissionDate: Date;
  lastUpdated: Date;
  reviewNotes?: string;
  approvedBy?: string;
  rejectedReason?: string;
}

// Enum pour les fonctions disponibles
export enum UserFunction {
  ACCOUNTANT = 'accountant',
  MANAGER = 'manager',
  FOCAL = 'focal',
  DIRECTOR = 'director',
  OTHER = 'other'
}

// Enum pour les profils d'entreprise
export enum BusinessProfile {
  GOVERNMENT_AGENCY = 'Government Agency',
  PUBLIC_INSTITUTION = 'Public Institution',
  PRIVATE_COMPANY = 'Private Company',
  NGO = 'NGO',
  INTERNATIONAL_ORG = 'International Organization',
  FINANCIAL_INSTITUTION = 'Financial Institution',
  ACADEMIC_INSTITUTION = 'Academic Institution',
  CONSULTING_FIRM = 'Consulting Firm'
}