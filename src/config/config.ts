const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const config = {
  API_BASE_URL: normalizeBaseUrl(apiBaseUrl || ""),
  APP_NAME: "Envvault",
  DEFAULT_LANGUAGE: "en",
};
