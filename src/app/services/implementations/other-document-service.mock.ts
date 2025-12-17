import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { OtherDocumentService } from '../abstract/other-document-service.abstract';
import {
  OtherDocumentsResponse,
  GetOtherDocumentsByUserFilteredQuery,
  GetOtherDocumentsWithFiltersQuery,
  CreateOtherDocumentCommand,
  CreateOtherDocumentResponse,
  OtherDocumentTypeDto,
  OtherDocumentDto,
  OtherDocumentStatus,
} from '../../models/other-document.model';

@Injectable()
export class OtherDocumentMockService extends OtherDocumentService {
  private mockOtherDocumentTypes: OtherDocumentTypeDto[] = [
    {
      id: '1',
      name: 'Technical Report',
      nameFr: 'Rapport Technique',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'system'
    },
    {
      id: '2',
      name: 'Financial Statement',
      nameFr: 'État Financier',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'system'
    },
    {
      id: '3',
      name: 'Progress Report',
      nameFr: 'Rapport d\'Avancement',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'system'
    }
  ];

  private mockOtherDocuments: OtherDocumentDto[] = [
    {
      id: '1',
      otherDocumentTypeId: '1',
      name: 'Q4 Technical Report 2024',
      year: '2024',
      userId: '1',
      status: OtherDocumentStatus.Submitted,
      sapCode: 'P-MA-AAA-001',
      loanNumber: 'LG-2024-001',
      otherDocumentType: this.mockOtherDocumentTypes[0],
      user: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      },
      files: [
        {
          id: '1',
          otherDocumentId: '1',
          fileName: 'technical-report-q4.pdf',
          fileSize: 2048000,
          contentType: 'application/pdf',
          uploadedAt: '2024-12-01T10:00:00Z',
          uploadedBy: 'john.doe@example.com',
          createdAt: '2024-12-01T10:00:00Z',
          createdBy: 'john.doe@example.com'
        }
      ],
      createdAt: '2024-12-01T10:00:00Z',
      createdBy: 'john.doe@example.com'
    },
    {
      id: '2',
      otherDocumentTypeId: '2',
      name: 'Financial Statement November 2024',
      year: '2024',
      userId: '1',
      status: OtherDocumentStatus.Consulted,
      sapCode: 'P-MA-AAA-001',
      loanNumber: 'LG-2024-001',
      otherDocumentType: this.mockOtherDocumentTypes[1],
      user: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      },
      files: [
        {
          id: '2',
          otherDocumentId: '2',
          fileName: 'financial-statement-nov.xlsx',
          fileSize: 512000,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          uploadedAt: '2024-11-15T14:30:00Z',
          uploadedBy: 'john.doe@example.com',
          createdAt: '2024-11-15T14:30:00Z',
          createdBy: 'john.doe@example.com'
        }
      ],
      createdAt: '2024-11-15T14:30:00Z',
      createdBy: 'john.doe@example.com'
    }
  ];


  override getOtherDocumentsByUserFiltered(
    query: GetOtherDocumentsByUserFilteredQuery
  ): Observable<OtherDocumentsResponse> {
    let filteredDocuments = [...this.mockOtherDocuments];

    if (query.status !== undefined) {
      filteredDocuments = filteredDocuments.filter(doc => doc.status === query.status);
    }
    if (query.otherDocumentTypeId) {
      filteredDocuments = filteredDocuments.filter(
        doc => doc.otherDocumentTypeId === query.otherDocumentTypeId
      );
    }
    if (query.sapCode) {
      filteredDocuments = filteredDocuments.filter(doc => doc.sapCode === query.sapCode);
    }
    if (query.year) {
      filteredDocuments = filteredDocuments.filter(doc => doc.year === query.year);
    }

    const pageNumber = query.pageNumber || 1;
    const pageSize = query.pageSize || 10;
    const totalCount = filteredDocuments.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

    const response: OtherDocumentsResponse = {
      otherDocuments: paginatedDocuments,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber < totalPages
    };

    return of(response).pipe(delay(500));
  }

  override getOtherDocumentsWithFilters(
    query: GetOtherDocumentsWithFiltersQuery
  ): Observable<OtherDocumentsResponse> {
    return this.getOtherDocumentsByUserFiltered(query);
  }

  override createOtherDocument(
    command: CreateOtherDocumentCommand
  ): Observable<CreateOtherDocumentResponse> {
    const newDocument: OtherDocumentDto = {
      id: (this.mockOtherDocuments.length + 1).toString(),
      otherDocumentTypeId: command.otherDocumentTypeId,
      name: command.name,
      year: new Date().getFullYear().toString(),
      userId: '1',
      status: OtherDocumentStatus.Submitted,
      sapCode: command.sapCode,
      loanNumber: command.loanNumber,
      otherDocumentType: this.mockOtherDocumentTypes.find(
        t => t.id === command.otherDocumentTypeId
      ),
      user: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      },
      files: command.files.map((file, index) => ({
        id: `${this.mockOtherDocuments.length + 1}-${index}`,
        otherDocumentId: (this.mockOtherDocuments.length + 1).toString(),
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'john.doe@example.com',
        createdAt: new Date().toISOString(),
        createdBy: 'john.doe@example.com'
      })),
      createdAt: new Date().toISOString(),
      createdBy: 'john.doe@example.com'
    };

    this.mockOtherDocuments.push(newDocument);

    const response: CreateOtherDocumentResponse = {
      otherDocument: newDocument,
      message: 'Document uploaded successfully'
    };

    return of(response).pipe(delay(1000));
  }

  override getOtherDocumentTypes(): Observable<OtherDocumentTypeDto[]> {
    return of(this.mockOtherDocumentTypes).pipe(delay(300));
  }

  override downloadFile(otherDocumentId: string): Observable<Blob> {
    const mockBlob = new Blob(['Mock file content'], { type: 'application/pdf' });
    return of(mockBlob).pipe(delay(500));
  }

}
