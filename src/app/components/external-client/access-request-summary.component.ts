import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AbstractRegistrationService } from '../../services/abstract/registration-service.abstract';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { RegistrationDetail, AccessRequestDetail, StatusEnum } from '../../models/registration.model';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';
import { AbstractProjectsService } from '../../services/abstract/projects-service.abstract';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-access-request-summary',
  standalone: true,
  imports: [CommonModule, AuthenticatedNavbarComponent],
  templateUrl: './access-request-summary.component.html',
  styleUrls: ['./access-request-summary.component.css']
})
export class AccessRequestSummaryComponent implements OnInit {
  accessRequest: AccessRequestDetail | null = null;
  projects: Project[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private registrationService: AbstractRegistrationService,
    private projectsService: AbstractProjectsService,
    private authService: AuthService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user?.email) {
      this.loadAccessRequest(user.email);
    } else {
      this.errorMessage = this.i18n.t('errors.noUserEmail');
      this.router.navigate(['/external/home']);
    }
  }

  loadAccessRequest(email: string): void {
    this.loading = true;

    this.registrationService.getRegistrationByEmail(email).subscribe({
      next: (response: RegistrationDetail | null) => {
        if (response && response.accessRequest) {
          this.accessRequest = response.accessRequest;
          this.loadProjects();
        } else {
          this.errorMessage = this.i18n.t('errors.noAccessRequest');
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading access request:', error);
        this.errorMessage = error.message || this.i18n.t('errors.loadingError');
        this.loading = false;
      }
    });
  }

  loadProjects(): void {
    if (!this.accessRequest?.selectedProjectCodes || this.accessRequest.selectedProjectCodes.length === 0) {
      this.loading = false;
      return;
    }

    this.projectsService.getProjectsBySapCodes(this.accessRequest.selectedProjectCodes).subscribe({
      next: (projects: Project[]) => {
        this.projects = projects;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/external/home']);
  }

  getStatusClass(status: StatusEnum): string {
    switch (status) {
      case StatusEnum.Pending:
        return 'badge bg-warning text-dark';
      case StatusEnum.Approved:
        return 'badge bg-success';
      case StatusEnum.Rejected:
        return 'badge bg-danger';
      case StatusEnum.Abandoned:
        return 'badge bg-secondary';
      case StatusEnum.Completed:
        return 'badge bg-primary';
      default:
        return 'badge bg-light text-dark';
    }
  }

  getStatusLabel(status: StatusEnum): string {
    const prefix = 'registration.status';
    switch (status) {
      case StatusEnum.Pending:
        return this.i18n.t(`${prefix}.pending`);
      case StatusEnum.Approved:
        return this.i18n.t(`${prefix}.approved`);
      case StatusEnum.Rejected:
        return this.i18n.t(`${prefix}.rejected`);
      case StatusEnum.Abandoned:
        return this.i18n.t(`${prefix}.abandoned`);
      case StatusEnum.Completed:
        return this.i18n.t(`${prefix}.completed`);
      default:
        return this.i18n.t(`${prefix}.unknown`);
    }
  }

  getStatusIcon(status: StatusEnum): string {
    switch (status) {
      case StatusEnum.Pending:
        return 'bi-hourglass-split';
      case StatusEnum.Approved:
        return 'bi-check-circle';
      case StatusEnum.Rejected:
        return 'bi-x-circle';
      case StatusEnum.Abandoned:
        return 'bi-trash';
      case StatusEnum.Completed:
        return 'bi-check-all';
      default:
        return 'bi-question-circle';
    }
  }
}
