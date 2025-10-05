import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InternalUserGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    console.log('🔒 InternalUserGuard: Checking internal user access');
    
    if (!this.authService.isAuthenticated()) {
      console.log('❌ User not authenticated, redirecting to home');
      this.router.navigate(['/home']);
      return false;
    }

    const currentUser = this.authService.getCurrentUser();
    
    // Vérifier si l'utilisateur a un azureAdId ET les bons rôles
    if ( this.authService.isInternalUser()) {
      console.log('✅ Internal user access granted');
      return true;
    }

    // Vérifier si c'est un admin (pour les tests en développement)
    if (this.authService.isAdmin()) {
      console.log('✅ Test admin user access granted');
      return true;
    }

    return false;
  }
}