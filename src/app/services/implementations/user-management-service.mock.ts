import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
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
        { id: '1', name: 'Côte d\'Ivoire', code: 'CI' },
        { id: '2', name: 'Senegal', code: 'SN' }
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
        { id: '3', name: 'Ghana', code: 'GH' }
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
        id,
        name: `Country ${id}`,
        code: id.substr(0, 2).toUpperCase()
      }))
    };

    this.mockUsers.push(newUser);

    const response: CreateInternalUserResponse = {
      user: newUser,
      message: 'User added successfully'
    };

    return of(response).pipe(delay(1000));
  }
}
