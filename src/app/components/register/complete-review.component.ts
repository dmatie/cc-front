import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';
import { RegistrationDetail } from '../../models/registration.model';
import { RequestDetailsComponent } from '../request/request-details.component';

@Component({
  selector: 'app-complete-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RequestDetailsComponent],
  templateUrl: './complete-review.component.html',
  styleUrls: ['./complete-review.component.css']
})
export class CompleteReviewComponent implements OnInit {
  registrationData: RegistrationDetail | null = null;
  submitForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  selectedFile: File | null = null;
  fileName = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public i18n: I18nService,
    private registrationService: AbstractRegistrationService
  ) {
    this.submitForm = this.fb.group({
      registrationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      document: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    const savedData = sessionStorage.getItem('completeRegistrationData');
    if (!savedData) {
      this.router.navigate(['/register/complete']);
      return;
    }

    try {
      this.registrationData = JSON.parse(savedData);
    } catch (error) {
      console.error('Error parsing registration data:', error);
      this.router.navigate(['/register/complete']);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file.type !== 'application/pdf') {
        this.errorMessage = this.i18n.t('complete.review.validation.pdf_only');
        this.submitForm.patchValue({ document: null });
        this.selectedFile = null;
        this.fileName = '';
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        this.errorMessage = this.i18n.t('complete.review.validation.file_too_large');
        this.submitForm.patchValue({ document: null });
        this.selectedFile = null;
        this.fileName = '';
        return;
      }

      this.selectedFile = file;
      this.fileName = file.name;
      this.submitForm.patchValue({ document: file });
      this.errorMessage = '';
    }
  }

  onSubmit(): void {
    if (this.submitForm.valid && this.registrationData && this.selectedFile) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const registrationCode = this.submitForm.get('registrationCode')?.value;
      const accessRequestId = this.registrationData.accessRequest.id;

      this.registrationService.submitAccessRequest(accessRequestId, registrationCode, this.selectedFile).subscribe({
        next: (response) => {
          sessionStorage.removeItem('completeRegistrationData');
          sessionStorage.setItem('registrationRequestId', response.accessRequest.id);
          sessionStorage.setItem('registrationMessage', response.message);
          this.router.navigate(['/register/success']);
        },
        error: (error) => {
          this.errorMessage = error.message || this.i18n.t('complete.review.submit_error');
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/register/complete']);
  }
}
