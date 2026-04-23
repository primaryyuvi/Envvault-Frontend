import type { User } from "./user";

export interface AuthContextType {
  user: User | null;
  register: (displayName: string, fullName: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export type AuthResponse = {
  user: User;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
};
