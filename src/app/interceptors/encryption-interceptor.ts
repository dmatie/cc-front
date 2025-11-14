import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap, map } from 'rxjs';
import { EncryptionService } from '../services/encryption.service';
import { environment } from '../../environments/environment';

export const encryptionInterceptor: HttpInterceptorFn = (req, next) => {
  const encryptionService = inject(EncryptionService);

  if (!encryptionService.isEnabled()) {
    return next(req);
  }

  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const hasBody = req.body !== null && req.body !== undefined;
  const isModifyingRequest = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

  if (!isApiRequest || !hasBody || !isModifyingRequest) {
    return next(req);
  }

  return from(encryptionService.encrypt(req.body)).pipe(
    switchMap(encryptedBody => {
      const encryptedReq = req.clone({
        body: encryptedBody
      });

      return next(encryptedReq).pipe(
        switchMap(event => {
          if (event instanceof HttpResponse && event.body && typeof event.body === 'object' && 'encryptedData' in event.body) {
            return from(encryptionService.decrypt(event.body)).pipe(
              map(decryptedBody => event.clone({ body: decryptedBody }))
            );
          }
          return from(Promise.resolve(event));
        })
      );
    })
  );
};
