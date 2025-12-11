import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';
import { RegistrationDetail } from '../../models/registration.model';
import { CommonModule } from '@angular/common';
import { RequestDetailsComponent } from "../request/request-details.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-registration-review',
  standalone: true,
  imports: [CommonModule, RequestDetailsComponent,ReactiveFormsModule],
  templateUrl: './registration-review.component.html',
  styleUrl: './registration-review.component.css'
})
export class RegistrationReviewComponent implements OnInit {
  registration: any = null;
  isLoading = true;
  email = '';

  otpForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  resendCooldown = 0;
  private cooldownInterval?: any;

  constructor(
     private location: Location,
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
      try {
        const parsedData = JSON.parse(data);
        this.email = parsedData.email;
        this.registration = parsedData;

        // S'assurer que selectedProjectCodes est un tableau
        if (this.registration && !Array.isArray(this.registration.selectedProjectCodes)) {
          this.registration.selectedProjectCodes = [];
        }

        this.isLoading = false;
      } catch (error) {
        this.errorMessage = this.i18n.t('registration_review.missing_data');
        this.isLoading = false;
        // Rediriger vers le formulaire après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/register/form']);
        }, 3000);
      }
    } else {
      this.errorMessage = this.i18n.t('registration_review.missing_data');
      this.isLoading = false;
      // Rediriger vers le formulaire après 3 secondes
      setTimeout(() => {
        this.router.navigate(['/register/form']);
      }, 3000);
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
          if (isValid) {
            this.submitRegistration();
          } else {
            this.errorMessage = this.i18n.t('amend.otp.invalid_code');
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          this.errorMessage = error.message || this.i18n.t('amend.otp.verification_error');
          this.isSubmitting = false;
        }
      });
    }
  }

  private submitRegistration(): void {
    if (!this.registration) {
      this.errorMessage = this.i18n.t('registration_review.missing_data');
      this.isSubmitting = false;
      return;
    }

    // Valider et normaliser selectedProjectCodes
    let selectedProjectCodes: string[] = [];
    if (this.registration.selectedProjectCodes) {
      if (Array.isArray(this.registration.selectedProjectCodes)) {
        selectedProjectCodes = this.registration.selectedProjectCodes;
      } else if (typeof this.registration.selectedProjectCodes === 'string') {
        // Si c'est une chaîne, essayer de la parser
        try {
          const parsed = JSON.parse(this.registration.selectedProjectCodes);
          selectedProjectCodes = Array.isArray(parsed) ? parsed : [];
        } catch {
          selectedProjectCodes = [];
        }
      }
    }

    // Convertir selectedProjectCodes en Projects avec le format attendu par l'API
     const projects = selectedProjectCodes.map(code => {
      const projectName = this.registration.projectNames?.[code] || '';
      return {
        sapCode: code,
        projectTitle: projectName
      };
    });

    const registrationRequest = {
      email: this.registration.email,
      firstName: this.registration.firstName,
      lastName: this.registration.lastName,
      functionId: this.registration.functionId,
      countryId: this.registration.countryId,
      businessProfileId: this.registration.businessProfileId,
      financingTypeId: this.registration.financingTypeId,
      Projects: projects
    };

    this.registrationService.submitRegistration(registrationRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        sessionStorage.setItem('registrationRequestId', response.accessRequest.id);
        sessionStorage.setItem('registrationMessage', response.message);
        sessionStorage.removeItem('registrationReviewData');

        this.router.navigate(['/register/success']);
      },
      error: (errorResponse) => {
        this.errorMessage = errorResponse.message || this.i18n.t('amend.otp.submission_error');
        this.isSubmitting = false;
      }
    });
  }

  resendCode(): void {
    if (this.resendCooldown > 0) return;
    
    this.registrationService.sendVerificationCode(this.email, false).subscribe({
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
    this.location.back();
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
    sessionStorage.removeItem('registrationReviewData');
  }
}
