import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ClaimService } from '../abstract/claim-service.abstract';
import {
  Claim,
  ClaimStatus,
  ClaimQueryParams,
  UserClaimQueryParams,
  CreateClaimDto,
  CreateClaimResponse,
  CreateClaimProcessDto
} from '../../models/claim.model';

@Injectable({
  providedIn: 'root'
})
export class ClaimServiceMock extends ClaimService {
  private mockClaims: Claim[] = [
    {
      id: '1',
      claimTypeId: 'ct1',
      claimTypeName: 'Data Access Issue',
      claimTypeNameFr: 'Problème d\'accès aux données',
      countryId: 'ng',
      countryName: 'Nigeria',
      userId: 'user1',
      userFirstName: 'John',
      userLastName: 'Doe',
      userFullName: 'John Doe',
      userEmail: 'john.doe@external.com',
      status: ClaimStatus.Submitted,
      closedAt: null,
      comment: 'I cannot access the project data for Q4 2024.',
      createdAt: new Date('2025-10-05T10:30:00').toISOString(),
      createdBy: 'john.doe@external.com',
      updatedAt: new Date('2025-10-05T10:30:00').toISOString(),
      updatedBy: 'john.doe@external.com',
      processes: []
    },
    {
      id: '2',
      claimTypeId: 'ct2',
      claimTypeName: 'Incorrect Information',
      claimTypeNameFr: 'Information incorrecte',
      countryId: 'ke',
      countryName: 'Kenya',
      userId: 'user2',
      userFirstName: 'Jane',
      userLastName: 'Smith',
      userFullName: 'Jane Smith',
      userEmail: 'jane.smith@external.com',
      status: ClaimStatus.InProgress,
      closedAt: null,
      comment: 'The budget allocation shown does not match the approved document.',
      createdAt: new Date('2025-10-03T14:15:00').toISOString(),
      createdBy: 'jane.smith@external.com',
      updatedAt: new Date('2025-10-04T08:20:00').toISOString(),
      updatedBy: 'admin@afdb.org',
      processes: [
        {
          id: 'p1',
          claimId: '2',
          userId: 'admin1',
          userFirstName: 'Admin',
          userLastName: 'User',
          userFullName: 'Admin User',
          status: ClaimStatus.InProgress,
          comment: 'We are investigating the discrepancy.',
          createdAt: new Date('2025-10-04T08:20:00').toISOString(),
          createdBy: 'admin@afdb.org'
        }
      ]
    }
  ];

  getClaims(params?: ClaimQueryParams): Observable<Claim[]> {
    let filtered = [...this.mockClaims];

    if (params?.status) {
      filtered = filtered.filter(c => c.status === params.status);
    }

    return of(filtered).pipe(delay(300));
  }

  getClaimsByUser(params: UserClaimQueryParams): Observable<Claim[]> {
    let filtered = this.mockClaims.filter(c => c.userId === params.userId);

    if (params.status) {
      filtered = filtered.filter(c => c.status === params.status);
    }

    return of(filtered).pipe(delay(300));
  }

  getClaimById(id: string): Observable<Claim> {
    const claim = this.mockClaims.find(c => c.id === id);
    if (!claim) {
      throw new Error('Claim not found');
    }
    return of(claim).pipe(delay(300));
  }

  createClaim(dto: CreateClaimDto): Observable<CreateClaimResponse> {
    const newClaim: Claim = {
      id: (this.mockClaims.length + 1).toString(),
      claimTypeId: dto.claimTypeId,
      claimTypeName: 'Mock Type',
      claimTypeNameFr: 'Type Mock',
      countryId: dto.countryId,
      countryName: 'Mock Country',
      userId: dto.userId,
      userFirstName: 'Mock',
      userLastName: 'User',
      userFullName: 'Mock User',
      userEmail: 'mock@example.com',
      status: ClaimStatus.Submitted,
      closedAt: null,
      comment: dto.comment,
      createdAt: new Date().toISOString(),
      createdBy: 'mock@example.com',
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock@example.com',
      processes: []
    };

    this.mockClaims = [newClaim, ...this.mockClaims];

    return of({
      claim: newClaim,
      message: 'Claim created successfully'
    }).pipe(delay(300));
  }

  createClaimProcess(claimId: string, dto: CreateClaimProcessDto): Observable<Claim> {
    const claimIndex = this.mockClaims.findIndex(c => c.id === claimId);
    if (claimIndex === -1) {
      throw new Error('Claim not found');
    }

    const newProcess = {
      id: `p${Date.now()}`,
      claimId: claimId,
      userId: dto.userId,
      userFirstName: 'Admin',
      userLastName: 'User',
      userFullName: 'Admin User',
      status: dto.status,
      comment: dto.comment,
      createdAt: new Date().toISOString(),
      createdBy: 'admin@afdb.org'
    };

    this.mockClaims[claimIndex].processes.push(newProcess);
    this.mockClaims[claimIndex].status = dto.status;
    this.mockClaims[claimIndex].updatedAt = new Date().toISOString();

    if (dto.status === ClaimStatus.Closed) {
      this.mockClaims[claimIndex].closedAt = new Date().toISOString();
    }

    return of(this.mockClaims[claimIndex]).pipe(delay(300));
  }
}
