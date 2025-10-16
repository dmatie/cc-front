import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, timeout, retry, map } from 'rxjs/operators';
import { AbstractProjectsService } from '../abstract/projects-service.abstract';
import { Project, ProjectsResponse, ProjectFilter, ProjectStats } from '../../models/project.model';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from '../error-handler.service';

/**
 * Implémentation API du service projets
 */
@Injectable({
  providedIn: 'root'
})
export class ApiProjectsService extends AbstractProjectsService {
  
  private readonly apiUrl = `${environment.apiUrl}/projects`;
  private readonly timeout = 30000; // 30 secondes

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {
    super();
  }

  getProjectsByCountry(countryCode: string, pageNumber: number = 1, pageSize: number = 10): Observable<ProjectsResponse> {
    console.log('[API] Fetching projects for country:', countryCode);

    return this.http.get<ProjectsResponse>(`${this.apiUrl}/country/${countryCode}`).pipe(
      timeout(this.timeout),
      retry(2),
      catchError(this.errorHandler.handleApiErrorRx('ProjectsService'))
    );
  }

  getProjects(filter?: ProjectFilter): Observable<ProjectsResponse> {
    console.log('[API] Fetching projects with filter:', filter);

    const params = this.buildHttpParams(filter);
    return this.http.get<ProjectsResponse>(`${this.apiUrl}`, { params }).pipe(
      timeout(this.timeout),
      retry(2),
      catchError(this.errorHandler.handleApiErrorRx('ProjectsService'))
    );
  }

  getProjectBySapCode(sapCode: string): Observable<Project | null> {
    console.log('[API] Fetching project by SAP code:', sapCode);

    return this.http.get<Project>(`${this.apiUrl}/${encodeURIComponent(sapCode)}`).pipe(
      timeout(this.timeout),
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        return this.errorHandler.handleApiErrorRx('ProjectsService')(error);
      })
    );
  }

  searchProjects(searchTerm: string, countryCode?: string): Observable<Project[]> {
    console.log('[API] Searching projects:', searchTerm, countryCode);

    let params = new HttpParams().set('search', searchTerm);
    if (countryCode) {
      params = params.set('countryCode', countryCode);
    }

    return this.http.get<{projects: Project[]}>(`${this.apiUrl}/search`, { params }).pipe(
      timeout(this.timeout),
      retry(2),
      map(response => response.projects),
      catchError(this.errorHandler.handleApiErrorRx('ProjectsService'))
    );
  }

  getProjectStats(): Observable<ProjectStats> {
    console.log('📊 [API] Fetching project stats');

    return this.http.get<ProjectStats>(`${this.apiUrl}/stats`).pipe(
      timeout(this.timeout),
      retry(2),
      catchError(this.errorHandler.handleApiErrorRx('ProjectsService'))
    );
  }

  getProjectsBySapCodes(sapCodes: string[]): Observable<Project[]> {
    console.log('🏗️ [API] Fetching projects by SAP codes:', sapCodes);

    const body = { sapCodes };
    return this.http.post<{projects: Project[]}>(`${this.apiUrl}/by-codes`, body).pipe(
      timeout(this.timeout),
      retry(2),
      map(response => response.projects),
      catchError(this.errorHandler.handleApiErrorRx('ProjectsService'))
    );
  }

  projectExists(sapCode: string): Observable<boolean> {
    console.log('🔍 [API] Checking if project exists:', sapCode);

    return this.http.get<{exists: boolean}>(`${this.apiUrl}/${encodeURIComponent(sapCode)}/exists`).pipe(
      timeout(this.timeout),
      map(response => response.exists),
      catchError(error => {
        if (error.status === 404) {
          return of(false);
        }
        return this.errorHandler.handleApiErrorRx('ProjectsService')(error);
      })
    );
  }

  // MÉTHODES PRIVÉES

  private buildHttpParams(filter?: ProjectFilter): HttpParams {
    let params = new HttpParams();

    if (filter) {
      if (filter.countryCode) params = params.set('countryCode', filter.countryCode);
      if (filter.search) params = params.set('search', filter.search);
      if (filter.pageNumber) params = params.set('pageNumber', filter.pageNumber.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
      if (filter.isActive !== undefined) params = params.set('isActive', filter.isActive.toString());
    }

    return params;
  }
}