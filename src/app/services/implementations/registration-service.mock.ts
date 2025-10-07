import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { AbstractRegistrationService } from '../abstract/registration-service.abstract';
import { RegistrationRequest, RegistrationResponse, RegistrationStatus, ValidationError, AccessRequest, RegistrationDetail, AmendRegistrationRequest, AccessRequestDetail, RegistrationResponseAll } from '../../models/registration.model';
import { ErrorTranslationService } from '../error-translation.service';
import { MapAccessRequestModelStatusToApi } from '../../core/utils/helper';

/**
 * Implémentation mock du service d'enregistrement
 */

export class MockRegistrationService extends AbstractRegistrationService {

  // Stockage en mémoire des demandes (simulation)
  private mockRegistrations: Map<string, RegistrationStatus> = new Map();
  private mockExistingEmails = ['admin@test.com', 'user@test.com', 'existing@example.com'];
  private mockRegistrationDetails: Map<string, RegistrationDetail> = new Map();
  private mockVerificationCodes: Map<string, string> = new Map();

  constructor(private errorTranslation: ErrorTranslationService) {
    super();
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Créer quelques demandes rejetées pour les tests
    const rejectedRequest: AccessRequestDetail = {
      id: 'REQ-REJECTED-001',
      email: 'rejected@test.com',
      firstName: 'Marie',
      lastName: 'Dupont',
      functionId: '11111111-2222-3333-4444-555555555555',
      countryId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      businessProfileId: 'aaaabbbb-cccc-dddd-eeee-111111111111',
      financingTypeId: 'public-001',
      selectedProjectCodes: ['P-DZ-F01-001'],
      status: MapAccessRequestModelStatusToApi('rejected'),
      rejectionReason: 'Informations insuffisantes concernant la justification métier. Veuillez fournir plus de détails sur votre rôle dans les projets demandés.',
      submissionDate: new Date('2024-01-15'),
      processedDate: new Date('2024-01-18'),
      functionName: 'Project Accountant',
      countryName: 'Algeria',
      businessProfileName: 'Government Agency',
      financingTypeName: 'Public'
    };

    const rejectedRequestDeatil: RegistrationDetail = {
      accessRequest: rejectedRequest
    };
    
    this.mockRegistrationDetails.set('rejected@test.com', rejectedRequestDeatil);
  }

  submitRegistration(request: RegistrationRequest): Observable<RegistrationResponse> {
    console.log('📤 [MOCK] Submitting registration request:', request);

    // Valider les données
    const validationErrors = this.validateRegistrationData(request);
    if (validationErrors.length > 0) {
      return throwError(() => ({ 
        message: 'Erreurs de validation', 
        errors: validationErrors 
      }));
    }

    // Simuler un délai de traitement
    return of(null).pipe(
      delay(2000),
      map(() => {
        const requestId = this.generateRequestId();
        
        // Créer l'AccessRequest simulé
        const accessRequest: AccessRequest = {
          id: requestId,
          email: request.email,
          firstName: request.firstName,
          lastName: request.lastName,
          status: 1, // Pending
          requestedDate: new Date().toISOString(),
          functionId: request.functionId,
          countryId: request.countryId,
          businessProfileId: request.businessProfileId,
          financingTypeId: request.financingTypeId,
          functionName: this.getMockFunctionName(request.functionId),
          countryName: this.getMockCountryName(request.countryId),
          businessProfileName: this.getMockBusinessProfileName(request.businessProfileId),
          financingTypeName: this.getMockFinancingTypeName(request.financingTypeId),
          approversEmail: ['admin@afdb.org', 'supervisor@afdb.org'],
          fullName: `${request.firstName} ${request.lastName}`,
          canBeProcessed: true,
          isProcessed: false,
          hasEntraIdAccount: false,
        };
        
        // Stocker la demande pour le suivi
        const registrationStatus: RegistrationStatus = {
          requestId: requestId,
          status: 'pending',
          submissionDate: new Date(),
          lastUpdated: new Date(),
          reviewNotes: 'Demande en cours d\'examen par l\'équipe de sécurité'
        };
        
        this.mockRegistrations.set(requestId, registrationStatus);

        const response: RegistrationResponse = {
          accessRequest: accessRequest,
          message: 'Votre demande d\'accès a été soumise avec succès'
        };

        console.log('✅ [MOCK] Registration submitted successfully:', response);
        return response;
      })
    );
  }

