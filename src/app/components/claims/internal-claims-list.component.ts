import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClaimMockService } from '../../services/claim-mock.service';
import { I18nService } from '../../services/i18n.service';
import { Claim, ClaimStatus } from '../../models/claim.model';
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
  selectedStatus = 'ALL';

  statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: ClaimStatus.PENDING, label: 'Pending' },
    { value: ClaimStatus.IN_PROGRESS, label: 'In Progress' },
    { value: ClaimStatus.RESOLVED, label: 'Resolved' },
    { value: ClaimStatus.CLOSED, label: 'Closed' },
    { value: ClaimStatus.REJECTED, label: 'Rejected' }
  ];

  constructor(
    private claimService: ClaimMockService,
    private router: Router,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.loading = true;

    this.claimService.getClaims().subscribe({
      next: (claims) => {
        this.claims = claims;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
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
    this.applyFilter();
  }

  viewClaimDetail(claimId: string): void {
    this.router.navigate(['/admin/claims', claimId]);
  }

  getStatusClass(status: ClaimStatus): string {
    switch (status) {
      case ClaimStatus.PENDING:
        return 'badge bg-warning text-dark';
      case ClaimStatus.IN_PROGRESS:
        return 'badge bg-info text-dark';
      case ClaimStatus.RESOLVED:
        return 'badge bg-success';
      case ClaimStatus.CLOSED:
        return 'badge bg-secondary';
      case ClaimStatus.REJECTED:
        return 'badge bg-danger';
      default:
        return 'badge bg-light text-dark';
    }
  }

  getStatusLabel(status: ClaimStatus): string {
    return this.i18n.t(`claims.status.${status.toLowerCase()}`);
  }

  getStatusCount(status: string): number {
    if (status === 'ALL') {
      return this.claims.length;
    }
    return this.claims.filter(c => c.status === status).length;
  }
}
