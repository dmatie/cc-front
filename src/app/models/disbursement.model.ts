export enum DisbursementStatus {
  Draft = 1,
  Submitted = 2,
  Approved = 3,
  Rejected = 4,
  Completed = 5,
  BackedToClient = 10,
}

export interface CountryDto {
  id: string;
  code: string;
  name: string;
  nameFr: string;
}

export interface CurrenciesResponse {
  currencies: CurrencyDto[];
  totalCount: number;
}


export interface CurrencyDto {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

export interface DisbursementTypeDto {
  id: string;
  code: string;
  name: string;
  nameFr: string;
  description?: string;
}

export interface DisbursementTypesResponse {
  disbursementTypes: DisbursementTypeDto[];
  totalCount: number;
}

export interface DisbursementA1Dto {
  id: string;
  disbursementId: string;
  paymentPurpose: string;

  beneficiaryBpNumber: string;
  beneficiaryName: string;
  beneficiaryContactPerson: string;
  beneficiaryAddress: string;
  beneficiaryCountryId: string;
  beneficiaryEmail: string;
  beneficiaryCountry?: CountryDto;

  correspondentBankName: string;
  correspondentBankAddress: string;
  correspondentBankCountryId: string;
  correspondantAccountNumber: string;
  correspondentBankSwiftCode: string;
  correspondentBankCountry?: CountryDto;

  amount: number;

  signatoryName: string;
  signatoryContactPerson: string;
  signatoryAddress: string;
  signatoryCountryId: string;
  signatoryEmail: string;
  signatoryPhone: string;
  signatoryTitle: string;
  signatoryCountry?: CountryDto;
}

export interface DisbursementA2Dto {
  id: string;
  disbursementId: string;
  reimbursementPurpose: string;
  contractor: string;

  goodDescription: string;
  goodOrginCountryId: string;
  goodOrginCountry?: CountryDto;

  contractBorrowerReference: string;
  contractAfDBReference: string;
  contractValue: string;
  contractBankShare: string;
  contractAmountPreviouslyPaid: number;

  invoiceRef: string;
  invoiceDate: string;
  invoiceAmount: number;

  paymentDateOfPayment: string;
  paymentAmountWithdrawn: number;
  paymentEvidenceOfPayment: string;
}

export interface DisbursementA3Dto {
  id: string;
  disbursementId: string;
  periodForUtilization: string;
  itemNumber: number;

  goodDescription: string;
  goodOrginCountryId: string;
  goodQuantity: number;
  goodOrginCountry?: CountryDto;

  annualBudget: number;
  bankShare: number;
  advanceRequested: number;

  dateOfApproval: string;
}

export interface DisbursementB1Dto {
  id: string;
  disbursementId: string;

  guaranteeDetails: string;
  confirmingBank: string;

  issuingBankName: string;
  issuingBankAdress: string;
  guaranteeAmount: number;
  expiryDate: string;

  beneficiaryName: string;
  beneficiaryBPNumber: string;
  beneficiaryAFDBContract: string;
  beneficiaryBankAddress: string;
  beneficiaryCity: string;
  beneficiaryCountryId: string;
  goodDescription: string;
  beneficiaryLcContractRef: string;
  beneficiaryCountry?: CountryDto;

  executingAgencyName: string;
  executingAgencyContactPerson: string;
  executingAgencyAddress: string;
  executingAgencyCity: string;
  executingAgencyCountryId: string;
  executingAgencyEmail: string;
  executingAgencyPhone: string;
  executingAgencyCountry?: CountryDto;
}

export interface DisbursementDocumentDto {
  id: string;
  disbursementId: string;
  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  createdBy: string;
  createdAt: string;
}

export interface DisbursementProcessDto {
  id: string;
  disbursementId: string;
  status: DisbursementStatus;
  processedByUserId: string;
  processedByUserName: string;
  processedByUserEmail: string;
  comment: string;
  processedAt: string;
  createdBy: string;
  createdAt: string;
}

export interface DisbursementDto {
  id: string;
  requestNumber: string;
  sapCodeProject: string;
  loanGrantNumber: string;

