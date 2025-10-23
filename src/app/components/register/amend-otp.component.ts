import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';

@Component({
  selector: 'app-amend-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './amend-otp.component.html',
  styleUrls: ['./amend-otp.component.css']
})
export class AmendOtpComponent implements OnInit {
  otpForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  email = '';
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
    // Récupérer l'email depuis la session
    this.email = sessionStorage.getItem('amendEmail') || '';
    if (!this.email) {
      // Rediriger vers la première étape si pas d'email
      this.router.navigate(['/register/amend']);
      return;
    }
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
          this.errorMessage = error.message || this.i18n.t('amend.otp.verification_error');
          this.isSubmitting = false;
        }
      });
    }
  }

  resendCode(): void {
    if (this.resendCooldown > 0) return;
    
    this.registrationService.sendVerificationCode(this.email, true).subscribe({
      next: (response) => {
        if (response.success) {
          this.startCooldown();
        }
      },
      error: (error) => {
        this.errorMessage = error.message || this.i18n.t('amend.otp.resend_error');
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
  }
}