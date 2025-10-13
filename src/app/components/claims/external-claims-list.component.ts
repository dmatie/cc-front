import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClaimService } from '../../services/abstract/claim-service.abstract';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { Claim, ClaimStatus, getClaimStatusLabel } from '../../models/claim.model';
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
  errorMessage = '';

  constructor(
    private claimService: ClaimService,
    private authService: AuthService,
    private router: Router,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.loading = true;

    this.claimService.getClaimsByUser({
      pageNumber: 1,
      pageSize: 100
    }).subscribe({
      next: (claims) => {
        this.claims = claims.claims
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading claims:', error);
        this.loading = false;
        this.errorMessage = error.message;

        if (error.validationErrors?.length) {
          this.errorMessage = error.validationErrors[0].error;
        }

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

  goBack(): void {
    this.router.navigate(['/client/home']);
  }
}
