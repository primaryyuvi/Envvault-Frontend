const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
// const apiBaseUrl = "http://localhost:3000/api/v1"

export const config = {
  API_BASE_URL: normalizeBaseUrl(apiBaseUrl || "https://api.envvault.in/api/v1"),
  APP_NAME: "Envvault",
  DEFAULT_LANGUAGE: "en",
};
