import type { Environment } from "../types/environment";
import type { ProjectMember } from "../types/project";
import type { User } from "../types/user";
import { apiGet, apiPatch, apiDelete, apiPost } from "../utils/ApiClient";

export type EnvironmentAccessRole =
  | "OWNER"
  | "MAINTAINER"
  | "DEVELOPER"
  | "GUEST"
  | "READ_ONLY"
  | "NO_ACCESS";

export type EnvironmentMemberDetails = {
  id: string;
  environmentId: string;
  projectMemberId?: string;
  role: EnvironmentAccessRole;
  environment?: Environment;
  userId?: string;
  user?: User;
  projectMember?: ProjectMember;
  joinedAt?: string | Date;
  createdAt?: string | Date;
};

export type CreateEnvironmentMemberInput = {
  userId: string;
  role: EnvironmentAccessRole;
};

export type UpdateEnvironmentMemberInput = {
  role: EnvironmentAccessRole;
};

export async function createEnvironment(env_name: string, projectId: string, slug: string) {
  const response = await apiPost<Environment>(`/env/`,{env_name,projectId,slug});
  return response.data;
}

export async function removeEnvironment(environmentId: string) {
  const response = await apiDelete<string>(`/env/${environmentId}`,{});
  return response.data;
}

export async function getEnvsByProject(projectId: string) {
  const response = await apiGet<Environment[]>(`/env/project/${projectId}`);
  return response.data;
}

export async function getEnvironmentMembers(environmentId: string) {
  const response = await apiGet<EnvironmentMemberDetails[]>(
    `/environment/${environmentId}/members`,
  );
  return response.data;
}

export async function addEnvironmentMember(
  environmentId: string,
  payload: CreateEnvironmentMemberInput,
) {
  const response = await apiPost<EnvironmentMemberDetails>(
    `/environment/${environmentId}/members`,
    payload,
  );
  return response.data;
}

export async function updateEnvironmentMember(
  environmentId: string,
  memberId: string,
  payload: UpdateEnvironmentMemberInput,
) {
  const response = await apiPatch<EnvironmentMemberDetails>(
    `/environment/${environmentId}/members/${memberId}`,
    payload,
  );
  return response.data;
}

export async function removeEnvironmentMember(
  environmentId: string,
  memberId: string,
) {
  const response = await apiDelete<{ success: boolean }>(
    `/environment/${environmentId}/members/${memberId}`,
    {},
  );
  return response.data;
}
