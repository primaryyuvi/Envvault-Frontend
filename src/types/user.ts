import type { AuditLog } from "./audit";
import type { KeyVersion, SecretVersion } from "./key";
import type { ProjectMember } from "./project";

export type User = {
  id: string;
  email?: string;
  username?: string | null;
  userName?: string | null;
  displayName?: string | null;
  fullName?: string | null;
  bio?: string | null;
  workspace?: string | null;
  defaultWorkspace?: string | null;
  passwordHash?: string;
  refreshToken?: string | null;
  isActive?: boolean | null;
  publicKey?: string | null;
  encryptedPrivateKey?: string | null;
  privateKeyIV?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  projectMemberships?: ProjectMember[];
  projectMemberShips?: ProjectMember[];
  createdVersions?: SecretVersion[] | KeyVersion[];
  auditLogs?: AuditLog[];
};
