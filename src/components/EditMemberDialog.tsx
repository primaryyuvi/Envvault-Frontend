import React, { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, Save, ShieldBan, UserX } from "lucide-react";
import { TeamDialogShell } from "./TeamDialogShell";
import type { ProjectMember, RoleLevel, TeamEnvironmentRole } from "../types/team";

interface EditMemberDialogProps {
  member: ProjectMember | null;
  isOpen: boolean;
  isLoading?: boolean;
  isSaving?: boolean;
  isRemoving?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSave: (roles: TeamEnvironmentRole[]) => Promise<void>;
  onRemove: () => Promise<void>;
}

const editableRoles: RoleLevel[] = [
  "No Access",
  "Guest",
  "Developer",
  "Maintainer",
];

export const EditMemberDialog: React.FC<EditMemberDialogProps> = ({
  member,
  isOpen,
  isLoading = false,
  isSaving = false,
  isRemoving = false,
  errorMessage,
  onClose,
  onSave,
  onRemove,
}) => {
  const [roles, setRoles] = useState<TeamEnvironmentRole[]>(member?.roles ?? []);

  useEffect(() => {
    setRoles(member?.roles ?? []);
  }, [member]);

  if (!isOpen || !member) {
    return null;
  }

  const handleRoleChange = (environmentId: string, role: RoleLevel) => {
    setRoles((prev) =>
      prev.map((entry) =>
        entry.environmentId === environmentId ? { ...entry, role } : entry,
      ),
    );
  };

  const hasLockedOwnerRole = member.roles.some((entry) => entry.role === "Owner");

  return (
    <TeamDialogShell onClose={onClose}>
      <div className="border-b border-slate-800 px-8 py-6">
        <div className="flex items-start gap-4">
          <button
            onClick={onClose}
            className="mt-0.5 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Edit Member Access
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Review environment roles and update access for this member.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 overflow-y-auto px-8 py-6 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
        <div className="rounded-2xl border border-slate-800 bg-[#0b0e14] px-6 py-5 text-center">
          <h3 className="text-xl font-bold text-white">{member.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{member.email}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-500">
            Joined {member.dateJoined}
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        {hasLockedOwnerRole && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Owner-level access is locked in this dialog and cannot be downgraded here.
          </div>
        )}

        <div className="grid gap-4 rounded-2xl border border-slate-800 bg-[#111722] p-4 sm:grid-cols-4">
          <RoleGuide
            title="No Access"
            colorClassName="text-slate-500"
            description="Removes this member from the environment."
          />
          <RoleGuide
            title="Guest"
            colorClassName="text-slate-300"
            description="Read-only access to secrets and configurations."
          />
          <RoleGuide
            title="Developer"
            colorClassName="text-blue-400"
            description="Limited access without secret management."
          />
          <RoleGuide
            title="Maintainer"
            colorClassName="text-emerald-400"
            description="Can manage secrets, settings, and access."
          />
        </div>

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-800 bg-[#111722]">
            <LoaderCircle className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Environment Roles
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#111722]">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0b0e14]">
                    <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Environment
                    </th>
                    {editableRoles.map((roleOption) => (
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
                  {roles.map((entry, index) => {
                    const isOwnerRole = entry.role === "Owner";

                    return (
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
                                <p className="text-xs text-slate-500">
                                  {entry.environmentSlug}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        {editableRoles.map((roleOption) => (
                          <td
                            key={`${entry.environmentId}-${roleOption}`}
                            className="px-4 py-4 text-center"
                          >
                            <input
                              type="radio"
                              name={`${entry.environmentId}_role`}
                              className="h-4 w-4 cursor-pointer border-slate-700 bg-[#0b0e14] text-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                              checked={entry.role === roleOption}
                              disabled={isOwnerRole || isSaving || isRemoving}
                              onChange={() =>
                                handleRoleChange(entry.environmentId, roleOption)
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-sm font-bold text-red-400">Danger Zone</h4>
              <p className="mt-1 text-xs text-slate-400">
                Removing {member.name.split(" ")[0]} revokes access to this
                project immediately.
              </p>
            </div>
            <button
              onClick={() => void onRemove()}
              disabled={
                isLoading || isSaving || isRemoving || member.isCurrentUser || hasLockedOwnerRole
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRemoving ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <UserX className="h-4 w-4" />
              )}
              Remove Member
            </button>
          </div>
          {(member.isCurrentUser || hasLockedOwnerRole) && (
            <div className="mt-3 flex items-start gap-2 text-xs text-slate-400">
              <ShieldBan className="mt-0.5 h-4 w-4 text-slate-500" />
              <span>
                Owner memberships and your own project access cannot be removed from here.
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-end gap-3 border-t border-slate-800 bg-[#0b0e14]/70 px-8 py-6 sm:flex-row">
        <button
          onClick={onClose}
          disabled={isSaving || isRemoving}
          className="w-full px-6 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Cancel
        </button>
        <button
          onClick={() => void onSave(roles)}
          disabled={isLoading || isSaving || isRemoving}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSaving ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </button>
      </div>
    </TeamDialogShell>
  );
};

const RoleGuide = ({
  title,
  colorClassName,
  description,
}: {
  title: string;
  colorClassName: string;
  description: string;
}) => (
  <div className="space-y-1">
    <p className={`text-[10px] font-bold uppercase tracking-wider ${colorClassName}`}>
      {title}
    </p>
    <p className="text-[11px] leading-relaxed text-slate-400">{description}</p>
  </div>
);
