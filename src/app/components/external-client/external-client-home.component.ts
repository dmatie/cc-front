import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';
import { User } from '../../models/user.model';
import { AbstractDashboardService, ExternalDashboardStatsDto } from '../../services/abstract/dashboard-service.abstract';

interface ServiceItem {
  title: string;
  description: string;
  icon: string;
  color: string;
  count: number;
  route: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  type: 'success' | 'info' | 'primary' | 'warning';
  read: boolean;
}

@Component({
  selector: 'app-external-client-home',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthenticatedNavbarComponent],
  templateUrl: './external-client-home.component.html',
  styleUrls: ['./external-client-home.component.css']
})
export class ExternalClientHomeComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = true;
  dashboardStats: ExternalDashboardStatsDto | null = null;
  errorMessage = '';

  availableServices: ServiceItem[] = [];

  // Notifications récentes
  recentNotifications: Notification[] = [
    {
      id: '1',
      title: 'Nouveau décaissement approuvé',
      message: 'Votre demande de décaissement #2024-001 a été approuvée',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2 heures
      type: 'success',
      read: false
    },
    {
      id: '2',
      title: 'Rapport mensuel disponible',
      message: 'Le rapport financier de janvier 2024 est maintenant disponible',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Il y a 1 jour
      type: 'info',
      read: false
    },
    {
      id: '3',
      title: 'Mise à jour du projet',
      message: 'Le projet Infrastructure Routière a été mis à jour',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
      type: 'primary',
      read: true
    },
    {
      id: '4',
      title: 'Maintenance programmée',
      message: 'Maintenance du système prévue le 15 février de 2h à 4h',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
      type: 'warning',
      read: true
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private dashboardService: AbstractDashboardService,
    public i18n: I18nService
  ) {
    console.log('🏠 ExternalClientHomeComponent constructor called');
  }

  ngOnInit(): void {
    console.log('🔄 ExternalClientHomeComponent ngOnInit called');
    this.checkAuthAndLoadData();
  }

  private checkAuthAndLoadData(): void {
    console.log('Checking authentication and loading user data...');
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      console.warn('No authenticated user found, redirecting to /home');
      setTimeout(() => {
        if (!this.authService.getCurrentUser()) {
          this.router.navigate(['/home']);
        } else {
          this.currentUser = this.authService.getCurrentUser();
          this.loadDashboardStats();
        }
      }, 500);
      return;
    }

    this.loadDashboardStats();
  }

  private loadDashboardStats(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getExternalDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.initializeServices();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error loading dashboard statistics';
        this.isLoading = false;
      }
    });
  }

  private initializeServices(): void {
    if (!this.dashboardStats) return;

    this.availableServices = [
      {
        title: this.i18n.t('client.services.disbursements'),
        description: this.i18n.t('client.services.disbursements_desc'),
        icon: 'bi-cash-coin',
        color: 'success',
        count: this.dashboardStats.activeDisbursementRequests,
        route: '/disbursements'
      },
      {
        title: this.i18n.t('client.services.claims'),
        description: this.i18n.t('client.services.claims_desc'),
        icon: 'bi-exclamation-triangle',
        color: 'danger',
        count: this.dashboardStats.pendingClaims,
        route: '/claims'
      },
      {
        title: this.i18n.t('client.services.projects'),
        description: this.i18n.t('client.services.projects_desc'),
        icon: 'bi-folder',
        color: 'primary',
        count: this.dashboardStats.activeProjects,
        route: '/projects'
      },
      {
        title: this.i18n.t('client.services.training'),
        description: this.i18n.t('client.services.training_desc'),
        icon: 'bi-book',
        color: 'warning',
        count: 0,
        route: '/training'
      }
    ];
  }

  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return this.i18n.t('client.good_morning');
    } else if (hour < 18) {
      return this.i18n.t('client.good_afternoon');
    } else {
      return this.i18n.t('client.good_evening');
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getUnreadNotificationsCount(): number {
    return this.recentNotifications.filter(n => !n.read).length;
  }

  // Méthodes pour les actions rapides
  requestDisbursement(): void {
    console.log('Requesting disbursement...');
    // Rediriger vers la page de demande de décaissement
    // this.router.navigate(['/disbursements/new']);
  }

  createClaim(): void {
    console.log('Creating claim...');
    // Rediriger vers la page de réclamation
    // this.router.navigate(['/claims/new']);
  }

  downloadLatestReport(): void {
    console.log('Downloading latest report...');
    // Implémenter la logique de téléchargement
  }

  contactSupport(): void {
    console.log(' Contacting support...');
    // Implémenter la logique de contact support
  }
}