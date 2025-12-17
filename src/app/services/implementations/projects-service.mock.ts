import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { AbstractProjectsService } from '../abstract/projects-service.abstract';
import { Project, ProjectsResponse, ProjectFilter, ProjectStats, GetProjectLoanNumberResponse } from '../../models/project.model';

/**
 * Implémentation mock du service projets
 */

export class MockProjectsService extends AbstractProjectsService {

  // MOCK PROJECTS DATA
  private mockProjects: Project[] = [
    // Projets pour l'Algérie (DZ)
    { sapCode: "P-DZ-F01-001", projectName: "Infrastructure Routière Algérie", countryCode: "DZ", managingCountryCode: "DZ" },
    { sapCode: "P-DZ-F02-002", projectName: "Développement Agricole Nord", countryCode: "DZ", managingCountryCode: "DZ" },
    { sapCode: "P-DZ-F03-003", projectName: "Modernisation Portuaire Alger", countryCode: "DZ", managingCountryCode: "DZ" },
    
    // Projets pour l'Angola (AO)
    { sapCode: "P-AO-F10-001", projectName: "Électrification Rurale Angola", countryCode: "AO", managingCountryCode: "AO" },
    { sapCode: "P-AO-F11-002", projectName: "Réhabilitation Réseau Eau", countryCode: "AO", managingCountryCode: "AO" },
    
    // Projets pour le Bénin (BJ)
    { sapCode: "P-BJ-F20-001", projectName: "Education Primaire Bénin", countryCode: "BJ", managingCountryCode: "BJ" },
    { sapCode: "P-BJ-F21-002", projectName: "Santé Communautaire", countryCode: "BJ", managingCountryCode: "BJ" },
    { sapCode: "P-BJ-F22-003", projectName: "Microfinance Rurale", countryCode: "BJ", managingCountryCode: "BJ" },
    
    // Projets pour le Botswana (BW)
    { sapCode: "P-BW-F30-001", projectName: "Gestion Ressources Eau", countryCode: "BW", managingCountryCode: "BW" },
    
    // Projets pour le Burkina Faso (BF)
    { sapCode: "P-BF-F40-001", projectName: "Sécurité Alimentaire", countryCode: "BF", managingCountryCode: "BF" },
    { sapCode: "P-BF-F41-002", projectName: "Énergies Renouvelables", countryCode: "BF", managingCountryCode: "BF" },
    
    // Projets pour le Cameroun (CM)
    { sapCode: "P-CM-F50-001", projectName: "Transport Multimodal", countryCode: "CM", managingCountryCode: "CM" },
    { sapCode: "P-CM-F51-002", projectName: "Développement Urbain Douala", countryCode: "CM", managingCountryCode: "CM" },
    { sapCode: "P-CM-F52-003", projectName: "Forêts et Biodiversité", countryCode: "CM", managingCountryCode: "CM" },
    
    // Projets pour le Kenya (KE)
    { sapCode: "P-KE-F60-001", projectName: "Corridor Transport Est", countryCode: "KE", managingCountryCode: "KE" },
    { sapCode: "P-KE-F61-002", projectName: "Innovation Technologique", countryCode: "KE", managingCountryCode: "KE" },
    
    // Projets pour le Nigeria (NG)
    { sapCode: "P-NG-F70-001", projectName: "Industrialisation Lagos", countryCode: "NG", managingCountryCode: "NG" },
    { sapCode: "P-NG-F71-002", projectName: "Agriculture Intelligente", countryCode: "NG", managingCountryCode: "NG" },
    { sapCode: "P-NG-F72-003", projectName: "Énergie Solaire Nord", countryCode: "NG", managingCountryCode: "NG" },
    { sapCode: "P-NG-F73-004", projectName: "Développement PME", countryCode: "NG", managingCountryCode: "NG" },
    
    // Projets pour l'Afrique du Sud (ZA)
    { sapCode: "P-ZA-F80-001", projectName: "Transition Énergétique", countryCode: "ZA", managingCountryCode: "ZA" },
    { sapCode: "P-ZA-F81-002", projectName: "Inclusion Financière", countryCode: "ZA", managingCountryCode: "ZA" }
  ];


    private mockProjectLoanNumbers = [
      { sapCode: 'P-MA-AAA-001', loanNumber: 'LG-2024-001' },
      { sapCode: 'P-MA-AAA-001', loanNumber: 'LG-2024-002' },
      { sapCode: 'P-TN-BBB-002', loanNumber: 'LG-2024-003' }
    ];
  

