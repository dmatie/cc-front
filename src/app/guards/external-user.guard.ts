import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ExternalUserGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    console.log('🔒 ExternalUserGuard: Checking external user access');
    
    if (!this.authService.isAuthenticated()) {
      console.log('❌ User not authenticated, redirecting to home');
      this.router.navigate(['/home']);
      return false;
    }

    const currentUser = this.authService.getCurrentUser();
    
    // Vérifier si c'est un utilisateur externe authentifié
    if (this.authService.isExternalUser()) {
      console.log('✅ External user access granted');
      return true;
    }

    // Si c'est un utilisateur interne avec Azure AD, rediriger vers le dashboard interne
    if (this.authService.isInternalUser()) {
      console.log('🏢 Internal user trying to access external dashboard, redirecting to internal dashboard');
      this.router.navigate(['/internal/dashboard']);
      return false;
    }

    console.log('❌ Access denied, redirecting to no-access');
    this.router.navigate(['/no-access']);
    return false;
  }
}