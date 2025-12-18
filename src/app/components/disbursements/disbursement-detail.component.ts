import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DisbursementService } from '../../services/abstract/disbursement-service.abstract';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { DisbursementDto, DisbursementPermissionsDto, DisbursementStatus, DisbursementDocumentDto } from '../../models/disbursement.model';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';
import { BackendMessageTranslationService } from '../../services/backend-message-translation.service';
import { ResubmitDisbursementModalComponent } from './resubmit-disbursement-modal.component';
import { DuplicateDisbursementModalComponent } from './duplicate-disbursement-modal.component';
import { getFileIcon } from '../../core/utils/helper';
import { ValidationUtils } from '../../core/utils/validation.util';
import { SanitizationUtils } from '../../core/utils/sanitization.util';
import { AppConstants } from '../../core/constants/app-constants';

@Component({
  selector: 'app-disbursement-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthenticatedNavbarComponent, ResubmitDisbursementModalComponent, DuplicateDisbursementModalComponent],
  templateUrl: './disbursement-detail.component.html',
  styleUrls: ['./disbursement-detail.component.css']
})
export class DisbursementDetailComponent implements OnInit {
  disbursement: DisbursementDto | null = null;
  loading = false;
  isInternalUser = false;
  actionLoading = false;
  errorMessage = '';
  successMessage = '';
  permissions: DisbursementPermissionsDto | null = null;

  showSubmitConfirm = false;
  showApproveConfirm = false;
  showRejectModal = false;
  showBackToClientModal = false;
  showResubmitModal = false;
  showDuplicateModal = false;

  rejectComment = '';
  backToClientComment = '';
  rejectCommentErrors: string[] = [];
  backToClientCommentErrors: string[] = [];
  additionalDocuments: File[] = [];
  protected readonly getFileIcon = getFileIcon;
  protected readonly AppConstants = AppConstants;

  uploadingDocuments = false;
  uploadDocumentsError = '';
  uploadDocumentsSuccess = '';
  documentsToUpload: File[] = [];
  deletingDocumentId: string | null = null;
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private disbursementService: DisbursementService,
    private authService: AuthService,
    private messageTranslationService: BackendMessageTranslationService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.isInternalUser = this.authService.isInternalUser();
    const disbursementId = this.route.snapshot.paramMap.get('id');

