import { Observable } from 'rxjs';
import {
  UserDto,
  SearchAzureAdUsersResponse,
  CreateInternalUserRequest,
  CreateInternalUserResponse
} from '../../models/user-management.model';

export abstract class AbstractUserManagementService {
  abstract getInternalUsers(): Observable<UserDto[]>;
  abstract searchAzureAdUsers(query: string, maxResults?: number): Observable<SearchAzureAdUsersResponse>;
  abstract addInternalUser(request: CreateInternalUserRequest): Observable<CreateInternalUserResponse>;
}