  getRegistrationStatus(requestId: string): Observable<RegistrationStatus> {
    console.log('🔍 [MOCK] Checking registration status for:', requestId);
    
    return of(null).pipe(
      delay(500),
      map(() => {
        const status = this.mockRegistrations.get(requestId);
        if (!status) {
          throw new Error('Demande non trouvée');
        }
        return status;
      })
    );
  }

  validateRegistrationData(request: RegistrationRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!request.email || !emailRegex.test(request.email)) {
      errors.push({
        field: 'email',
        error: 'ERR.General.InvalidEmailFormat',
        message: 'Format d\'email invalide'
          }
      )
    }

    // Validation du prénom
    if (!request.firstName || request.firstName.trim().length < 2) {
      errors.push({
        field: 'firstName',
        error: 'ERR.General.FirstNameTooShort',
        message: 'Le prénom doit contenir au moins 2 caractères'
          }
      )
    }

    // Validation du nom
    if (!request.lastName || request.lastName.trim().length < 2) {
      errors.push({
        field: 'lastName',
        error: 'ERR.General.LastNameTooShort',
        message: 'Le nom doit contenir au moins 2 caractères'
          }
      )
    }

    // Validation de la fonction
    if (!request.functionId) {
      errors.push({
        field: 'functionId',
        error: 'ERR.General.ReferenceDataNotExist',
        message: 'La fonction est requise'
          }
      )
    }

    // Validation du pays
    if (!request.countryId) {
      errors.push({
        field: 'countryId',
        error: 'ERR.General.ReferenceDataNotExist',
        message: 'Le pays est requis'
          }
      )
    }

    // Validation du profil d'entreprise
    if (!request.businessProfileId) {
      errors.push({
        field: 'businessProfileId',
        error: 'ERR.General.ReferenceDataNotExist',
        message: 'Le profil d\'entreprise est requis'
          }
      )
    }

    // Validation du type de financement
    if (!request.financingTypeId) {
      errors.push({
        field: 'financingTypeId',
        error: 'ERR.General.ReferenceDataNotExist'
      });
    }

    // Validation des projets sélectionnés
    if (!request.Projects || request.Projects.length === 0) {
      errors.push({
        field: 'Projects',
        error: 'ERR.General.ProjectsRequired',
        message: 'Au moins un projet doit être sélectionné'
      });
    }

    return errors;
  }

  checkEmailExists(email: string): Observable<boolean> {
    return of(null).pipe(
      delay(300),
      map(() => this.mockExistingEmails.includes(email.toLowerCase()))
    );
  }

