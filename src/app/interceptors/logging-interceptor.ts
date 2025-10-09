import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.features.enableDebugLogs) {
    return next(req);
  }

  const authHeader = req.headers.get('Authorization');

  console.log('🌐 [HTTP Request]', {
    method: req.method,
    url: req.url,
    hasAuthHeader: !!authHeader,
    authHeader: authHeader ? `${authHeader.substring(0, 50)}...` : '❌ None',
    allHeaders: req.headers.keys().map(key => `${key}: ${req.headers.get(key)}`)
  });

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === 4) {
          console.log('✅ [HTTP Response]', {
            url: req.url,
            status: (event as any).status
          });
        }
      },
      error: (error) => {
        console.error('❌ [HTTP Error]', {
          url: req.url,
          status: error.status,
          message: error.message
        });
      }
    })
  );
};
