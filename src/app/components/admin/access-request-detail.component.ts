import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';
import { I18nService } from '../../services/i18n.service';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';
import { RegistrationDetail } from '../../models/registration.model';
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
          this.registrationViewData = registration.accessRequest; // Préparer les données pour l'affichage.
        } else {
          this.errorMessage = this.i18n.t('admin.access_request_detail.not_found');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement:', error);
        this.errorMessage = this.i18n.t('admin.access_request_detail.load_error');
        this.isLoading = false;
      }
    });
  }

  approveRequest(): void {
    if (!this.requestId) return;

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.registrationService.approveRegistration(this.requestId).subscribe({
      next: (response) => {
        this.successMessage = this.i18n.t('admin.access_request_detail.approve_success');
        this.isProcessing = false;

        setTimeout(() => {
          this.router.navigate(['/admin/accessrequests']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'approbation:', error);
        this.errorMessage = error.message || this.i18n.t('admin.access_request_detail.approve_error');
        this.isProcessing = false;
      }
    });
  }

  openRejectModal(): void {
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
  }

  rejectRequest(reason: string): void {
    if (!this.requestId) return;

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.registrationService.rejectRegistration(this.requestId, reason).subscribe({
      next: (response) => {
        this.successMessage = this.i18n.t('admin.access_request_detail.reject_success');
        this.isProcessing = false;
        this.showRejectModal = false;

        setTimeout(() => {
          this.router.navigate(['/admin/accessrequests']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Erreur lors du rejet:', error);
        if(error !== null && error.message) {
          this.errorMessage = error.message || this.i18n.t('admin.access_request_detail.reject_error');
        }
        if(error !== null && error.status === 400) {
          this.errorMessage = error.title || this.i18n.t('admin.access_request_detail.reject_error');
        }

        this.isProcessing = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/accessrequests']);
  }
}
