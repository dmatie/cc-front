import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClaimService } from '../../services/abstract/claim-service.abstract';
import { AbstractDropdownService } from '../../services/abstract/dropdown-service.abstract';
import { I18nService } from '../../services/i18n.service';
import { Claim, ClaimStatus, ClaimType, getClaimStatusLabel } from '../../models/claim.model';
import { Country } from '../../models/dropdown.model';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';
import { LocalizedFieldPipe } from '../../core/utils/localized-field.pipe';

@Component({
  selector: 'app-internal-claims-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthenticatedNavbarComponent, LocalizedFieldPipe],
  templateUrl: './internal-claims-list.component.html',
  styleUrls: ['./internal-claims-list.component.css']
})
export class InternalClaimsListComponent implements OnInit {
  claims: Claim[] = [];
  loading = false;
  errorMessage = '';

  countries: Country[] = [];
  claimTypes: ClaimType[] = [];

  selectedStatus: ClaimStatus | null = null;
  selectedClaimTypeId: string = '';
  selectedCountryId: string = '';
  createdFrom: string = '';
  createdTo: string = '';

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  statusOptions = [
    { value: ClaimStatus.Submitted, label: 'Submitted' },
    { value: ClaimStatus.InProgress, label: 'In Progress' },
    { value: ClaimStatus.Closed, label: 'Closed' }
  ];

  constructor(
    private claimService: ClaimService,
    private dropdownService: AbstractDropdownService,
    private router: Router,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadCountries();
    this.loadClaimTypes();
    this.loadClaims();
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

  loadClaimTypes(): void {
    this.dropdownService.getClaimTypes().subscribe({
      next: (response) => {
        this.claimTypes = response.claimTypes || [];
      },
      error: (error: any) => {
        console.error('Error loading claim types:', error);
      }
    });
  }

  loadClaims(): void {
    this.loading = true;
    this.errorMessage = '';

    const params = {
      status: this.selectedStatus !== null ? this.selectedStatus : undefined,
      claimTypeId: this.selectedClaimTypeId || undefined,
      countryId: this.selectedCountryId || undefined,
      createdFrom: this.createdFrom || undefined,
      createdTo: this.createdTo || undefined,
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    this.claimService.getClaimsWithFilters(params).subscribe({
      next: (response) => {
        this.claims = response.claims;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.hasPreviousPage = response.hasPreviousPage || false;
        this.hasNextPage = response.hasNextPage || false;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || this.i18n.t('claims.loadError');
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadClaims();
  }

  resetFilters(): void {
    this.selectedStatus = null;
    this.selectedClaimTypeId = '';
    this.selectedCountryId = '';
    this.createdFrom = '';
    this.createdTo = '';
    this.currentPage = 1;
    this.loadClaims();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadClaims();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.goToPage(this.currentPage + 1);
    }
  }

  getPageNumbers(): number[] {
    const totalPages = this.totalPages;
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

  viewClaimDetail(claimId: string): void {
    this.router.navigate(['/admin/claims', claimId]);
  }

  getStatusClass(status: ClaimStatus): string {
    switch (status) {
      case ClaimStatus.Submitted:
        return 'badge bg-warning';
      case ClaimStatus.InProgress:
        return 'badge bg-info';
      case ClaimStatus.Closed:
        return 'badge bg-success';
      default:
        return 'badge bg-light text-dark';
    }
  }

  getStatusLabel(status: ClaimStatus): string {
    const lang = this.i18n.getCurrentLocale() as 'en' | 'fr';
    return getClaimStatusLabel(status, lang);
  }

  getStatusCount(status: ClaimStatus): number {
    return this.claims.filter(c => c.status === status).length;
  }

  goBack(): void {
    this.router.navigate(['/internal/dashboard']);
  }
}