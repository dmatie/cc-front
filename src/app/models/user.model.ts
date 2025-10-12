export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  role: string
  appRoles: string[]
  status: string
  registrationDate: Date;
  approvalDate?: Date;
  azureAdId?: string;
}

export interface RegistrationRequest {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  businessJustification: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface UserMeResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: number;
    isActive: boolean;
    entraIdObjectId: string;
    organizationName: string;
    createdAt: string;
  };
}
