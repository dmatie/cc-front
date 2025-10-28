import { Observable } from 'rxjs';

export interface InternalDashboardStatsDto {
  pendingAccessRequests: number;
  pendingClaims: number;
  pendingDisbursements: number;
  totalUsers: number;
}

export interface ExternalDashboardStatsDto {
  activeProjects: number;
  activeDisbursementRequests: number;
  pendingClaims: number;
}

export abstract class AbstractDashboardService {
  abstract getInternalDashboardStats(): Observable<InternalDashboardStatsDto>;
  abstract getExternalDashboardStats(): Observable<ExternalDashboardStatsDto>;
}
