import { Observable } from 'rxjs';
import { AmendRegistrationRequest, RegistrationDetail, RegistrationRequest, RegistrationResponse, RegistrationStatus, ValidationError } from '../../models/registration.model';

/**
 * Service abstrait pour la gestion des enregistrements
 */
export abstract class AbstractRegistrationService {

  /**
   * Soumettre une demande d'enregistrement
   * @param request Données de la demande d'enregistrement
   * @returns Observable avec la réponse d'enregistrement
   */
  abstract submitRegistration(request: RegistrationRequest): Observable<RegistrationResponse>;

  /**
   * Vérifier le statut d'une demande d'enregistrement
   * @param requestId Identifiant de la demande
   * @returns Observable avec le statut de la demande
   */
  abstract getRegistrationStatus(requestId: string): Observable<RegistrationStatus>;

  /**
   * Valider les données d'enregistrement côté client
   * @param request Données à valider
   * @returns Liste des erreurs de validation
   */
  abstract validateRegistrationData(request: RegistrationRequest): ValidationError[];

  /**
   * Vérifier si un email existe déjà
   * @param email Adresse email à vérifier
   * @returns Observable avec true si l'email existe, false sinon
   */
  abstract checkEmailExists(email: string): Observable<boolean>;

  /**
   * Obtenir toutes les demandes d'enregistrement (pour les admins)
   * @param filter Filtres optionnels
   * @returns Observable avec la liste des demandes
   */
  abstract getAllRegistrations(filter?: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
  }): Observable<RegistrationStatus[]>;

  /**
   * Approuver une demande d'enregistrement
   * @param requestId Identifiant de la demande
   * @param approverNotes Notes de l'approbateur
   * @returns Observable avec la réponse
   */
  abstract approveRegistration(requestId: string, approverNotes?: string): Observable<{ success: boolean; message: string }>;

  /**
   * Rejeter une demande d'enregistrement
   * @param requestId Identifiant de la demande
   * @param rejectionReason Motif du rejet
   * @returns Observable avec la réponse
   */
  abstract rejectRegistration(requestId: string, rejectionReason: string): Observable<{ success: boolean; message: string }>;

  /**
   * Obtenir une demande d'enregistrement par email
   * @param email Adresse email
   * @returns Observable avec les détails de la demande ou null si non trouvée
   */
 abstract getRegistrationByEmail(email: string): Observable<RegistrationDetail | null>;

  /**
   * Envoyer un code de vérification par email
   * @param email Adresse email
   * @returns Observable avec la confirmation d'envoi
   */
  abstract sendVerificationCode(email: string): Observable<{ success: boolean; message: string }>;

  /**
   * Vérifier le code de validation
   * @param email Adresse email
   * @param code Code de vérification (6 chiffres)
   * @returns Observable avec true si le code est valide
   */
  abstract verifyCode(email: string, code: string): Observable<boolean>;

  /**
   * Abandonner une demande d'enregistrement
   * @param id Identifiant de la demande
   * @returns Observable avec la confirmation
   */
  abstract abandonRegistration(id: string): Observable<{ success: boolean; message: string }>;

  /**
   * Mettre à jour une demande d'enregistrement
   * @param request Données mises à jour
   * @returns Observable avec la réponse
   */
  abstract updateRegistration(request: AmendRegistrationRequest): Observable<RegistrationResponse>;
}
