import { Injectable } from '@angular/core';
import { ApiError } from '../interceptors/api-error-interceptor';
import { throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService {

    /**
     * Traite une erreur API et renvoie un message clair
     */
    public handleApiError(error: ApiError): string {
        if (!error) {
            return 'Une erreur inconnue est survenue.';
        }

        // Erreurs de validation
        if (error.validationErrors && error.validationErrors.length > 0) {
            return error.validationErrors[0].error; // ou concaténer plusieurs erreurs
        }

        // Erreurs spécifiques selon le message
        if (error.message?.startsWith('ERR.General.NotAuthorize')) {
            return 'Vous n’êtes pas autorisé à effectuer cette action.';
        }

        if (error.message?.includes('InternalServerError')) {
            return 'Une erreur interne est survenue. Veuillez réessayer plus tard.';
        }

        // Cas par défaut
        return error.message || 'Une erreur inattendue est survenue.';
    }

    handleApiErrorRx() {
        return (error: ApiError) => {
            const message = this.handleApiError(error);
            // on renvoie un flux d’erreur avec un message clair
            return throwError(() => ({ ...error, message }));
        };
    }
}
