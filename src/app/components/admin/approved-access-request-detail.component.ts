import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';
import { I18nService } from '../../services/i18n.service';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';
import { RegistrationDetail, AccessRequestDetail, StatusEnum } from '../../models/registration.model';

@Component({
  selector: 'app-approved-access-request-detail',
  standalone: true,
  imports: [CommonModule, AuthenticatedNavbarComponent, RouterLink],
  templateUrl: './approved-access-request-detail.component.html',
  styleUrl: './approved-access-request-detail.component.css'
})
export class ApprovedAccessRequestDetailComponent implements OnInit {
  requestId: string = '';
  accessRequest: AccessRequestDetail | null = null;
  loading = true;
  errorMessage = '';

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
      this.router.navigate(['/admin/approved-accessrequests']);
    }
  }

  loadRequestDetail(): void {
    this.loading = true;
    this.errorMessage = '';

    this.registrationService.getRegistrationById(this.requestId).subscribe({
      next: (response: RegistrationDetail | null) => {
        if (response && response.accessRequest) {
          this.accessRequest = response.accessRequest;
        } else {
          this.errorMessage = this.i18n.getCurrentLocale() === 'fr'
            ? 'Demande non trouvée'
            : 'Request not found';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading access request:', error);
        this.errorMessage = error.message || (this.i18n.getCurrentLocale() === 'fr'
          ? 'Erreur lors du chargement de la demande'
          : 'Error loading request');
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/approved-accessrequests']);
  }

  getStatusClass(status: StatusEnum): string {
    switch (status) {
      case StatusEnum.Pending:
        return 'badge bg-warning text-dark';
      case StatusEnum.Approved:
        return 'badge bg-success';
      case StatusEnum.Rejected:
        return 'badge bg-danger';
      case StatusEnum.Abandoned:
        return 'badge bg-secondary';
      case StatusEnum.Completed:
        return 'badge bg-primary';
      default:
        return 'badge bg-light text-dark';
    }
  }

  getStatusLabel(status: StatusEnum): string {
    const isFr = this.i18n.getCurrentLocale() === 'fr';
    switch (status) {
      case StatusEnum.Pending:
        return isFr ? 'En attente' : 'Pending';
      case StatusEnum.Approved:
        return isFr ? 'Approuvée' : 'Approved';
      case StatusEnum.Rejected:
        return isFr ? 'Rejetée' : 'Rejected';
      case StatusEnum.Abandoned:
        return isFr ? 'Abandonnée' : 'Abandoned';
      case StatusEnum.Completed:
        return isFr ? 'Complétée' : 'Completed';
      default:
        return isFr ? 'Inconnu' : 'Unknown';
    }
  }

  getStatusIcon(status: StatusEnum): string {
    switch (status) {
      case StatusEnum.Pending:
        return 'bi-hourglass-split';
      case StatusEnum.Approved:
        return 'bi-check-circle';
      case StatusEnum.Rejected:
        return 'bi-x-circle';
      case StatusEnum.Abandoned:
        return 'bi-trash';
      case StatusEnum.Completed:
        return 'bi-check-all';
      default:
        return 'bi-question-circle';
    }
  }
}
