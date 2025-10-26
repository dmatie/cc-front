import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { AbstractDropdownService } from '../abstract/dropdown-service.abstract';
import { Country, UserFunction, BusinessProfile, DropdownResponse, DropdownFilter, FinancingType } from '../../models/dropdown.model';
import { ClaimTypesResponse, ClaimType } from '../../models/claim.model';
import { CurrenciesResponse, CurrencyDto, DisbursementTypeDto, DisbursementTypesResponse } from '../../models/disbursement.model';

/**
 * Implémentation mock du service dropdown
 */

export class MockDropdownService extends AbstractDropdownService {

  // MOCK COUNTRIES
  private mockCountries: Country[] = [
    { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', code: 'DZ', name: 'Algeria', isActive: true },
    { id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', code: 'AO', name: 'Angola',  isActive: true },
    { id: 'c3d4e5f6-g7h8-9012-cdef-345678901234', code: 'BJ', name: 'Benin',  isActive: true },
    { id: 'd4e5f6g7-h8i9-0123-defg-456789012345', code: 'BW', name: 'Botswana', isActive: true },
    { id: 'e5f6g7h8-i9j0-1234-efgh-567890123456', code: 'BF', name: 'Burkina Faso', isActive: true },
    { id: 'f6g7h8i9-j0k1-2345-fghi-678901234567', code: 'BI', name: 'Burundi',  isActive: true },
    { id: 'g7h8i9j0-k1l2-3456-ghij-789012345678', code: 'CM', name: 'Cameroon',  isActive: true },
    { id: 'h8i9j0k1-l2m3-4567-hijk-890123456789', code: 'CV', name: 'Cape Verde', isActive: true },
    { id: 'i9j0k1l2-m3n4-5678-ijkl-901234567890', code: 'CF', name: 'Central African Republic', isActive: true },
    { id: 'j0k1l2m3-n4o5-6789-jklm-012345678901', code: 'TD', name: 'Chad', isActive: true },
    { id: 'k1l2m3n4-o5p6-7890-klmn-123456789012', code: 'KM', name: 'Comoros', isActive: true },
    { id: 'l2m3n4o5-p6q7-8901-lmno-234567890123', code: 'CG', name: 'Congo',  isActive: true },
    { id: 'm3n4o5p6-q7r8-9012-mnop-345678901234', code: 'CD', name: 'Democratic Republic of Congo',  isActive: true },
    { id: 'n4o5p6q7-r8s9-0123-nopq-456789012345', code: 'DJ', name: 'Djibouti',  isActive: true },
    { id: 'o5p6q7r8-s9t0-1234-opqr-567890123456', code: 'EG', name: 'Egypt', isActive: true },
    { id: 'p6q7r8s9-t0u1-2345-pqrs-678901234567', code: 'GQ', name: 'Equatorial Guinea',  isActive: true },
    { id: 'q7r8s9t0-u1v2-3456-qrst-789012345678', code: 'ER', name: 'Eritrea', isActive: true },
    { id: 'r8s9t0u1-v2w3-4567-rstu-890123456789', code: 'SZ', name: 'Eswatini', isActive: true },
    { id: 's9t0u1v2-w3x4-5678-stuv-901234567890', code: 'ET', name: 'Ethiopia', isActive: true },
    { id: 't0u1v2w3-x4y5-6789-tuvw-012345678901', code: 'GA', name: 'Gabon',  isActive: true },
    { id: 'u1v2w3x4-y5z6-7890-uvwx-123456789012', code: 'GM', name: 'Gambia', isActive: true },
    { id: 'v2w3x4y5-z6a7-8901-vwxy-234567890123', code: 'GH', name: 'Ghana', isActive: true },
    { id: 'w3x4y5z6-a7b8-9012-wxyz-345678901234', code: 'GN', name: 'Guinea', isActive: true },
    { id: 'x4y5z6a7-b8c9-0123-xyza-456789012345', code: 'GW', name: 'Guinea-Bissau', isActive: true },
    { id: 'y5z6a7b8-c9d0-1234-yzab-567890123456', code: 'CI', name: 'Ivory Coast', isActive: true },
    { id: 'z6a7b8c9-d0e1-2345-zabc-678901234567', code: 'KE', name: 'Kenya', isActive: true },
    { id: 'a7b8c9d0-e1f2-3456-abcd-789012345678', code: 'LS', name: 'Lesotho', isActive: true },
    { id: 'b8c9d0e1-f2g3-4567-bcde-890123456789', code: 'LR', name: 'Liberia', isActive: true },
    { id: 'c9d0e1f2-g3h4-5678-cdef-901234567890', code: 'LY', name: 'Libya', isActive: true },
    { id: 'd0e1f2g3-h4i5-6789-defg-012345678901', code: 'MG', name: 'Madagascar', isActive: true },
    { id: 'e1f2g3h4-i5j6-7890-efgh-123456789012', code: 'MW', name: 'Malawi', isActive: true },
    { id: 'f2g3h4i5-j6k7-8901-fghi-234567890123', code: 'ML', name: 'Mali', isActive: true },
    { id: 'g3h4i5j6-k7l8-9012-ghij-345678901234', code: 'MR', name: 'Mauritania', isActive: true },
    { id: 'h4i5j6k7-l8m9-0123-hijk-456789012345', code: 'MU', name: 'Mauritius', isActive: true },
    { id: 'i5j6k7l8-m9n0-1234-ijkl-567890123456', code: 'MA', name: 'Morocco', isActive: true },
    { id: 'j6k7l8m9-n0o1-2345-jklm-678901234567', code: 'MZ', name: 'Mozambique', isActive: true },
    { id: 'k7l8m9n0-o1p2-3456-klmn-789012345678', code: 'NA', name: 'Namibia', isActive: true },
    { id: 'l8m9n0o1-p2q3-4567-lmno-890123456789', code: 'NE', name: 'Niger', isActive: true },
    { id: 'm9n0o1p2-q3r4-5678-mnop-901234567890', code: 'NG', name: 'Nigeria', isActive: true },
    { id: 'n0o1p2q3-r4s5-6789-nopq-012345678901', code: 'RW', name: 'Rwanda', isActive: true },
    { id: 'o1p2q3r4-s5t6-7890-opqr-123456789012', code: 'ST', name: 'Sao Tome and Principe', isActive: true },
    { id: 'p2q3r4s5-t6u7-8901-pqrs-234567890123', code: 'SN', name: 'Senegal', isActive: true },
    { id: 'q3r4s5t6-u7v8-9012-qrst-345678901234', code: 'SC', name: 'Seychelles', isActive: true },
    { id: 'r4s5t6u7-v8w9-0123-rstu-456789012345', code: 'SL', name: 'Sierra Leone', isActive: true },
    { id: 's5t6u7v8-w9x0-1234-stuv-567890123456', code: 'SO', name: 'Somalia', isActive: true },
    { id: 't6u7v8w9-x0y1-2345-tuvw-678901234567', code: 'ZA', name: 'South Africa', isActive: true },
    { id: 'u7v8w9x0-y1z2-3456-uvwx-789012345678', code: 'SS', name: 'South Sudan', isActive: true },
    { id: 'v8w9x0y1-z2a3-4567-vwxy-890123456789', code: 'SD', name: 'Sudan', isActive: true },
    { id: 'w9x0y1z2-a3b4-5678-wxyz-901234567890', code: 'TZ', name: 'Tanzania', isActive: true },
    { id: 'x0y1z2a3-b4c5-6789-xyza-012345678901', code: 'TG', name: 'Togo', isActive: true },
    { id: 'y1z2a3b4-c5d6-7890-yzab-123456789012', code: 'TN', name: 'Tunisia', isActive: true },
    { id: 'z2a3b4c5-d6e7-8901-zabc-234567890123', code: 'UG', name: 'Uganda', isActive: true },
    { id: 'a3b4c5d6-e7f8-9012-abcd-345678901234', code: 'ZM', name: 'Zambia', isActive: true },
    { id: 'b4c5d6e7-f8g9-0123-bcde-456789012345', code: 'ZW', name: 'Zimbabwe', isActive: true }
  ];

  // MOCK USER FUNCTIONS
  private mockFunctions: UserFunction[] = [
    {
      id: '11111111-2222-3333-4444-555555555555',
      name: 'Project Accountant',
      description: 'Responsible for project financial management and accounting',
      isActive: true
    },
    {
      id: '22222222-3333-4444-5555-666666666666',
      name: 'Project Manager / Project Coordinator',
      description: 'Oversees project implementation and coordination',
      isActive: true
    },
    {
      id: '33333333-4444-5555-6666-777777777777',
      name: 'AfDB Focal Point',
      description: 'Main contact point for AfDB communications',
      isActive: true
    },
    {
      id: '44444444-5555-6666-7777-888888888888',
      name: 'Administrative and Financial Manager / Director',
      description: 'Senior management role for administrative and financial oversight',
      isActive: true
    },
    {
      id: '55555555-6666-7777-8888-999999999999',
      name: 'Procurement Officer',
      description: 'Manages procurement processes and vendor relations',
      isActive: true
    },
    {
      id: '66666666-7777-8888-9999-aaaaaaaaaaaa',
      name: 'Monitoring & Evaluation Specialist',
      description: 'Responsible for project monitoring and evaluation activities',
      isActive: true
    },
    {
      id: '77777777-8888-9999-aaaa-bbbbbbbbbbbb',
      name: 'Financial Analyst',
      description: 'Analyzes financial data and prepares financial reports',
      isActive: true
    },
    {
      id: '88888888-9999-aaaa-bbbb-cccccccccccc',
      name: 'Compliance Officer',
      description: 'Ensures adherence to regulatory requirements and policies',
      isActive: true
    },
    {
      id: '99999999-aaaa-bbbb-cccc-dddddddddddd',
      name: 'Internal Auditor',
      description: 'Conducts internal audits and risk assessments',
      isActive: true
    },
    {
      id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      name: 'Treasury Officer',
      description: 'Manages cash flow and treasury operations',
      isActive: true
    },
    {
      id: 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
      name: 'Legal Advisor',
      description: 'Provides legal counsel and contract review',
      isActive: true
    },
    {
      id: 'cccccccc-dddd-eeee-ffff-000000000000',
      name: 'Human Resources Manager',
      description: 'Manages human resources and staff development',
      isActive: true
    },
    {
      id: 'dddddddd-eeee-ffff-0000-111111111111',
      name: 'IT Specialist',
      description: 'Manages information technology systems and support',
      isActive: true
    },
    {
      id: 'eeeeeeee-ffff-0000-1111-222222222222',
      name: 'Communications Officer',
      description: 'Handles communications and public relations',
      isActive: true
    },
    {
      id: 'ffffffff-0000-1111-2222-333333333333',
      name: 'Other',
      description: 'Other function not listed above',
      isActive: true
    }
  ];

  // MOCK BUSINESS PROFILES
  private mockBusinessProfiles: BusinessProfile[] = [
    {
      id: 'aaaabbbb-cccc-dddd-eeee-111111111111',
      name: 'Government Agency',
      description: 'National or regional government department or agency',
      isActive: true
    },
    {
      id: 'bbbbcccc-dddd-eeee-ffff-222222222222',
      name: 'Public Institution',
      description: 'State-owned enterprise or public institution',
      isActive: true
    },
    {
      id: 'ccccdddd-eeee-ffff-0000-333333333333',
      name: 'Ministry',
      description: 'Government ministry or department',
      isActive: true
    },
    {
      id: 'ddddeeee-ffff-0000-1111-444444444444',
      name: 'Municipality / Local Government',
      description: 'Local government authority or municipality',
      isActive: true
    },
    {
      id: 'eeeeffff-0000-1111-2222-555555555555',
      name: 'Private Company',
      description: 'Private sector company or corporation',
      isActive: true
    },
    {
      id: 'ffff0000-1111-2222-3333-666666666666',
      name: 'Small and Medium Enterprise (SME)',
      description: 'Small or medium-sized private enterprise',
      isActive: true
    },
    {
      id: '00001111-2222-3333-4444-777777777777',
      name: 'Multinational Corporation',
      description: 'Large multinational company with global operations',
      isActive: true
    },
    {
      id: '11112222-3333-4444-5555-888888888888',
      name: 'Non-Governmental Organization (NGO)',
      description: 'Non-profit organization or NGO',
      isActive: true
    },
    {
      id: '22223333-4444-5555-6666-999999999999',
      name: 'International Organization',
      description: 'International or multilateral organization',
      isActive: true
    },
    {
      id: '33334444-5555-6666-7777-aaaaaaaaaaaa',
      name: 'Financial Institution',
      description: 'Bank, microfinance institution, or other financial service provider',
      isActive: true
    },
    {
      id: '44445555-6666-7777-8888-bbbbbbbbbbbb',
      name: 'Academic Institution',
      description: 'University, research institute, or educational institution',
      isActive: true
    },
    {
      id: '55556666-7777-8888-9999-cccccccccccc',
      name: 'Consulting Firm',
      description: 'Professional services or consulting company',
      isActive: true
    },
    {
      id: '66667777-8888-9999-aaaa-dddddddddddd',
      name: 'Development Partner',
      description: 'Bilateral or multilateral development partner',
      isActive: true
    },
    {
      id: '77778888-9999-aaaa-bbbb-eeeeeeeeeeee',
      name: 'Foundation / Trust',
      description: 'Private foundation or charitable trust',
      isActive: true
    },
    {
      id: '88889999-aaaa-bbbb-cccc-ffffffffffff',
      name: 'Cooperative / Association',
      description: 'Cooperative society or professional association',
      isActive: true
    }
  ];

  // MOCK FINANCING TYPES
  private mockFinancingTypes: FinancingType[] = [
    {
      id: 'public-001',
      name: 'Public',
      code: 'PUB',
      isActive: true
    },
    {
      id: 'private-001',
      name: 'Private',
      code: 'PRI',
      isActive: true
    },
    {
      id: 'others-001',
      name: 'Others',
      code: 'OTH',
      isActive: true
    }
  ];

    private mockDisbursementTypes: DisbursementTypeDto[] = [
      {
        id: '1',
        code: 'A1',
        name: 'Direct Payment',
        nameFr: 'Paiement Direct',
        description: 'Direct payment to beneficiary',
      },
      {
        id: '2',
        code: 'A2',
        name: 'Reimbursement',
        nameFr: 'Remboursement',
        description: 'Reimbursement of expenses',
      },
      {
        id: '3',
        code: 'A3',
        name: 'Special Commitment',
        nameFr: 'Engagement Spécial',
        description: 'Special commitment procedure',
      },
      {
        id: '4',
        code: 'B1',
        name: 'Letter of Credit',
        nameFr: 'Lettre de Crédit',
        description: 'Letter of credit issuance',
      },
    ];
  
    private mockCurrencies: CurrencyDto[] = [
      { id: '1', code: 'USD', name: 'US Dollar', symbol: '$' },
      { id: '2', code: 'EUR', name: 'Euro', symbol: '€' },
      { id: '3', code: 'GBP', name: 'British Pound', symbol: '£' },
      { id: '4', code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA' },
    ];
  

  getCountries(filter?: DropdownFilter): Observable<DropdownResponse<Country>> {
    console.log('[MOCK] Fetching countries with filter:', filter);
    return this.simulateCountriesResponse(filter);
  }

  getFunctions(filter?: DropdownFilter): Observable<DropdownResponse<UserFunction>> {
    console.log('[MOCK] Fetching functions with filter:', filter);
    return this.simulateFunctionsResponse(filter);
  }

  getBusinessProfiles(filter?: DropdownFilter): Observable<DropdownResponse<BusinessProfile>> {
    console.log('[MOCK] Fetching business profiles with filter:', filter);
    return this.simulateBusinessProfilesResponse(filter);
  }

  getFinancingTypes(filter?: DropdownFilter): Observable<DropdownResponse<FinancingType>> {
    console.log('[MOCK] Fetching business profiles with filter:', filter);
    return this.simulateFinancingTypesResponse(filter);
  }


  getCountryById(id: string): Observable<Country | null> {
    console.log(' [MOCK] Fetching country by ID:', id);
    return of(null).pipe(
      delay(200),
      map(() => this.mockCountries.find(country => country.id === id) || null)
    );
  }

  getFunctionById(id: string): Observable<UserFunction | null> {
    console.log(' [MOCK] Fetching function by ID:', id);
    return of(null).pipe(
      delay(200),
      map(() => this.mockFunctions.find(func => func.id === id) || null)
    );
  }

  getBusinessProfileById(id: string): Observable<BusinessProfile | null> {
    console.log(' [MOCK] Fetching business profile by ID:', id);
    return of(null).pipe(
      delay(200),
      map(() => this.mockBusinessProfiles.find(profile => profile.id === id) || null)
    );
  }

  getFinancingTypeById(id: string): Observable<FinancingType | null> {
    console.log(' [MOCK] Fetching financing type by ID:', id);
    return of(null).pipe(
      delay(200),
      map(() => this.mockFinancingTypes.find(profile => profile.id === id) || null)
    );
  }

  getClaimTypes(): Observable<ClaimTypesResponse> {
    console.log('[MOCK] Fetching claim types');
    return of({
      claimTypes: [
        {
          id: 'ct1',
          name: 'Data Access Issue',
          nameFr: 'Problème d\'accès aux données',
          description: 'Issues related to accessing project data',
          createdAt: new Date('2025-01-01').toISOString()
        },
        {
          id: 'ct2',
          name: 'Incorrect Information',
          nameFr: 'Information incorrecte',
          description: 'Issues with incorrect or outdated information',
          createdAt: new Date('2025-01-01').toISOString()
        },
        {
          id: 'ct3',
          name: 'Technical Error',
          nameFr: 'Erreur technique',
          description: 'Technical issues with the system',
          createdAt: new Date('2025-01-01').toISOString()
        },
        {
          id: 'ct4',
          name: 'Missing Documents',
          nameFr: 'Documents manquants',
          description: 'Issues with missing documents',
          createdAt: new Date('2025-01-01').toISOString()
        },
        {
          id: 'ct5',
          name: 'Other',
          nameFr: 'Autre',
          description: 'Other types of issues',
          createdAt: new Date('2025-01-01').toISOString()
        }
      ],
      totalCount: 5
    }).pipe(delay(300));
  }

  getCurrencies(): Observable<CurrenciesResponse> {
    console.log('[MOCK] Fetching currencies');
    return of({
      currencies: this.mockCurrencies,
      totalCount: this.mockCurrencies.length
    }).pipe(delay(300));
  }

  getDisbursementTypes(): Observable<DisbursementTypesResponse> {
    console.log('[MOCK] Fetching disbursement types');
    return of({
      disbursementTypes: this.mockDisbursementTypes,
      totalCount: this.mockDisbursementTypes.length
    }).pipe(delay(300));
  }

  // MÉTHODES PRIVÉES DE SIMULATION

  private simulateCountriesResponse(filter?: DropdownFilter): Observable<DropdownResponse<Country>> {
    return of(null).pipe(
      delay(500),
      map(() => {
        let filteredCountries = [...this.mockCountries];

        if (filter) {
          if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            filteredCountries = filteredCountries.filter(country => 
              country.name.toLowerCase().includes(searchTerm) ||
              country.code.toLowerCase().includes(searchTerm)
            );
          }
          if (filter.isActive !== undefined) {
            filteredCountries = filteredCountries.filter(country => 
              country.isActive === filter.isActive
            );
          }
        }

        filteredCountries.sort((a, b) => a.name.localeCompare(b.name));

        return {
          success: true,
          data: filteredCountries,
          total: filteredCountries.length,
          message: 'Countries loaded successfully'
        };
      }),
      catchError(error => this.handleError('countries', error))
    );
  }

  private simulateFunctionsResponse(filter?: DropdownFilter): Observable<DropdownResponse<UserFunction>> {
    return of(null).pipe(
      delay(300),
      map(() => {
        let filteredFunctions = [...this.mockFunctions];

        if (filter) {
          if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            filteredFunctions = filteredFunctions.filter(func => 
              func.name.toLowerCase().includes(searchTerm) ||
              func.description.toLowerCase().includes(searchTerm)
            );
          }

          if (filter.isActive !== undefined) {
            filteredFunctions = filteredFunctions.filter(func => 
              func.isActive === filter.isActive
            );
          }
        }

        filteredFunctions.sort((a, b) => a.name.localeCompare(b.name));

        return {
          success: true,
          data: filteredFunctions,
          total: filteredFunctions.length,
          message: 'Functions loaded successfully'
        };
      }),
      catchError(error => this.handleError('functions', error))
    );
  }

  private simulateBusinessProfilesResponse(filter?: DropdownFilter): Observable<DropdownResponse<BusinessProfile>> {
    return of(null).pipe(
      delay(400),
      map(() => {
        let filteredProfiles = [...this.mockBusinessProfiles];

        if (filter) {
          if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            filteredProfiles = filteredProfiles.filter(profile => 
              profile.name.toLowerCase().includes(searchTerm) ||
              profile.description.toLowerCase().includes(searchTerm)
            );
          }

          if (filter.isActive !== undefined) {
            filteredProfiles = filteredProfiles.filter(profile => 
              profile.isActive === filter.isActive
            );
          }
        }

        filteredProfiles.sort((a, b) => a.name.localeCompare(b.name));

        return {
          success: true,
          data: filteredProfiles,
          total: filteredProfiles.length,
          message: 'Business profiles loaded successfully'
        };
      }),
      catchError(error => this.handleError('business-profiles', error))
    );
  }



   private simulateFinancingTypesResponse(filter?: DropdownFilter): Observable<DropdownResponse<FinancingType>> {
    return of(null).pipe(
      delay(400),
      map(() => {
        let filteredProfiles = [...this.mockFinancingTypes];

        if (filter) {
          if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            filteredProfiles = filteredProfiles.filter(profile => 
              profile.name.toLowerCase().includes(searchTerm));
          }

          if (filter.isActive !== undefined) {
            filteredProfiles = filteredProfiles.filter(profile => 
              profile.isActive === filter.isActive
            );
          }
        }

        filteredProfiles.sort((a, b) => a.name.localeCompare(b.name));

        return {
          success: true,
          data: filteredProfiles,
          total: filteredProfiles.length,
          message: 'Financing Types loaded successfully'
        };
      }),
      catchError(error => this.handleError('business-profiles', error))
    );
  }

  private handleError(endpoint: string, error: any): Observable<never> {
    console.error(`❌ [MOCK] Error fetching ${endpoint}:`, error);
    return throwError(() => ({
      success: false,
      data: [],
      total: 0,
      message: `Failed to load ${endpoint}`
    }));
  }
}