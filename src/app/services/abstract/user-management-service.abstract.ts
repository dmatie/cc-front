import { Observable } from 'rxjs';
import {
  UserDto,
  SearchAzureAdUsersResponse,
  CreateInternalUserRequest,
  CreateInternalUserResponse
} from '../../models/user-management.model';

export abstract class AbstractUserManagementService {

  /** Récupère la liste des utilisateurs internes
   * @return Observable avec la liste des utilisateurs internes
   */
  abstract getInternalUsers(): Observable<UserDto[]>;

  /** Recherche des utilisateurs dans Azure AD
   * @param query Terme de recherche
   * @param maxResults Nombre maximum de résultats à retourner
   * @return Observable avec les résultats de la recherche
   */
  abstract searchAzureAdUsers(query: string, maxResults?: number): Observable<SearchAzureAdUsersResponse>;
  
  /** Ajoute un nouvel utilisateur interne
   * @param request Données de l'utilisateur à créer
   * @return Observable avec la réponse de la création
   */
  abstract addInternalUser(request: CreateInternalUserRequest): Observable<CreateInternalUserResponse>;

  /** Récupère les détails d'un utilisateur par son ID
   * @param id ID de l'utilisateur
   * @return Observable avec les détails de l'utilisateur
   */
  abstract getUserById(id: string): Observable<UserDto>;

  /** Désactive un utilisateur
   * @param id ID de l'utilisateur
   * @return Observable avec le résultat de l'opération
   */
  abstract deactivateUser(id: string): Observable<boolean>;

  /** Ajoute des pays à un utilisateur
   * @param userId ID de l'utilisateur
   * @param countryIds Liste des IDs des pays à ajouter
   * @return Observable avec le résultat de l'opération
   */
  abstract addCountriesToUser(userId: string, countryIds: string[]): Observable<boolean>;

  /** Supprime un pays d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param countryId ID du pays à supprimer
   * @return Observable avec le résultat de l'opération
   */
  abstract removeCountryFromUser(userId: string, countryId: string): Observable<boolean>;
}
