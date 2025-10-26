import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DisbursementService } from '../../services/abstract/disbursement-service.abstract';
import { I18nService } from '../../services/i18n.service';
import { DisbursementDto, DisbursementStatus } from '../../models/disbursement.model';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';

@Component({
  selector: 'app-external-disbursements-list',
  standalone: true,
  imports: [CommonModule, AuthenticatedNavbarComponent],
  templateUrl: './external-disbursements-list.component.html',
  styleUrls: ['./external-disbursements-list.component.css']
})
export class ExternalDisbursementsListComponent implements OnInit {
  disbursements: DisbursementDto[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private disbursementService: DisbursementService,
    private router: Router,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadDisbursements();
  }

  loadDisbursements(): void {
    this.loading = true;
    this.errorMessage = '';

    this.disbursementService.getAllUserDisbursements().subscribe({
      next: (disbursements) => {
        this.disbursements = disbursements;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Error loading disbursements';
      }
    });
  }

  createDisbursement(): void {
    this.router.navigate(['/disbursements/create']);
  }

  viewDisbursementDetail(disbursementId: string): void {
    this.router.navigate(['/disbursements', disbursementId]);
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
    this.router.navigate(['/client/home']);
  }
}
