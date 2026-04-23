import type { AuditLog } from "./audit";
import type { Environment } from "./environment";
import type { ProjectMember } from "./project";
import type { User } from "./user";

export type Key = {
  id: string;
  keyName?: string;
  environmentId?: string;
  environment?: Environment;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  versions?: KeyVersion[];
  accessControls?: KeyAccessControl[];
  auditLogs?: AuditLog[];
};

export type KeyVersion = {
  id: string;
  keyId?: string;
  key?: Key;
  secretId?: string;
  secret?: Key;
  version?: number;
  encryptedValue?: string;
  iv?: string;
  authTag?: string | null;
  createdBy?: string | null;
  creator?: User | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type KeyAccessControl = {
  id: string;
  memberId?: string;
  member?: ProjectMember;
  keyId?: string;
  key?: Key;
  secretId?: string;
  secret?: Key;
  canRead?: boolean;
  canWrite?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type KeyAccessControls = KeyAccessControl;
export type Secret = Key;
export type SecretVersion = KeyVersion;
export type SecretAccessControl = KeyAccessControl;

export type EncryptedSecret = {
  id: string;
  keyName?: string;
  environment?: string;
  encryptedValue?: string;
  iv?: string;
  version?: {
    id: string;
    version?: number;
    encryptedValue?: string;
    iv?: string;
    createdAt?: string | Date;
    createdBy?: string;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type DecryptedKeyVersion = {
  id: string;
  version?: number;
  value?: string;
  createdAt?: string | Date;
  createdBy?: string;
};

export type DecryptedSecret = {
  id: string;
  keyName?: string;
  value?: string;
  environment?: string;
  version?: DecryptedKeyVersion;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type GetKeysByEnvironmentData = {
  secrets?: DecryptedSecret[];
  count?: number;
  errors?: Array<{
    keyName?: string;
    error?: string;
  }>;
};

export type GetEncryptedKeysByEnvironmentData = {
  secrets?: EncryptedSecret[];
  count?: number;
};
