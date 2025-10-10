import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaimMockService } from '../../services/claim-mock.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { CreateClaimDto } from '../../models/claim.model';

@Component({
  selector: 'app-create-claim-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-claim-modal.component.html',
  styleUrls: ['./create-claim-modal.component.css']
})
export class CreateClaimModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() claimCreated = new EventEmitter<void>();

  claimType = '';
  country = '';
  comment = '';
  loading = false;
  errorMessage = '';

  claimTypes = [
    'Data Access Issue',
    'Incorrect Information',
    'Technical Error',
    'Missing Documents',
    'Other'
  ];

  countries = [
    'Nigeria',
    'Kenya',
    'Ghana',
    'South Africa',
    'Egypt',
    'Tanzania',
    'Ethiopia',
    'Morocco',
    'Uganda',
    'Senegal'
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

    const dto: CreateClaimDto = {
      claimType: this.claimType,
      country: this.country,
      comment: this.comment
    };

    const userEmail = this.authService.getUserEmail() || '';

    this.claimService.createClaim(dto, userEmail).subscribe({
      next: () => {
        this.loading = false;
        this.claimCreated.emit();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = this.i18n.t('common.error');
      }
    });
  }

  isValid(): boolean {
    return this.claimType.trim() !== '' &&
           this.country.trim() !== '' &&
           this.comment.trim() !== '';
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
