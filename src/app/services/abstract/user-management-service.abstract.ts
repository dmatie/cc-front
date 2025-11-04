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
}
