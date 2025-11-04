import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AbstractUserManagementService } from '../abstract/user-management-service.abstract';
import {
  UserDto,
  SearchAzureAdUsersResponse,
  CreateInternalUserRequest,
  CreateInternalUserResponse,
  UserRole
} from '../../models/user-management.model';

@Injectable()
export class UserManagementServiceMock extends AbstractUserManagementService {
  private mockUsers: UserDto[] = [
    {
      id: '1',
      email: 'admin@afdb.org',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      role: UserRole.Admin,
      isActive: true,
      entraIdObjectId: 'azure-123',
      organizationName: 'AfDB',
      createdAt: new Date('2024-01-15'),
      countries: []
    },
    {
      id: '2',
      email: 'do.officer@afdb.org',
      firstName: 'Jane',
      lastName: 'Smith',
      fullName: 'Jane Smith',
      role: UserRole.DO,
      isActive: true,
      entraIdObjectId: 'azure-456',
      organizationName: 'AfDB',
      createdAt: new Date('2024-02-20'),
      countries: [
        { countryId: '1', userId: '2', isActive: true, countryName: 'Côte d\'Ivoire', counrtyCode: 'CI' },
        { countryId: '2', userId: '2', isActive: true, countryName: 'Senegal', counrtyCode: 'SN' }
      ]
    },
    {
      id: '3',
      email: 'da.assistant@afdb.org',
      firstName: 'Mike',
      lastName: 'Johnson',
      fullName: 'Mike Johnson',
      role: UserRole.DA,
      isActive: true,
      entraIdObjectId: 'azure-789',
      organizationName: 'AfDB',
      createdAt: new Date('2024-03-10'),
      countries: [
        { countryId: '3', userId: '3', isActive: true, countryName: 'Ghana', counrtyCode: 'GH' }
      ]
    }
  ];

  getInternalUsers(): Observable<UserDto[]> {
    return of(this.mockUsers).pipe(delay(500));
  }

  searchAzureAdUsers(query: string, maxResults: number = 10): Observable<SearchAzureAdUsersResponse> {
    const mockAzureUsers = [
      {
        id: 'azure-new-1',
        displayName: 'Alice Williams',
        email: 'alice.williams@afdb.org',
        jobTitle: 'Financial Analyst',
        department: 'Finance'
      },
      {
        id: 'azure-new-2',
        displayName: 'Bob Brown',
        email: 'bob.brown@afdb.org',
        jobTitle: 'Project Manager',
        department: 'Operations'
      },
      {
        id: 'azure-new-3',
        displayName: 'Carol Davis',
        email: 'carol.davis@afdb.org',
        jobTitle: 'Senior Analyst',
        department: 'Research'
      }
    ];

    const filtered = mockAzureUsers.filter(user =>
      user.displayName.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    ).slice(0, maxResults);

    const response: SearchAzureAdUsersResponse = {
      users: filtered,
      totalCount: filtered.length
    };

    return of(response).pipe(delay(800));
  }

  addInternalUser(request: CreateInternalUserRequest): Observable<CreateInternalUserResponse> {
    const newUser: UserDto = {
      id: Math.random().toString(36).substr(2, 9),
      email: request.email,
      firstName: request.email.split('@')[0].split('.')[0],
      lastName: request.email.split('@')[0].split('.')[1] || 'User',
      fullName: request.email.split('@')[0].replace('.', ' '),
      role: request.role,
      isActive: true,
      entraIdObjectId: 'azure-' + Math.random().toString(36).substr(2, 9),
      organizationName: 'AfDB',
      createdAt: new Date(),
      countries: request.countryIds.map(id => ({
        countryId: id,
        userId: Math.random().toString(36).substr(2, 9),
        isActive: true,
        countryName: `Country ${id}`,
        counrtyCode: id.substr(0, 2).toUpperCase()
      }))
    };

    this.mockUsers.push(newUser);

    const response: CreateInternalUserResponse = {
      user: newUser,
      message: 'User added successfully'
    };

    return of(response).pipe(delay(1000));
  }

  getUserById(id: string): Observable<UserDto> {
    const user = this.mockUsers.find(u => u.id === id);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }
    return of(user).pipe(delay(500));
  }

  deactivateUser(id: string): Observable<boolean> {
    const user = this.mockUsers.find(u => u.id === id);
    if (user) {
      user.isActive = false;
    }
    return of(true).pipe(delay(800));
  }

  addCountriesToUser(userId: string, countryIds: string[]): Observable<boolean> {
    const user = this.mockUsers.find(u => u.id === userId);
    if (user) {
      const newCountries = countryIds.map(id => ({
        countryId: id,
        userId: userId,
        isActive: true,
        countryName: `Country ${id}`,
        counrtyCode: id.substr(0, 2).toUpperCase()
      }));
      user.countries = [...(user.countries || []), ...newCountries];
    }
    return of(true).pipe(delay(800));
  }

  removeCountryFromUser(userId: string, countryId: string): Observable<boolean> {
    const user = this.mockUsers.find(u => u.id === userId);
    if (user && user.countries) {
      user.countries = user.countries.filter(c => c.countryId !== countryId);
    }
    return of(true).pipe(delay(800));
  }
}
