import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import { Claim, ClaimProcess, ClaimStatus, CreateClaimDto, CreateClaimProcessDto } from '../models/claim.model';

@Injectable({
  providedIn: 'root'
})
export class ClaimMockService {
  private claimsSubject = new BehaviorSubject<Claim[]>([
    {
      id: '1',
      claimType: 'Data Access Issue',
      user: 'john.doe@external.com',
      country: 'Nigeria',
      comment: 'I cannot access the project data for Q4 2024. Getting permission denied error.',
      status: ClaimStatus.PENDING,
      createdAt: new Date('2025-10-05T10:30:00')
    },
    {
      id: '2',
      claimType: 'Incorrect Information',
      user: 'jane.smith@external.com',
      country: 'Kenya',
      comment: 'The budget allocation shown in the system does not match the approved project document.',
      status: ClaimStatus.IN_PROGRESS,
      createdAt: new Date('2025-10-03T14:15:00')
    },
    {
      id: '3',
      claimType: 'Technical Error',
      user: 'john.doe@external.com',
      country: 'Ghana',
      comment: 'System crashes when trying to export project reports to PDF format.',
      status: ClaimStatus.RESOLVED,
      createdAt: new Date('2025-09-28T09:00:00')
    },
    {
      id: '4',
      claimType: 'Missing Documents',
      user: 'sarah.wilson@external.com',
      country: 'South Africa',
      comment: 'Project approval documents are missing from the document repository.',
      status: ClaimStatus.CLOSED,
      createdAt: new Date('2025-09-20T11:45:00')
    }
  ]);

  private claimProcessesSubject = new BehaviorSubject<ClaimProcess[]>([
    {
      id: 'p1',
      claimId: '2',
      user: 'admin@afdb.org',
      status: ClaimStatus.IN_PROGRESS,
      comment: 'We are investigating the discrepancy. Initial review shows the data was updated after approval.',
      createdAt: new Date('2025-10-04T08:20:00')
    },
    {
      id: 'p2',
      claimId: '3',
      user: 'support@afdb.org',
      status: ClaimStatus.RESOLVED,
      comment: 'Issue was caused by browser compatibility. Updated the export module. Please clear cache and try again.',
      createdAt: new Date('2025-09-29T16:30:00')
    },
    {
      id: 'p3',
      claimId: '4',
      user: 'admin@afdb.org',
      status: ClaimStatus.CLOSED,
      comment: 'Documents have been uploaded to the repository. Issue resolved.',
      createdAt: new Date('2025-09-22T10:00:00')
    }
  ]);

  private nextClaimId = 5;
  private nextProcessId = 4;

  constructor() {}

  getClaims(): Observable<Claim[]> {
    return this.claimsSubject.asObservable().pipe(delay(300));
  }

  getClaimsByUser(userEmail: string): Observable<Claim[]> {
    return of(this.claimsSubject.value.filter(c => c.user === userEmail)).pipe(delay(300));
  }

  getClaimById(id: string): Observable<Claim | undefined> {
    return of(this.claimsSubject.value.find(c => c.id === id)).pipe(delay(300));
  }

  getClaimProcesses(claimId: string): Observable<ClaimProcess[]> {
    return of(this.claimProcessesSubject.value.filter(p => p.claimId === claimId)).pipe(delay(300));
  }

  createClaim(dto: CreateClaimDto, userEmail: string): Observable<Claim> {
    const newClaim: Claim = {
      id: String(this.nextClaimId++),
      claimType: dto.claimType,
      user: userEmail,
      country: dto.country,
      comment: dto.comment,
      status: ClaimStatus.PENDING,
      createdAt: new Date()
    };

    const currentClaims = this.claimsSubject.value;
    this.claimsSubject.next([newClaim, ...currentClaims]);

    return of(newClaim).pipe(delay(300));
  }

  createClaimProcess(dto: CreateClaimProcessDto, userEmail: string): Observable<ClaimProcess> {
    const newProcess: ClaimProcess = {
      id: `p${this.nextProcessId++}`,
      claimId: dto.claimId,
      user: userEmail,
      status: dto.status,
      comment: dto.comment,
      createdAt: new Date()
    };

    const currentProcesses = this.claimProcessesSubject.value;
    this.claimProcessesSubject.next([...currentProcesses, newProcess]);

    const claims = this.claimsSubject.value;
    const claimIndex = claims.findIndex(c => c.id === dto.claimId);
    if (claimIndex !== -1) {
      claims[claimIndex] = { ...claims[claimIndex], status: dto.status };
      this.claimsSubject.next([...claims]);
    }

    return of(newProcess).pipe(delay(300));
  }
}
