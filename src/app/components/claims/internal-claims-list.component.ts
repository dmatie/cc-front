import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClaimService } from '../../services/abstract/claim-service.abstract';
import { I18nService } from '../../services/i18n.service';
import { Claim, ClaimStatus, getClaimStatusLabel } from '../../models/claim.model';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';

@Component({
  selector: 'app-internal-claims-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthenticatedNavbarComponent],
  templateUrl: './internal-claims-list.component.html',
  styleUrls: ['./internal-claims-list.component.css']
})
export class InternalClaimsListComponent implements OnInit {
  claims: Claim[] = [];
  filteredClaims: Claim[] = [];
  loading = false;
  selectedStatus: ClaimStatus | 'ALL' = 'ALL';
  errorMessage = '';

  statusOptions = [
    { value: 'ALL' as const, label: 'All Status' },
    { value: ClaimStatus.Submitted, label: 'Submitted' },
    { value: ClaimStatus.InProgress, label: 'In Progress' },
    { value: ClaimStatus.Closed, label: 'Closed' }
  ];

  constructor(
    private claimService: ClaimService,
    private router: Router,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.loading = true;

    const params = this.selectedStatus === 'ALL'
      ? { pageNumber: 1, pageSize: 100 }
      : { status: this.selectedStatus, pageNumber: 1, pageSize: 100 };

    this.claimService.getClaims(params).subscribe({
      next: (claims) => {
        this.claims = claims.claims;
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || this.i18n.t('claims.loadError');
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (this.selectedStatus === 'ALL') {
      this.filteredClaims = [...this.claims];
    } else {
      this.filteredClaims = this.claims.filter(c => c.status === this.selectedStatus);
    }
  }

  onStatusFilterChange(): void {
    this.loadClaims();
  }

  viewClaimDetail(claimId: string): void {
    this.router.navigate(['/admin/claims', claimId]);
  }

  getStatusClass(status: ClaimStatus): string {
    switch (status) {
      case ClaimStatus.Submitted:
        return 'badge bg-warning';
      case ClaimStatus.InProgress:
        return 'badge bg-info';
      case ClaimStatus.Closed:
        return 'badge bg-success';
      default:
        return 'badge bg-light text-dark';
    }
  }

  getStatusLabel(status: ClaimStatus): string {
    const lang = this.i18n.getCurrentLocale() as 'en' | 'fr';
    return getClaimStatusLabel(status, lang);
  }

  getStatusCount(status: ClaimStatus | 'ALL'): number {
    if (status === 'ALL') {
      return this.claims.length;
    }
    return this.claims.filter(c => c.status === status).length;
  }

  goBack(): void {
    this.router.navigate(['/internal/dashboard']);
  }
}