    if (!this.isInternalUser) {
      this.loadDataForExternalUser(disbursementId);
    } else if (disbursementId) {
      this.loadDisbursementDetail(disbursementId);
    }
  }

    loadDataForExternalUser(disbursementId: string | null): void {
    this.disbursementService.getMyPermissions().subscribe({
      next: (perms) => {
        this.permissions = perms;
        if (disbursementId) {
          this.loadDisbursementDetail(disbursementId);
        }
      },
      error: () => {
        this.permissions = { canConsult: false, canSubmit: false };
        if (disbursementId) {
          this.loadDisbursementDetail(disbursementId);
        }
      }
    });
  }

  loadDisbursementDetail(disbursementId: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.disbursementService.getDisbursementById(disbursementId).subscribe({
      next: (disbursement) => {
        this.disbursement = disbursement;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Error loading disbursement';
        setTimeout(() => this.goBack(), 2000);
      }
    });
  }

  canSubmit(): boolean {
    if (this.isInternalUser) return false;
    const hasPermission = this.permissions?.canSubmit ?? false;
    return hasPermission && this.disbursement?.status === DisbursementStatus.Draft;
  }

  canApprove(): boolean {
    return this.isInternalUser &&
           this.disbursement?.status === DisbursementStatus.Submitted;
  }

  canReject(): boolean {
    return this.isInternalUser &&
           this.disbursement?.status === DisbursementStatus.Submitted;
  }

  canBackToClient(): boolean {
    return this.isInternalUser &&
           this.disbursement?.status === DisbursementStatus.Submitted;
  }

  canResubmit(): boolean {
    if (this.isInternalUser) return false;
    const hasPermission = this.permissions?.canSubmit ?? false;
    return hasPermission && this.disbursement?.status === DisbursementStatus.BackedToClient;
  }

  canEdit(): boolean {
    if (this.isInternalUser) return false;
    const hasPermission = this.permissions?.canSubmit ?? false;
    return hasPermission &&
           (this.disbursement?.status === DisbursementStatus.Draft ||
            this.disbursement?.status === DisbursementStatus.BackedToClient);
  }

  canDuplicate(): boolean {
    if (this.isInternalUser) return false;
    const hasPermission = this.permissions?.canSubmit ?? false;
    return hasPermission && this.disbursement?.status === DisbursementStatus.Approved;
  }

  openDuplicateModal(): void {
    this.showDuplicateModal = true;
  }

  duplicateDisbursement(): void {
    if (!this.disbursement) return;

    this.showDuplicateModal = false;
    this.router.navigate(['/disbursements/create'], {
      state: { preFillData: this.disbursement }
    });
  }

  editDisbursement(): void {
    if (this.disbursement) {
      this.router.navigate(['/disbursements', this.disbursement.id, 'edit']);
    }
  }

  onResubmitSuccess(): void {
    this.successMessage = this.i18n.t('disbursements.resubmit.success');
    if (this.disbursement) {
      this.loadDisbursementDetail(this.disbursement.id);
    }
  }

  submitDisbursement(): void {
    if (!this.disbursement) return;

    this.actionLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.disbursementService.submitDisbursement({
      disbursementId: this.disbursement.id,
      additionalDocuments: this.additionalDocuments.length > 0 ? this.additionalDocuments : undefined
    }).subscribe({
      next: (response) => {
        this.successMessage = this.messageTranslationService.translateMessage(response.message);
        this.actionLoading = false;
        this.showSubmitConfirm = false;
        this.loadDisbursementDetail(this.disbursement!.id);
      },
      error: (error) => {
        this.actionLoading = false;
        this.errorMessage = error.message || 'Error submitting disbursement';
        this.showSubmitConfirm = false;
      }
    });
  }

  approveDisbursement(): void {
    if (!this.disbursement) return;

    this.actionLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.disbursementService.approveDisbursement({
      disbursementId: this.disbursement.id
    }).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.actionLoading = false;
        this.showApproveConfirm = false;
        this.loadDisbursementDetail(this.disbursement!.id);
      },
      error: (error) => {
        this.actionLoading = false;
        this.errorMessage = error.message || 'Error approving disbursement';
        this.showApproveConfirm = false;
      }
    });
  }

  rejectDisbursement(): void {
    if (!this.disbursement || !this.rejectComment.trim()) return;

    this.rejectCommentErrors = [];
    this.errorMessage = '';

    const validationResult = ValidationUtils.validateComment(
      this.rejectComment,
      this.i18n.t('disbursements.reject.comment_label')
    );

    if (!validationResult.isValid) {
      this.rejectCommentErrors = validationResult.errors;
      this.errorMessage = validationResult.errors[0];
      return;
    }

    const sanitizedComment = SanitizationUtils.sanitizeComment(this.rejectComment);

    if (!SanitizationUtils.isClean(sanitizedComment)) {
      this.rejectCommentErrors = [this.i18n.t('validation.dangerous_content')];
      this.errorMessage = this.i18n.t('validation.dangerous_content');
      return;
    }

    this.actionLoading = true;
    this.successMessage = '';

    this.disbursementService.rejectDisbursement({
      disbursementId: this.disbursement.id,
      comment: sanitizedComment
    }).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.actionLoading = false;
        this.showRejectModal = false;
        this.rejectComment = '';
        this.rejectCommentErrors = [];
        this.loadDisbursementDetail(this.disbursement!.id);
      },
      error: (error) => {
        this.actionLoading = false;
        this.errorMessage = error.message || 'Error rejecting disbursement';
      }
    });
  }

  backToClientDisbursement(): void {
    if (!this.disbursement || !this.backToClientComment.trim()) return;

    this.backToClientCommentErrors = [];
    this.errorMessage = '';

    const validationResult = ValidationUtils.validateComment(
      this.backToClientComment,
      this.i18n.t('disbursements.back_to_client.comment_label')
    );

    if (!validationResult.isValid) {
      this.backToClientCommentErrors = validationResult.errors;
      this.errorMessage = validationResult.errors[0];
      return;
    }

    const sanitizedComment = SanitizationUtils.sanitizeComment(this.backToClientComment);

    if (!SanitizationUtils.isClean(sanitizedComment)) {
      this.backToClientCommentErrors = [this.i18n.t('validation.dangerous_content')];
      this.errorMessage = this.i18n.t('validation.dangerous_content');
      return;
    }

    this.actionLoading = true;
    this.successMessage = '';

    this.disbursementService.backToClientDisbursement({
      disbursementId: this.disbursement.id,
      comment: sanitizedComment,
      additionalDocuments: this.additionalDocuments.length > 0 ? this.additionalDocuments : undefined
    }).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.actionLoading = false;
        this.showBackToClientModal = false;
        this.backToClientComment = '';
        this.backToClientCommentErrors = [];
        this.additionalDocuments = [];
        this.loadDisbursementDetail(this.disbursement!.id);
      },
      error: (error) => {
        this.actionLoading = false;
        this.errorMessage = error.message || 'Error sending back to client';
      }
    });
  }

  onFileSelected(event: Event, target: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.additionalDocuments = Array.from(input.files);
    }
  }

  getTimelineStatusClass(status: DisbursementStatus): string {
    switch (status) {
      case DisbursementStatus.Draft:
        return 'bg-secondary';
      case DisbursementStatus.Submitted:
        return 'bg-warning';
      case DisbursementStatus.Approved:
        return 'bg-success';
      case DisbursementStatus.Rejected:
        return 'bg-danger';
      case DisbursementStatus.Completed:
        return 'bg-primary';
      case DisbursementStatus.BackedToClient:
        return 'bg-info';
      default:
        return 'bg-light text-dark';
    }
  }

  getStatusClass(status: DisbursementStatus): string {
    switch (status) {
      case DisbursementStatus.Draft:
        return 'badge bg-secondary';
      case DisbursementStatus.Submitted:
        return 'badge bg-warning';
      case DisbursementStatus.Approved:
        return 'badge bg-success';
      case DisbursementStatus.Rejected:
        return 'badge bg-danger';
      case DisbursementStatus.Completed:
        return 'badge bg-primary';
      case DisbursementStatus.BackedToClient:
        return 'badge bg-info';
      default:
        return 'badge bg-light text-dark';
    }
  }

  getStatusLabel(status: DisbursementStatus): string {
    switch (status) {
      case DisbursementStatus.Draft:
        return this.i18n.getCurrentLocale() === 'fr' ? 'Brouillon' : 'Draft';
      case DisbursementStatus.Submitted:
        return this.i18n.getCurrentLocale() === 'fr' ? 'Soumis' : 'Submitted';
      case DisbursementStatus.Approved:
        return this.i18n.getCurrentLocale() === 'fr' ? 'Approuvé' : 'Approved';
      case DisbursementStatus.Rejected:
        return this.i18n.getCurrentLocale() === 'fr' ? 'Rejeté' : 'Rejected';
      case DisbursementStatus.Completed:
        return this.i18n.getCurrentLocale() === 'fr' ? 'Complété' : 'Completed';
      case DisbursementStatus.BackedToClient:
        return this.i18n.getCurrentLocale() === 'fr' ? 'Retourné au client' : 'Returned to Client';
      default:
        return 'Unknown';
    }
  }

  downloadDocument(fileName: string): void {
    if (!this.disbursement) return;

    this.disbursementService
      .downloadDocument(this.disbursement.requestNumber, fileName)
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          this.errorMessage = this.i18n.getCurrentLocale() === 'fr'
            ? 'Erreur lors du téléchargement du fichier'
            : 'Error downloading file';
          console.error('Download error:', error);
        }
      });
  }

  goBack(): void {
    if (this.isInternalUser) {
      this.router.navigate(['/admin/disbursements']);
    } else {
      this.router.navigate(['/disbursements']);
    }
  }

  onDocumentsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.addDocumentsToUpload(Array.from(input.files));
      input.value = '';
    }
  }

  addDocumentsToUpload(files: File[]): void {
    this.uploadDocumentsError = '';
    const maxSize = AppConstants.FileUpload.maxSizeBytes;
    const allowedTypes = AppConstants.FileUpload.allowedTypes;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        this.uploadDocumentsError = this.i18n.translate('errors.fileTypeNotAllowed').replace('{fileName}', file.name);
        continue;
      }

      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        this.uploadDocumentsError = this.i18n.translate('errors.fileTooLarge')
          .replace('{fileName}', file.name)
          .replace('{size}', sizeMB)
          .replace('{maxSize}', AppConstants.FileUpload.maxSizeMB.toString());
        continue;
      }

      this.documentsToUpload.push(file);
    }
  }

  removeDocumentFromUploadList(index: number): void {
    this.documentsToUpload.splice(index, 1);
  }

  uploadDocuments(): void {
    if (!this.disbursement || this.documentsToUpload.length === 0) return;

    this.uploadingDocuments = true;
    this.uploadDocumentsError = '';
    this.uploadDocumentsSuccess = '';

    this.disbursementService.addDisbursementDocuments({
      disbursementId: this.disbursement.id,
      documents: this.documentsToUpload
    }).subscribe({
      next: (response) => {
        this.uploadDocumentsSuccess = this.messageTranslationService.translateMessage(response.message);
        this.disbursement = response.disbursement;
        this.documentsToUpload = [];
        this.uploadingDocuments = false;
      },
      error: (error) => {
        this.uploadDocumentsError = error.message || 'Error uploading documents';
        this.uploadingDocuments = false;
      }
    });
  }

  canDeleteDocument(document: DisbursementDocumentDto): boolean {
    if (this.isInternalUser) return false;

    const currentUser = this.authService.getCurrentUser();
    return document.createdBy === currentUser?.email;
  }

  deleteDocument(document: DisbursementDocumentDto): void {
    if (!this.disbursement || !this.canDeleteDocument(document)) return;

    if (!confirm(this.i18n.getCurrentLocale() === 'fr'
      ? `Êtes-vous sûr de vouloir supprimer le document "${document.fileName}" ?`
      : `Are you sure you want to delete the document "${document.fileName}"?`)) {
      return;
    }

    this.deletingDocumentId = document.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.disbursementService.deleteDisbursementDocument(
      this.disbursement.id,
      document.id
    ).subscribe({
      next: (response) => {
        this.successMessage = this.messageTranslationService.translateMessage(response.message);
        this.loadDisbursementDetail(this.disbursement!.id);
        this.deletingDocumentId = null;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error deleting document';
        this.deletingDocumentId = null;
      }
    });
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
