import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DisbursementService } from '../../services/abstract/disbursement-service.abstract';
import { AbstractDropdownService } from '../../services/abstract/dropdown-service.abstract';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import {
  EditDisbursementCommand,
  DisbursementDto,
  DisbursementTypeDto,
  CurrencyDto
} from '../../models/disbursement.model';
import { Country } from '../../models/dropdown.model';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';
import { getCharCountClass } from '../../core/utils/helper';
import { AppConstants } from '../../core/constants/app-constants';
import { ValidationUtils } from '../../core/utils/validation.util';
import { SanitizationUtils } from '../../core/utils/sanitization.util';

@Component({
  selector: 'app-edit-disbursement-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthenticatedNavbarComponent],
  templateUrl: './edit-disbursement-wizard.component.html',
  styleUrls: ['./edit-disbursement-wizard.component.css']
})
export class EditDisbursementWizardComponent implements OnInit {
  currentStep = 1;
  loading = false;
  errorMessage = '';
  successMessage = '';
  loadingProjects = false;
  loadingCurrencies = false;
  loadingTypes = false;
  loadingDisbursement = false;
  disbursementId = '';
  existingDisbursement: DisbursementDto | null = null;

  disbursementTypes: DisbursementTypeDto[] = [];
  currencies: CurrencyDto[] = [];
  countries: Country[] = [];
  sapCodes: string[] = [];

  command: EditDisbursementCommand = {
    id: '',
    sapCodeProject: '',
    loanGrantNumber: '',
    disbursementTypeId: '',
    currencyId: '',
    documents: [],
  };

  selectedFiles: File[] = [];

  paymentPurposeCustomErrors: string[] = [];
  paymentPurposeCustomTouched = false;

  reimbursementPurposeCustomErrors: string[] = [];
  reimbursementPurposeCustomTouched = false;

  guaranteeDetailsCustomErrors: string[] = [];
  guaranteeDetailsCustomTouched = false;


  protected readonly getCharCountClass = getCharCountClass;
  protected readonly AppConstants = AppConstants;
  fileUploadError = '';

  constructor(
    private disbursementService: DisbursementService,
    private dropdownService: AbstractDropdownService,
    private registrationService: AbstractRegistrationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.disbursementId = this.route.snapshot.paramMap.get('id') || '';
    if (this.disbursementId) {
      this.loadDisbursement();
    } else {
      this.errorMessage = 'Disbursement ID not found';
    }
    this.loadDropdowns();
    this.loadSapCodes();
  }

  loadDisbursement(): void {
    this.loadingDisbursement = true;
    this.disbursementService.getDisbursementById(this.disbursementId).subscribe({
      next: (disbursement) => {
        this.existingDisbursement = disbursement;
        this.populateFormData(disbursement);
        this.loadingDisbursement = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading disbursement';
        this.loadingDisbursement = false;
      }
    });
  }

