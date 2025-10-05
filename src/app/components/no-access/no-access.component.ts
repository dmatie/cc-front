import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-no-access',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSwitcherComponent],
  templateUrl: './no-access.component.html',
  styleUrls: ['./no-access.component.css']
})
export class NoAccessComponent {
  currentUser: User | null = null;
  userRoles: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    public i18n: I18nService
  ) {
    console.log('🚫 NoAccessComponent constructor called');
    this.currentUser = this.authService.getCurrentUser();
    this.userRoles = this.authService.getCurrentUserRoles();
    
    console.log('🔍 Current user:', this.currentUser);
    console.log('🎭 User roles:', this.userRoles);
  }

  goHome(): void {
    // Déconnecter l'utilisateur avant de rediriger vers l'accueil
    // pour éviter la redirection automatique
    this.authService.logout()
      .then(() => {
        console.log('✅ User logged out, redirecting to home');
        this.router.navigate(['/home']);
      })
      .catch(error => {
        console.error('❌ Logout error:', error);
        // Forcer la redirection même en cas d'erreur
        this.router.navigate(['/home']);
      });
  }

  logout(): void {
    console.log('🔐 Logging out unauthorized user...');
    this.authService.logout()
      .then(() => {
        console.log('✅ Logout successful');
        window.location.href = '/home';
      })
      .catch(error => {
        console.error('❌ Logout error:', error);
        window.location.href = '/home';
      });
  }

  requestAccess(): void {
    console.log('📝 Requesting access...');
    this.router.navigate(['/register/confidentiality']);
  }

  contactSupport(): void {
    console.log('📞 Contacting support...');
    // Ouvrir un email ou rediriger vers une page de contact
    window.location.href = 'mailto:clientconnection@afdb.org?subject=Demande d\'accès - Utilisateur non autorisé';
  }
}