import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AbstractUserManagementService } from '../../services/abstract/user-management-service.abstract';
import { AbstractDropdownService } from '../../services/abstract/dropdown-service.abstract';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';
import { UserDto, UserRole } from '../../models/user-management.model';
import { Country } from '../../models/dropdown.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, AuthenticatedNavbarComponent],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  user: UserDto | null = null;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  isDeactivating = false;
  isRemovingCountry = false;
  isAddingCountries = false;

  showAddCountriesModal = false;
  availableCountries: Country[] = [];
  selectedCountryIds: string[] = [];

  UserRole = UserRole;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public i18n: I18nService,
    private userManagementService: AbstractUserManagementService,
    private dropdownService: AbstractDropdownService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUserDetails(userId);
    } else {
      this.errorMessage = this.i18n.t('users.detail.user_not_found');
      this.isLoading = false;
    }
  }

  loadUserDetails(userId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userManagementService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user details:', error);
        this.errorMessage = this.i18n.t('users.detail.load_error');
        this.isLoading = false;
      }
    });
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
        return this.i18n.t('users.roles.external_user');
      default:
        return role;
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

  confirmDeactivate(): void {
    if (!this.user) return;

    const confirmed = confirm(this.i18n.t('users.detail.confirm_deactivate'));
    if (confirmed) {
      this.deactivateUser();
    }
  }

  deactivateUser(): void {
    if (!this.user) return;

    this.isDeactivating = true;
    this.errorMessage = '';

    this.userManagementService.deactivateUser(this.user.id).subscribe({
      next: () => {
        this.successMessage = this.i18n.t('users.detail.deactivate_success');
        this.isDeactivating = false;
        if (this.user) {
          this.user.isActive = false;
        }
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        console.error('Error deactivating user:', error);
        this.errorMessage = this.i18n.t('users.detail.deactivate_error');
        this.isDeactivating = false;
      }
    });
  }

  openAddCountriesModal(): void {
    this.loadAvailableCountries();
    this.showAddCountriesModal = true;
    this.selectedCountryIds = [];
  }

  closeAddCountriesModal(): void {
    this.showAddCountriesModal = false;
    this.selectedCountryIds = [];
  }

  loadAvailableCountries(): void {
    this.dropdownService.getCountries().subscribe({
      next: (response) => {
        const userCountryIds = this.user?.countries?.map(c => c.countryId) || [];
        this.availableCountries = response.data.filter((c: Country) => !userCountryIds.includes(c.id));
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        this.errorMessage = this.i18n.t('users.detail.load_countries_error');
      }
    });
  }

  isCountrySelectedForAdd(countryId: string): boolean {
    return this.selectedCountryIds.includes(countryId);
  }

  onCountrySelectionChange(countryId: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      if (!this.selectedCountryIds.includes(countryId)) {
        this.selectedCountryIds.push(countryId);
      }
    } else {
      this.selectedCountryIds = this.selectedCountryIds.filter(id => id !== countryId);
    }
  }

  addSelectedCountries(): void {
    if (!this.user || this.selectedCountryIds.length === 0) return;

    this.isAddingCountries = true;
    this.errorMessage = '';

    this.userManagementService.addCountriesToUser(this.user.id, this.selectedCountryIds).subscribe({
      next: () => {
        this.successMessage = this.i18n.t('users.detail.add_countries_success');
        this.isAddingCountries = false;
        this.closeAddCountriesModal();
        if (this.user) {
          this.loadUserDetails(this.user.id);
        }
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        console.error('Error adding countries:', error);
        this.errorMessage = this.i18n.t('users.detail.add_countries_error');
        this.isAddingCountries = false;
      }
    });
  }

  confirmRemoveCountry(countryId: string): void {
    const confirmed = confirm(this.i18n.t('users.detail.confirm_remove_country'));
    if (confirmed) {
      this.removeCountry(countryId);
    }
  }

  removeCountry(countryId: string): void {
    if (!this.user) return;

    this.isRemovingCountry = true;
    this.errorMessage = '';

    this.userManagementService.removeCountryFromUser(this.user.id, countryId).subscribe({
      next: () => {
        this.successMessage = this.i18n.t('users.detail.remove_country_success');
        this.isRemovingCountry = false;
        if (this.user) {
          this.loadUserDetails(this.user.id);
        }
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        console.error('Error removing country:', error);
        this.errorMessage = this.i18n.t('users.detail.remove_country_error');
        this.isRemovingCountry = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  dismissSuccess(): void {
    this.successMessage = '';
  }

  dismissError(): void {
    this.errorMessage = '';
  }
}
