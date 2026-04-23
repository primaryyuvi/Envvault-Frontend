import type { User } from "../types/user";
import { apiGet, apiPatch } from "../utils/ApiClient";

export type UpdateUserInput = {
  displayName: string;
  username: string;
  bio: string;
  workspace: string;
};

export async function getUser(){
  const response = await apiGet<User>(`/user/`);
  return response.data;
}

export async function updateUser({
  displayName,
  username,
  bio,
  workspace,
}: UpdateUserInput) {
  const response = await apiPatch<User>(`/user/`, {
    displayName,
    username,
    bio,
    workspace,
  });
  return response.data;
}
