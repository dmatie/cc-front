import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AbstractDashboardService, InternalDashboardStatsDto, ExternalDashboardStatsDto } from '../abstract/dashboard-service.abstract';

@Injectable()
export class DashboardServiceMock extends AbstractDashboardService {
  getInternalDashboardStats(): Observable<InternalDashboardStatsDto> {
    const stats: InternalDashboardStatsDto = {
      pendingAccessRequests: 5,
      pendingClaims: 12,
      pendingDisbursements: 8,
      totalUsers: 45
    };
    return of(stats).pipe(delay(500));
  }

  getExternalDashboardStats(): Observable<ExternalDashboardStatsDto> {
    const stats: ExternalDashboardStatsDto = {
      activeProjects: 3,
      activeDisbursementRequests: 7,
      pendingClaims: 4
    };
    return of(stats).pipe(delay(500));
  }
}
