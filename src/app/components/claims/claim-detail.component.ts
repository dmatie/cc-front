import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimService } from '../../services/abstract/claim-service.abstract';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { Claim, ClaimProcess, ClaimStatus, getClaimStatusLabel } from '../../models/claim.model';
import { ClaimResponseModalComponent } from './claim-response-modal.component';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';

@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [CommonModule, ClaimResponseModalComponent, AuthenticatedNavbarComponent],
  templateUrl: './claim-detail.component.html',
  styleUrls: ['./claim-detail.component.css']
})
export class ClaimDetailComponent implements OnInit {
  claim: Claim | null = null;
  claimProcesses: ClaimProcess[] = [];
  loading = false;
  isInternalUser = false;
  showResponseModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private claimService: ClaimService,
    private authService: AuthService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.isInternalUser = this.authService.isInternalUser();
    const claimId = this.route.snapshot.paramMap.get('id');
    if (claimId) {
      this.loadClaimDetail(claimId);
    }
  }

  loadClaimDetail(claimId: string): void {
    this.loading = true;

    this.claimService.getClaimById(claimId).subscribe({
      next: (claim) => {
        this.claim = claim.claim;
        this.claimProcesses = claim.claim.processes.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading claim:', error);
        this.loading = false;
        this.router.navigate(['/claims']);
      }
    });
  }


  openResponseModal(): void {
    this.showResponseModal = true;
  }

  closeResponseModal(): void {
    this.showResponseModal = false;
  }

  onResponseCreated(): void {
    this.closeResponseModal();
    if (this.claim) {
      this.loadClaimDetail(this.claim.id);
    }
  }

  goBack(): void {
    if (this.isInternalUser) {
      this.router.navigate(['/admin/claims']);
    } else {
      this.router.navigate(['/claims']);
    }
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

  canAddResponse(): boolean {
    return this.isInternalUser &&
           this.claim !== null &&
           this.claim.status !== ClaimStatus.Closed;
  }
}
