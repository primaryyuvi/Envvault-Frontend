export type RoleLevel =
  | "Owner"
  | "Maintainer"
  | "Developer"
  | "Guest"
  | "No Access"
  | "Read Only";

export interface TeamEnvironment {
  id: string;
  name: string;
  slug?: string;
}

export interface TeamEnvironmentRole {
  environmentId: string;
  environmentName: string;
  environmentSlug?: string;
  role: RoleLevel;
  environmentMemberId?: string;
}

export interface ProjectMember {
  id: string;
  projectMemberId: string;
  userId?: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
  roles: TeamEnvironmentRole[];
  dateJoined: string;
  isCurrentUser?: boolean;
}

export interface OwnedProject {
  id: string;
  name: string;
  description?: string | null;
  environments: TeamEnvironment[];
  members: ProjectMember[];
}

export interface JoinedProject {
  id: string;
  name: string;
  description?: string | null;
  environments: TeamEnvironment[];
  allMembers: ProjectMember[];
  visibleMembers: ProjectMember[];
  extraMembersCount: number;
}
