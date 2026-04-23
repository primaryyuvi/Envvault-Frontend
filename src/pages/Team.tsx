import React, { useContext, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpCircle,
  CheckCircle,
  ChevronRight,
  Folder,
  LoaderCircle,
  LogOut,
  Settings,
  UserPlus,
} from "lucide-react";
import { EditMemberDialog } from "../components/EditMemberDialog";
import { InviteMemberDialog } from "../components/InviteMemberDialog";
import { ProjectSettingsDialog } from "../components/ProjectSettingsDialog";
import { RequestAccessDialog } from "../components/RequestAccessDialog";
import { AuthContext } from "../contexts/AuthContext";
import LoadingSpinner from "../utils/LoadingSpinner";
import {
  addEnvironmentMember,
  getEnvironmentMembers,
  removeEnvironmentMember,
  updateEnvironmentMember,
} from "../services/Environment.service";
import {
  bulkAssignProjectMembers,
  deleteProject,
  getMemberProjectsDetailed,
  getOwnedProjectsDetailed,
  leaveProject,
  requestProjectAccess,
  type DetailedProject,
  type DetailedProjectMember,
  type EnvironmentAccessRole,
  type ProjectEnvironmentRoleAssignment,
} from "../services/Project.service";
import type {
  JoinedProject,
  OwnedProject,
  ProjectMember,
  RoleLevel,
  TeamEnvironment,
  TeamEnvironmentRole,
} from "../types/team";

const getRoleStyles = (role: RoleLevel): string => {
  switch (role) {
    case "Owner":
      return "text-[#1a75ff] font-bold";
    case "Maintainer":
      return "text-slate-300 font-semibold";
    case "Developer":
      return "text-slate-400";
    case "Guest":
      return "text-slate-500 font-medium italic";
    case "No Access":
      return "text-slate-600 font-bold uppercase tracking-tighter";
    case "Read Only":
      return "text-slate-500 italic";
    default:
      return "text-slate-400";
  }
};

type ToastState = {
  message: string;
  type: "success" | "error";
} | null;

type EditContext = {
  project: OwnedProject;
  member: ProjectMember;
} | null;

const toRoleLevel = (role?: string | null): RoleLevel => {
  const normalized = role?.trim().replace(/\s+/g, "_").toUpperCase();

  switch (normalized) {
    case "OWNER":
      return "Owner";
    case "MAINTAINER":
      return "Maintainer";
    case "DEVELOPER":
      return "Developer";
    case "GUEST":
      return "Guest";
    case "READ_ONLY":
      return "Read Only";
    case "NO_ACCESS":
      return "No Access";
    default:
      return "No Access";
  }
};

const toApiRole = (role: RoleLevel): EnvironmentAccessRole | null => {
  switch (role) {
    case "Maintainer":
      return "MAINTAINER";
    case "Developer":
      return "DEVELOPER";
    case "Guest":
      return "GUEST";
    case "Read Only":
      return "READ_ONLY";
    default:
      return null;
  }
};

const isOwnerMember = (member: ProjectMember): boolean =>
  member.roles.some((role) => role.role === "Owner");

