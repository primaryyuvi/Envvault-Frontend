import type { User } from "../types/user";
import {
  importPrivateKeyFromBase64,
  importProjectKeyFromBase64,
  importPublicKeyFromPem,
} from "./crypto";

const ACCESS_TOKEN_KEY = "envvault.accessToken";
const REFRESH_TOKEN_KEY = "envvault.refreshToken";
const USER_KEY = "envvault.user";
const PUBLIC_KEY_KEY = "envvault.publicKey";
const PRIVATE_KEY_KEY = "envvault.privateKey";

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

type CryptoState = {
  publicKeyPem: string | null;
  publicKey: CryptoKey | null;
  privateKeyBase64: string | null;
  privateKey: CryptoKey | null;
  projectKeys: Map<string, string>;
  projectCryptoKeys: Map<string, CryptoKey>;
};

const cryptoState: CryptoState = {
  publicKeyPem: null,
  publicKey: null,
  privateKeyBase64: null,
  privateKey: null,
  projectKeys: new Map<string, string>(),
  projectCryptoKeys: new Map<string, CryptoKey>(),
};

const isBrowser = typeof window !== "undefined";

const readStorage = (storage: Storage, key: string): string | null => {
  if (!isBrowser) {
    return null;
  }
  return storage.getItem(key);
};

const writeStorage = (storage: Storage, key: string, value: string | null) => {
  if (!isBrowser) {
    return;
  }

  if (value === null) {
    storage.removeItem(key);
    return;
  }

  storage.setItem(key, value);
};

export const getStoredTokens = (): Partial<TokenPair> => ({
  accessToken: readStorage(localStorage, ACCESS_TOKEN_KEY) ?? undefined,
  refreshToken: readStorage(localStorage, REFRESH_TOKEN_KEY) ?? undefined,
});

export const persistTokens = (tokens: Partial<TokenPair>) => {
  writeStorage(localStorage, ACCESS_TOKEN_KEY, tokens.accessToken ?? null);
  writeStorage(localStorage, REFRESH_TOKEN_KEY, tokens.refreshToken ?? null);
};

export const clearTokens = () => {
  writeStorage(localStorage, ACCESS_TOKEN_KEY, null);
  writeStorage(localStorage, REFRESH_TOKEN_KEY, null);
};

export const getStoredUser = (): User | null => {
  const value = readStorage(localStorage, USER_KEY);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as User;
  } catch {
    return null;
  }
};

export const persistUser = (user: User | null) => {
  writeStorage(localStorage, USER_KEY, user ? JSON.stringify(user) : null);
};

export const persistSessionKeys = async (payload: {
  publicKeyPem: string;
  privateKeyBase64: string;
}) => {
  cryptoState.publicKeyPem = payload.publicKeyPem;
  cryptoState.privateKeyBase64 = payload.privateKeyBase64;
  cryptoState.publicKey = await importPublicKeyFromPem(payload.publicKeyPem);
  cryptoState.privateKey = await importPrivateKeyFromBase64(payload.privateKeyBase64);
  writeStorage(sessionStorage, PUBLIC_KEY_KEY, payload.publicKeyPem);
  writeStorage(sessionStorage, PRIVATE_KEY_KEY, payload.privateKeyBase64);
};

export const hydrateSessionKeys = async (): Promise<boolean> => {
  const publicKeyPem = readStorage(sessionStorage, PUBLIC_KEY_KEY);
  const privateKeyBase64 = readStorage(sessionStorage, PRIVATE_KEY_KEY);

  if (!publicKeyPem || !privateKeyBase64) {
    return false;
  }

  try {
    await persistSessionKeys({ publicKeyPem, privateKeyBase64 });
    return true;
  } catch {
    clearSessionKeys();
    return false;
  }
};

export const clearSessionKeys = () => {
  cryptoState.publicKeyPem = null;
  cryptoState.publicKey = null;
  cryptoState.privateKeyBase64 = null;
  cryptoState.privateKey = null;
  cryptoState.projectKeys.clear();
  cryptoState.projectCryptoKeys.clear();
  writeStorage(sessionStorage, PUBLIC_KEY_KEY, null);
  writeStorage(sessionStorage, PRIVATE_KEY_KEY, null);
};

export const getPublicKeyPem = (): string | null => cryptoState.publicKeyPem;
export const getPublicKey = (): CryptoKey | null => cryptoState.publicKey;
export const getPrivateKeyBase64 = (): string | null => cryptoState.privateKeyBase64;
export const getPrivateKey = (): CryptoKey | null => cryptoState.privateKey;

export const cacheProjectKey = async (projectId: string, projectKeyBase64: string) => {
  cryptoState.projectKeys.set(projectId, projectKeyBase64);
  cryptoState.projectCryptoKeys.set(
    projectId,
    await importProjectKeyFromBase64(projectKeyBase64),
  );
};

export const getCachedProjectKeyBase64 = (projectId: string): string | null =>
  cryptoState.projectKeys.get(projectId) ?? null;

export const getCachedProjectCryptoKey = (projectId: string): CryptoKey | null =>
  cryptoState.projectCryptoKeys.get(projectId) ?? null;

export const clearCachedProjectKey = (projectId: string) => {
  cryptoState.projectKeys.delete(projectId);
  cryptoState.projectCryptoKeys.delete(projectId);
};

export const clearAllSecureState = () => {
  clearTokens();
  persistUser(null);
  clearSessionKeys();
};
