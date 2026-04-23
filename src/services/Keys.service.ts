import type {
  DecryptedSecret,
  EncryptedSecret,
  GetEncryptedKeysByEnvironmentData,
  GetKeysByEnvironmentData,
  Key,
  KeyVersion,
} from "../types/key";
import { apiDelete, apiGet, apiPatch, apiPost } from "../utils/ApiClient";
import { decryptSecretValue, encryptSecretValue } from "../utils/crypto";
import { getProjectMasterKey } from "./Project.service";

const decryptSecretRecord = async (
  projectKeyBase64: string,
  secret: EncryptedSecret,
): Promise<DecryptedSecret> => {
  const encryptedValue = secret.version?.encryptedValue ?? secret.encryptedValue;
  const iv = secret.version?.iv ?? secret.iv;

  if (!encryptedValue || !iv) {
    throw new Error("Missing encrypted secret payload");
  }

  return {
    id: secret.id,
    keyName: secret.keyName,
    environment: secret.environment,
    value: await decryptSecretValue(encryptedValue, iv, projectKeyBase64),
    version: secret.version
      ? {
          id: secret.version.id,
          version: secret.version.version,
          value: await decryptSecretValue(
            secret.version.encryptedValue ?? encryptedValue,
            secret.version.iv ?? iv,
            projectKeyBase64,
          ),
          createdAt: secret.version.createdAt,
          createdBy: secret.version.createdBy,
        }
      : undefined,
    createdAt: secret.createdAt,
    updatedAt: secret.updatedAt,
  };
};

export async function getKeysByEnvironment(
  projectId: string,
  environmentId: string,
): Promise<GetKeysByEnvironmentData> {
  const projectKeyBase64 = await getProjectMasterKey(projectId);
  const response = await apiGet<GetEncryptedKeysByEnvironmentData>(`/keys/env/${environmentId}`);
  const encryptedSecrets = Array.isArray(response.data?.secrets) ? response.data.secrets : [];

  const decryptedSecrets = await Promise.allSettled(
    encryptedSecrets.map((secret) => decryptSecretRecord(projectKeyBase64, secret)),
  );

  return {
    secrets: decryptedSecrets
      .filter((result): result is PromiseFulfilledResult<DecryptedSecret> => result.status === "fulfilled")
      .map((result) => result.value),
    count:
      typeof response.data?.count === "number"
        ? response.data.count
        : encryptedSecrets.length,
    errors: decryptedSecrets.reduce<Array<{ keyName?: string; error?: string }>>(
      (errors, result, index) => {
        if (result.status === "rejected") {
          errors.push({
            keyName: encryptedSecrets[index]?.keyName,
            error:
              result.reason instanceof Error
                ? result.reason.message
                : "Failed to decrypt",
          });
        }
        return errors;
      },
      [],
    ),
  };
}

export async function createKey(
  projectId: string,
  secretName: string,
  environmentId: string,
  value: string,
  projectMemberId?: string,
) {
  const projectKeyBase64 = await getProjectMasterKey(projectId);
  const encryptedSecret = await encryptSecretValue(value, projectKeyBase64);
  const response = await apiPost<Key>("/keys/", {
    secretName,
    environmentId,
    encryptedValue: encryptedSecret.encryptedValue,
    iv: encryptedSecret.iv,
    projectMemberId,
  });
  return response.data;
}

export async function removeKey(secretId: string) {
  const response = await apiDelete<string>(`/keys/${secretId}`, {});
  return response.data;
}

export async function updateKey(
  projectId: string,
  value: string,
  secretId: string,
  secretName?: string,
) {
  const projectKeyBase64 = await getProjectMasterKey(projectId);
  const encryptedSecret = await encryptSecretValue(value, projectKeyBase64);
  const response = await apiPatch<KeyVersion>(`/keys/${secretId}`, {
    encryptedValue: encryptedSecret.encryptedValue,
    iv: encryptedSecret.iv,
    ...(secretName !== undefined ? { secretName } : {}),
  });
  return response.data;
}
