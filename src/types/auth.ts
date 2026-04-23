import type { User } from "./user";

export interface AuthContextType {
  user: User | null;
  register: (
    displayName: string,
    fullName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentUser: (user: User) => void;
}

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterRequest = {
  email: string;
  displayName: string;
  fullName: string;
  passwordHash: string;
  publicKey: string;
  encryptedPrivateKey: string;
  privateKeyIV: string;
};

export type LoginRequest = {
  email: string;
  passwordHash: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
  publicKey: string;
  encryptedPrivateKey: string;
  privateKeyIV: string;
  message?: string;
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken?: string;
};
