export enum UserRole {
  Admin = 1,
  DO = 2,
  DA = 3,
  ExternalUser = 4
}

export interface CountryAdminDto {
  countryId: string;
  userId: string;
  isActive: boolean;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
  userFullName?: string;
  countryName?: string;
  countryNameFr?: string;
  counrtyCode?: string;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  entraIdObjectId?: string;
  organizationName?: string;
  createdAt: Date;
  countries?: CountryAdminDto[];
}

export interface AzureAdUserDetailsDto {
  id: string;
  displayName: string;
  email: string;
  jobTitle?: string;
  department?: string;
}

export interface SearchAzureAdUsersResponse {
  users: AzureAdUserDetailsDto[];
  totalCount: number;
}

export interface CreateInternalUserRequest {
  email: string;
  role: UserRole;
  countryIds: string[];
}

export interface CreateInternalUserResponse {
  user: UserDto;
  message: string;
}
