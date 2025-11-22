import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';
import { User } from '../../models/user.model';
import { AbstractDashboardService, InternalDashboardStatsDto } from '../../services/abstract/dashboard-service.abstract';

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
  internalStats: InternalDashboardStatsDto | null = null;
  errorMessage = '';
  isAdmin: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dashboardService: AbstractDashboardService,
    public i18n: I18nService
  ) {
    this.isAdmin = this.authService.isAdmin();
    console.log(this.isAdmin);
  }

  ngOnInit(): void {
    this.checkAuthAndLoadData();
  }

  private checkAuthAndLoadData(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      console.warn('No authenticated user found');
      this.isLoading = false;
      return;
    }

    this.loadDashboardStats();
  }

  private loadDashboardStats(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getInternalDashboardStats().subscribe({
      next: (stats) => {
        this.internalStats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error loading dashboard statistics';
        this.isLoading = false;
      }
    });
  }

  // Actions rapides
  manageAccessRequests(): void {
    this.router.navigate(['/admin/accessrequests']);
  }

  manageClaims(): void {
    this.router.navigate(['/admin/claims']);
  }

  manageDisbursements(): void {
    this.router.navigate(['/admin/disbursements']);
  }

  manageUsers(): void {
    this.router.navigate(['/admin/users']);
  }
}