import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClaimMockService } from '../../services/claim-mock.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { Claim, ClaimStatus } from '../../models/claim.model';
import { CreateClaimModalComponent } from './create-claim-modal.component';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';

@Component({
  selector: 'app-external-claims-list',
  standalone: true,
  imports: [CommonModule, CreateClaimModalComponent, AuthenticatedNavbarComponent],
  templateUrl: './external-claims-list.component.html',
  styleUrls: ['./external-claims-list.component.css']
})
export class ExternalClaimsListComponent implements OnInit {
  claims: Claim[] = [];
  loading = false;
  showCreateModal = false;

  constructor(
    private claimService: ClaimMockService,
    private authService: AuthService,
    private router: Router,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.loading = true;
    const userEmail = this.authService.getUserEmail() || '';

    this.claimService.getClaimsByUser(userEmail).subscribe({
      next: (claims) => {
        this.claims = claims;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  onClaimCreated(): void {
    this.closeCreateModal();
    this.loadClaims();
  }

  viewClaimDetail(claimId: string): void {
    this.router.navigate(['/claims', claimId]);
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
}
