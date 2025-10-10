import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimMockService } from '../../services/claim-mock.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { Claim, ClaimProcess, ClaimStatus } from '../../models/claim.model';
import { ClaimResponseModalComponent } from './claim-response-modal.component';

@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [CommonModule, ClaimResponseModalComponent],
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
    private claimService: ClaimMockService,
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
        if (claim) {
          this.claim = claim;
          this.loadClaimProcesses(claimId);
        } else {
          this.loading = false;
          this.router.navigate(['/claims']);
        }
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/claims']);
      }
    });
  }

  loadClaimProcesses(claimId: string): void {
    this.claimService.getClaimProcesses(claimId).subscribe({
      next: (processes) => {
        this.claimProcesses = processes.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loading = false;
      },
      error: () => {
        this.loading = false;
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

  canAddResponse(): boolean {
    return this.isInternalUser &&
           this.claim !== null &&
           this.claim.status !== ClaimStatus.CLOSED;
  }
}
