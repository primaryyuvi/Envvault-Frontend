import React, { useEffect, useState } from "react";
import { Info, LoaderCircle, SendHorizonal } from "lucide-react";
import { TeamDialogShell } from "./TeamDialogShell";
import type {
  JoinedProject,
  RoleLevel,
  TeamEnvironmentRole,
} from "../types/team";

interface RequestAccessDialogProps {
  isOpen: boolean;
  project: JoinedProject | null;
  onClose: () => void;
  onSubmit: (payload: {
    message: string;
    roles: TeamEnvironmentRole[];
  }) => Promise<void>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

const requestableRoles: RoleLevel[] = [
  "No Access",
  "Guest",
  "Developer",
  "Maintainer",
];

const roleDescriptions: Record<RoleLevel, string> = {
  "No Access": "Do not include this environment in the request.",
  Guest: "Read-only access to secrets and logs.",
  Developer: "Limited access without secret management.",
  Maintainer: "Can manage secrets and environment settings.",
  Owner: "Full ownership access.",
  "Read Only": "Read-only access.",
};

const nextSuggestedRole = (role?: RoleLevel): RoleLevel => {
  switch (role) {
    case "No Access":
      return "Guest";
    case "Guest":
    case "Read Only":
      return "Developer";
    case "Developer":
      return "Maintainer";
    default:
      return "No Access";
  }
};

const buildDefaultRoles = (project: JoinedProject | null): TeamEnvironmentRole[] => {
  const currentUser = project?.visibleMembers.find((member) => member.isCurrentUser);

  return (project?.environments ?? []).map((environment) => ({
    environmentId: environment.id,
    environmentName: environment.name,
    environmentSlug: environment.slug,
    role: nextSuggestedRole(
      currentUser?.roles.find((entry) => entry.environmentId === environment.id)?.role,
    ),
  }));
};

export const RequestAccessDialog: React.FC<RequestAccessDialogProps> = ({
  isOpen,
  project,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage,
}) => {
  const [roles, setRoles] = useState<TeamEnvironmentRole[]>(buildDefaultRoles(project));
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setRoles(buildDefaultRoles(project));
    setReason("");
  }, [isOpen, project]);

  if (!isOpen || !project) {
    return null;
  }

  const handleRoleChange = (environmentId: string, role: RoleLevel) => {
    setRoles((prev) =>
      prev.map((entry) =>
        entry.environmentId === environmentId ? { ...entry, role } : entry,
      ),
    );
  };

  const selectedEnvironmentCount = roles.filter(
    (entry) => entry.role !== "No Access",
  ).length;

  return (
    <TeamDialogShell onClose={onClose} maxWidthClassName="max-w-4xl">
      <div className="border-b border-slate-800 px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Request More Access
            </h2>
            <p className="mt-1 text-sm text-slate-400">{project.name}</p>
          </div>
          <div className="inline-flex w-fit items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
            {selectedEnvironmentCount} environment
            {selectedEnvironmentCount !== 1 ? "s" : ""} selected
          </div>
        </div>
      </div>

      <div className="space-y-6 overflow-y-auto px-6 py-6 sm:px-8 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
        {errorMessage && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <div className="rounded-2xl border border-slate-800 bg-[#111722] p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 text-blue-400" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">How this works</p>
              <p className="text-sm leading-6 text-slate-400">
                Select the access level you need per environment, then explain why.
                Only the environments you choose will be included in the request sent to the project owner.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              Environment Permissions
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              Pick one role for each environment.
            </p>
          </div>

          <div className="space-y-4">
            {roles.map((entry, index) => (
              <section
                key={entry.environmentId}
                className="rounded-2xl border border-slate-800 bg-[#111722] p-4 sm:p-5"
              >
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          index % 3 === 0
                            ? "bg-red-500"
                            : index % 3 === 1
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <p className="truncate text-base font-semibold text-white">
                        {entry.environmentName}
                      </p>
                    </div>
                    {entry.environmentSlug && (
                      <p className="mt-1 pl-5 text-xs text-slate-500">
                        {entry.environmentSlug}
                      </p>
                    )}
                  </div>
                  <div className="w-fit rounded-full border border-slate-700 bg-[#0b0e14] px-3 py-1 text-xs font-medium text-slate-400">
                    Current request: {entry.role}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {requestableRoles.map((roleOption) => {
                    const isSelected = entry.role === roleOption;

                    return (
                      <label
                        key={`${entry.environmentId}-${roleOption}`}
                        className={`flex cursor-pointer flex-col gap-2 rounded-xl border px-4 py-4 transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.25)]"
                            : "border-slate-800 bg-[#0b0e14] hover:border-slate-700 hover:bg-[#101520]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p
                              className={`text-sm font-semibold ${
                                isSelected ? "text-white" : "text-slate-200"
                              }`}
                            >
                              {roleOption}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {roleDescriptions[roleOption]}
                            </p>
                          </div>
                          <input
                            type="radio"
                            name={`request_${entry.environmentId}_role`}
                            className="mt-1 h-4 w-4 shrink-0 cursor-pointer border-slate-700 bg-[#0b0e14] text-blue-500 focus:ring-blue-500"
                            checked={isSelected}
                            onChange={() => handleRoleChange(entry.environmentId, roleOption)}
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-800 bg-[#111722] p-4 sm:grid-cols-2 xl:grid-cols-4">
          <GuideItem
            title="No Access"
            description="Leaves this environment out of the request."
          />
          <GuideItem
            title="Guest"
            description="Read-only access to secrets and logs."
          />
          <GuideItem
            title="Developer"
            description="Limited access without secret management."
          />
          <GuideItem
            title="Maintainer"
            description="Can manage secrets and environment settings."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              Reason for Request
            </label>
            <span className="text-xs text-slate-500">
              {reason.trim().length} characters
            </span>
          </div>
          <textarea
            className="min-h-[140px] w-full resize-none rounded-2xl border border-slate-800 bg-[#0b0e14] p-4 text-sm leading-6 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Explain why you need higher access, what work you need to do, and which environments are affected."
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-800 bg-[#0b0e14]/70 px-6 py-6 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-slate-500">
          {selectedEnvironmentCount === 0
            ? "Choose at least one environment before submitting."
            : `This request will include ${selectedEnvironmentCount} selected environment${selectedEnvironmentCount !== 1 ? "s" : ""}.`}
        </div>
        <div className="flex w-full items-center gap-3 md:w-auto">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50 md:flex-none"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              void onSubmit({
                message: reason,
                roles,
              })
            }
            disabled={isSubmitting || selectedEnvironmentCount === 0 || !reason.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-8 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none"
          >
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
            Submit Request
          </button>
        </div>
      </div>
    </TeamDialogShell>
  );
};

const GuideItem = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
      {title}
    </p>
    <p className="text-[11px] leading-relaxed text-slate-400">{description}</p>
  </div>
);
