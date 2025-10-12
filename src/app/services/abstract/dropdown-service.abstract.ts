import { Observable } from 'rxjs';
import { Country, UserFunction, BusinessProfile, DropdownResponse, DropdownFilter, FinancingType } from '../../models/dropdown.model';
import { ClaimTypesResponse } from '../../models/claim.model';

/**
 * Service abstrait pour la gestion des listes déroulantes
 */
export abstract class AbstractDropdownService {

  /**
   * Obtenir la liste des pays
   * @param filter Filtres optionnels
   * @returns Observable avec la réponse contenant les pays
   */
  abstract getCountries(filter?: DropdownFilter): Observable<DropdownResponse<Country>>;

  /**
   * Obtenir la liste des fonctions utilisateur
   * @param filter Filtres optionnels
   * @returns Observable avec la réponse contenant les fonctions
   */
  abstract getFunctions(filter?: DropdownFilter): Observable<DropdownResponse<UserFunction>>;

  /**
   * Obtenir la liste des profils d'entreprise
   * @param filter Filtres optionnels
   * @returns Observable avec la réponse contenant les profils
   */
  abstract getBusinessProfiles(filter?: DropdownFilter): Observable<DropdownResponse<BusinessProfile>>;

   /**
   * Obtenir la liste des types de financement
   * @param filter Filtres optionnels
   * @returns Observable avec la réponse contenant les types de financement
   */
  abstract getFinancingTypes(filter?: DropdownFilter): Observable<DropdownResponse<FinancingType>>;

  /**
   * Obtenir la liste des types de réclamation
   * @returns Observable avec la réponse contenant les types de réclamation
   */
  abstract getClaimTypes(): Observable<ClaimTypesResponse>;

  /**
   * Obtenir un pays par son ID
   * @param id Identifiant GUID du pays
   * @returns Observable avec le pays ou null si non trouvé
   */
  abstract getCountryById(id: string): Observable<Country | null>;

  /**
   * Obtenir une fonction par son ID
   * @param id Identifiant GUID de la fonction
   * @returns Observable avec la fonction ou null si non trouvée
   */
  abstract getFunctionById(id: string): Observable<UserFunction | null>;

  /**
   * Obtenir un profil d'entreprise par son ID
   * @param id Identifiant GUID du profil
   * @returns Observable avec le profil ou null si non trouvé
   */
  abstract getBusinessProfileById(id: string): Observable<BusinessProfile | null>;
}
