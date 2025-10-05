import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';
import { RegistrationDetail } from '../../models/registration.model';
import { CommonModule } from '@angular/common';
import { RequestDetailsComponent } from "../request/request-details.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-registration-review',
  standalone: true,
  imports: [CommonModule, RequestDetailsComponent,ReactiveFormsModule],
  templateUrl: './registration-review.component.html',
  styleUrl: './registration-review.component.css'
})
export class RegistrationReviewComponent implements OnInit {
  registration: RegistrationDetail | null = null;
  isLoading = true;
  email = '';

  otpForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  resendCooldown = 0;
  private cooldownInterval?: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public i18n: I18nService,
    private registrationService: AbstractRegistrationService
  ) { 
    this.otpForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }


  ngOnInit(): void {
    const data = sessionStorage.getItem('registrationReviewData');
    if (data) {
      this.email = JSON.parse(data).email;
      this.registration = JSON.parse(data);
      this.registration?.accessRequest
      this.isLoading = false;
    }
  }

    goHome(): void {
    this.router.navigate(['/home']);
  }

  onSubmit(): void {
    if (this.otpForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      const code = this.otpForm.get('code')?.value;
      
      this.registrationService.verifyCode(this.email, code).subscribe({
        next: (isValid) => {
          this.isSubmitting = false;
          if (isValid) {
            // Code valide, rediriger vers le récapitulatif
            this.router.navigate(['/register/detail']);
          } else {
            this.errorMessage = this.i18n.t('amend.otp.invalid_code');
          }
        },
        error: (error) => {
          console.error('Erreur lors de la vérification:', error);
          this.errorMessage = this.i18n.t('amend.otp.verification_error');
          this.isSubmitting = false;
        }
      });
    }
  }

  resendCode(): void {
    if (this.resendCooldown > 0) return;
    
    this.registrationService.sendVerificationCode(this.email).subscribe({
      next: (response) => {
        if (response.success) {
          this.startCooldown();
        }
      },
      error: (error) => {
        console.error('Erreur lors du renvoi:', error);
      }
    });
  }

  private startCooldown(): void {
    this.resendCooldown = 60; // 60 secondes
    this.cooldownInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownInterval);
      }
    }, 1000);
  }

  goBack(): void {
    this.router.navigate(['/register/amend']);
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
    sessionStorage.removeItem('registrationReviewData');
  }
}
