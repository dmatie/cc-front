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
import { ValidationUtils } from '../../core/utils/validation.util';
import { SanitizationUtils } from '../../core/utils/sanitization.util';
import { AppConstants } from '../../core/constants/app-constants';

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

  commentErrors: string[] = [];
  commentTouched = false;

  claimTypes: ClaimType[] = [];
  AppConstants = AppConstants;


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

  onCommentChange(): void {
    this.commentTouched = true;
    this.validateComment();
  }


  validateComment(): void {
    if (!this.commentTouched) {
      return;
    }

    const validation = ValidationUtils.validateComment(
      this.comment,
      this.i18n.t('claims.description')
    );

    if (validation.isValid) {
      this.commentErrors = [];
    } else {
      this.commentErrors = validation.errors.map((error) => {
        if (error.includes('required')) {
          return this.i18n.t('validation.comment.required');
        }
        if (error.includes('at least')) {
          return this.i18n.t('validation.comment.minLength');
        }
        if (error.includes('not exceed')) {
          return this.i18n.t('validation.comment.maxLength');
        }
        if (error.includes('invalid characters')) {
          return this.i18n.t('validation.comment.invalidCharacters');
        }
        if (error.includes('dangerous content')) {
          return this.i18n.t('validation.comment.dangerousContent');
        }
        return error;
      });
    }
  }

  onSubmit(): void {
    this.commentTouched = true;
    this.validateComment();

    if (!this.isValid()) {
      this.errorMessage = this.i18n.t('claims.fillAllFields');
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const sanitizedComment = SanitizationUtils.sanitizeComment(this.comment);

    const dto: CreateClaimDto = {
      claimTypeId: this.claimTypeId,
      comment: sanitizedComment
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
