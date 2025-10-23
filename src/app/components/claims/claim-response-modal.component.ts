import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaimService } from '../../services/abstract/claim-service.abstract';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { ClaimStatus, CreateClaimProcessDto, getClaimStatusLabel } from '../../models/claim.model';

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

  status: ClaimStatus | '' = '';
  comment = '';
  loading = false;
  errorMessage = '';

  statusOptions = [
    { value: ClaimStatus.InProgress, label: 'In Progress' },
    { value: ClaimStatus.Closed, label: 'Closed' }
  ];

  constructor(
    private claimService: ClaimService,
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

    const statusNumber = typeof this.status === 'string'
      ? parseInt(this.status, 10)
      : this.status as number;

    const dto: CreateClaimProcessDto = {
      claimId: this.claimId,
      status: statusNumber,
      comment: this.comment
    };

    this.claimService.createClaimProcess(this.claimId, dto).subscribe({
      next: () => {
        this.loading = false;
        this.responseCreated.emit();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.message || this.i18n.t('common.error');
      }
    });
  }

  isValid(): boolean {
    return this.status !== '' && this.comment.trim() !== '';
  }

  onClose(): void {
    if (!this.loading) {
      this.close.emit();
    }
  }

  getStatusLabel(status: ClaimStatus): string {
    const lang = this.i18n.getCurrentLocale() as 'en' | 'fr';
    return getClaimStatusLabel(status, lang);
  }
}
