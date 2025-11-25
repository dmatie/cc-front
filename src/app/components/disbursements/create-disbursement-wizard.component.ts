import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DisbursementService } from '../../services/abstract/disbursement-service.abstract';
import { AbstractDropdownService } from '../../services/abstract/dropdown-service.abstract';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import {
  CreateDisbursementCommand,
  CreateDisbursementA1Command,
  CreateDisbursementA2Command,
  CreateDisbursementA3Command,
  CreateDisbursementB1Command,
  DisbursementTypeDto,
  CurrencyDto
} from '../../models/disbursement.model';
import { Country } from '../../models/dropdown.model';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';

@Component({
  selector: 'app-create-disbursement-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthenticatedNavbarComponent],
  templateUrl: './create-disbursement-wizard.component.html',
  styleUrls: ['./create-disbursement-wizard.component.css']
})
export class CreateDisbursementWizardComponent implements OnInit {
  currentStep = 1;
  loading = false;
  errorMessage = '';
  loadingProjects = false;
  loadingCurrencies = false;
  loadingTypes = false;
  previousDisbursementTypeId='';

  disbursementTypes: DisbursementTypeDto[] = [];
  currencies: CurrencyDto[] = [];
  countries: Country[] = [];
  sapCodes: string[] = [];

  command: CreateDisbursementCommand = {
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
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadSapCodes();
    this.checkForPreFilledData();
  }

  checkForPreFilledData(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state || (history.state as any);

    if (state && state.preFillData) {
      const data = state.preFillData;
      this.command.sapCodeProject = data.sapCodeProject || '';
      this.command.loanGrantNumber = data.loanGrantNumber || '';
      this.command.disbursementTypeId = data.disbursementTypeId || '';
      this.command.currencyId = data.currencyId || '';

      if (data.disbursementA1) {
        this.command.disbursementA1 = { ...data.disbursementA1 };
      }
      if (data.disbursementA2) {
        this.command.disbursementA2 = { ...data.disbursementA2 };
      }
      if (data.disbursementA3) {
        this.command.disbursementA3 = { ...data.disbursementA3 };
      }
      if (data.disbursementB1) {
        this.command.disbursementB1 = { ...data.disbursementB1 };
      }
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
    const currentTypeId = this.command.disbursementTypeId;

    //Si le type n'a PAS changé ET qu'il y a déjà des données, on ne fait RIEN
    if (this.previousDisbursementTypeId === currentTypeId && currentTypeId !== '') {
      // Vérifie qu'il y a bien des données existantes pour ce type
      if (
        (typeCode === 'A1' && this.command.disbursementA1) ||
        (typeCode === 'A2' && this.command.disbursementA2) ||
        (typeCode === 'A3' && this.command.disbursementA3) ||
        (typeCode === 'B1' && this.command.disbursementB1)
      ) {
        return; // On conserve les données existantes
      }
    }
    // Le type a changé, on réinitialise uniquement les données du nouveau type
    this.previousDisbursementTypeId = currentTypeId;

    this.command.disbursementA1 = undefined;
    this.command.disbursementA2 = undefined;
    this.command.disbursementA3 = undefined;
    this.command.disbursementB1 = undefined;

    if (typeCode === 'A1' && !this.command.disbursementA1) {
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
    } else if (typeCode === 'A2' && !this.command.disbursementA2) {
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
    } else if (typeCode === 'A3' && !this.command.disbursementA3) {
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
    } else if (typeCode === 'B1' && !this.command.disbursementB1) {
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

    this.disbursementService.createDisbursement(this.command).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/disbursements', response.disbursement.id]);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Error creating disbursement';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/disbursements']);
  }
}