getAllRegistrations(filter?: { status?: string; dateFrom?: Date; dateTo?: Date; search?: string; }): Observable<RegistrationResponseAll> {
  console.log('📋 [MOCK] Getting all registrations with filter:', filter);

  return of(null).pipe(
    delay(500),
    map(() => {
      let registrations = Array.from(this.mockRegistrationDetails.values());

      if (filter) {
        if (filter.status) {
          const statusNumber = MapAccessRequestModelStatusToApi(filter.status as any);
          registrations = registrations.filter(r => r.accessRequest.status === statusNumber);
        }
        if (filter.dateFrom) {
          registrations = registrations.filter(r => r.accessRequest.submissionDate >= filter.dateFrom!);
        }
        if (filter.dateTo) {
          registrations = registrations.filter(r => r.accessRequest.submissionDate <= filter.dateTo!);
        }
        if (filter.search) {
          const searchTerm = filter.search.toLowerCase();
          registrations = registrations.filter(r =>
            r.accessRequest.email.toLowerCase().includes(searchTerm) ||
            r.accessRequest.firstName.toLowerCase().includes(searchTerm) ||
            r.accessRequest.lastName.toLowerCase().includes(searchTerm)
          );
        }
      }

      // Tri par date de soumission décroissante
      registrations = registrations.sort((a, b) => b.accessRequest.submissionDate.getTime() - a.accessRequest.submissionDate.getTime());

      // Adaptation pour retourner RegistrationResponseAll
      const response: RegistrationResponseAll = {
        accessRequests : registrations.map(r => r.accessRequest),
        pageNumber: 1,
        pageSize: registrations.length,
        totalPages: 1,
        totalCount: registrations.length,
      };

      return response;
    })
  );
}
  approveRegistration(requestId: string, approverNotes?: string): Observable<{ success: boolean; message: string; }> {
    console.log('✅ [MOCK] Approving registration:', requestId, approverNotes);
    
    return of(null).pipe(
      delay(1000),
      map(() => {
        const registration = this.mockRegistrations.get(requestId);
        if (!registration) {
          throw new Error('Demande non trouvée');
        }
        
        registration.status = 'approved';
        registration.lastUpdated = new Date();
        registration.approvedBy = 'admin@system.com';
        registration.reviewNotes = approverNotes || 'Demande approuvée';
        
        this.mockRegistrations.set(requestId, registration);
        
        return {
          success: true,
          message: 'Demande approuvée avec succès'
        };
      })
    );
  }

  rejectRegistration(requestId: string, rejectionReason: string): Observable<{ success: boolean; message: string; }> {
    console.log('❌ [MOCK] Rejecting registration:', requestId, rejectionReason);
    
    return of(null).pipe(
      delay(1000),
      map(() => {
        const registration = this.mockRegistrations.get(requestId);
        if (!registration) {
          throw new Error('Demande non trouvée');
        }
        
        registration.status = 'rejected';
        registration.lastUpdated = new Date();
        registration.rejectedReason = rejectionReason;
        registration.reviewNotes = `Demande rejetée: ${rejectionReason}`;
        
        this.mockRegistrations.set(requestId, registration);
        
        return {
          success: true,
          message: 'Demande rejetée avec succès'
        };
      })
    );
  }

  getRegistrationByEmail(email: string): Observable<RegistrationDetail | null> {
    console.log('🔍 [MOCK] Getting registration by email:', email);
    
    return of(null).pipe(
      delay(800),
      map(() => {
        const registration = this.mockRegistrationDetails.get(email.toLowerCase());
        console.log('📋 [MOCK] Registration found:', registration ? 'Yes' : 'No');
        return registration || null;
      })
    );
  }

    getRegistrationById(id: string): Observable<RegistrationDetail | null> {
    console.log('🔍 [MOCK] Getting registration by ID:', id);
    
    return of(null).pipe(
      delay(800),
      map(() => {

        const registration = Array.from(this.mockRegistrationDetails.values())
          .find(detail => detail.accessRequest.id === id);
          
        console.log('📋 [MOCK] Registration found:', registration ? 'Yes' : 'No');
        return registration || null;
      })
    );
  }

  sendVerificationCode(email: string, isEmailExist: boolean): Observable<{ success: boolean; message: string; }> {
    console.log('📧 [MOCK] Sending verification code to:', email);
    
    return of(null).pipe(
      delay(1000),
      map(() => {
        // Générer un code de 6 chiffres
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        this.mockVerificationCodes.set(email.toLowerCase(), code);
        
        console.log('🔑 [MOCK] Verification code generated:', code, 'for', email);
        
        return {
          success: true,
          message: 'Code de vérification envoyé par email'
        };
      })
    );
  }

  verifyCode(email: string, code: string): Observable<boolean> {
    console.log('🔐 [MOCK] Verifying code:', code, 'for email:', email);
    
    return of(null).pipe(
      delay(500),
      map(() => {
        const storedCode = this.mockVerificationCodes.get(email.toLowerCase());
        const isValid = storedCode === code;
        
        console.log('✅ [MOCK] Code verification:', isValid ? 'Valid' : 'Invalid');
        
        if (isValid) {
          // Supprimer le code après utilisation
          this.mockVerificationCodes.delete(email.toLowerCase());
        }
        
        return isValid;
      })
    );
  }

  abandonRegistration(id: string): Observable<{ success: boolean; message: string; }> {
    console.log('🗑️ [MOCK] Abandoning registration:', id);
    
    return of(null).pipe(
      delay(1000),
      map(() => {
        // Marquer la demande comme abandonnée
        for (const [email, detail] of this.mockRegistrationDetails.entries()) {
          if (detail.accessRequest.id === id) {
            detail.accessRequest .status = MapAccessRequestModelStatusToApi('abandoned');
            this.mockRegistrationDetails.set(email, detail);
            break;
          }
        }
        
        return {
          success: true,
          message: 'Demande abandonnée avec succès'
        };
      })
    );
  }

  updateRegistration(request: AmendRegistrationRequest): Observable<RegistrationResponse> {
    console.log('📝 [MOCK] Updating registration:', request);
    
    return of(null).pipe(
      delay(2000),
      map(() => {
        // Mettre à jour la demande existante
        const existingDetail = this.mockRegistrationDetails.get(request.email.toLowerCase());
        if (existingDetail) {
          // Convertir Projects en selectedProjectCodes pour le stockage
          const selectedProjectCodes = request.Projects.map(p => p.sapCode);

          const updatedDetail: AccessRequestDetail = {
            ...existingDetail.accessRequest,
            firstName: request.firstName,
            lastName: request.lastName,
            functionId: request.functionId,
            countryId: request.countryId,
            businessProfileId: request.businessProfileId,
            financingTypeId: request.financingTypeId,
            selectedProjectCodes: selectedProjectCodes,
            status: MapAccessRequestModelStatusToApi('pending'),
            rejectionReason: undefined,
            submissionDate: new Date()
          };
          
          const registrationDetail: RegistrationDetail = {
            accessRequest: updatedDetail
          };
          this.mockRegistrationDetails.set(request.email.toLowerCase(), registrationDetail);
        }
        
        const accessRequest: AccessRequest = {
          id: request.id,
          email: request.email,
          firstName: request.firstName,
          lastName: request.lastName,
          status: 1,
          requestedDate: new Date().toISOString(),
          functionId: request.functionId,
          countryId: request.countryId,
          businessProfileId: request.businessProfileId,
          financingTypeId: request.financingTypeId,
          functionName: this.getMockFunctionName(request.functionId),
          countryName: this.getMockCountryName(request.countryId),
          businessProfileName: this.getMockBusinessProfileName(request.businessProfileId),
          financingTypeName: this.getMockFinancingTypeName(request.financingTypeId),
          approversEmail: ['admin@afdb.org'],
          fullName: `${request.firstName} ${request.lastName}`,
          canBeProcessed: true,
          isProcessed: false,
          hasEntraIdAccount: false
        };
        
        return {
          accessRequest,
          message: 'Demande mise à jour avec succès'
        };
      })
    );
  }

  // MÉTHODES PRIVÉES

  private generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `REQ-${timestamp}-${random}`.toUpperCase();
  }

  private getMockFunctionName(functionId: string): string {
    const mockFunctions: { [key: string]: string } = {
      '11111111-2222-3333-4444-555555555555': 'Project Accountant',
      '22222222-3333-4444-5555-666666666666': 'Project Manager / Project Coordinator',
      '33333333-4444-5555-6666-777777777777': 'AfDB Focal Point',
      '44444444-5555-6666-7777-888888888888': 'Administrative and Financial Manager / Director'
    };
    return mockFunctions[functionId] || 'Unknown Function';
  }

  private getMockCountryName(countryId: string): string {
    const mockCountries: { [key: string]: string } = {
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890': 'Algeria',
      'b2c3d4e5-f6g7-8901-bcde-f23456789012': 'Angola',
      'c3d4e5f6-g7h8-9012-cdef-345678901234': 'Benin',
      'd4e5f6g7-h8i9-0123-defg-456789012345': 'Botswana'
    };
    return mockCountries[countryId] || 'Unknown Country';
  }

  private getMockBusinessProfileName(businessProfileId: string): string {
    const mockProfiles: { [key: string]: string } = {
      'aaaabbbb-cccc-dddd-eeee-111111111111': 'Government Agency',
      'bbbbcccc-dddd-eeee-ffff-222222222222': 'Public Institution',
      'ccccdddd-eeee-ffff-0000-333333333333': 'Ministry',
      'ddddeeee-ffff-0000-1111-444444444444': 'Municipality / Local Government'
    };
    return mockProfiles[businessProfileId] || 'Unknown Business Profile';
  }

  private getMockFinancingTypeName(financingTypeId: string): string {
    const mockTypes: { [key: string]: string } = {
      'public-001': 'Public',
      'private-001': 'Private',
      'others-001': 'Others'
    };
    return mockTypes[financingTypeId] || 'Unknown Financing Type';
  }
}