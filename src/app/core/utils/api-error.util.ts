import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from '../../services/error-handler.service';

export function handleApiError(errorHandler: ErrorHandlerService) {
  return catchError(errorHandler.handleApiErrorRx());
}