  populateFormData(disbursement: DisbursementDto): void {
    this.command.id = disbursement.id;
    this.command.sapCodeProject = disbursement.sapCodeProject;
    this.command.loanGrantNumber = disbursement.loanGrantNumber;
    this.command.disbursementTypeId = disbursement.disbursementTypeId;
    this.command.currencyId = disbursement.currencyId;

    if (disbursement.disbursementA1) {
      this.command.disbursementA1 = {
        paymentPurpose: disbursement.disbursementA1.paymentPurpose,
        beneficiaryBpNumber: disbursement.disbursementA1.beneficiaryBpNumber,
        beneficiaryName: disbursement.disbursementA1.beneficiaryName,
        beneficiaryContactPerson: disbursement.disbursementA1.beneficiaryContactPerson,
        beneficiaryAddress: disbursement.disbursementA1.beneficiaryAddress,
        beneficiaryCountryId: disbursement.disbursementA1.beneficiaryCountryId,
        beneficiaryEmail: disbursement.disbursementA1.beneficiaryEmail,
        correspondentBankName: disbursement.disbursementA1.correspondentBankName,
        correspondentBankAddress: disbursement.disbursementA1.correspondentBankAddress,
        correspondentBankCountryId: disbursement.disbursementA1.correspondentBankCountryId,
        correspondantAccountNumber: disbursement.disbursementA1.correspondantAccountNumber,
        correspondentBankSwiftCode: disbursement.disbursementA1.correspondentBankSwiftCode,
        amount: disbursement.disbursementA1.amount,
        signatoryName: disbursement.disbursementA1.signatoryName,
        signatoryContactPerson: disbursement.disbursementA1.signatoryContactPerson,
        signatoryAddress: disbursement.disbursementA1.signatoryAddress,
        signatoryCountryId: disbursement.disbursementA1.signatoryCountryId,
        signatoryEmail: disbursement.disbursementA1.signatoryEmail,
        signatoryPhone: disbursement.disbursementA1.signatoryPhone,
        signatoryTitle: disbursement.disbursementA1.signatoryTitle
      };
    }

    if (disbursement.disbursementA2) {
      this.command.disbursementA2 = {
        reimbursementPurpose: disbursement.disbursementA2.reimbursementPurpose,
        contractor: disbursement.disbursementA2.contractor,
        goodDescription: disbursement.disbursementA2.goodDescription,
        goodOrginCountryId: disbursement.disbursementA2.goodOrginCountryId,
        contractBorrowerReference: disbursement.disbursementA2.contractBorrowerReference,
        contractAfDBReference: disbursement.disbursementA2.contractAfDBReference,
        contractValue: disbursement.disbursementA2.contractValue,
        contractBankShare: disbursement.disbursementA2.contractBankShare,
        contractAmountPreviouslyPaid: disbursement.disbursementA2.contractAmountPreviouslyPaid,
        invoiceRef: disbursement.disbursementA2.invoiceRef,
        invoiceDate: disbursement.disbursementA2.invoiceDate,
        invoiceAmount: disbursement.disbursementA2.invoiceAmount,
        paymentDateOfPayment: disbursement.disbursementA2.paymentDateOfPayment,
        paymentAmountWithdrawn: disbursement.disbursementA2.paymentAmountWithdrawn,
        paymentEvidenceOfPayment: disbursement.disbursementA2.paymentEvidenceOfPayment
      };
    }

    if (disbursement.disbursementA3) {
      this.command.disbursementA3 = {
        periodForUtilization: disbursement.disbursementA3.periodForUtilization,
        itemNumber: disbursement.disbursementA3.itemNumber,
        goodDescription: disbursement.disbursementA3.goodDescription,
        goodOrginCountryId: disbursement.disbursementA3.goodOrginCountryId,
        goodQuantity: disbursement.disbursementA3.goodQuantity,
        annualBudget: disbursement.disbursementA3.annualBudget,
        bankShare: disbursement.disbursementA3.bankShare,
        advanceRequested: disbursement.disbursementA3.advanceRequested,
        dateOfApproval: disbursement.disbursementA3.dateOfApproval
      };
    }

    if (disbursement.disbursementB1) {
      this.command.disbursementB1 = {
        guaranteeDetails: disbursement.disbursementB1.guaranteeDetails,
        confirmingBank: disbursement.disbursementB1.confirmingBank,
        issuingBankName: disbursement.disbursementB1.issuingBankName,
        issuingBankAdress: disbursement.disbursementB1.issuingBankAdress,
        guaranteeAmount: disbursement.disbursementB1.guaranteeAmount,
        expiryDate: disbursement.disbursementB1.expiryDate,
        beneficiaryName: disbursement.disbursementB1.beneficiaryName,
        beneficiaryBPNumber: disbursement.disbursementB1.beneficiaryBPNumber,
        beneficiaryAFDBContract: disbursement.disbursementB1.beneficiaryAFDBContract,
        beneficiaryBankAddress: disbursement.disbursementB1.beneficiaryBankAddress,
        beneficiaryCity: disbursement.disbursementB1.beneficiaryCity,
        beneficiaryCountryId: disbursement.disbursementB1.beneficiaryCountryId,
        goodDescription: disbursement.disbursementB1.goodDescription,
        beneficiaryLcContractRef: disbursement.disbursementB1.beneficiaryLcContractRef,
        executingAgencyName: disbursement.disbursementB1.executingAgencyName,
        executingAgencyContactPerson: disbursement.disbursementB1.executingAgencyContactPerson,
        executingAgencyAddress: disbursement.disbursementB1.executingAgencyAddress,
        executingAgencyCity: disbursement.disbursementB1.executingAgencyCity,
        executingAgencyCountryId: disbursement.disbursementB1.executingAgencyCountryId,
        executingAgencyEmail: disbursement.disbursementB1.executingAgencyEmail,
        executingAgencyPhone: disbursement.disbursementB1.executingAgencyPhone
      };
    }
  }

