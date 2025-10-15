import { Injectable } from '@angular/core';
import { ApiError } from '../interceptors/api-error-interceptor';
import { throwError } from 'rxjs';
import { ErrorTranslationService } from './error-translation.service';
import { I18nService } from './i18n.service';

/**
 * Service centralisé pour la gestion globale des erreurs API
 * - Traite les erreurs ApiError de l'intercepteur
 * - Utilise ErrorTranslationService pour la traduction i18n
 * - Gère les codes HTTP standards (401, 403, 404, 500, etc.)
 * - Logging centralisé des erreurs
 */
@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService {

    constructor(
        private errorTranslation: ErrorTranslationService,
        private i18n: I18nService
    ) {}

    /**
     * Traite une erreur API et renvoie un message traduit
     * @param error L'erreur ApiError interceptée
     * @param context Contexte optionnel pour le logging (ex: 'LoginComponent')
     * @returns Message d'erreur traduit et formaté
     */
    public handleApiError(error: ApiError, context?: string): string {
        // Log l'erreur pour debugging/monitoring
        this.logError(error, context);

        if (!error) {
            return this.i18n.translate('errors.unexpected_error');
        }

        // 1. Gestion des erreurs de validation (priorité haute)
        if (error.validationErrors && error.validationErrors.length > 0) {
            return this.handleValidationErrors(error.validationErrors);
        }

        // 2. Gestion des codes d'erreur métier (format ERR.xxx.yyy)
        if (error.message && this.errorTranslation.isKnownErrorCode(error.message)) {
            return this.errorTranslation.translateErrorCode(error.message);
        }

        // 3. Gestion des codes HTTP standards
        const httpMessage = this.handleHttpStatusCode(error.status);
        if (httpMessage) {
            return httpMessage;
        }

        // 4. Message générique de l'API si disponible
        if (error.message) {
            return error.message;
        }

        // 5. Fallback ultime
        return this.i18n.translate('errors.unexpected_error');
    }

    /**
     * Variante RxJS pour chaîner dans les pipes
     * @param context Contexte optionnel
     * @returns Fonction operator pour catchError
     */
    public handleApiErrorRx(context?: string) {
        return (error: ApiError) => {
            const message = this.handleApiError(error, context);
            return throwError(() => ({ ...error, message }));
        };
    }

    /**
     * Gère les erreurs de validation et les formate
     * @param validationErrors Liste des erreurs de validation
     * @returns Message formaté
     */
    private handleValidationErrors(validationErrors: { field: string; error: string }[]): string {
        // Traduit chaque erreur si c'est un code ERR.xxx
        const translatedErrors = validationErrors.map(ve => {
            if (this.errorTranslation.isKnownErrorCode(ve.error)) {
                return this.errorTranslation.translateErrorCode(ve.error);
            }
            return ve.error;
        });

        // Retourne la première erreur (ou toutes séparées par des sauts de ligne)
        return translatedErrors[0];
        // Alternative : return translatedErrors.join('\n');
    }

    /**
     * Gère les codes HTTP standards
     * @param status Code HTTP
     * @returns Message traduit ou null
     */
    private handleHttpStatusCode(status: number): string | null {
        switch (status) {
            case 400:
                return this.i18n.translate('errors.invalid_operation');

            case 401:
                return this.i18n.translate('errors.token_expired');

            case 403:
                return this.i18n.translate('errors.access_denied');

            case 404:
                return this.i18n.translate('errors.resource_not_found');

            case 408:
                return this.i18n.translate('errors.timeout_error');

            case 409:
                return this.i18n.translate('errors.duplicate_entry');

            case 500:
            case 502:
            case 503:
                return this.i18n.translate('errors.service_unavailable');

            case 504:
                return this.i18n.translate('errors.timeout_error');

            default:
                return null;
        }
    }

    /**
     * Log l'erreur pour debugging et monitoring futur
     * @param error L'erreur à logger
     * @param context Contexte optionnel
     */
    private logError(error: ApiError, context?: string): void {
        const logPrefix = context ? `[${context}]` : '[ErrorHandler]';

        console.error(`${logPrefix} API Error:`, {
            message: error.message,
            status: error.status,
            validationErrors: error.validationErrors,
            timestamp: new Date().toISOString()
        });

        // TODO: Intégrer avec un service de monitoring (Sentry, Azure Application Insights, etc.)
        // this.monitoringService.trackError(error, context);
    }

    /**
     * Méthode utilitaire pour vérifier si une erreur nécessite une redirection
     * @param error L'erreur à vérifier
     * @returns true si redirection nécessaire
     */
    public shouldRedirectToLogin(error: ApiError): boolean {
        return error.status === 401 || error.status === 403;
    }

    /**
     * Retourne toutes les erreurs de validation formatées
     * @param error L'erreur contenant les erreurs de validation
     * @returns Liste des messages d'erreur
     */
    public getAllValidationErrors(error: ApiError): string[] {
        if (!error.validationErrors || error.validationErrors.length === 0) {
            return [];
        }

        return error.validationErrors.map(ve => {
            if (this.errorTranslation.isKnownErrorCode(ve.error)) {
                return this.errorTranslation.translateErrorCode(ve.error);
            }
            return ve.error;
        });
    }
}
