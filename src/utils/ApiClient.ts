import axios from "axios";
import type { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { config } from "../config/config";
import { getStoredTokens } from "./secureSession";

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  success: boolean;
}

type RefreshAccessTokenHandler = () => Promise<string | null>;
type UnauthorizedHandler = () => void;

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshAccessTokenHandler: RefreshAccessTokenHandler | null = null;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export const setApiAuthHandlers = (handlers: {
  refreshAccessToken?: RefreshAccessTokenHandler | null;
  onUnauthorized?: UnauthorizedHandler | null;
}) => {
  refreshAccessTokenHandler = handlers.refreshAccessToken ?? null;
  unauthorizedHandler = handlers.onUnauthorized ?? null;
};

export const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((request: InternalAxiosRequestConfig) => {
  const { accessToken } = getStoredTokens();
  if (accessToken) {
    request.headers.Authorization = `Bearer ${accessToken}`;
  }
  return request;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const request = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      request &&
      !request._retry &&
      refreshAccessTokenHandler
    ) {
      request._retry = true;
      const nextAccessToken = await refreshAccessTokenHandler();

      if (nextAccessToken) {
        request.headers.Authorization = `Bearer ${nextAccessToken}`;
        return apiClient(request);
      }
    }

    if (error.response?.status === 401) {
      unauthorizedHandler?.();
    }

    const apiError = {
      message:
        error.response?.data?.message ||
        error.message ||
        "A network error occurred. Please try again.",
      statusCode: error.response?.status || 500,
    };

    return Promise.reject(apiError);
  },
);

const unwrap = async <T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<ApiResponse<T>> => {
  const response = await request;
  return response.data;
};

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return unwrap(apiClient.get<ApiResponse<T>>(url, config));
}

export async function apiPost<T>(
  url: string,
  data: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return unwrap(apiClient.post<ApiResponse<T>>(url, data, config));
}

export async function apiPut<T>(
  url: string,
  data: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return unwrap(apiClient.put<ApiResponse<T>>(url, data, config));
}

export async function apiPatch<T>(
  url: string,
  data: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return unwrap(apiClient.patch<ApiResponse<T>>(url, data, config));
}

export async function apiDelete<T>(
  url: string,
  data: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return unwrap(apiClient.delete<ApiResponse<T>>(url, { ...config, data }));
}
