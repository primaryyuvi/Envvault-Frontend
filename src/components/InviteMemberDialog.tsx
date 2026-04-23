import React, { useEffect, useState } from "react";
import { Info, LoaderCircle, SendHorizonal } from "lucide-react";
import { TeamDialogShell } from "./TeamDialogShell";
import type {
  OwnedProject,
  RoleLevel,
  TeamEnvironment,
  TeamEnvironmentRole,
} from "../types/team";

interface InviteMemberDialogProps {
  isOpen: boolean;
  project: OwnedProject | null;
  onClose: () => void;
  onSendInvite: (payload: {
    emails: string[];
    message: string;
    roles: TeamEnvironmentRole[];
  }) => Promise<void>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

const assignableRoles: RoleLevel[] = [
  "No Access",
  "Guest",
  "Developer",
  "Maintainer",
];

const buildDefaultRoles = (
  environments: TeamEnvironment[],
): TeamEnvironmentRole[] =>
  environments.map((environment) => ({
    environmentId: environment.id,
    environmentName: environment.name,
    environmentSlug: environment.slug,
    role: "No Access",
  }));

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  isOpen,
  project,
  onClose,
  onSendInvite,
  isSubmitting = false,
  errorMessage,
}) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [message, setMessage] = useState("");
  const [roles, setRoles] = useState<TeamEnvironmentRole[]>(
    buildDefaultRoles(project?.environments ?? []),
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setEmails([]);
    setInputValue("");
    setMessage("");
    setRoles(buildDefaultRoles(project?.environments ?? []));
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

  const addEmail = () => {
    const normalized = inputValue.trim().toLowerCase();
    if (!normalized || emails.includes(normalized)) {
      return;
    }

    setEmails((prev) => [...prev, normalized]);
    setInputValue("");
  };

  const selectedEnvironmentCount = roles.filter(
    (entry) => entry.role !== "No Access",
  ).length;

  return (
    <TeamDialogShell onClose={onClose}>
      <div className="border-b border-slate-800 px-8 py-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Invite to Project
        </h2>
        <p className="mt-1 text-sm text-slate-400">{project.name}</p>
      </div>

      <div className="space-y-8 overflow-y-auto px-8 py-6 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
        {errorMessage && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Add People
          </label>
          <div className="rounded-2xl border border-slate-800 bg-[#0b0e14] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              {emails.map((email) => (
                <button
                  key={email}
                  type="button"
                  onClick={() =>
                    setEmails((prev) => prev.filter((item) => item !== email))
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300"
                >
                  {email}
                  <span className="text-slate-300">x</span>
                </button>
              ))}
              <input
                className="min-w-[180px] flex-1 bg-transparent p-1 text-sm text-white outline-none placeholder:text-slate-600"
                placeholder="Add emails... (press Enter)"
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addEmail();
                  } else if (
                    event.key === "Backspace" &&
                    !inputValue &&
                    emails.length > 0
                  ) {
                    setEmails((prev) => prev.slice(0, -1));
                  }
                }}
                onBlur={addEmail}
              />
            </div>
          </div>
        </div>

        <RoleLegend />

        <EnvironmentRoleTable
          roles={roles}
          onRoleChange={handleRoleChange}
        />

        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Add a Message
          </label>
          <textarea
            className="min-h-[110px] w-full resize-none rounded-2xl border border-slate-800 bg-[#0b0e14] p-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Welcome to the project. Here are the expectations for this environment..."
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-800 bg-[#0b0e14]/70 px-8 py-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="h-4 w-4 text-blue-500" />
          {selectedEnvironmentCount === 0
            ? "Select at least one environment role before sending."
            : "Assignments will be created for the selected environments."}
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
              void onSendInvite({
                emails,
                message,
                roles,
              })
            }
            disabled={isSubmitting || emails.length === 0 || selectedEnvironmentCount === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-8 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none"
          >
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
            Send Invite
          </button>
        </div>
      </div>
    </TeamDialogShell>
  );
};

const RoleLegend = () => (
  <div className="grid gap-4 rounded-2xl border border-slate-800 bg-[#111722] p-4 sm:grid-cols-4">
    <LegendItem
      title="No Access"
      titleClassName="text-slate-500"
      description="Skip this environment during assignment."
    />
    <LegendItem
      title="Guest"
      titleClassName="text-slate-300"
      description="Read-only access to secrets."
    />
    <LegendItem
      title="Developer"
      titleClassName="text-blue-400"
      description="Limited access without secret management."
    />
    <LegendItem
      title="Maintainer"
      titleClassName="text-emerald-400"
      description="Can manage secrets and environment settings."
    />
  </div>
);

const EnvironmentRoleTable = ({
  roles,
  onRoleChange,
}: {
  roles: TeamEnvironmentRole[];
  onRoleChange: (environmentId: string, role: RoleLevel) => void;
}) => (
  <div className="space-y-4">
    <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
      Environment-Specific Roles
    </h4>
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#111722]">
      <table className="w-full min-w-[700px] text-left">
        <thead>
          <tr className="border-b border-slate-800 bg-[#0b0e14]">
            <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Environment
            </th>
            {assignableRoles.map((roleOption) => (
              <th
                key={roleOption}
                className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500"
              >
                {roleOption}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {roles.map((entry, index) => (
            <tr key={entry.environmentId} className="hover:bg-white/5">
              <td className="px-6 py-4">
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
                  <div>
                    <span className="text-sm font-semibold text-white">
                      {entry.environmentName}
                    </span>
                    {entry.environmentSlug && (
                      <p className="text-xs text-slate-500">{entry.environmentSlug}</p>
                    )}
                  </div>
                </div>
              </td>
              {assignableRoles.map((roleOption) => (
                <td
                  key={`${entry.environmentId}-${roleOption}`}
                  className="px-4 py-4 text-center"
                >
                  <input
                    type="radio"
                    name={`invite_${entry.environmentId}_role`}
                    className="h-4 w-4 cursor-pointer border-slate-700 bg-[#0b0e14] text-blue-500 focus:ring-blue-500"
                    checked={entry.role === roleOption}
                    onChange={() => onRoleChange(entry.environmentId, roleOption)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const LegendItem = ({
  title,
  titleClassName,
  description,
}: {
  title: string;
  titleClassName: string;
  description: string;
}) => (
  <div className="space-y-1">
    <p className={`text-[10px] font-bold uppercase tracking-wider ${titleClassName}`}>
      {title}
    </p>
    <p className="text-[11px] leading-relaxed text-slate-400">{description}</p>
  </div>
);
