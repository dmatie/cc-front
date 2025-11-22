import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';
import { I18nService } from '../../services/i18n.service';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';
import { RegistrationDetail, RegistrationResponseAll, StatusMapper } from '../../models/registration.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-access-request-list',
  standalone: true,
  imports: [CommonModule, AuthenticatedNavbarComponent],
  templateUrl: './access-request-list.component.html',
  styleUrl: './access-request-list.component.css'
})
export class AccessRequestListComponent implements OnInit {
  requestResponse: RegistrationResponseAll = { accessRequests: [], pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0 };
  isLoading = true;
  errorMessage = '';
  StatusMapper = StatusMapper;

  constructor(
    private registrationService: AbstractRegistrationService,
    private router: Router,
    public i18n: I18nService,
    
  ) {}

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  loadPendingRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.registrationService.getAllRegistrations({ status: 'pending' }).subscribe({
      next: (requestResponse) => {
        this.requestResponse = requestResponse;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || this.i18n.t('admin.access_requests.load_error');
        this.isLoading = false;
      }
    });
  }

  viewDetail(requestId: string): void {
    this.router.navigate(['/admin/accessrequests', requestId]);
  }

  goBack(): void {
    this.router.navigate(['/internal/dashboard']);
  }
}
