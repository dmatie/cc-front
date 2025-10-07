import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-authenticated-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSwitcherComponent],
  templateUrl: './authenticated-navbar.component.html',
  styleUrl: './authenticated-navbar.component.css'
})
export class AuthenticatedNavbarComponent implements OnInit {
  @Input() title: string = '';
  @Input() userType: 'internal' | 'external' = 'external';

  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout()
      .then(() => {
        window.location.href = '/home';
      })
      .catch(error => {
        console.error('Logout error:', error);
        window.location.href = '/home';
      });
  }

  getProfileLabel(): string {
    return this.userType === 'internal'
      ? this.i18n.t('internal.nav.profile')
      : this.i18n.t('client.my_profile');
  }

  getSettingsLabel(): string {
    return this.userType === 'internal'
      ? this.i18n.t('internal.nav.settings')
      : this.i18n.t('client.settings');
  }

  getLogoutLabel(): string {
    return this.userType === 'internal'
      ? this.i18n.t('internal.nav.logout')
      : this.i18n.t('client.logout');
  }

  getUserLabel(): string {
    return this.userType === 'internal'
      ? this.i18n.t('internal.nav.user')
      : this.i18n.t('client.user_menu');
  }

  getLoadingLabel(): string {
    return this.userType === 'internal'
      ? this.i18n.t('internal.nav.loading')
      : this.i18n.t('common.loading');
  }
}
