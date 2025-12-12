import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';
import { AbstractDropdownService } from '../../services/abstract/dropdown-service.abstract';
import { AbstractProjectsService } from '../../services/abstract/projects-service.abstract';
import { I18nService } from '../../services/i18n.service';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';
import { AccessRequestDetail, RegistrationResponseAll } from '../../models/registration.model';
import { Country } from '../../models/dropdown.model';
import { Project } from '../../models/project.model';
import { LocalizedFieldPipe } from '../../core/utils/localized-field.pipe';

@Component({
  selector: 'app-approved-access-requests-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthenticatedNavbarComponent, LocalizedFieldPipe],
  templateUrl: './approved-access-requests-list.component.html',
  styleUrl: './approved-access-requests-list.component.css'
})
export class ApprovedAccessRequestsListComponent implements OnInit {
  requestResponse: RegistrationResponseAll = {
    accessRequests: [],
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  };

  isLoading = true;
  errorMessage = '';

  countries: Country[] = [];
  projects: Project[] = [];

  selectedCountryId: string = '';
  selectedProjectCode: string = '';

  isLoadingProjects = false;

  currentPage = 1;
  pageSize = 10;

  constructor(
    private registrationService: AbstractRegistrationService,
    private dropdownService: AbstractDropdownService,
    private projectsService: AbstractProjectsService,
    private router: Router,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadCountries();
    this.loadApprovedRequests();
  }

  loadCountries(): void {
    this.dropdownService.getCountries({ isActive: true }).subscribe({
      next: (response) => {
        if (response.success) {
          this.countries = response.data || [];
        }
      },
      error: (error: any) => {
        console.error('Error loading countries:', error);
      }
    });
  }

  loadProjectsForCountry(countryCode: string): void {
    this.isLoadingProjects = true;
    this.projects = [];
    this.selectedProjectCode = '';

    this.projectsService.getProjectsByCountry(countryCode).subscribe({
      next: (response) => {
        this.projects = response.projects || [];
        this.isLoadingProjects = false;
      },
      error: (error: any) => {
        console.error('Error loading projects:', error);
        this.projects = [];
        this.isLoadingProjects = false;
      }
    });
  }

  loadApprovedRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filters = {
      countryId: this.selectedCountryId || undefined,
      projectCode: this.selectedProjectCode || undefined,
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    this.registrationService.getApprovedAccessRequests(filters).subscribe({
      next: (response) => {
        this.requestResponse = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || this.i18n.t('admin.approved_requests.load_error');
        this.isLoading = false;
      }
    });
  }

  onCountryChange(): void {
    this.currentPage = 1;
    this.selectedProjectCode = '';
    this.projects = [];

    if (this.selectedCountryId) {
      const selectedCountry = this.countries.find(c => c.id === this.selectedCountryId);
      if (selectedCountry) {
        this.loadProjectsForCountry(selectedCountry.code);
      }
    }

    this.loadApprovedRequests();
  }

  onProjectChange(): void {
    this.currentPage = 1;
    this.loadApprovedRequests();
  }

  resetFilters(): void {
    this.selectedCountryId = '';
    this.selectedProjectCode = '';
    this.projects = [];
    this.currentPage = 1;
    this.loadApprovedRequests();
  }

  viewDetail(requestId: string): void {
    this.router.navigate(['/admin/approved-accessrequests', requestId]);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.requestResponse.totalPages) {
      this.currentPage = page;
      this.loadApprovedRequests();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.requestResponse.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  getPageNumbers(): number[] {
    const totalPages = this.requestResponse.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      } else if (current >= totalPages - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }

    return pages;
  }

  goBack(): void {
    this.router.navigate(['/internal/dashboard']);
  }

  getCountryLabel(country: Country): string {
    return this.i18n.getCurrentLocale() === 'fr' ? country.nameFr : country.name;
  }
}
