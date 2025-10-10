import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ✅ Filtre : N'ajouter le token QUE pour les requêtes vers votre API
    if (!req.url.startsWith(environment.apiUrl)) {
      return next.handle(req);
    }

    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let authReq = req;
        if (token) {
          authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          console.log('🔑 Token added to request:', req.url);
        } else {
          console.warn('⚠️ No token available for request:', req.url);
        }
        return next.handle(authReq);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('❌ 401 Unauthorized - Attempting token refresh...');
          
          // ✅ Tenter de renouveler le token avant de déconnecter
          return from(this.authService.getAccessToken()).pipe(
            switchMap(newToken => {
              if (newToken) {
                // Retry avec le nouveau token
                const retryReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` }
                });
                console.log('🔄 Retrying with refreshed token');
                return next.handle(retryReq);
              } else {
                // Pas de token disponible, déconnexion
                console.error('❌ Token refresh failed, logging out');
                this.authService.logout();
                return throwError(() => error);
              }
            }),
            catchError(refreshError => {
              console.error('❌ Token refresh error:', refreshError);
              this.authService.logout();
              return throwError(() => error);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
}
