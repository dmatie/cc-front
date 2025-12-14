import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OtherDocumentService } from '../../services/abstract/other-document-service.abstract';
import { I18nService } from '../../services/i18n.service';
import {
  OtherDocumentDto,
  OtherDocumentStatus,
  OtherDocumentTypeDto,
  GetOtherDocumentsByUserFilteredQuery
} from '../../models/other-document.model';
import { AuthenticatedNavbarComponent } from '../layout/authenticated-navbar.component';
import { UploadDocumentModalComponent } from './upload-document-modal.component';

@Component({
  selector: 'app-external-additional-documents-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthenticatedNavbarComponent, UploadDocumentModalComponent],
  templateUrl: './external-additional-documents-list.component.html',
  styleUrls: ['./external-additional-documents-list.component.css']
})
export class ExternalAdditionalDocumentsListComponent implements OnInit {
  documents: OtherDocumentDto[] = [];
  documentTypes: OtherDocumentTypeDto[] = [];
  loading = false;
  errorMessage = '';
  showUploadModal = false;

  currentYear = new Date().getFullYear().toString();
  selectedYear = this.currentYear;
  selectedStatus: OtherDocumentStatus | undefined = undefined;
  selectedTypeId: string | undefined = undefined;
  selectedSAPCode: string | undefined = undefined;

  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;
  totalPages = 0;

  Math = Math;

  constructor(
    private otherDocumentService: OtherDocumentService,
    private router: Router,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadDocumentTypes();
    this.loadDocuments();
  }

  loadDocumentTypes(): void {
    this.otherDocumentService.getOtherDocumentTypes().subscribe({
      next: (types) => {
        this.documentTypes = types.filter(t => t.isActive);
      },
      error: (error) => {
        console.error('Error loading document types:', error);
      }
    });
  }

  loadDocuments(): void {
    this.loading = true;
    this.errorMessage = '';

    const query: GetOtherDocumentsByUserFilteredQuery = {
      year: this.selectedYear,
      status: this.selectedStatus,
      otherDocumentTypeId: this.selectedTypeId,
      sapCode: this.selectedSAPCode,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    this.otherDocumentService.getOtherDocumentsByUserFiltered(query).subscribe({
      next: (response) => {
        this.documents = response.otherDocuments;
        this.totalCount = response.totalCount;
        this.pageNumber = response.pageNumber;
        this.pageSize = response.pageSize;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Error loading documents';
      }
    });
  }

  applyFilters(): void {
    this.pageNumber = 1;
    this.loadDocuments();
  }

  clearFilters(): void {
    this.selectedYear = this.currentYear;
    this.selectedStatus = undefined;
    this.selectedTypeId = undefined;
    this.selectedSAPCode = undefined;
    this.pageNumber = 1;
    this.loadDocuments();
  }

  previousPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadDocuments();
    }
  }

  nextPage(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.loadDocuments();
    }
  }

  openUploadModal(): void {
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
  }

  onDocumentUploaded(): void {
    this.closeUploadModal();
    this.loadDocuments();
  }

  downloadDocument(documentId: string, fileName: string): void {
    this.otherDocumentService.downloadFile(documentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading file:', error);
        this.errorMessage = 'Error downloading file';
      }
    });
  }

  getStatusClass(status: OtherDocumentStatus): string {
    switch (status) {
      case OtherDocumentStatus.Draft:
        return 'badge bg-secondary';
      case OtherDocumentStatus.Submitted:
        return 'badge bg-warning';
      case OtherDocumentStatus.Consulted:
        return 'badge bg-success';
      default:
        return 'badge bg-light text-dark';
    }
  }

  getStatusLabel(status: OtherDocumentStatus): string {
    switch (status) {
      case OtherDocumentStatus.Draft:
        return this.i18n.getCurrentLocale() === 'fr' ? 'Brouillon' : 'Draft';
      case OtherDocumentStatus.Submitted:
        return this.i18n.getCurrentLocale() === 'fr' ? 'Soumis' : 'Submitted';
      case OtherDocumentStatus.Consulted:
        return this.i18n.getCurrentLocale() === 'fr' ? 'Consulté' : 'Consulted';
      default:
        return 'Unknown';
    }
  }

  getFileIcon(contentType: string): string {
    if (contentType.includes('pdf')) {
      return 'bi-file-pdf text-danger';
    } else if (contentType.includes('word') || contentType.includes('document')) {
      return 'bi-file-word text-primary';
    } else if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
      return 'bi-file-excel text-success';
    } else if (contentType.includes('image')) {
      return 'bi-file-image text-info';
    } else if (contentType.includes('zip') || contentType.includes('compressed')) {
      return 'bi-file-zip text-warning';
    } else {
      return 'bi-file-earmark text-secondary';
    }
  }

  getDocumentTypeName(doc: OtherDocumentDto): string {
    if (doc.otherDocumentType) {
      return this.i18n.getCurrentLocale() === 'fr'
        ? doc.otherDocumentType.nameFr
        : doc.otherDocumentType.name;
    }
    return '';
  }

  goBack(): void {
    this.router.navigate(['/client/home']);
  }
}
