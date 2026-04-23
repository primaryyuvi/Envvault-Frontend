import { createContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type {
  AuthContextType,
  AuthResponse,
  LoginRequest,
  RefreshTokenResponse,
  RegisterRequest,
} from "../types/auth";
import type { User } from "../types/user";
import LoadingSpinner from "../utils/LoadingSpinner";
import { apiClient, apiPost, setApiAuthHandlers } from "../utils/ApiClient";
import {
  clearAllSecureState,
  getStoredTokens,
  getStoredUser,
  hydrateSessionKeys,
  persistSessionKeys,
  persistTokens,
  persistUser,
} from "../utils/secureSession";
import {
  decryptPrivateKey,
  derivePasswordKey,
  encryptPrivateKey,
  exportPrivateKeyToBase64,
  exportPublicKeyToPem,
  generateRsaKeyPair,
  sha256Hex,
} from "../utils/crypto";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Authentication failed";
};

const normalizeUser = (user: User | null): User | null => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    displayName: user.displayName ?? user.username ?? user.userName ?? user.email ?? "User",
  };
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => normalizeUser(getStoredUser()));
  const [loading, setLoading] = useState(true);

  const handleUnauthorized = () => {
    clearAllSecureState();
    setUser(null);
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    const { refreshToken } = getStoredTokens();
    if (!refreshToken) {
      handleUnauthorized();
      return null;
    }

    try {
      const response = await apiPost<RefreshTokenResponse>(
        "/auth/refresh-token",
        { refreshToken },
        { headers: { Authorization: undefined } },
      );

      persistTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken ?? refreshToken,
      });

      return response.data.accessToken;
    } catch {
      handleUnauthorized();
      return null;
    }
  };

  useEffect(() => {
    setApiAuthHandlers({
      refreshAccessToken,
      onUnauthorized: handleUnauthorized,
    });

    return () => {
      setApiAuthHandlers({
        refreshAccessToken: null,
        onUnauthorized: null,
      });
    };
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const { accessToken } = getStoredTokens();

      if (!accessToken) {
        setLoading(false);
        return;
      }

      await hydrateSessionKeys();

      try {
        const response = await apiClient.get<{ user: User }>("/user/protected");
        const nextUser = normalizeUser(response.data.user);
        setUser(nextUser);
        persistUser(nextUser);
      } catch {
        handleUnauthorized();
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const completeAuthenticatedSession = async (
    response: AuthResponse,
    password: string,
    email: string,
  ) => {
    const passwordKey = await derivePasswordKey(email, password);
    const privateKeyBase64 = await decryptPrivateKey(
      response.encryptedPrivateKey,
      response.privateKeyIV,
      passwordKey,
    );

    await persistSessionKeys({
      publicKeyPem: response.publicKey,
      privateKeyBase64,
    });

    persistTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });

    const nextUser = normalizeUser({
      ...response.user,
      publicKey: response.publicKey,
      encryptedPrivateKey: response.encryptedPrivateKey,
      privateKeyIV: response.privateKeyIV,
    });

    setUser(nextUser);
    persistUser(nextUser);
  };

  const register = async (
    displayName: string,
    fullName: string,
    email: string,
    password: string,
  ) => {
    try {
      const passwordHash = await sha256Hex(password);
      const passwordKey = await derivePasswordKey(email, password);
      const rsaKeyPair = await generateRsaKeyPair();
      const publicKey = await exportPublicKeyToPem(rsaKeyPair.publicKey);
      const privateKeyBase64 = await exportPrivateKeyToBase64(rsaKeyPair.privateKey);
      const encryptedPrivateKey = await encryptPrivateKey(privateKeyBase64, passwordKey);

      const payload: RegisterRequest = {
        email,
        displayName,
        fullName,
        passwordHash,
        publicKey,
        encryptedPrivateKey: encryptedPrivateKey.encryptedPrivateKey,
        privateKeyIV: encryptedPrivateKey.privateKeyIV,
      };

      const response = await apiPost<AuthResponse>("/auth/register", payload);

      await persistSessionKeys({ publicKeyPem: publicKey, privateKeyBase64 });
      persistTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });
      const nextUser = normalizeUser({
        ...response.data.user,
        publicKey,
        encryptedPrivateKey: encryptedPrivateKey.encryptedPrivateKey,
        privateKeyIV: encryptedPrivateKey.privateKeyIV,
      });
      setUser(nextUser);
      persistUser(nextUser);
      navigate("/dashboard");
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const payload: LoginRequest = {
        email,
        passwordHash: await sha256Hex(password),
      };
      const response = await apiPost<AuthResponse>("/auth/login", payload);
      await completeAuthenticatedSession(response.data, password, email);
      navigate("/dashboard");
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const logout = async () => {
    const { refreshToken } = getStoredTokens();

    try {
      await apiPost("/user/signOut", { refreshToken });
    } catch {
      // Logout should still clear local state even if the network request fails.
    } finally {
      clearAllSecureState();
      setUser(null);
      navigate("/");
    }
  };

  const updateCurrentUser = (nextUser: User) => {
    const normalizedUser = normalizeUser(nextUser);
    setUser(normalizedUser);
    persistUser(normalizedUser);
  };

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      register,
      login,
      logout,
      updateCurrentUser,
    }),
    [user],
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
