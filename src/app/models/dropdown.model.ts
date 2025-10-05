export interface Country {
  id: string; // GUID
  code: string;
  name: string;
  isActive: boolean;
}

export interface FinancingType {
  id: string; // GUID
  code: string;
  name: string;
  isActive: boolean;
}

export interface UserFunction {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface BusinessProfile {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface DropdownResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  message?: string;
}

export interface DropdownFilter {
  search?: string;
  isActive?: boolean;
  category?: string;
  sector?: string;
  region?: string;
}