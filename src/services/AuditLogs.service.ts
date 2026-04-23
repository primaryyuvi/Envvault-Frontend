import type { AuditLog } from "../types/audit";
import { apiGet, apiPost } from "../utils/ApiClient";

export async function createAudit(keyId: string, projectId: string, action: string, description: string, actionType: string) {
  const response = await apiPost<AuditLog>(`/audit/`,{keyId,projectId,action,actionType,description});
  return response.data;
}

export async function getAuditsByProjects(projectId: string) {
  const response = await apiGet<AuditLog[]>(`/audit/project/${projectId}`);
  return response.data;
}

export async function getAuditsByKeys(keyId: string) {
  const response = await apiGet<AuditLog[]>(`/audit/key/${keyId}`);
  return response.data;
}

export async function getAuditsByUser() {
  const response = await apiGet<AuditLog[]>(`/audit/user/`);
  return response.data;
}
