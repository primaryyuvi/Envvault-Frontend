import { AuditAction, AuditActionType, type AuditLog } from "../types/audit";

export type AuditActivityTone =
  | "create"
  | "update"
  | "delete"
  | "access"
  | "member"
  | "request"
  | "default";

export type AuditActivityContent = {
  user: string;
  action: string;
  target: string;
  targetType: "link" | "code" | "text";
  tone: AuditActivityTone;
};

const getDetailsRecord = (audit: AuditLog): Record<string, unknown> | null => {
  if (
    typeof audit.details === "object" &&
    audit.details !== null &&
    !Array.isArray(audit.details)
  ) {
    return audit.details as Record<string, unknown>;
  }

  return null;
};

const getFirstString = (
  record: Record<string, unknown> | null,
  keys: string[],
): string | null => {
  if (!record) {
    return null;
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
};

const getProjectName = (audit: AuditLog, details: Record<string, unknown> | null) =>
  audit.project?.name?.trim() ||
  getFirstString(details, ["projectName", "project_name"]) ||
  "project";

const getEnvironmentName = (
  audit: AuditLog,
  details: Record<string, unknown> | null,
) =>
  audit.environment?.name?.trim() ||
  getFirstString(details, ["environmentName", "environmentSlug", "environment"]) ||
  "environment";

const getSecretName = (audit: AuditLog, details: Record<string, unknown> | null) =>
  audit.secret?.keyName?.trim() ||
  getFirstString(details, ["secretName", "keyName", "secret", "key"]) ||
  "secret";

export const resolveAuditActivityContent = (
  audit: AuditLog,
): AuditActivityContent => {
  const displayName = audit.user?.displayName?.trim() || "Unknown user";
  const normalizedAction = (audit.action?.toUpperCase() ?? "") as AuditAction;
  const normalizedActionType = (audit.actionType?.toUpperCase() ??
    "") as AuditActionType;
  const details = getDetailsRecord(audit);
  const projectName = getProjectName(audit, details);
  const environmentName = getEnvironmentName(audit, details);
  const secretName = getSecretName(audit, details);

  switch (normalizedAction) {
    case AuditAction.PROJECT_CREATED:
      return {
        user: displayName,
        action: "created project",
        target: projectName,
        targetType: "link",
        tone: "create",
      };
    case AuditAction.PROJECT_DELETED:
      return {
        user: displayName,
        action: "deleted project",
        target: projectName,
        targetType: "text",
        tone: "delete",
      };
    case AuditAction.PROJECT_USER_ADDED:
      return {
        user: displayName,
        action: "added a member to project",
        target: projectName,
        targetType: "link",
        tone: "member",
      };
    case AuditAction.PROJECT_USER_REMOVED:
      return {
        user: displayName,
        action: "removed a member from project",
        target: projectName,
        targetType: "link",
        tone: "member",
      };
    case AuditAction.PROJECT_USER_LEFT:
      return {
        user: displayName,
        action: "left project",
        target: projectName,
        targetType: "link",
        tone: "member",
      };
    case AuditAction.PROJECT_USERS_BULK_ASSIGNED:
      return {
        user: displayName,
        action: "bulk assigned members in project",
        target: projectName,
        targetType: "link",
        tone: "member",
      };
    case AuditAction.PROJECT_ACCESS_REQUESTED:
      return {
        user: displayName,
        action: "requested higher access for",
        target: projectName,
        targetType: "link",
        tone: "request",
      };
    case AuditAction.ENVIRONMENT_CREATED:
      return {
        user: displayName,
        action: "created environment",
        target: environmentName,
        targetType: "text",
        tone: "create",
      };
    case AuditAction.ENVIRONMENT_DELETED:
      return {
        user: displayName,
        action: "deleted environment",
        target: environmentName,
        targetType: "text",
        tone: "delete",
      };
    case AuditAction.ENVIRONMENT_ACCESS_GRANTED:
      return {
        user: displayName,
        action: "granted environment access in",
        target: environmentName,
        targetType: "text",
        tone: "access",
      };
    case AuditAction.ENVIRONMENT_ACCESS_UPDATED:
      return {
        user: displayName,
        action: "updated environment access in",
        target: environmentName,
        targetType: "text",
        tone: "access",
      };
    case AuditAction.ENVIRONMENT_ACCESS_REMOVED:
      return {
        user: displayName,
        action: "removed environment access from",
        target: environmentName,
        targetType: "text",
        tone: "access",
      };
    case AuditAction.KEY_CREATED:
      return {
        user: displayName,
        action: "created",
        target: secretName,
        targetType: "code",
        tone: "create",
      };
    case AuditAction.KEY_UPDATED:
      return {
        user: displayName,
        action: "updated",
        target: secretName,
        targetType: "code",
        tone: "update",
      };
    case AuditAction.KEY_DELETED:
      return {
        user: displayName,
        action: "deleted",
        target: secretName,
        targetType: "code",
        tone: "delete",
      };
  }

  if (normalizedActionType === AuditActionType.CREATE) {
    return {
      user: displayName,
      action: "created",
      target: audit.secret ? secretName : audit.environment ? environmentName : projectName,
      targetType: audit.secret ? "code" : audit.project ? "link" : "text",
      tone: "create",
    };
  }

  if (normalizedActionType === AuditActionType.UPDATE) {
    return {
      user: displayName,
      action: "updated",
      target: audit.secret ? secretName : audit.environment ? environmentName : projectName,
      targetType: audit.secret ? "code" : "text",
      tone: "update",
    };
  }

  if (normalizedActionType === AuditActionType.DELETE) {
    return {
      user: displayName,
      action: "deleted",
      target: audit.secret ? secretName : audit.environment ? environmentName : projectName,
      targetType: audit.secret ? "code" : "text",
      tone: "delete",
    };
  }

  return {
    user: displayName,
    action: (audit.action?.toLowerCase() ?? "updated").replace(/_/g, " "),
    target: audit.secret?.keyName ?? audit.environment?.name ?? audit.project?.name ?? "activity",
    targetType: audit.secret ? "code" : audit.project ? "link" : "text",
    tone: "default",
  };
};
