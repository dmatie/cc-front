import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DisbursementService } from '../../services/abstract/disbursement-service.abstract';
import { I18nService } from '../../services/i18n.service';
import { ReSubmitDisbursementCommand } from '../../models/disbursement.model';

@Component({
  selector: 'app-resubmit-disbursement-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resubmit-disbursement-modal.component.html',
  styleUrl: './resubmit-disbursement-modal.component.css',
})
export class ResubmitDisbursementModalComponent {
  private disbursementService = inject(DisbursementService);
  i18n = inject(I18nService);

  @Input() disbursementId: string = '';
  @Input() show: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() resubmitSuccess = new EventEmitter<void>();

  comment: string = '';
  selectedFiles: File[] = [];
  submitting: boolean = false;
  errorMessage: string = '';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  onClose(): void {
    this.comment = '';
    this.selectedFiles = [];
    this.errorMessage = '';
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (!this.comment.trim()) {
      this.errorMessage = this.i18n.t('disbursements.resubmit.commentRequired');
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const command: ReSubmitDisbursementCommand = {
      disbursementId: this.disbursementId,
      comment: this.comment.trim(),
      additionalDocuments: this.selectedFiles.length > 0 ? this.selectedFiles : undefined,
    };

    this.disbursementService.resubmitDisbursement(command).subscribe({
      next: () => {
        this.submitting = false;
        this.resubmitSuccess.emit();
        this.onClose();
      },
      error: (error) => {
        this.submitting = false;
        this.errorMessage = error.message || this.i18n.t('disbursements.resubmit.error');
      },
    });
  }
}
