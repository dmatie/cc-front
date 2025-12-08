import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';

@Component({
  selector: 'app-complete-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complete-registration.component.html',
  styleUrls: ['./complete-registration.component.css']
})
export class CompleteRegistrationComponent {
  emailForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  noRequestFound = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public i18n: I18nService,
    private registrationService: AbstractRegistrationService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.emailForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.noRequestFound = false;

      const email = this.emailForm.get('email')?.value;

      this.registrationService.getRegistrationByEmail(email).subscribe({
        next: (registration) => {
          if (registration) {
            sessionStorage.setItem('completeRegistrationData', JSON.stringify(registration));
            this.router.navigate(['/register/complete-review']);
          } else {
            this.noRequestFound = true;
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          this.errorMessage = error.message || this.i18n.t('complete.email.search_error');
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