const formatDisplayDate = (value?: string | Date): string => {
  if (!value) {
    return "Unknown";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const getInitials = (value: string): string => {
  const parts = value
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "NA";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
};

const getDisplayName = (member: DetailedProjectMember): string =>
  member.user?.displayName?.trim() ||
  member.user?.username?.trim() ||
  member.user?.userName?.trim() ||
  member.user?.email?.trim() ||
  "Unknown user";

const getEmail = (member: DetailedProjectMember): string =>
  member.user?.email?.trim() || "No email";

const getMemberAssignments = (
  member: DetailedProjectMember,
): ProjectEnvironmentRoleAssignment[] =>
  member.environmentRoles ?? member.environments ?? [];

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

const normalizeProjectEnvironments = (project: DetailedProject): TeamEnvironment[] => {
  const environments = new Map<string, TeamEnvironment>();

  for (const environment of project.environments ?? []) {
    if (!environment.id) {
      continue;
    }

    environments.set(environment.id, {
      id: environment.id,
      name: environment.name?.trim() || environment.slug?.trim() || environment.id,
      slug: environment.slug ?? undefined,
    });
  }

  for (const member of project.members) {
    for (const role of getMemberAssignments(member)) {
      if (!role.environmentId || environments.has(role.environmentId)) {
        continue;
      }

      environments.set(role.environmentId, {
        id: role.environmentId,
        name:
          role.environmentName?.trim() ||
          role.environmentSlug?.trim() ||
          role.environment?.name?.trim() ||
          role.environment?.slug?.trim() ||
          role.environmentId,
        slug: role.environmentSlug ?? role.environment?.slug ?? undefined,
      });
    }
  }

  return Array.from(environments.values());
};

const mapMember = (
  member: DetailedProjectMember,
  environments: TeamEnvironment[],
  currentUserId?: string,
): ProjectMember => {
  const rolesByEnvironment = new Map(
    getMemberAssignments(member).map((role) => [role.environmentId, role]),
  );
  const name = getDisplayName(member);
  const email = getEmail(member);
  const projectMemberId = member.memberId ?? member.id ?? email;

  return {
    id: projectMemberId,
    projectMemberId,
    userId: member.userId ?? member.user?.id ?? undefined,
    name,
    email,
    initials: getInitials(name === "Unknown user" ? email : name),
    dateJoined: formatDisplayDate(member.joinedAt ?? member.createdAt),
    isCurrentUser:
      Boolean(currentUserId) &&
      (member.userId === currentUserId || member.user?.id === currentUserId),
    roles: environments.map((environment) => {
      const assignment = rolesByEnvironment.get(environment.id);

      return {
        environmentId: environment.id,
        environmentName:
          assignment?.environmentName?.trim() || environment.name,
        environmentSlug:
          assignment?.environmentSlug?.trim() || environment.slug,
        environmentMemberId: assignment?.id,
        role: toRoleLevel(assignment?.role),
      };
    }),
  };
};

const mapOwnedProject = (
  project: DetailedProject,
  currentUserId?: string,
): OwnedProject => {
  const environments = normalizeProjectEnvironments(project);

  return {
    id: project.id,
    name: project.name ?? "Untitled project",
    description: project.description ?? null,
    environments,
    members: project.members.map((member) =>
      mapMember(member, environments, currentUserId),
    ),
  };
};

const mapJoinedProject = (
  project: DetailedProject,
  currentUserId?: string,
): JoinedProject => {
  const environments = normalizeProjectEnvironments(project);
  const members = project.members
    .map((member) => mapMember(member, environments, currentUserId))
    .sort((left, right) => {
      const score = (member: ProjectMember) =>
        Number(isOwnerMember(member)) * 2 + Number(member.isCurrentUser);

      return score(right) - score(left);
    });
  const previewMembers: ProjectMember[] = [];
  const previewMemberIds = new Set<string>();

  for (const member of members) {
    if (isOwnerMember(member) && !previewMemberIds.has(member.id)) {
      previewMembers.push(member);
      previewMemberIds.add(member.id);
    }
  }

  for (const member of members) {
    if (member.isCurrentUser && !previewMemberIds.has(member.id)) {
      previewMembers.push(member);
      previewMemberIds.add(member.id);
    }
  }

  return {
    id: project.id,
    name: project.name ?? "Untitled project",
    description: project.description ?? null,
    environments,
    allMembers: members,
    visibleMembers: previewMembers.length > 0 ? previewMembers : members.slice(0, 1),
    extraMembersCount: Math.max(
      members.length - (previewMembers.length > 0 ? previewMembers.length : 1),
      0,
    ),
  };
};

const OwnedProjectCard = ({
  project,
  onMemberClick,
  onInviteClick,
  onSettingsClick,
}: {
  project: OwnedProject;
  onMemberClick: (project: OwnedProject, member: ProjectMember) => void;
  onInviteClick: (project: OwnedProject) => void;
  onSettingsClick: (project: OwnedProject) => void;
}) => (
  <div className="space-y-4">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-2">
        <Folder className="h-5 w-5 text-slate-500" />
        <h3 className="text-lg font-bold tracking-tight text-white">
          Project: {project.name}
        </h3>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onSettingsClick(project)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#2d3748] px-3 py-1.5 text-xs font-bold text-slate-400 transition-all hover:bg-white/5 hover:text-white sm:w-auto"
        >
          <Settings className="h-4 w-4" />
          Project Settings
        </button>
        <button
          onClick={() => onInviteClick(project)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1a75ff] px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-[#1a75ff]/20 transition-all hover:bg-[#1a75ff]/90 sm:w-auto"
        >
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </div>
    </div>

    <div className="overflow-x-auto rounded-xl border border-[#2d3748] bg-[#1e2530] shadow-lg">
      <table className="min-w-[700px] w-full table-fixed text-left">
        <thead>
          <tr className="border-b border-[#2d3748] bg-slate-800/50">
            <th className="w-[35%] px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Member
            </th>
            <th className="w-[45%] px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Role per Environment
            </th>
            <th className="w-[15%] px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Date Joined
            </th>
            <th className="w-[5%] px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2d3748]">
          {project.members.map((member) => (
            <tr
              key={member.id}
              className="group cursor-pointer transition-colors hover:bg-white/5"
              onClick={() => onMemberClick(project, member)}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">
                    {member.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-200">
                      {member.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {member.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  {member.roles.map((role) => (
                    <RoleLine
                      key={role.environmentId}
                      label={role.environmentName}
                      value={role.role}
                    />
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-400">
                {member.dateJoined}
              </td>
              <td className="px-6 py-4 text-right">
                <ChevronRight className="ml-auto h-5 w-5 text-slate-600 transition-colors group-hover:text-[#1a75ff]" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {project.members.length === 0 && (
        <EmptyStrip message="No members found for this project." />
      )}
    </div>
  </div>
);

const JoinedProjectCard = ({
  project,
  isLeaving,
  isExpanded,
  onRequestAccess,
  onLeave,
  onToggleMembers,
}: {
  project: JoinedProject;
  isLeaving: boolean;
  isExpanded: boolean;
  onRequestAccess: (project: JoinedProject) => void;
  onLeave: (project: JoinedProject) => void;
  onToggleMembers: (projectId: string) => void;
}) => (
  <div className="space-y-4">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-2">
        <Folder className="h-5 w-5 text-slate-500" />
        <h3 className="text-lg font-bold tracking-tight text-slate-400">
          Project: <span className="text-white">{project.name}</span>
        </h3>
        <span className="rounded border border-[#2d3748] bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Member
        </span>
      </div>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => onRequestAccess(project)}
          className="flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-[#1a75ff] transition-colors hover:text-[#1a75ff]/80 sm:w-auto sm:justify-start"
        >
          <ArrowUpCircle className="h-5 w-5" />
          Ask for More Access
        </button>
        <button
          onClick={() => onLeave(project)}
          disabled={isLeaving}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#ff5c5c]/20 px-4 py-2 text-sm font-semibold text-[#ff5c5c] transition-all hover:bg-[#ff5c5c]/5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:justify-start"
        >
          {isLeaving ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
          Leave Project
        </button>
      </div>
    </div>

    <div className="overflow-x-auto rounded-xl border border-[#2d3748] bg-[#1e2530] shadow-lg">
      {(() => {
        const displayedMembers = isExpanded
          ? project.allMembers
          : project.visibleMembers;

        return (
      <table className="min-w-[700px] w-full table-fixed text-left">
        <thead>
          <tr className="border-b border-[#2d3748] bg-slate-800/50">
            <th className="w-[50%] px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Member
            </th>
            <th className="w-[45%] px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Role per Environment
            </th>
            <th className="w-[5%] px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2d3748]">
          {displayedMembers.map((member) => (
            <tr
              key={member.id}
              className="group cursor-pointer transition-colors hover:bg-white/5"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      member.isCurrentUser
                        ? "border border-[#2d3748] bg-slate-800"
                        : "bg-slate-700"
                    }`}
                  >
                    {member.initials}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`truncate text-sm font-semibold ${
                        member.isCurrentUser ? "text-[#1a75ff]" : "text-slate-200"
                      }`}
                    >
                      {member.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {member.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  {member.roles.map((role) => (
                    <RoleLine
                      key={role.environmentId}
                      label={role.environmentName}
                      value={role.role}
                    />
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <ChevronRight className="ml-auto h-5 w-5 text-slate-600 transition-colors group-hover:text-[#1a75ff]" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        );
      })()}
      {project.visibleMembers.length === 0 && (
        <EmptyStrip message="No visible members returned for this project." />
      )}
      {project.extraMembersCount > 0 && (
        <div className="flex justify-center border-t border-[#2d3748] bg-slate-800/30 px-6 py-3">
          <button
            onClick={() => onToggleMembers(project.id)}
            className="text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-white"
          >
            {isExpanded
              ? "Show fewer members"
              : `Show ${project.extraMembersCount} more member${project.extraMembersCount !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}
    </div>
  </div>
);

const RoleLine = ({ label, value }: { label: string; value: RoleLevel }) => (
  <div className="flex items-center justify-between gap-4 text-[10px] leading-tight">
    <span className="font-medium text-slate-500">{label}</span>
    <span className={getRoleStyles(value)}>{value}</span>
  </div>
);

const EmptyStrip = ({ message }: { message: string }) => (
  <div className="flex justify-center border-t border-[#2d3748] bg-slate-800/30 px-6 py-5 text-sm text-slate-500">
    {message}
  </div>
);

export function Team(): React.JSX.Element {
  const authContext = useContext(AuthContext);
  const currentUserId = authContext?.user?.id;

  const [ownedProjects, setOwnedProjects] = useState<OwnedProject[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<JoinedProject[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const [editingContext, setEditingContext] = useState<EditContext>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [inviteProject, setInviteProject] = useState<OwnedProject | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [requestAccessProject, setRequestAccessProject] =
    useState<JoinedProject | null>(null);
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [requestAccessError, setRequestAccessError] = useState<string | null>(null);

  const [settingsProject, setSettingsProject] = useState<OwnedProject | null>(
    null,
  );
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [expandedJoinedProjectIds, setExpandedJoinedProjectIds] = useState<string[]>([]);
  const [leavingProjectId, setLeavingProjectId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  const loadProjects = async (silent = false) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }

    setPageError(null);

    try {
      const [owned, joined] = await Promise.all([
        getOwnedProjectsDetailed(),
        getMemberProjectsDetailed(),
      ]);

      setOwnedProjects(owned.map((project) => mapOwnedProject(project, currentUserId)));
      setJoinedProjects(
        joined.map((project) => mapJoinedProject(project, currentUserId)),
      );
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, [currentUserId]);

  const hydrateMemberFromEnvironmentApis = async (
    project: OwnedProject,
    member: ProjectMember,
  ): Promise<ProjectMember> => {
    const membershipsByEnvironment = new Map<string, string>();
    const rolesByEnvironment = new Map<string, RoleLevel>();

    const responses = await Promise.all(
      project.environments.map(async (environment) => ({
        environment,
        members: await getEnvironmentMembers(environment.id),
      })),
    );

    for (const { environment, members } of responses) {
      const existingMemberId = member.roles.find(
        (entry) => entry.environmentId === environment.id,
      )?.environmentMemberId;

      const environmentMember = members.find(
        (candidate) =>
          candidate.id === existingMemberId ||
          candidate.projectMemberId === member.projectMemberId ||
          candidate.userId === member.userId ||
          candidate.user?.id === member.userId,
      );

      if (!environmentMember) {
        continue;
      }

      membershipsByEnvironment.set(environment.id, environmentMember.id);
      rolesByEnvironment.set(environment.id, toRoleLevel(environmentMember.role));
    }

    return {
      ...member,
      roles: project.environments.map((environment) => {
        const existing = member.roles.find(
          (entry) => entry.environmentId === environment.id,
        );

        return {
          environmentId: environment.id,
          environmentName: environment.name,
          environmentSlug: environment.slug,
          environmentMemberId:
            membershipsByEnvironment.get(environment.id) ?? existing?.environmentMemberId,
          role: rolesByEnvironment.get(environment.id) ?? existing?.role ?? "No Access",
        };
      }),
    };
  };

  const handleMemberClick = async (project: OwnedProject, member: ProjectMember) => {
    if (isOwnerMember(member)) {
      showToast("Cannot edit settings for the project owner.", "error");
      return;
    }

    setEditingContext({ project, member });
    setEditError(null);
    setIsEditLoading(true);

    try {
      const hydratedMember = await hydrateMemberFromEnvironmentApis(project, member);
      setEditingContext({ project, member: hydratedMember });
    } catch (error) {
      setEditError(getErrorMessage(error));
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleSaveMember = async (roles: TeamEnvironmentRole[]) => {
    if (!editingContext) {
      return;
    }

    setEditError(null);
    setIsEditSaving(true);

    try {
      const originalRoles = new Map(
        editingContext.member.roles.map((role) => [role.environmentId, role]),
      );

      for (const role of roles) {
        const originalRole = originalRoles.get(role.environmentId);
        const targetRole = role.role;

        if (targetRole === "Owner" || originalRole?.role === "Owner") {
          continue;
        }

        if (targetRole === "No Access") {
          if (originalRole?.environmentMemberId) {
            await removeEnvironmentMember(
              role.environmentId,
              originalRole.environmentMemberId,
            );
          }
          continue;
        }

        const apiRole = toApiRole(targetRole);
        if (!apiRole) {
          continue;
        }

        if (
          originalRole?.environmentMemberId &&
          originalRole.role !== targetRole
        ) {
          await updateEnvironmentMember(
            role.environmentId,
            originalRole.environmentMemberId,
            { role: apiRole },
          );
          continue;
        }

        if (!originalRole?.environmentMemberId) {
          if (!editingContext.member.userId) {
            throw new Error("Unable to resolve the selected user for this member.");
          }

          await addEnvironmentMember(role.environmentId, {
            userId: editingContext.member.userId,
            role: apiRole,
          });
        }
      }

      await loadProjects(true);
      setEditingContext(null);
      showToast("Member access updated successfully");
    } catch (error) {
      setEditError(getErrorMessage(error));
    } finally {
      setIsEditSaving(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!editingContext) {
      return;
    }

    if (!window.confirm(`Remove ${editingContext.member.name} from this project?`)) {
      return;
    }

    setEditError(null);
    setIsRemovingMember(true);

    try {
      const memberships = editingContext.member.roles
        .map((role) => ({
          environmentId: role.environmentId,
          memberId: role.environmentMemberId,
        }))
        .filter(
          (role): role is { environmentId: string; memberId: string } =>
            Boolean(role.memberId),
        );

      for (const membership of memberships) {
        await removeEnvironmentMember(membership.environmentId, membership.memberId);
      }

      await loadProjects(true);
      setEditingContext(null);
      showToast("Member removed successfully");
    } catch (error) {
      setEditError(getErrorMessage(error));
    } finally {
      setIsRemovingMember(false);
    }
  };

  const handleInviteMembers = async (payload: {
    emails: string[];
    message: string;
    roles: TeamEnvironmentRole[];
  }) => {
    if (!inviteProject) {
      return;
    }

    setInviteError(null);
    setIsInviting(true);

    try {
      const environmentRoles = payload.roles
        .map((role) => {
          const apiRole = toApiRole(role.role);
          if (!apiRole) {
            return null;
          }

          return { environmentId: role.environmentId, role: apiRole };
        })
        .filter(
          (
            role,
          ): role is { environmentId: string; role: EnvironmentAccessRole } =>
            role !== null,
        );

      if (environmentRoles.length === 0) {
        throw new Error("Select at least one environment role before inviting.");
      }

      await bulkAssignProjectMembers(inviteProject.id, {
        members: payload.emails.map((email) => ({
          email,
          environmentRoles,
        })),
      });

      await loadProjects(true);
      setInviteProject(null);
      showToast("Members assigned successfully");
    } catch (error) {
      setInviteError(getErrorMessage(error));
    } finally {
      setIsInviting(false);
    }
  };

  const handleRequestAccess = async (payload: {
    message: string;
    roles: TeamEnvironmentRole[];
  }) => {
    if (!requestAccessProject) {
      return;
    }

    setRequestAccessError(null);
    setIsRequestingAccess(true);

    try {
      const environmentRoles = payload.roles
        .map((role) => {
          const apiRole = toApiRole(role.role);
          if (!apiRole) {
            return null;
          }

          return { environmentId: role.environmentId, role: apiRole };
        })
        .filter(
          (
            role,
          ): role is { environmentId: string; role: EnvironmentAccessRole } =>
            role !== null,
        );

      if (environmentRoles.length === 0) {
        throw new Error("Select at least one environment for the access request.");
      }

      await requestProjectAccess(requestAccessProject.id, {
        message: payload.message.trim(),
        environmentRoles,
      });

      setRequestAccessProject(null);
      showToast("Access request submitted successfully");
    } catch (error) {
      setRequestAccessError(getErrorMessage(error));
    } finally {
      setIsRequestingAccess(false);
    }
  };

  const handleLeaveProject = async (project: JoinedProject) => {
    if (!window.confirm(`Leave ${project.name}?`)) {
      return;
    }

    setLeavingProjectId(project.id);

    try {
      await leaveProject(project.id);
      await loadProjects(true);
      showToast("You left the project successfully");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setLeavingProjectId(null);
    }
  };

  const handleToggleJoinedMembers = (projectId: string) => {
    setExpandedJoinedProjectIds((previous) =>
      previous.includes(projectId)
        ? previous.filter((id) => id !== projectId)
        : [...previous, projectId],
    );
  };

  const handleDeleteOwnedProject = async (projectId: string) => {
    const project = settingsProject;
    if (!project) {
      return;
    }

    if (!window.confirm(`Delete ${project.name}? This cannot be undone.`)) {
      return;
    }

    setSettingsError(null);
    setIsDeletingProject(true);

    try {
      await deleteProject(projectId);
      await loadProjects(true);
      setSettingsProject(null);
      showToast("Project deleted successfully");
    } catch (error) {
      setSettingsError(getErrorMessage(error));
    } finally {
      setIsDeletingProject(false);
    }
  };

  if (isInitialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0e18] font-sans text-slate-100 antialiased">
      <main className="flex flex-1 flex-col overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#2d3748] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
        <div className="mx-auto w-full max-w-6xl space-y-8 p-4 pb-20 sm:p-8">
          <div className="flex flex-col gap-4 rounded-3xl border border-[#1c2433] bg-[#0f141e] p-6 shadow-2xl shadow-black/20 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Your Projects
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Projects you own and manage, plus projects where you contribute.
              </p>
            </div>
            <div className="text-sm text-slate-500">
              {isRefreshing ? "Refreshing team data..." : "Team data is up to date."}
            </div>
          </div>

          {pageError && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-red-300" />
                  <div>
                    <p className="text-sm font-semibold text-red-100">
                      Failed to load team data
                    </p>
                    <p className="mt-1 text-sm text-red-200/90">{pageError}</p>
                  </div>
                </div>
                <button
                  onClick={() => void loadProjects()}
                  className="rounded-lg border border-red-400/30 px-4 py-2 text-sm font-medium text-red-100 transition-colors hover:bg-red-500/10"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <section className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                Owned Projects
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Members and environment access for projects you own.
              </p>
            </div>

            {ownedProjects.length === 0 ? (
              <div className="rounded-2xl border border-[#2d3748] bg-[#111722] px-6 py-12 text-center text-slate-500">
                No owned projects found.
              </div>
            ) : (
              ownedProjects.map((project) => (
                <OwnedProjectCard
                  key={project.id}
                  project={project}
                  onMemberClick={handleMemberClick}
                  onInviteClick={(selectedProject) => {
                    setInviteError(null);
                    setInviteProject(selectedProject);
                  }}
                  onSettingsClick={(selectedProject) => {
                    setSettingsError(null);
                    setSettingsProject(selectedProject);
                  }}
                />
              ))
            )}
          </section>

          <div className="mb-6 border-t border-[#2d3748] pt-8">
            <h3 className="text-2xl font-bold tracking-tight text-white">
              Projects You're In
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Projects where you are a contributing member.
            </p>
          </div>

          <section className="space-y-12">
            {joinedProjects.length === 0 ? (
              <div className="rounded-2xl border border-[#2d3748] bg-[#111722] px-6 py-12 text-center text-slate-500">
                No joined projects found.
              </div>
            ) : (
              joinedProjects.map((project) => (
                <JoinedProjectCard
                  key={project.id}
                  project={project}
                  isLeaving={leavingProjectId === project.id}
                  isExpanded={expandedJoinedProjectIds.includes(project.id)}
                  onRequestAccess={(selectedProject) => {
                    setRequestAccessError(null);
                    setRequestAccessProject(selectedProject);
                  }}
                  onLeave={handleLeaveProject}
                  onToggleMembers={handleToggleJoinedMembers}
                />
              ))
            )}
          </section>
        </div>
      </main>

      <EditMemberDialog
        member={editingContext?.member ?? null}
        isOpen={Boolean(editingContext)}
        isLoading={isEditLoading}
        isSaving={isEditSaving}
        isRemoving={isRemovingMember}
        errorMessage={editError}
        onClose={() => {
          setEditingContext(null);
          setEditError(null);
        }}
        onSave={handleSaveMember}
        onRemove={handleRemoveMember}
      />

      <InviteMemberDialog
        isOpen={Boolean(inviteProject)}
        project={inviteProject}
        isSubmitting={isInviting}
        errorMessage={inviteError}
        onClose={() => {
          setInviteProject(null);
          setInviteError(null);
        }}
        onSendInvite={handleInviteMembers}
      />

      <RequestAccessDialog
        isOpen={Boolean(requestAccessProject)}
        project={requestAccessProject}
        isSubmitting={isRequestingAccess}
        errorMessage={requestAccessError}
        onClose={() => {
          setRequestAccessProject(null);
          setRequestAccessError(null);
        }}
        onSubmit={handleRequestAccess}
      />

      <ProjectSettingsDialog
        isOpen={Boolean(settingsProject)}
        project={settingsProject}
        isDeleting={isDeletingProject}
        errorMessage={settingsError}
        onClose={() => {
          setSettingsProject(null);
          setSettingsError(null);
        }}
        onDelete={handleDeleteOwnedProject}
      />

      {toast && (
        <div className="animate-in slide-in-from-bottom-5 fade-in fixed bottom-6 right-6 z-[80] duration-300">
          <div
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-2xl ${
              toast.type === "success"
                ? "border-slate-800 bg-slate-900"
                : "border-red-500/20 bg-[#2a1114]"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-blue-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-300" />
            )}
            <span className="text-sm font-medium text-white">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
