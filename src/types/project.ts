import type { Environment } from "./environment";
import type { SecretAccessControl } from "./key";
import type { User } from "./user";

export type ProjectCardMember = {
  id: string;
  displayName: string;
};

export type ProjectCardEnvironment = {
  id: string;
  name: string;
};

export type DashboardProject = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  members: ProjectCardMember[];
  environments: ProjectCardEnvironment[];
  totalSecrets: number;
};

export type DashboardProjectsPagination = {
  page: number;
  pageSize: number;
  totalProjects: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedDashboardProjects = {
  projects: DashboardProject[];
  pagination: DashboardProjectsPagination;
};

export type Project = {
  id: string;
  name?: string;
  description?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  members?: ProjectMember[];
  environments?: Environment[];
};

export type ProjectMember = {
  id: string;
  userId?: string;
  user?: User;
  projectId?: string;
  project?: Project;
  role?: string;
  createdAt?: string | Date;
  secretPermissions?: SecretAccessControl[];
  environmentMemberships?: EnvironmentMemberMembership[];
};

export type EnvironmentMember = {
  id: string;
  environmentId: string;
  environment?: Environment;
  projectMemberId: string;
  projectMember?: ProjectMember;
  createdAt?: string | Date;
};

export type EnvironmentMemberMembership = {
  environment: {
    id: string;
    name: string;
  };
};
