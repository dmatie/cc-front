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

  if (!isApiRequest) {
    return next(req);
  }

  const neverEncryptPaths = environment.encryption.neverEncryptPaths || [];
  const shouldSkipEncryption = neverEncryptPaths.some(pattern => {
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '[^/]+');
    const regex = new RegExp(regexPattern, 'i');
    return regex.test(req.url);
  });


  if (shouldSkipEncryption) {
    return next(req).pipe(
      switchMap(event => {
        if (event instanceof HttpResponse && event.body && typeof event.body === 'object' && ('EncryptedData' in event.body || 'encryptedData' in event.body)) {
          return from(encryptionService.decrypt(event.body)).pipe(
            map(decryptedBody => event.clone({ body: decryptedBody }))
          );
        }
        return from(Promise.resolve(event));
      })
    );
  }

  const hasBody = req.body !== null && req.body !== undefined;
  const isModifyingRequest = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const shouldEncryptRequest = hasBody && isModifyingRequest;

  if (shouldEncryptRequest) {
    return from(encryptionService.encrypt(req.body)).pipe(
      switchMap(encryptedBody => {
        const encryptedReq = req.clone({
          body: encryptedBody
        });

        return next(encryptedReq).pipe(
          switchMap(event => {
            if (event instanceof HttpResponse && event.body && typeof event.body === 'object' && ('EncryptedData' in event.body || 'encryptedData' in event.body)) {
              return from(encryptionService.decrypt(event.body)).pipe(
                map(decryptedBody => event.clone({ body: decryptedBody }))
              );
            }
            return from(Promise.resolve(event));
          })
        );
      })
    );
  }

  return next(req).pipe(
    switchMap(event => {
      if (event instanceof HttpResponse && event.body && typeof event.body === 'object' && ('EncryptedData' in event.body || 'encryptedData' in event.body)) {
        return from(encryptionService.decrypt(event.body)).pipe(
          map(decryptedBody => event.clone({ body: decryptedBody }))
        );
      }
      return from(Promise.resolve(event));
    })
  );
};
