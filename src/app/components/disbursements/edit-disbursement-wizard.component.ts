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

  command: any = {
    id: '',
    sapCodeProject: '',
    loanGrantNumber: '',
    disbursementTypeId: '',
    currencyId: '',
    documents: []
  };

  selectedFiles: File[] = [];

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

  nextStep(): void {
    if (this.currentStep === 1 && this.canProceedStep1()) {
      this.initializeTypeSpecificData();
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

    this.command.disbursementA1 = null;
    this.command.disbursementA2 = null;
    this.command.disbursementA3 = null;
    this.command.disbursementB1 = null;

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
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    this.selectedFiles = [...this.selectedFiles, ...validFiles];
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

    this.disbursementService.editDisbursement(this.command).subscribe({
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
}
