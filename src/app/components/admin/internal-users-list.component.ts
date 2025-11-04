import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';
import { AbstractUserManagementService } from '../../services/abstract/user-management-service.abstract';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';
import { AddInternalUserModalComponent } from './add-internal-user-modal.component';
import { UserDto, UserRole } from '../../models/user-management.model';

@Component({
  selector: 'app-internal-users-list',
  standalone: true,
  imports: [CommonModule, AuthenticatedNavbarComponent, AddInternalUserModalComponent],
  templateUrl: './internal-users-list.component.html',
  styleUrls: ['./internal-users-list.component.css']
})
export class InternalUsersListComponent implements OnInit {
  users: UserDto[] = [];
  filteredUsers: UserDto[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  showAddUserModal = false;

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  UserRole = UserRole;
  Math = Math;

  constructor(
    private userManagementService: AbstractUserManagementService,
    private authService: AuthService,
    private router: Router,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userManagementService.getInternalUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || this.i18n.t('users.errors.load_failed');
        this.isLoading = false;
      }
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  get paginatedUsers(): UserDto[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case UserRole.Admin:
        return this.i18n.t('users.roles.admin');
      case UserRole.DO:
        return this.i18n.t('users.roles.do');
      case UserRole.DA:
        return this.i18n.t('users.roles.da');
      case UserRole.ExternalUser:
        return this.i18n.t('users.roles.external');
      default:
        return 'Unknown';
    }
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case UserRole.Admin:
        return 'bg-danger';
      case UserRole.DO:
        return 'bg-primary';
      case UserRole.DA:
        return 'bg-info';
      case UserRole.ExternalUser:
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }

  getCountriesDisplay(user: UserDto): string {
    if (!user.countries || user.countries.length === 0) {
      return this.i18n.t('users.no_countries');
    }
    return user.countries.map(c => c.countryName).join(', ');
  }

  openAddUserModal(): void {
    this.showAddUserModal = true;
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
  }

  onUserAdded(): void {
    this.showAddUserModal = false;
    this.successMessage = this.i18n.t('users.messages.user_added_success');
    this.loadUsers();

    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  viewUserDetail(userId: string): void {
    this.router.navigate(['/admin/users', userId]);
  }

  dismissSuccess(): void {
    this.successMessage = '';
  }

  dismissError(): void {
    this.errorMessage = '';
  }

  goBack(): void {
    this.router.navigate(['/internal/dashboard']);
  }
}
