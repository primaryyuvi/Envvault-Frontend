import type { Environment } from "./environment";
import type { User } from "./user";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export const AuditActionType = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
} as const;

export type AuditActionType =
  (typeof AuditActionType)[keyof typeof AuditActionType];

export const AuditAction = {
  PROJECT_CREATED: "PROJECT_CREATED",
  PROJECT_DELETED: "PROJECT_DELETED",
  PROJECT_USER_ADDED: "PROJECT_USER_ADDED",
  PROJECT_USER_REMOVED: "PROJECT_USER_REMOVED",
  PROJECT_USER_LEFT: "PROJECT_USER_LEFT",
  PROJECT_USERS_BULK_ASSIGNED: "PROJECT_USERS_BULK_ASSIGNED",
  PROJECT_ACCESS_REQUESTED: "PROJECT_ACCESS_REQUESTED",
  ENVIRONMENT_CREATED: "ENVIRONMENT_CREATED",
  ENVIRONMENT_DELETED: "ENVIRONMENT_DELETED",
  ENVIRONMENT_ACCESS_GRANTED: "ENVIRONMENT_ACCESS_GRANTED",
  ENVIRONMENT_ACCESS_UPDATED: "ENVIRONMENT_ACCESS_UPDATED",
  ENVIRONMENT_ACCESS_REMOVED: "ENVIRONMENT_ACCESS_REMOVED",
  KEY_CREATED: "KEY_CREATED",
  KEY_UPDATED: "KEY_UPDATED",
  KEY_DELETED: "KEY_DELETED",
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export type AuditLog = {
  id: string;
  action: string;
  details: JsonValue;
  actionType: string;
  user?: Pick<User, "id" | "displayName"> | null;
  environmentId: string | null;
  environment?: Environment | null;
  project?: {
    id: string;
    name: string;
  } | null;
  secret?: {
    id: string;
    keyName: string;
  } | null;
  timestamp: string | Date;
};
