import { Injectable } from '@angular/core';
import { I18nService } from './i18n.service';

@Injectable({
  providedIn: 'root'
})
export class BackendMessageTranslationService {

  constructor(private i18n: I18nService) {}

  // Mapping des codes backend -> clés i18n
    private messageKeyMapping: { [backendCode: string]: string } = {
    'MSG.DISBURSEMENT.SUBMITTED_SUCCESS': 'disbursements.submitted_success',
    'MSG.DISBURSEMENT.SUBMISSION_FAILED': 'disbursements.submission_failed',
    'MSG.REGISTRATION.CREATED': 'registration.created',
    'MSG.REGISTRATION.UPDATED': 'registration.updated',
    'MSG.DISBURSEMENT.CREATED_SUCCESS': 'disbursements.created_success',
    'MSG.DISBURSEMENT.APPROVED_SUCCESS': 'disbursements.approved_success',
    'MSG.DISBURSEMENT.REJECTED_SUCCESS': 'disbursements.rejected_success',
    'MSG.DISBURSEMENT.BACKED_TO_CLIENT_SUCCESS': 'disbursements.backed_to_client_success',
    'MSG.DISBURSEMENT.UPDATED_SUCCESS': 'disbursements.updated_success'
  };



  /**
   * Traduit un code de message retourné par le backend.
   * Si aucune traduction n'existe, retourne un fallback lisible (ou le code).
   */
  translateMessage(code?: string | null): string {
    if (!code) return this.getFallbackMessage(code);

    const i18nKey = this.messageKeyMapping[code];
    if (i18nKey) {
      const translated = this.i18n.translate(i18nKey);
      return translated !== i18nKey ? translated : this.getFallbackMessage(code);
    }

    // Si le pattern MSG.* n'est pas connu, tenter une traduction générique
    return this.getFallbackMessage(code);
  }

  /**
   * Traduit une liste de codes de messages backend.
   */
  translateMessages(codes: (string | null | undefined)[]): string[] {
    return codes.map(c => this.translateMessage(c));
  }

  /**
   * Inspecte une réponse backend (objet contenant une propriété "Message")
   * et retourne un nouvel objet avec la traduction ajoutée sous 'translatedMessage'.
   * Usage générique pour responses contenant Message: string.
   */
  translateResponse<T extends { Message?: string | null }>(response: T): T & { translatedMessage: string } {
    const translated = this.translateMessage(response?.Message);
    return { ...response, translatedMessage: translated };
  }

  /**
   * Indique si le code est un message backend connu (pattern)
   */
  isKnownBackendMessage(code?: string | null): boolean {
    return !!code && code.startsWith('MSG.');
  }

  /**
   * Fallback pour les messages inconnus
   */
  private getFallbackMessage(code?: string | null): string {
    if (!code) {
      const generic = this.i18n.translate('messages.unexpected');
      return generic !== 'messages.unexpected' ? generic : 'Une erreur est survenue';
    }

    // essaie une clé générique contenant le code (optionnel)
    const keyGuess = `messages.${code.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
    const guessed = this.i18n.translate(keyGuess);
    if (guessed !== keyGuess) return guessed;

    // dernier recours : retourne le code backend lisible
    return code;
  }
}