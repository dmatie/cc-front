import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSwitcherComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoggingIn = false;
  isAuthenticated = false;

  constructor(
    public i18n: I18nService,
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    
    // Attendre un peu que MSAL soit initialisé si nécessaire
    setTimeout(() => {
      this.checkAuthenticationStatus();
    }, 100);
  }

  private checkAuthenticationStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    console.log('isAuthenticated():', this.isAuthenticated);
    console.log('getCurrentUser():', this.authService.getCurrentUser());

    if (this.isAuthenticated && this.authService.getCurrentUser()) {
      console.log('User already authenticated, determining redirect...');
      
      // Rediriger selon le type d'utilisateur
      if (this.authService.isInternalUser()) {
        console.log('Internal user detected, redirecting to internal dashboard');
        this.router.navigate(['/internal/dashboard']);
      } else if (this.authService.isExternalUser()) {
        console.log('External user detected, redirecting to client home');
        this.router.navigate(['/client/home']);
      } else {
        // Ne pas rediriger, laisser l'utilisateur sur la page d'accueil
      }
    } 
  }

  async loginWithAzureAD(): Promise<void> {
    try {
      this.isLoggingIn = true;
      
      await this.authService.loginWithAzureAD();
      console.log('Login redirect initiated');
      // La redirection se fait automatiquement après l'authentification
    } catch (error) {
      console.error('Login error:', error);
      this.isLoggingIn = false;
    }
  }
}