  currencyId: string;
  currency: string;
  disbursementTypeId: string;
  disbursementTypeCode: string;
  disbursementTypeName: string;
  disbursementTypeNameFr: string;

  status: DisbursementStatus;

  createdByUserId: string;
  createdByUserName: string;
  createdByUserEmail: string;

  submittedAt?: string;
  processedAt?: string;

  processedByUserId?: string;
  processedByUserName?: string;
  processedByUserEmail?: string;

  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;

  disbursementA1?: DisbursementA1Dto;
  disbursementA2?: DisbursementA2Dto;
  disbursementA3?: DisbursementA3Dto;
  disbursementB1?: DisbursementB1Dto;

  processes: DisbursementProcessDto[];
  documents: DisbursementDocumentDto[];
}

export interface CreateDisbursementA1Command {
  paymentPurpose: string;

  beneficiaryBpNumber: string;
  beneficiaryName: string;
  beneficiaryContactPerson: string;
  beneficiaryAddress: string;
  beneficiaryCountryId: string;
  beneficiaryEmail: string;

  correspondentBankName: string;
  correspondentBankAddress: string;
  correspondentBankCountryId: string;
  correspondantAccountNumber: string;
  correspondentBankSwiftCode: string;

  amount: number;

  signatoryName: string;
  signatoryContactPerson: string;
  signatoryAddress: string;
  signatoryCountryId: string;
  signatoryEmail: string;
  signatoryPhone: string;
  signatoryTitle: string;
}

export interface CreateDisbursementA2Command {
  reimbursementPurpose: string;
  contractor: string;

  goodDescription: string;
  goodOrginCountryId: string;

  contractBorrowerReference: string;
  contractAfDBReference: string;
  contractValue: string;
  contractBankShare: string;
  contractAmountPreviouslyPaid: number;

  invoiceRef: string;
  invoiceDate: string;
  invoiceAmount: number;

  paymentDateOfPayment: string;
  paymentAmountWithdrawn: number;
  paymentEvidenceOfPayment: string;
}

export interface CreateDisbursementA3Command {
  periodForUtilization: string;
  itemNumber: number;

  goodDescription: string;
  goodOrginCountryId: string;
  goodQuantity: number;

  annualBudget: number;
  bankShare: number;
  advanceRequested: number;

  dateOfApproval: string;
}

export interface CreateDisbursementB1Command {
  guaranteeDetails: string;
  confirmingBank: string;

  issuingBankName: string;
  issuingBankAdress: string;
  guaranteeAmount: number;
  expiryDate: string;

  beneficiaryName: string;
  beneficiaryBPNumber: string;
  beneficiaryAFDBContract: string;
  beneficiaryBankAddress: string;
  beneficiaryCity: string;
  beneficiaryCountryId: string;
  goodDescription: string;
  beneficiaryLcContractRef: string;

  executingAgencyName: string;
  executingAgencyContactPerson: string;
  executingAgencyAddress: string;
  executingAgencyCity: string;
  executingAgencyCountryId: string;
  executingAgencyEmail: string;
  executingAgencyPhone: string;
}

export interface CreateDisbursementCommand {
  sapCodeProject: string;
  loanGrantNumber: string;
  disbursementTypeId: string;
  currencyId: string;

  disbursementA1?: CreateDisbursementA1Command;
  disbursementA2?: CreateDisbursementA2Command;
  disbursementA3?: CreateDisbursementA3Command;
  disbursementB1?: CreateDisbursementB1Command;

