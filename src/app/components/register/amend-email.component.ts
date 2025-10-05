import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';
import { MapAccessRequestApiStatusToModel } from '../../core/utils/helper';
import { StatusEnum } from '../../models/registration.model';

@Component({
  selector: 'app-amend-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './amend-email.component.html',
  styleUrls: ['./amend-email.component.css']
})
export class AmendEmailComponent {
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
          if (registration && registration.accessRequest.status === StatusEnum.Rejected) {
            // Demande trouvée et rejetée, envoyer le code de vérification
            this.sendVerificationCode(email);
          } else if (registration && registration.accessRequest.status !== StatusEnum.Rejected) {
            // Demande trouvée mais pas rejetée
            this.errorMessage = this.i18n.t('amend.email.not_rejected');
            this.isSubmitting = false;
          } else {
            // Aucune demande trouvée
            this.noRequestFound = true;
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          console.error('Erreur lors de la recherche:', error);
          this.errorMessage = this.i18n.t('amend.email.search_error');
          this.isSubmitting = false;
        }
      });
    }
  }

  private sendVerificationCode(email: string): void {
    this.registrationService.sendVerificationCode(email).subscribe({
      next: (response) => {
        if (response.success) {
          // Stocker l'email pour les étapes suivantes
          sessionStorage.setItem('amendEmail', email);
          this.router.navigate(['/register/otp']);
        } else {
          this.errorMessage = response.message;
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi du code:', error);
        this.errorMessage = this.i18n.t('amend.email.send_code_error');
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}