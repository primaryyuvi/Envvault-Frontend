import type { EnvironmentValues } from "../types/environment";
import type {
  DashboardProject,
  PaginatedDashboardProjects,
  Project,
  ProjectMember,
} from "../types/project";
import type { User } from "../types/user";
import { apiDelete, apiGet, apiPost } from "../utils/ApiClient";
import {
  cacheProjectKey,
  getCachedProjectKeyBase64,
  getPrivateKey,
  getPublicKey,
} from "../utils/secureSession";
import {
  bufferToBase64,
  decryptProjectKeyWithPrivateKey,
  encryptProjectKeyForPublicKey,
  generateProjectKey,
  importPublicKeyFromPem,
} from "../utils/crypto";

export type EnvironmentAccessRole =
  | "OWNER"
  | "MAINTAINER"
  | "DEVELOPER"
  | "GUEST"
  | "READ_ONLY"
  | "NO_ACCESS";

export type ProjectEnvironmentRoleAssignment = {
  id?: string;
  environmentId: string;
  environmentName?: string;
  environmentSlug?: string;
  role: EnvironmentAccessRole;
  memberId?: string;
  environment?: {
    id: string;
    name?: string;
    slug?: string;
  };
  joinedAt?: string | Date;
  createdAt?: string | Date;
};

export type DetailedProjectMember = {
  id?: string;
  memberId?: string;
  userId?: string;
  user?: User;
  projectRole?: string;
  joinedAt?: string | Date;
  createdAt?: string | Date;
  environmentRoles?: ProjectEnvironmentRoleAssignment[];
  environments?: ProjectEnvironmentRoleAssignment[];
};

export type DetailedProject = Project & {
  currentUserRole?: string;
  currentUserJoinedAt?: string | Date;
  currentUserEnvironments?: ProjectEnvironmentRoleAssignment[];
  members: DetailedProjectMember[];
};

export type BulkAssignProjectMembersInput = {
  members: {
    email: string;
    environmentRoles: {
      environmentId: string;
      role: EnvironmentAccessRole;
    }[];
  }[];
};

export type AccessRequestInput = {
  message: string;
  environmentRoles: {
    environmentId: string;
    role: EnvironmentAccessRole;
  }[];
};

type ProjectKeyResponse = {
  encryptedProjectKey: string;
};

type PublicKeyLookupResponse = {
  userId: string;
  publicKey: string;
};

export async function createProject(
  project_name: string,
  description: string,
  environments: EnvironmentValues[],
) {
  const publicKey = getPublicKey();
  if (!publicKey) {
    throw new Error("Encryption session not loaded. Please sign in again.");
  }

  const projectKey = await generateProjectKey();
  const encryptedProjectKey = await encryptProjectKeyForPublicKey(projectKey, publicKey);
  const response = await apiPost<Project>("/project/", {
    project_name,
    description,
    environments,
    encryptedProjectKey,
  });

  if (response.data?.id) {
    await cacheProjectKey(
      response.data.id,
      bufferToBase64(await crypto.subtle.exportKey("raw", projectKey)),
    );
  }

  return response.data;
}

export async function getProjectsByUser() {
  const response = await apiGet<Project[]>("/project/");
  return response.data;
}

export async function getPaginatedProjectsByUser(page: number, pageSize: number) {
  const response = await apiGet<PaginatedDashboardProjects>("/project/", {
    params: {
      page,
      pageSize,
    },
  });
  return {
    projects: (response.data?.projects ?? []) as DashboardProject[],
    pagination: response.data.pagination,
  };
}

export async function getProjectMembersByProject(projectId: string) {
  const response = await apiGet<ProjectMember[]>(`/project/member/${projectId}`);
  return response.data;
}

export async function getOwnedProjectsDetailed() {
  const response = await apiGet<DetailedProject[]>("/project/owned/detailed");
  return response.data;
}

export async function getMemberProjectsDetailed() {
  const response = await apiGet<DetailedProject[]>("/project/member/detailed");
  return response.data;
}

export async function getProjectMasterKey(projectId: string): Promise<string> {
  const cached = getCachedProjectKeyBase64(projectId);
  if (cached) {
    return cached;
  }

  const privateKey = getPrivateKey();
  if (!privateKey) {
    throw new Error("Private key unavailable. Please sign in again.");
  }

  const response = await apiGet<ProjectKeyResponse>(`/project/${projectId}/key`);
  const projectKeyBase64 = await decryptProjectKeyWithPrivateKey(
    response.data.encryptedProjectKey,
    privateKey,
  );
  await cacheProjectKey(projectId, projectKeyBase64);
  return projectKeyBase64;
}

export async function lookupUserPublicKey(email: string) {
  const response = await apiGet<PublicKeyLookupResponse>(
    `/users/${encodeURIComponent(email)}/public-key`,
  );
  return response.data;
}

export async function bulkAssignProjectMembers(
  projectId: string,
  payload: BulkAssignProjectMembersInput,
) {
  const projectKeyBase64 = await getProjectMasterKey(projectId);

  const members = await Promise.all(
    payload.members.map(async (member) => {
      const lookup = await lookupUserPublicKey(member.email);
      const publicKey = await importPublicKeyFromPem(lookup.publicKey);
      const encryptedProjectKey = await encryptProjectKeyForPublicKey(
        projectKeyBase64,
        publicKey,
      );

      return {
        userId: lookup.userId,
        email: member.email,
        environmentRoles: member.environmentRoles,
        encryptedProjectKey,
      };
    }),
  );

  const response = await apiPost<DetailedProject>(
    `/project/${projectId}/members/bulk-assign`,
    { members },
  );
  return response.data;
}

export async function requestProjectAccess(
  projectId: string,
  payload: AccessRequestInput,
) {
  const response = await apiPost<{ success: boolean }>(
    `/project/${projectId}/access-requests`,
    payload,
  );
  return response.data;
}

export async function leaveProject(projectId: string) {
  const response = await apiDelete<{ success: boolean }>(
    `/project/${projectId}/leave`,
    {},
  );
  return response.data;
}

export async function deleteProject(projectId: string) {
  const response = await apiDelete<{ success: boolean }>(
    `/project/${projectId}`,
    {},
  );
  return response.data;
}
