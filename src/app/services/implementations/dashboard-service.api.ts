import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { AbstractDashboardService, InternalDashboardStatsDto, ExternalDashboardStatsDto } from '../abstract/dashboard-service.abstract';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from '../error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ApiDashboardService extends AbstractDashboardService {
  private readonly apiUrl = `${environment.apiUrl}/Dashboard`;
  private readonly timeout = 30000;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {
    super();
  }

  getInternalDashboardStats(): Observable<InternalDashboardStatsDto> {
    console.log('📤 [API] Fetching internal dashboard stats');

    return this.http.get<any>(`${this.apiUrl}/internal-stats`).pipe(
      timeout(this.timeout),
      map(response => {
        const stats: InternalDashboardStatsDto = {
          pendingAccessRequests: response.pendingAccessRequests || 0,
          pendingClaims: response.pendingClaims || 0,
          pendingDisbursements: response.pendingDisbursements || 0,
          totalUsers: response.totalUsers || 0
        };
        console.log('✅ [API] Internal dashboard stats received:', stats);
        return stats;
      }),
      catchError(error => {
        console.error('❌ [API] Error fetching internal dashboard stats:', error);
        const errorMessage = this.errorHandler.handleApiError(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getExternalDashboardStats(): Observable<ExternalDashboardStatsDto> {
    console.log('📤 [API] Fetching external dashboard stats');

    return this.http.get<any>(`${this.apiUrl}/external-stats`).pipe(
      timeout(this.timeout),
      map(response => {
        const stats: ExternalDashboardStatsDto = {
          activeProjects: response.activeProjects || 0,
          activeDisbursementRequests: response.activeDisbursementRequests || 0,
          pendingClaims: response.pendingClaims || 0
        };
        console.log('✅ [API] External dashboard stats received:', stats);
        return stats;
      }),
      catchError(error => {
        console.error('❌ [API] Error fetching external dashboard stats:', error);
        const errorMessage = this.errorHandler.handleApiError(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
