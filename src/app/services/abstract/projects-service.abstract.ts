import { Observable } from 'rxjs';
import { Project, ProjectsResponse, ProjectFilter, ProjectStats, GetProjectLoanNumberResponse } from '../../models/project.model';

/**
 * Service abstrait pour la gestion des projets
 */
export abstract class AbstractProjectsService {

  /**
   * Obtenir la liste des projets par pays
   * @param countryCode Code du pays
   * @param pageNumber Numéro de page (optionnel, défaut: 1)
   * @param pageSize Taille de page (optionnel, défaut: 10)
   * @returns Observable avec la réponse contenant les projets
   */
  abstract getProjectsByCountry(countryCode: string, pageNumber?: number, pageSize?: number): Observable<ProjectsResponse>;

  /**
   * Obtenir tous les projets avec filtres
   * @param filter Filtres optionnels
   * @returns Observable avec la réponse contenant les projets
   */
  abstract getProjects(filter?: ProjectFilter): Observable<ProjectsResponse>;

  /**
   * Obtenir un projet par son code SAP
   * @param sapCode Code SAP du projet
   * @returns Observable avec le projet ou null si non trouvé
   */
  abstract getProjectBySapCode(sapCode: string): Observable<Project | null>;

  /**
   * Rechercher des projets par nom ou code SAP
   * @param searchTerm Terme de recherche
   * @param countryCode Code du pays (optionnel)
   * @returns Observable avec la liste des projets trouvés
   */
  abstract searchProjects(searchTerm: string, countryCode?: string): Observable<Project[]>;

  /**
   * Obtenir les statistiques des projets
   * @returns Observable avec les statistiques
   */
  abstract getProjectStats(): Observable<ProjectStats>;

  /**
   * Obtenir les projets par codes SAP
   * @param sapCodes Liste des codes SAP
   * @returns Observable avec la liste des projets
   */
  abstract getProjectsBySapCodes(sapCodes: string[]): Observable<Project[]>;

  /**
   * Vérifier si un projet existe
   * @param sapCode Code SAP du projet
   * @returns Observable avec true si le projet existe, false sinon
   */
  abstract projectExists(sapCode: string): Observable<boolean>;

  abstract getProjectLoanNumbers(sapCode: string): Observable<GetProjectLoanNumberResponse>;
}
