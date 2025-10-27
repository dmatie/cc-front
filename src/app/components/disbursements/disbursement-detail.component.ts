import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DisbursementService } from '../../services/abstract/disbursement-service.abstract';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { DisbursementDto, DisbursementStatus } from '../../models/disbursement.model';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';
import { BackendMessageTranslationService } from '../../services/backend-message-translation.service';
import { ResubmitDisbursementModalComponent } from './resubmit-disbursement-modal.component';

@Component({
  selector: 'app-disbursement-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthenticatedNavbarComponent, ResubmitDisbursementModalComponent],
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

  showSubmitConfirm = false;
  showApproveConfirm = false;
  showRejectModal = false;
  showBackToClientModal = false;
  showResubmitModal = false;

  rejectComment = '';
  backToClientComment = '';
  additionalDocuments: File[] = [];

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
    if (disbursementId) {
      this.loadDisbursementDetail(disbursementId);
    }
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
    return !this.isInternalUser &&
           this.disbursement?.status === DisbursementStatus.Draft;
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
    return !this.isInternalUser &&
           this.disbursement?.status === DisbursementStatus.BackedToClient;
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

    this.actionLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.disbursementService.rejectDisbursement({
      disbursementId: this.disbursement.id,
      comment: this.rejectComment
    }).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.actionLoading = false;
        this.showRejectModal = false;
        this.rejectComment = '';
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

    this.actionLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.disbursementService.backToClientDisbursement({
      disbursementId: this.disbursement.id,
      comment: this.backToClientComment,
      additionalDocuments: this.additionalDocuments.length > 0 ? this.additionalDocuments : undefined
    }).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.actionLoading = false;
        this.showBackToClientModal = false;
        this.backToClientComment = '';
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

  goBack(): void {
    if (this.isInternalUser) {
      this.router.navigate(['/admin/disbursements']);
    } else {
      this.router.navigate(['/disbursements']);
    }
  }
}
