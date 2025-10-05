import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public i18n: I18nService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      const credentials: LoginRequest = this.loginForm.value;
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.router.navigate(['/client/home']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = 'Email ou mot de passe incorrect';
          console.error('Erreur de connexion:', error);
        }
      });
    }
  }

  loginWithAzureAD(): void {
    console.log('🔐 Tentative de connexion Azure AD...');
    this.isSubmitting = true;
    this.errorMessage = '';
    
    this.authService.loginWithAzureAD()
      .then(() => {
        console.log('✅ Redirection Azure AD initiée');
        // La redirection se fait automatiquement
      })
      .catch(error => {
        console.error('❌ Erreur de connexion Azure AD:', error);
        this.errorMessage = 'Erreur lors de la connexion avec Azure AD';
        this.isSubmitting = false;
      });
  }
}