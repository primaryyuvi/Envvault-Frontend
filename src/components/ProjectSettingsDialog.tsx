import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  Info,
  Lock,
  LoaderCircle,
  Settings,
  Trash2,
} from "lucide-react";
import { TeamDialogShell } from "./TeamDialogShell";
import type { OwnedProject } from "../types/team";

interface ProjectSettingsDialogProps {
  isOpen: boolean;
  project: OwnedProject | null;
  onClose: () => void;
  onDelete: (projectId: string) => Promise<void>;
  isDeleting?: boolean;
  errorMessage?: string | null;
}

export const ProjectSettingsDialog: React.FC<ProjectSettingsDialogProps> = ({
  isOpen,
  project,
  onClose,
  onDelete,
  isDeleting = false,
  errorMessage,
}) => {
  const [projectName, setProjectName] = useState(project?.name ?? "");

  useEffect(() => {
    setProjectName(project?.name ?? "");
  }, [project]);

  if (!isOpen || !project) {
    return null;
  }

  return (
    <TeamDialogShell onClose={onClose}>
      <div className="border-b border-slate-800 px-8 py-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-[#111722]">
            <Settings className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Project Settings
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Review the project configuration exposed by the current team APIs.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 overflow-y-auto px-8 py-6 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
        {errorMessage && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Info className="h-4 w-4 text-blue-500" />
            <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              General Information
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.22em] text-slate-300">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-[#0b0e14]/70 px-4 py-3 text-sm text-slate-500 outline-none"
                placeholder="Project name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.22em] text-slate-300">
                Project Slug/ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={project.name.toLowerCase().replace(/\s+/g, "-")}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-[#0b0e14]/70 px-4 py-3 pr-11 text-sm text-slate-500 outline-none"
                />
                <Lock className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-[0.22em] text-slate-300">
              Environments
            </label>
            <div className="relative">
              <select
                disabled
                className="w-full appearance-none rounded-xl border border-slate-800 bg-[#0b0e14]/70 px-4 py-3 text-sm text-slate-500 outline-none"
              >
                {project.environments.map((environment) => (
                  <option key={environment.id}>{environment.name}</option>
                ))}
              </select>
              <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
            </div>
            <p className="text-[11px] italic text-slate-500">
              Project settings are currently read-only here. Deletion is available below.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-red-500/20 pb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-red-500">
              Danger Zone
            </h3>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-200">
                  Delete this project
                </h4>
                <p className="text-xs text-slate-400">
                  This permanently removes the project and all project-scoped access tied to it.
                </p>
              </div>
              <button
                onClick={() => void onDelete(project.id)}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete Project
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-end border-t border-slate-800 bg-[#0b0e14]/70 px-8 py-6">
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
        >
          Close
        </button>
      </div>
    </TeamDialogShell>
  );
};
