import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-reject-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reject-modal.component.html',
  styleUrl: './reject-modal.component.css'
})
export class RejectModalComponent {
  @Input() isVisible = false;
  @Input() isSubmitting = false;
  @Output() onReject = new EventEmitter<string>();
  @Output() onCancel = new EventEmitter<void>();

  rejectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public i18n: I18nService
  ) {
    this.rejectForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  handleReject(): void {
    if (this.rejectForm.valid) {
      const reason = this.rejectForm.get('reason')?.value;
      this.onReject.emit(reason);
    }
  }

  handleCancel(): void {
    this.rejectForm.reset();
    this.onCancel.emit();
  }

  get reasonControl() {
    return this.rejectForm.get('reason');
  }
}
