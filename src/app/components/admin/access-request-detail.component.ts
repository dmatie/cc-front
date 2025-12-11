import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';
import { I18nService } from '../../services/i18n.service';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';
import { AccessRequestDocumentDto, ApproveRequest, RegistrationDetail, RejectRequest, StatusEnum } from '../../models/registration.model';
import { RequestDetailsComponent } from '../request/request-details.component';
import { RejectModalComponent } from '../shared/reject-modal.component';

@Component({
  selector: 'app-access-request-detail',
  standalone: true,
  imports: [CommonModule, AuthenticatedNavbarComponent, RequestDetailsComponent, RejectModalComponent],
  templateUrl: './access-request-detail.component.html',
  styleUrl: './access-request-detail.component.css'
})
export class AccessRequestDetailComponent implements OnInit {
  requestId: string = '';
  registration: RegistrationDetail | null = null;
  registrationViewData: any = null;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  isProcessing = false;
  showRejectModal = false;
  isPending = false;
 uploadedDocument: AccessRequestDocumentDto | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private registrationService: AbstractRegistrationService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.requestId = this.route.snapshot.paramMap.get('id') || '';
    if (this.requestId) {
      this.loadRequestDetail();
    } else {
      this.router.navigate(['/admin/accessrequests']);
    }
  }

  loadRequestDetail(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.registrationService.getRegistrationById(this.requestId).subscribe({
      next: (registration) => {
        if (registration) {
          this.registration = registration;
          this.registrationViewData = registration.accessRequest;

      this.registrationViewData.projectNames = {};

      this.registration?.accessRequest.selectedProjectCodes.forEach(code => {
        const project = this.registration?.accessRequest.projects?.find(p => p.sapCode === code);
        if (project) {
          this.registrationViewData.projectNames[code] = project.projectTitle;
        }
      });


       if (registration.accessRequest.documents && registration.accessRequest.documents.length > 0) {
            this.uploadedDocument = registration.accessRequest.documents[0];
          }


          this.isPending = registration.accessRequest.status === StatusEnum.Pending;

          if (!this.isPending) {
            this.errorMessage = this.i18n.t('admin.access_request_detail.already_processed');
          }
        } else {
          this.errorMessage = this.i18n.t('admin.access_request_detail.not_found');
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || this.i18n.t('admin.access_request_detail.load_error');
        this.isLoading = false;
      }
    });
  }

  approveRequest(): void {
    if (!this.requestId || !this.isPending) return;

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    const approveContent: ApproveRequest = {
      comment: '',
      approverEmail: '',
      accessRequestId: this.requestId,
      isFromApplication: true
    };

    this.registrationService.approveRegistration(this.requestId, approveContent).subscribe({
      next: (response) => {
        this.successMessage = this.i18n.t('admin.access_request_detail.approve_success');
        this.isProcessing = false;

        setTimeout(() => {
          this.router.navigate(['/admin/accessrequests']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.message || this.i18n.t('admin.access_request_detail.approve_error');
        this.isProcessing = false;
      }
    });
  }

  openRejectModal(): void {
    if (!this.isPending) return;
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
  }

  rejectRequest(reason: string): void {
    if (!this.requestId || !this.isPending) return;

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

      const rejectContent : RejectRequest = {
        accessRequestId: this.requestId,
        rejectionReason: reason,
        isFromApplication: true,
        approverEmail: ''
      };

    this.registrationService.rejectRegistration(this.requestId, rejectContent).subscribe({
      next: (response) => {
        this.successMessage = this.i18n.t('admin.access_request_detail.reject_success');
        this.isProcessing = false;
        this.showRejectModal = false;

        setTimeout(() => {
          this.router.navigate(['/admin/accessrequests']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.message || this.i18n.t('admin.access_request_detail.reject_error');
        this.isProcessing = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/accessrequests']);
  }

  getStatusBadgeClass(): string {
    if (!this.registration) return '';

    switch (this.registration.accessRequest.status) {
      case StatusEnum.Pending:
        return 'bg-warning';
      case StatusEnum.Approved:
        return 'bg-success';
      case StatusEnum.Rejected:
        return 'bg-danger';
      case StatusEnum.Abandoned:
        return 'bg-secondary';
      default:
        return 'bg-info';
    }
  }

  getStatusLabel(): string {
    if (!this.registration) return '';

    const isFr = this.i18n.getCurrentLocale() === 'fr';

    switch (this.registration.accessRequest.status) {
      case StatusEnum.Pending:
        return isFr ? 'En attente' : 'Pending';
      case StatusEnum.Approved:
        return isFr ? 'Approuvée' : 'Approved';
      case StatusEnum.Rejected:
        return isFr ? 'Rejetée' : 'Rejected';
      case StatusEnum.Abandoned:
        return isFr ? 'Abandonnée' : 'Abandoned';
      default:
        return isFr ? 'Inconnu' : 'Unknown';
    }
  }

    downloadDocument(): void {
    if (!this.requestId) {
      return;
    }

    this.registrationService.downloadSignedForm(this.requestId).subscribe({
      next: (blob) => {
        const fileName = this.uploadedDocument?.fileName || 'signed-form.pdf';
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading document:', error);
        this.errorMessage = this.i18n.getCurrentLocale() === 'fr'
          ? 'Erreur lors du téléchargement du document'
          : 'Error downloading document';
      }
    });
  }
}
