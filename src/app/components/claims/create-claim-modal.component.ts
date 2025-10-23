import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaimService } from '../../services/abstract/claim-service.abstract';
import { AbstractDropdownService } from '../../services/abstract/dropdown-service.abstract';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { CreateClaimDto } from '../../models/claim.model';
import { ClaimType } from '../../models/claim.model';
import { Country } from '../../models/dropdown.model';

@Component({
  selector: 'app-create-claim-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-claim-modal.component.html',
  styleUrls: ['./create-claim-modal.component.css']
})
export class CreateClaimModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() claimCreated = new EventEmitter<void>();

  claimTypeId = '';
  comment = '';
  loading = false;
  errorMessage = '';

  claimTypes: ClaimType[] = [];

  constructor(
    private claimService: ClaimService,
    private dropdownService: AbstractDropdownService,
    private authService: AuthService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadDropdownData();
  }

  loadDropdownData(): void {
    this.loading = true;
    this.dropdownService.getClaimTypes().subscribe({
      next: (response) => {
        this.claimTypes = response.claimTypes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading claim types:', error);
        this.errorMessage = this.i18n.t('common.error');
      }
    });
  }

  onSubmit(): void {
    if (!this.isValid()) {
      this.errorMessage = this.i18n.t('claims.fillAllFields');
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const dto: CreateClaimDto = {
      claimTypeId: this.claimTypeId,
      comment: this.comment
    };

    this.claimService.createClaim(dto).subscribe({
      next: () => {
        this.loading = false;
        this.claimCreated.emit();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.message || this.i18n.t('common.error');
      }
    });
  }

  isValid(): boolean {
    return this.claimTypeId.trim() !== '' &&
           this.comment.trim() !== '';
  }

  onClose(): void {
    if (!this.loading) {
      this.close.emit();
    }
  }

  getClaimTypeName(claimType: ClaimType): string {
    return this.i18n.getCurrentLocale() === 'fr' ? claimType.nameFr : claimType.name;
  }
}
