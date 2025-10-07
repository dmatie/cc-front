import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, timeout, retry, map } from 'rxjs/operators';
import { AbstractProjectsService } from '../abstract/projects-service.abstract';
import { Project, ProjectsResponse, ProjectFilter, ProjectStats } from '../../models/project.model';
import { environment } from '../../../environments/environment';

/**
 * Implémentation API du service projets
 */
@Injectable({
  providedIn: 'root'
})
export class ApiProjectsService extends AbstractProjectsService {
  
  private readonly apiUrl = `${environment.apiUrl}/projects`;
  private readonly timeout = 30000; // 30 secondes

  constructor(private http: HttpClient) {
    super();
  }

  getProjectsByCountry(countryCode: string, pageNumber: number = 1, pageSize: number = 10): Observable<ProjectsResponse> {
    console.log('[API] Fetching projects for country:', countryCode);
    
    
    return this.http.get<ProjectsResponse>(`${this.apiUrl}/country/${countryCode}`, { 
      headers: this.getHeaders(),
    }).pipe(
      timeout(this.timeout),
      retry(2),
      catchError(error => this.handleError('projects by country', error))
    );
  }

  getProjects(filter?: ProjectFilter): Observable<ProjectsResponse> {
    console.log('[API] Fetching projects with filter:', filter);
    
    const params = this.buildHttpParams(filter);
    return this.http.get<ProjectsResponse>(`${this.apiUrl}`, { 
      headers: this.getHeaders(),
      params 
    }).pipe(
      timeout(this.timeout),
      retry(2),
      catchError(error => this.handleError('projects', error))
    );
  }

  getProjectBySapCode(sapCode: string): Observable<Project | null> {
    console.log('[API] Fetching project by SAP code:', sapCode);
    
    return this.http.get<Project>(`${this.apiUrl}/${encodeURIComponent(sapCode)}`, { 
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        return this.handleError('project', error);
      })
    );
  }

  searchProjects(searchTerm: string, countryCode?: string): Observable<Project[]> {
    console.log('[API] Searching projects:', searchTerm, countryCode);
    
    let params = new HttpParams().set('search', searchTerm);
    if (countryCode) {
      params = params.set('countryCode', countryCode);
    }
    
    return this.http.get<{projects: Project[]}>(`${this.apiUrl}/search`, { 
      headers: this.getHeaders(),
      params 
    }).pipe(
      timeout(this.timeout),
      retry(2),
      map(response => response.projects),
      catchError(error => this.handleError('project search', error))
    );
  }

  getProjectStats(): Observable<ProjectStats> {
    console.log('📊 [API] Fetching project stats');
    
    return this.http.get<ProjectStats>(`${this.apiUrl}/stats`, { 
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      retry(2),
      catchError(error => this.handleError('project stats', error))
    );
  }

  getProjectsBySapCodes(sapCodes: string[]): Observable<Project[]> {
    console.log('🏗️ [API] Fetching projects by SAP codes:', sapCodes);
    
    const body = { sapCodes };
    return this.http.post<{projects: Project[]}>(`${this.apiUrl}/by-codes`, body, { 
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      retry(2),
      map(response => response.projects),
      catchError(error => this.handleError('projects by codes', error))
    );
  }

  projectExists(sapCode: string): Observable<boolean> {
    console.log('🔍 [API] Checking if project exists:', sapCode);
    
    return this.http.get<{exists: boolean}>(`${this.apiUrl}/${encodeURIComponent(sapCode)}/exists`, { 
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      map(response => response.exists),
      catchError(error => {
        if (error.status === 404) {
          return of(false);
        }
        return this.handleError('project exists', error);
      })
    );
  }

  // MÉTHODES PRIVÉES

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

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

  private handleError(endpoint: string, error: any): Observable<never> {
    console.error(`❌ [API] Error fetching ${endpoint}:`, error);
    
    let errorMessage = 'Une erreur inattendue s\'est produite';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur réseau: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = 'Paramètres de requête invalides';
          break;
        case 401:
          errorMessage = 'Non autorisé';
          break;
        case 403:
          errorMessage = 'Accès interdit';
          break;
        case 404:
          errorMessage = 'Projets non trouvés';
          break;
        case 429:
          errorMessage = 'Trop de requêtes. Veuillez réessayer plus tard';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
    }

    const errorResponse: ProjectsResponse = {
      projects: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0
    };

    return throwError(() => errorResponse);
  }
}