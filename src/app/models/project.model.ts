export interface Project {
  sapCode: string;
  projectName: string;
  countryCode: string;
  managingCountryCode: string;
}

export interface ProjectsResponse {
  projects: Project[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ProjectFilter {
  countryCode?: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
  isActive?: boolean;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  projectsByCountry: { [countryCode: string]: number };
}

export interface ProjectLoanNumberDto {
  sapCode: string;
  loanNumber: string;
}

export interface GetProjectLoanNumberResponse {
  projectLoanNumbers: ProjectLoanNumberDto[];
  totalCount: number;
}
