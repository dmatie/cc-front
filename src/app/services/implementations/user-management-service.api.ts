import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { AbstractUserManagementService } from '../abstract/user-management-service.abstract';
import {
  UserDto,
  SearchAzureAdUsersResponse,
  CreateInternalUserRequest,
  CreateInternalUserResponse
} from '../../models/user-management.model';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from '../error-handler.service';

@Injectable()
export class UserManagementServiceApi extends AbstractUserManagementService {
  private readonly userApiUrl = `${environment.apiUrl}/Users`;
  private readonly azureAdApiUrl = `${environment.apiUrl}/AzureAd`;
  private readonly timeout = 30000;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {
    super();
  }

  getInternalUsers(): Observable<UserDto[]> {
    console.log('📤 [API] Fetching internal users');

    return this.http.get<UserDto[]>(`${this.userApiUrl}/InternalUsers`).pipe(
      timeout(this.timeout),
      map(response => {
        console.log('✅ [API] Internal users received:', response);
        return response.map(user => ({
          ...user,
          createdAt: new Date(user.createdAt)
        }));
      }),
      catchError(error => {
        console.error('❌ [API] Error fetching internal users:', error);
        const errorMessage = this.errorHandler.handleApiError(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  searchAzureAdUsers(query: string, maxResults: number = 10): Observable<SearchAzureAdUsersResponse> {
    console.log('📤 [API] Searching Azure AD users:', query);

    const params = new HttpParams()
      .set('query', query)
      .set('maxResults', maxResults.toString());

    return this.http.get<SearchAzureAdUsersResponse>(`${this.azureAdApiUrl}/users/search`, { params }).pipe(
      timeout(this.timeout),
      map(response => {
        console.log('✅ [API] Azure AD users found:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ [API] Error searching Azure AD users:', error);
        const errorMessage = this.errorHandler.handleApiError(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  addInternalUser(request: CreateInternalUserRequest): Observable<CreateInternalUserResponse> {
    console.log('📤 [API] Adding internal user:', request);

    return this.http.post<CreateInternalUserResponse>(`${this.userApiUrl}/AddInternal`, request).pipe(
      timeout(this.timeout),
      map(response => {
        console.log('✅ [API] Internal user added:', response);
        return {
          ...response,
          user: {
            ...response.user,
            createdAt: new Date(response.user.createdAt)
          }
        };
      }),
      catchError(error => {
        console.error('❌ [API] Error adding internal user:', error);
        const errorMessage = this.errorHandler.handleApiError(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
