import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DisbursementService } from '../../services/abstract/disbursement-service.abstract';
import { I18nService } from '../../services/i18n.service';
import { DisbursementDto, DisbursementStatus } from '../../models/disbursement.model';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';

@Component({
  selector: 'app-internal-disbursements-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthenticatedNavbarComponent],
  templateUrl: './internal-disbursements-list.component.html',
  styleUrls: ['./internal-disbursements-list.component.css']
})
export class InternalDisbursementsListComponent implements OnInit {
  disbursements: DisbursementDto[] = [];
  filteredDisbursements: DisbursementDto[] = [];
  loading = false;
  selectedStatus: DisbursementStatus | 'ALL' = 'ALL';
  errorMessage = '';

  statusOptions = [
    { value: 'ALL' as const, labelEn: 'All Status', labelFr: 'Tous les statuts' },
    { value: DisbursementStatus.Draft, labelEn: 'Draft', labelFr: 'Brouillon' },
    { value: DisbursementStatus.Submitted, labelEn: 'Submitted', labelFr: 'Soumis' },
    { value: DisbursementStatus.Approved, labelEn: 'Approved', labelFr: 'Approuvé' },
    { value: DisbursementStatus.Rejected, labelEn: 'Rejected', labelFr: 'Rejeté' },
    { value: DisbursementStatus.Completed, labelEn: 'Completed', labelFr: 'Complété' },
    { value: DisbursementStatus.BackedToClient, labelEn: 'Returned to Client', labelFr: 'Retourné au client' }
  ];

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

    this.disbursementService.getAllDisbursements().subscribe({
      next: (disbursements) => {
        this.disbursements = disbursements;
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error loading disbursements';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (this.selectedStatus === 'ALL') {
      this.filteredDisbursements = [...this.disbursements];
    } else {
      this.filteredDisbursements = this.disbursements.filter(d => d.status === this.selectedStatus);
    }
  }

  onStatusFilterChange(): void {
    this.applyFilter();
  }

  viewDisbursementDetail(disbursementId: string): void {
    this.router.navigate(['/admin/disbursements', disbursementId]);
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

  getStatusCount(status: DisbursementStatus | 'ALL'): number {
    if (status === 'ALL') {
      return this.disbursements.length;
    }
    return this.disbursements.filter(d => d.status === status).length;
  }

  goBack(): void {
    this.router.navigate(['/internal/dashboard']);
  }
}
