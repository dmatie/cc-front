import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';
import { User } from '../../models/user.model';

interface InternalStats {
  accessRequests: number;
  pendingClaims: number;
  pendingDisbursements: number;
  totalUsers: number;
}

@Component({
  selector: 'app-internal-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthenticatedNavbarComponent],
  templateUrl: './internal-dashboard.component.html',
  styleUrls: ['./internal-dashboard.component.css']
})
export class InternalDashboardComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = true;

  // Statistiques du dashboard interne
  internalStats: InternalStats = {
    accessRequests: 8,
    pendingClaims: 12,
    pendingDisbursements: 5,
    totalUsers: 156
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    public i18n: I18nService
  ) {
    console.log('🏢 InternalDashboardComponent constructor called');
  }

  ngOnInit(): void {
    console.log('🔄 InternalDashboardComponent ngOnInit called');
    this.checkAuthAndLoadData();
  }

  private checkAuthAndLoadData(): void {
    console.log('🔍 Checking authentication and loading internal user data...');
    
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      console.warn('⚠️ No authenticated user found');
      return;
    }

    this.isLoading = false;
    console.log('✅ Internal user data loaded successfully:', this.currentUser.firstName, this.currentUser.lastName);
  }

  // Actions rapides
  manageAccessRequests(): void {
    console.log('📝 Managing access requests...');
    this.router.navigate(['/admin/accessrequests']);
  }

  manageClaims(): void {
    console.log('📞 Managing claims...');
    this.router.navigate(['/admin/claims']);
  }

  manageDisbursements(): void {
    console.log('💰 Managing disbursements...');
    // Rediriger vers la gestion des décaissements
  }

  manageUsers(): void {
    console.log('👥 Managing users...');
    // Rediriger vers la gestion des utilisateurs
  }
}