import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaimMockService } from '../../services/claim-mock.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { ClaimStatus, CreateClaimProcessDto } from '../../models/claim.model';

@Component({
  selector: 'app-claim-response-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './claim-response-modal.component.html',
  styleUrls: ['./claim-response-modal.component.css']
})
export class ClaimResponseModalComponent {
  @Input() claimId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() responseCreated = new EventEmitter<void>();

  status = '';
  comment = '';
  loading = false;
  errorMessage = '';

  statusOptions = [
    { value: ClaimStatus.IN_PROGRESS, label: 'In Progress' },
    { value: ClaimStatus.RESOLVED, label: 'Resolved' },
    { value: ClaimStatus.CLOSED, label: 'Closed' },
    { value: ClaimStatus.REJECTED, label: 'Rejected' }
  ];

  constructor(
    private claimService: ClaimMockService,
    private authService: AuthService,
    public i18n: I18nService
  ) {}

  onSubmit(): void {
    if (!this.isValid()) {
      this.errorMessage = this.i18n.t('claims.fillAllFields');
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const dto: CreateClaimProcessDto = {
      claimId: this.claimId,
      status: this.status as ClaimStatus,
      comment: this.comment
    };

    const userEmail = this.authService.getUserEmail() || '';

    this.claimService.createClaimProcess(dto, userEmail).subscribe({
      next: () => {
        this.loading = false;
        this.responseCreated.emit();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = this.i18n.t('common.error');
      }
    });
  }

  isValid(): boolean {
    return this.status.trim() !== '' && this.comment.trim() !== '';
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
