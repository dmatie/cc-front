// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // On passe tout en async → on encapsule dans un Observable
    return from(this.addTokenAndHandle(req, next));
  }

private async addTokenAndHandle(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
  try {
    let token = this.authService.getToken();
        console.error('token form interceptor:', token);


    if (!token || this.isTokenExpired(token)) {
      console.log('🔄 Token expiré ou manquant → renouvellement silencieux...');
      token = await this.authService.getAccessToken();
      if (token) {
        localStorage.setItem('token', token);
      }
    }

    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    const result = await next.handle(authReq).toPromise();
    if (!result) {
      throw new Error('No HttpEvent returned from next.handle');
    }
    return result;
  } catch (error) {
    console.error('❌ Erreur dans l’intercepteur d’auth:', error);
    throw error;
  }
}
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();
      // expiration dans moins de 2 minutes = considéré expiré
      return now > exp - 120000;
    } catch {
      return true;
    }
  }
}
