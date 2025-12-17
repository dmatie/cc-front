import { Observable } from 'rxjs';
import {
  OtherDocumentsResponse,
  GetOtherDocumentsByUserFilteredQuery,
  GetOtherDocumentsWithFiltersQuery,
  CreateOtherDocumentCommand,
  CreateOtherDocumentResponse,
  OtherDocumentTypeDto,
} from '../../models/other-document.model';

export abstract class OtherDocumentService {
  abstract getOtherDocumentsByUserFiltered(
    query: GetOtherDocumentsByUserFilteredQuery
  ): Observable<OtherDocumentsResponse>;

  abstract getOtherDocumentsWithFilters(
    query: GetOtherDocumentsWithFiltersQuery
  ): Observable<OtherDocumentsResponse>;

  abstract createOtherDocument(
    command: CreateOtherDocumentCommand
  ): Observable<CreateOtherDocumentResponse>;

  abstract getOtherDocumentTypes(): Observable<OtherDocumentTypeDto[]>;

  abstract downloadFile(otherDocumentId: string): Observable<Blob>;
}