  getProjectsByCountry(countryCode: string, pageNumber: number = 1, pageSize: number = 10): Observable<ProjectsResponse> {
    console.log('🏗️ [MOCK] Fetching projects for country:', countryCode);
    
    return of(null).pipe(
      delay(800),
      map(() => {
        // Filtrer les projets par code pays
        const countryProjects = this.mockProjects.filter(project => 
          project.countryCode === countryCode
        );
        
        // Pagination
        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedProjects = countryProjects.slice(startIndex, endIndex);
        
        const response: ProjectsResponse = {
          projects: paginatedProjects,
          totalCount: countryProjects.length,
          pageNumber: pageNumber,
          pageSize: pageSize,
          totalPages: Math.ceil(countryProjects.length / pageSize)
        };
        
        console.log('✅ [MOCK] Projects loaded for', countryCode, ':', response.projects.length);
        return response;
      }),
      catchError(error => this.handleError('projects', error))
    );
  }

  getProjects(filter?: ProjectFilter): Observable<ProjectsResponse> {
    console.log('🏗️ [MOCK] Fetching projects with filter:', filter);
    
    return of(null).pipe(
      delay(600),
      map(() => {
        let filteredProjects = [...this.mockProjects];

        if (filter) {
          if (filter.countryCode) {
            filteredProjects = filteredProjects.filter(project => 
              project.countryCode === filter.countryCode
            );
          }
          if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            filteredProjects = filteredProjects.filter(project => 
              project.projectName.toLowerCase().includes(searchTerm) ||
              project.sapCode.toLowerCase().includes(searchTerm)
            );
          }
        }

        // Pagination
        const pageNumber = filter?.pageNumber || 1;
        const pageSize = filter?.pageSize || 10;
        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

        const response: ProjectsResponse = {
          projects: paginatedProjects,
          totalCount: filteredProjects.length,
          pageNumber: pageNumber,
          pageSize: pageSize,
          totalPages: Math.ceil(filteredProjects.length / pageSize)
        };

        console.log('✅ [MOCK] Projects loaded:', response.projects.length);
        return response;
      }),
      catchError(error => this.handleError('projects', error))
    );
  }

  getProjectBySapCode(sapCode: string): Observable<Project | null> {
    console.log('🏗️ [MOCK] Fetching project by SAP code:', sapCode);
    
    return of(null).pipe(
      delay(300),
      map(() => this.mockProjects.find(project => project.sapCode === sapCode) || null)
    );
  }

  searchProjects(searchTerm: string, countryCode?: string): Observable<Project[]> {
    console.log('🔍 [MOCK] Searching projects:', searchTerm, countryCode);
    
    return of(null).pipe(
      delay(400),
      map(() => {
        let projects = this.mockProjects;
        
        if (countryCode) {
          projects = projects.filter(project => project.countryCode === countryCode);
        }
        
        const searchTermLower = searchTerm.toLowerCase();
        return projects.filter(project => 
          project.projectName.toLowerCase().includes(searchTermLower) ||
          project.sapCode.toLowerCase().includes(searchTermLower)
        ).slice(0, 20); // Limiter à 20 résultats
      })
    );
  }

  getProjectStats(): Observable<ProjectStats> {
    console.log('📊 [MOCK] Fetching project stats');
    
    return of(null).pipe(
      delay(500),
      map(() => {
        const projectsByCountry: { [countryCode: string]: number } = {};
        
        this.mockProjects.forEach(project => {
          projectsByCountry[project.countryCode] = (projectsByCountry[project.countryCode] || 0) + 1;
        });

        const stats: ProjectStats = {
          totalProjects: this.mockProjects.length,
          activeProjects: this.mockProjects.length, // Tous actifs en mock
          projectsByCountry: projectsByCountry
        };

        console.log('✅ [MOCK] Project stats:', stats);
        return stats;
      })
    );
  }

  getProjectsBySapCodes(sapCodes: string[]): Observable<Project[]> {
    console.log('🏗️ [MOCK] Fetching projects by SAP codes:', sapCodes);
    
    return of(null).pipe(
      delay(400),
      map(() => {
        return this.mockProjects.filter(project => 
          sapCodes.includes(project.sapCode)
        );
      })
    );
  }

  projectExists(sapCode: string): Observable<boolean> {
    console.log('🔍 [MOCK] Checking if project exists:', sapCode);
    
    return of(null).pipe(
      delay(200),
      map(() => this.mockProjects.some(project => project.sapCode === sapCode))
    );
  }

  
  override getProjectLoanNumbers(sapCode: string): Observable<GetProjectLoanNumberResponse> {
    const filtered = this.mockProjectLoanNumbers.filter(p => p.sapCode === sapCode);
    const response: GetProjectLoanNumberResponse = {
      projectLoanNumbers: filtered,
      totalCount: filtered.length
    };
    return of(response).pipe(delay(300));
  }


  // MÉTHODES PRIVÉES

  private handleError(endpoint: string, error: any): Observable<never> {
    console.error(`❌ [MOCK] Error fetching ${endpoint}:`, error);
    return throwError(() => ({
      success: false,
      projects: [],
      totalCount: 0,
      message: `Failed to load ${endpoint}`
    }));
  }
}