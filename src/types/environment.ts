import type { Project } from "./project";
import type { Key, Secret } from "./key";

export type Environment = {
  id: string;
  name?: string;
  slug?: string;
  projectId?: string;
  project?: Project;
  createdAt?: string | Date;
  secrets?: Secret[];
  keys?: Key[];
};

export type EnvironmentValues = "development" | "staging" | "production";