  documents?: File[];
}

export interface CreateDisbursementResponse {
  disbursement: DisbursementDto;
  message: string;
}

export interface SubmitDisbursementCommand {
  disbursementId: string;
  additionalDocuments?: File[];
}

export interface SubmitDisbursementResponse {
  disbursement: DisbursementDto;
  message: string;
}

export interface ApproveDisbursementCommand {
  disbursementId: string;
}

export interface ApproveDisbursementResponse {
  disbursement: DisbursementDto;
  message: string;
}

export interface RejectDisbursementCommand {
  disbursementId: string;
  comment: string;
}

export interface RejectDisbursementResponse {
  disbursement: DisbursementDto;
  message: string;
}

export interface BackToClientDisbursementCommand {
  disbursementId: string;
  comment: string;
  additionalDocuments?: File[];
}

export interface BackToClientDisbursementResponse {
  disbursement: DisbursementDto;
  message: string;
}

export interface ReSubmitDisbursementCommand {
  disbursementId: string;
  comment: string;
  additionalDocuments?: File[];
}

export interface ReSubmitDisbursementResponse {
  disbursement: DisbursementDto;
  message: string;
}

export interface EditDisbursementA1Command {
  paymentPurpose: string;

  beneficiaryBpNumber: string;
  beneficiaryName: string;
  beneficiaryContactPerson: string;
  beneficiaryAddress: string;
  beneficiaryCountryId: string;
  beneficiaryEmail: string;

  correspondentBankName: string;
  correspondentBankAddress: string;
  correspondentBankCountryId: string;
  correspondantAccountNumber: string;
  correspondentBankSwiftCode: string;

  amount: number;

  signatoryName: string;
  signatoryContactPerson: string;
  signatoryAddress: string;
  signatoryCountryId: string;
  signatoryEmail: string;
  signatoryPhone: string;
  signatoryTitle: string;
}

export interface EditDisbursementA2Command {
  reimbursementPurpose: string;
  contractor: string;

  goodDescription: string;
  goodOrginCountryId: string;

  contractBorrowerReference: string;
  contractAfDBReference: string;
  contractValue: string;
  contractBankShare: string;
  contractAmountPreviouslyPaid: number;

  invoiceRef: string;
  invoiceDate: string;
  invoiceAmount: number;

  paymentDateOfPayment: string;
  paymentAmountWithdrawn: number;
  paymentEvidenceOfPayment: string;
}

export interface EditDisbursementA3Command {
  periodForUtilization: string;
  itemNumber: number;

  goodDescription: string;
  goodOrginCountryId: string;
  goodQuantity: number;

  annualBudget: number;
  bankShare: number;
  advanceRequested: number;

  dateOfApproval: string;
}

export interface EditDisbursementB1Command {
  guaranteeDetails: string;
  confirmingBank: string;

  issuingBankName: string;
  issuingBankAdress: string;
  guaranteeAmount: number;
  expiryDate: string;

  beneficiaryName: string;
  beneficiaryBPNumber: string;
  beneficiaryAFDBContract: string;
  beneficiaryBankAddress: string;
  beneficiaryCity: string;
  beneficiaryCountryId: string;
  goodDescription: string;
  beneficiaryLcContractRef: string;

  executingAgencyName: string;
  executingAgencyContactPerson: string;
  executingAgencyAddress: string;
  executingAgencyCity: string;
  executingAgencyCountryId: string;
  executingAgencyEmail: string;
  executingAgencyPhone: string;
}

export interface EditDisbursementCommand {
  id: string;
  sapCodeProject: string;
  loanGrantNumber: string;
  disbursementTypeId: string;
  currencyId: string;

  disbursementA1?: EditDisbursementA1Command;
  disbursementA2?: EditDisbursementA2Command;
  disbursementA3?: EditDisbursementA3Command;
  disbursementB1?: EditDisbursementB1Command;

  documents?: File[];
}

export interface EditDisbursementResponse {
  disbursement: DisbursementDto;
  message: string;
}

export interface DisbursementPermissionsDto {
  canConsult: boolean;
  canSubmit: boolean;
}
