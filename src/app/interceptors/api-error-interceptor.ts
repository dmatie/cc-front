import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ApiError {
  message: string;
  status: number;
  validationErrors?: { field: string; error: string }[];
}

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let apiError: ApiError = {
          message: 'Une erreur inconnue est survenue.',
          status: error.status,
          validationErrors: []
        };

        if (error.error) {
          const err = error.error;

          // Cas d'erreurs de validation (ton middleware)
          if (err.message === 'Erreurs de validation' && Array.isArray(err.errors)) {
            apiError.message = 'Erreurs de validation';
            apiError.validationErrors = err.errors;
          } 
          // Cas général
          else if (typeof err.message === 'string') {
            apiError.message = err.message;
          }
        }

        // On renvoie un objet bien typé à ton composant
        return throwError(() => apiError);
      })
    );
  }
}
