import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtherDocumentService } from '../../services/abstract/other-document-service.abstract';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import {
  CreateOtherDocumentCommand,
  OtherDocumentTypeDto,
  ProjectLoanNumberDto
} from '../../models/other-document.model';
import { AccessRequestProjectDto } from '../../models/registration.model';

@Component({
  selector: 'app-upload-document-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-document-modal.component.html',
  styleUrls: ['./upload-document-modal.component.css']
})
export class UploadDocumentModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() documentUploaded = new EventEmitter<void>();

  documentTypeId = '';
  documentName = '';
  selectedProjectSAPCode = '';
  selectedLoanNumber = '';
  selectedFile: File | null = null;

  loading = false;
  loadingProjects = false;
  loadingLoanNumbers = false;
  errorMessage = '';
  successMessage = '';

  documentTypes: OtherDocumentTypeDto[] = [];
  projects: AccessRequestProjectDto[] = [];
  loanNumbers: ProjectLoanNumberDto[] = [];

  maxFileSizeMB = 5;
  acceptedFileTypes = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg';

  constructor(
    private otherDocumentService: OtherDocumentService,
    private registrationService: AbstractRegistrationService,
    private authService: AuthService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadDropdownData();
    this.loadUserProjects();
  }

  loadDropdownData(): void {
    this.loading = true;
    this.otherDocumentService.getOtherDocumentTypes().subscribe({
      next: (types) => {
        this.documentTypes = types.filter(t => t.isActive);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading document types:', error);
        this.errorMessage = this.i18n.t('common.error');
        this.loading = false;
      }
    });
  }

  loadUserProjects(): void {
    this.loadingProjects = true;
    const userEmail = this.authService.getUserEmail();

    if (!userEmail) {
      this.errorMessage = 'User email not found';
      this.loadingProjects = false;
      return;
    }

    this.registrationService.getRegistrationByEmail(userEmail).subscribe({
      next: (registration) => {
        if (registration && registration.accessRequest && registration.accessRequest.projects) {
          this.projects = registration.accessRequest.projects;
        }
        this.loadingProjects = false;
      },
      error: (error) => {
        console.error('Error loading user projects:', error);
        this.errorMessage = 'Error loading projects';
        this.loadingProjects = false;
      }
    });
  }

  onProjectChange(): void {
    this.selectedLoanNumber = '';
    this.loanNumbers = [];

    if (this.selectedProjectSAPCode) {
      this.loadLoanNumbers();
    }
  }

  loadLoanNumbers(): void {
    this.loadingLoanNumbers = true;
    this.otherDocumentService.getProjectLoanNumbers(this.selectedProjectSAPCode).subscribe({
      next: (response) => {
        this.loanNumbers = response.projectLoanNumbers;
        this.loadingLoanNumbers = false;
      },
      error: (error) => {
        console.error('Error loading loan numbers:', error);
        this.loadingLoanNumbers = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const maxSizeBytes = this.maxFileSizeMB * 1024 * 1024;

      if (file.size > maxSizeBytes) {
        this.errorMessage = this.i18n.t('additionalDocuments.upload.fileTooLarge');
        this.selectedFile = null;
        input.value = '';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';
    }
  }

  isFormValid(): boolean {
    return (
      this.documentTypeId !== '' &&
      this.documentName.trim() !== '' &&
      this.selectedProjectSAPCode !== '' &&
      this.selectedLoanNumber !== '' &&
      this.selectedFile !== null
    );
  }

  submitDocument(): void {
    if (!this.isFormValid()) {
      this.errorMessage = this.i18n.t('additionalDocuments.upload.invalidForm');
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const command: CreateOtherDocumentCommand = {
      otherDocumentTypeId: this.documentTypeId,
      name: this.documentName.trim(),
      sapCode: this.selectedProjectSAPCode,
      loanNumber: this.selectedLoanNumber,
      files: [this.selectedFile!]
    };

    this.otherDocumentService.createOtherDocument(command).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response.message;
        setTimeout(() => {
          this.documentUploaded.emit();
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || this.i18n.t('common.error');
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  getDocumentTypeName(type: OtherDocumentTypeDto): string {
    return this.i18n.getCurrentLocale() === 'fr' ? type.nameFr : type.name;
  }

  getProjectDisplay(project: AccessRequestProjectDto): string {
    return `${project.sapCode} - ${project.projectTitle}`;
  }
}
