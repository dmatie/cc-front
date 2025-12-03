import { Injectable } from '@angular/core';
import { I18nService } from './i18n.service';

/**
 * Service pour la traduction des codes d'erreur API
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorTranslationService {

  constructor(private i18n: I18nService) {}

  /**
   * Traduit un code d'erreur API en message utilisateur
   * @param errorCode Code d'erreur de l'API
   * @returns Message traduit ou le code original si pas de traduction
   */
  translateErrorCode(errorCode: string): string {
    // Mapping des codes d'erreur vers les clés i18n
    const errorKeyMapping: { [key: string]: string } = {

      //AccessRequest Errors
      'ERR.AccessRequest.EmailAlreadyExists': 'errors.access_request.email_already_exists',
      'ERR.AccessRequest.RequestAlreadyExists': 'errors.access_request.email_already_exists',


      //File Upload Errors
      'ERR.FILE.NULL': 'errors.file.null',
      'ERR.FILE.NAME_EMPTY': 'errors.file.name_empty',
      'ERR.FILE.EMPTY': 'errors.file.empty',
      'ERR.FILE.SIZE_EXCEEDED': 'errors.file.size_exceeded',
      'ERR.FILE.EXTENSION_NOT_ALLOWED': 'errors.file.extension_not_allowed',
      'ERR.FILE.MIMETYPE_NOT_ALLOWED': 'errors.file.mimetype_not_allowed',

       //Disbursement Errors
      'ERR.Disbursement.DisbursementTypeNotExist': 'disbursements.validation_errors.disbursement_type_not_exist',
      'ERR.Disbursement.CurrencyNotExist': 'disbursements.validation_errors.currency_not_exist',
      'ERR.Disbursement.DisbursementTypeCodeNotExist': 'disbursements.validation_errors.disbursement_type_code_not_exist',


      // Erreurs générales
      'ERR.General.ReferenceDataNotExist': 'errors.reference_data_not_exist',
      'ERR.General.InvalidEmailFormat': 'errors.invalid_email_format',
      'ERR.General.EmailAlreadyExists': 'errors.email_already_exists',
      'ERR.General.MissingAdGroup': 'errors.missing_ad_group',
      'ERR.General.EmailExistsInEntra': 'errors.access_request.invalid_status_transition',

      
      // Erreurs de validation des champs
      'ERR.General.UserNotFound': 'errors.user_not_found',
      'ERR.General.FirstNameTooShort': 'errors.first_name_too_short',
      'ERR.General.LastNameTooShort': 'errors.last_name_too_short',
      'ERR.General.FunctionRequired': 'errors.function_required',
      'ERR.General.CountryRequired': 'errors.country_required',
      'ERR.General.BusinessProfileRequired': 'errors.business_profile_required',
      'ERR.General.FinancingTypeRequired': 'errors.financing_type_required',
      
      // Erreurs d'authentification
      'ERR.Auth.InvalidCredentials': 'errors.invalid_credentials',
      'ERR.Auth.AccountLocked': 'errors.account_locked',
      'ERR.Auth.TokenExpired': 'errors.token_expired',
      
      // Erreurs de permissions
      'ERR.Permission.AccessDenied': 'errors.access_denied',
      'ERR.Permission.InsufficientRights': 'errors.insufficient_rights',
      
      // Erreurs système
      'ERR.System.DatabaseError': 'errors.database_error',
      'ERR.System.ServiceUnavailable': 'errors.service_unavailable',
      'ERR.System.TimeoutError': 'errors.timeout_error',
      
      // Erreurs de validation métier
      'ERR.Business.DuplicateEntry': 'errors.duplicate_entry',
      'ERR.Business.InvalidOperation': 'errors.invalid_operation',
      'ERR.Business.ResourceNotFound': 'errors.resource_not_found'
    };

    const translationKey = errorKeyMapping[errorCode];
    
    if (translationKey) {
      const translatedMessage = this.i18n.translate(translationKey);
      // Si la traduction retourne la clé (pas trouvée), utiliser le fallback
      return translatedMessage !== translationKey ? translatedMessage : this.getFallbackMessage(errorCode);
    }

    // Fallback : retourner le code original ou un message générique
    return this.getFallbackMessage(errorCode);
  }

  /**
   * Traduit plusieurs codes d'erreur
   * @param errorCodes Liste des codes d'erreur
   * @returns Liste des messages traduits
   */
  translateErrorCodes(errorCodes: string[]): string[] {
    return errorCodes.map(code => this.translateErrorCode(code));
  }

  /**
   * Vérifie si un code d'erreur est connu
   * @param errorCode Code d'erreur à vérifier
   * @returns true si le code est connu
   */
  isKnownErrorCode(errorCode: string): boolean {
    return errorCode.startsWith('ERR.');
  }

  /**
   * Extrait le type d'erreur du code (General, Auth, Permission, etc.)
   * @param errorCode Code d'erreur
   * @returns Type d'erreur ou 'Unknown'
   */
  getErrorType(errorCode: string): string {
    const match = errorCode.match(/^ERR\.([^.]+)\./);
    return match ? match[1] : 'Unknown';
  }

  /**
   * Obtient un message de fallback pour les codes d'erreur non traduits
   * @param errorCode Code d'erreur original
   * @returns Message de fallback
   */
  private getFallbackMessage(errorCode: string): string {
    // Messages de fallback basés sur le type d'erreur
    const fallbackMessages: { [key: string]: string } = {
      'General': this.i18n.translate('errors.general_error'),
      'Auth': this.i18n.translate('errors.authentication_error'),
      'Permission': this.i18n.translate('errors.permission_error'),
      'System': this.i18n.translate('errors.system_error'),
      'Business': this.i18n.translate('errors.business_error')
    };

    const errorType = this.getErrorType(errorCode);
    const fallback = fallbackMessages[errorType];
    
    if (fallback && fallback !== `errors.${errorType.toLowerCase()}_error`) {
      return fallback;
    }

    // Dernier recours : message générique
    const genericMessage = this.i18n.translate('errors.unexpected_error');
    return genericMessage !== 'errors.unexpected_error' ? genericMessage : 'Une erreur inattendue s\'est produite';
  }
}