  loadSapCodes(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.email) {
      this.errorMessage = 'User not found';
      return;
    }

    this.loadingProjects = true;
    this.registrationService.getRegistrationByEmail(currentUser.email).subscribe({
      next: (response) => {
        if (response?.accessRequest?.selectedProjectCodes) {
          this.sapCodes = response.accessRequest.selectedProjectCodes;
        }
        this.loadingProjects = false;
      },
      error: (error) => {
        console.error('Error loading SAP codes:', error);
        this.loadingProjects = false;
      }
    });
  }

  loadDropdowns(): void {
    this.loadingTypes = true;
    this.dropdownService.getDisbursementTypes().subscribe({
      next: (response) => {
        this.disbursementTypes = response.disbursementTypes;
        this.loadingTypes = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading disbursement types';
        this.loadingTypes = false;
      }
    });

    this.loadingCurrencies = true;
    this.dropdownService.getCurrencies().subscribe({
      next: (response) => {
        this.currencies = response.currencies;
        this.loadingCurrencies = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading currencies';
        this.loadingCurrencies = false;
      }
    });

    this.dropdownService.getCountries().subscribe({
      next: (response) => {
        this.countries = response.data;
      },
      error: (error) => {
        this.errorMessage = 'Error loading countries';
      }
    });
  }

  getSelectedType(): DisbursementTypeDto | undefined {
    return this.disbursementTypes.find(t => t.id === this.command.disbursementTypeId);
  }

  getSelectedTypeCode(): string {
    return this.getSelectedType()?.code || '';
  }

  canProceedStep1(): boolean {
    const sapSelected = !!this.command.sapCodeProject;
    const disbTypeSelected = !!this.command.disbursementTypeId;
    const currencySelected = !!this.command.currencyId;

    const loan = (this.command.loanGrantNumber || '').toString().trim();
    const loanValid = /^\d{13}$/.test(loan); // exactly 13 digits

    return sapSelected && disbTypeSelected && currencySelected && loanValid;
  }

  canProceedStep2(): boolean {
    const typeCode = this.getSelectedTypeCode();

    if (typeCode === 'A1' && this.command.disbursementA1) {
      return !!(
        this.command.disbursementA1.paymentPurpose &&
        this.command.disbursementA1.beneficiaryName &&
        this.command.disbursementA1.beneficiaryEmail &&
        this.command.disbursementA1.correspondentBankName &&
        this.command.disbursementA1.amount > 0
      );
    }

    if (typeCode === 'A2' && this.command.disbursementA2) {
      return !!(
        this.command.disbursementA2.reimbursementPurpose &&
        this.command.disbursementA2.contractor &&
        this.command.disbursementA2.invoiceRef
      );
    }

    if (typeCode === 'A3' && this.command.disbursementA3) {
      return !!(
        this.command.disbursementA3.periodForUtilization &&
        this.command.disbursementA3.goodDescription &&
        this.command.disbursementA3.advanceRequested > 0
      );
    }

    if (typeCode === 'B1' && this.command.disbursementB1) {
      return !!(
        this.command.disbursementB1.guaranteeDetails &&
        this.command.disbursementB1.issuingBankName &&
        this.command.disbursementB1.beneficiaryName
      );
    }

    return false;
  }

  onDisbursementTypeChange(): void {
    this.initializeTypeSpecificData();
  }

  nextStep(): void {
    if (this.currentStep === 1 && this.canProceedStep1()) {
      if (!this.existingDisbursement) {
        this.initializeTypeSpecificData();
      }
      this.currentStep = 2;
    } else if (this.currentStep === 2 && this.canProceedStep2()) {
      this.currentStep = 3;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  initializeTypeSpecificData(): void {
    const typeCode = this.getSelectedTypeCode();

    this.command.disbursementA1 = undefined;
    this.command.disbursementA2 = undefined;
    this.command.disbursementA3 = undefined;
    this.command.disbursementB1 = undefined;

    if (typeCode === 'A1') {
      this.command.disbursementA1 = {
        paymentPurpose: '',
        beneficiaryBpNumber: '',
        beneficiaryName: '',
        beneficiaryContactPerson: '',
        beneficiaryAddress: '',
        beneficiaryCountryId: '',
        beneficiaryEmail: '',
        correspondentBankName: '',
        correspondentBankAddress: '',
        correspondentBankCountryId: '',
        correspondantAccountNumber: '',
        correspondentBankSwiftCode: '',
        amount: 0,
        signatoryName: '',
        signatoryContactPerson: '',
        signatoryAddress: '',
        signatoryCountryId: '',
        signatoryEmail: '',
        signatoryPhone: '',
        signatoryTitle: ''
      };
    } else if (typeCode === 'A2') {
      this.command.disbursementA2 = {
        reimbursementPurpose: '',
        contractor: '',
        goodDescription: '',
        goodOrginCountryId: '',
        contractBorrowerReference: '',
        contractAfDBReference: '',
        contractValue: '',
        contractBankShare: '',
        contractAmountPreviouslyPaid: 0,
        invoiceRef: '',
        invoiceDate: new Date().toISOString(),
        invoiceAmount: 0,
        paymentDateOfPayment: new Date().toISOString(),
        paymentAmountWithdrawn: 0,
        paymentEvidenceOfPayment: ''
      };
    } else if (typeCode === 'A3') {
      this.command.disbursementA3 = {
        periodForUtilization: '',
        itemNumber: 0,
        goodDescription: '',
        goodOrginCountryId: '',
        goodQuantity: 0,
        annualBudget: 0,
        bankShare: 0,
        advanceRequested: 0,
        dateOfApproval: new Date().toISOString()
      };
    } else if (typeCode === 'B1') {
      this.command.disbursementB1 = {
        guaranteeDetails: '',
        confirmingBank: '',
        issuingBankName: '',
        issuingBankAdress: '',
        guaranteeAmount: 0,
        expiryDate: new Date().toISOString(),
        beneficiaryName: '',
        beneficiaryBPNumber: '',
        beneficiaryAFDBContract: '',
        beneficiaryBankAddress: '',
        beneficiaryCity: '',
        beneficiaryCountryId: '',
        goodDescription: '',
        beneficiaryLcContractRef: '',
        executingAgencyName: '',
        executingAgencyContactPerson: '',
        executingAgencyAddress: '',
        executingAgencyCity: '',
        executingAgencyCountryId: '',
        executingAgencyEmail: '',
        executingAgencyPhone: ''
      };
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.addFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  addFiles(files: File[]): void {
    this.fileUploadError = '';
    const maxSize = AppConstants.FileUpload.maxSizeBytes;
    const allowedTypes = AppConstants.FileUpload.allowedTypes;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        this.fileUploadError = this.i18n.translate('errors.fileTypeNotAllowed').replace('{fileName}', file.name);
        continue;
      }

      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        this.fileUploadError = this.i18n.translate('errors.fileTooLarge')
          .replace('{fileName}', file.name)
          .replace('{size}', sizeMB)
          .replace('{maxSize}', AppConstants.FileUpload.maxSizeMB.toString());
        continue;
      }

      this.selectedFiles.push(file);
    }
  }


  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  clearFiles(): void {
    this.selectedFiles = [];
  }

  getFileIcon(file: File): string {
    if (file.type === 'application/pdf') return 'bi-file-pdf';
    if (file.type.includes('word')) return 'bi-file-word';
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return 'bi-file-excel';
    return 'bi-file-earmark';
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getCurrencyCode(): string {
    const currency = this.currencies.find(c => c.id === this.command.currencyId);
    return currency?.code || '—';
  }

  getCountryName(countryId: string): string {
    const country = this.countries.find(c => c.id === countryId);
    return country?.name || '—';
  }

  submitDisbursement(): void {
    this.loading = true;
    this.errorMessage = '';

    this.command.documents = this.selectedFiles.length > 0 ? this.selectedFiles : undefined;

const sanitizedCommand = { ...this.command };

    if (sanitizedCommand.disbursementA1?.paymentPurpose) {
      sanitizedCommand.disbursementA1 = {
        ...sanitizedCommand.disbursementA1,
        paymentPurpose: SanitizationUtils.sanitizeComment(sanitizedCommand.disbursementA1.paymentPurpose)
      };
    }

    if (sanitizedCommand.disbursementA2?.reimbursementPurpose) {
      sanitizedCommand.disbursementA2 = {
        ...sanitizedCommand.disbursementA2,
        reimbursementPurpose: SanitizationUtils.sanitizeComment(sanitizedCommand.disbursementA2.reimbursementPurpose)
      };
    }

    if (sanitizedCommand.disbursementB1?.guaranteeDetails) {
      sanitizedCommand.disbursementB1 = {
        ...sanitizedCommand.disbursementB1,
        guaranteeDetails: SanitizationUtils.sanitizeComment(sanitizedCommand.disbursementB1.guaranteeDetails)
      };
    }


    this.disbursementService.editDisbursement(sanitizedCommand).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/disbursements', response.disbursement.id]);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Error updating disbursement';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/disbursements']);
  }

  resetToOriginal(): void {
    if (this.existingDisbursement) {
      this.populateFormData(this.existingDisbursement);
      this.currentStep = 1;
      this.selectedFiles = [];
      this.errorMessage = '';
      this.successMessage = this.i18n.t('disbursements.edit.resetSuccess');
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }
  }


   onPaymentPurposeChange(): void {
    this.paymentPurposeCustomTouched = true;
    this.validatePaymentPurpose();
  }

  validatePaymentPurpose(): void {
    if (!this.paymentPurposeCustomTouched) return;

    const validation = ValidationUtils.validateComment(
      this.command.disbursementA1?.paymentPurpose || '',
      this.i18n.t('disbursements.typeA1.paymentPurpose')
    );

    this.paymentPurposeCustomErrors = validation.errors.filter(error =>
      error.includes('dangerous') ||
      error.includes('invalid characters') ||
      error.includes('control characters')
    );
  }

  onReimbursementPurposeChange(): void {
    this.reimbursementPurposeCustomTouched = true;
    this.validateReimbursementPurpose();
  }

  validateReimbursementPurpose(): void {
    if (!this.reimbursementPurposeCustomTouched) return;

    const validation = ValidationUtils.validateComment(
      this.command.disbursementA2?.reimbursementPurpose || '',
      this.i18n.t('disbursements.typeA2.reimbursementPurpose')
    );

    this.reimbursementPurposeCustomErrors = validation.errors.filter(error =>
      error.includes('dangerous') ||
      error.includes('invalid characters') ||
      error.includes('control characters')
    );
  }

  onGuaranteeDetailsChange(): void {
    this.guaranteeDetailsCustomTouched = true;
    this.validateGuaranteeDetails();
  }

  validateGuaranteeDetails(): void {
    if (!this.guaranteeDetailsCustomTouched) return;

    const validation = ValidationUtils.validateComment(
      this.command.disbursementB1?.guaranteeDetails || '',
      this.i18n.t('disbursements.typeB1.guaranteeDetails')
    );

    this.guaranteeDetailsCustomErrors = validation.errors.filter(error =>
      error.includes('dangerous') ||
      error.includes('invalid characters') ||
      error.includes('control characters')
    );
  }

  validateAllCustomFields(): void {
    const typeCode = this.getSelectedTypeCode();

    if (typeCode === 'A1') {
      this.paymentPurposeCustomTouched = true;
      this.validatePaymentPurpose();
    }

    if (typeCode === 'A2') {
      this.reimbursementPurposeCustomTouched = true;
      this.validateReimbursementPurpose();
    }

    if (typeCode === 'B1') {
      this.guaranteeDetailsCustomTouched = true;
      this.validateGuaranteeDetails();
    }
  }

  hasCustomValidationErrors(): boolean {
    const typeCode = this.getSelectedTypeCode();

    if (typeCode === 'A1' && this.paymentPurposeCustomErrors.length > 0) {
      return true;
    }

    if (typeCode === 'A2' && this.reimbursementPurposeCustomErrors.length > 0) {
      return true;
    }

    if (typeCode === 'B1' && this.guaranteeDetailsCustomErrors.length > 0) {
      return true;
    }

    return false;
  }
}
