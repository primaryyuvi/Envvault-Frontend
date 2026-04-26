import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Check,
  Key as KeyIcon,
  ChevronRight,
  ChevronDown,
  Copy,
  Settings,
  Trash2,
  Plus,
  FolderOpen,
  X,
} from "lucide-react";
import {
  createKey,
  getKeysByEnvironment,
  removeKey,
  updateKey,
} from "../services/Keys.service";
import { ProjectList } from "../components/ProjectList";
import { ProjectSettingsDialog } from "../components/ProjectSettingsDialog";
import LoadingSpinner from "../utils/LoadingSpinner";
import {
  AddKeyDialog,
  SecretDetailsDialog,
} from "../components/AddKeyDialogBox";
import {
  createProject,
  deleteProject,
  type DetailedProjectMember,
  getMemberProjectsDetailed,
  getOwnedProjectsDetailed,
  getProjectsByUser,
  type DetailedProject,
  type EnvironmentAccessRole,
} from "../services/Project.service";
import { CreateProjectDialog } from "../components/CreateProjectDialogBox";
import { getAuditsByProjects } from "../services/AuditLogs.service";
import type { Project } from "../types/project";
import type { DecryptedSecret } from "../types/key";
import type { AuditLog } from "../types/audit";
import { resolveAuditActivityContent } from "../utils/auditActivity";
import type { EnvironmentValues } from "../types/environment";
import type { OwnedProject } from "../types/team";

type SecretRow = {
  id: string;
  keyName: string | undefined;
  value: string;
  environment: string | undefined;
  versionId: string;
  version: number;
  createdAt: string | Date | undefined;
  updatedAt: string | Date | undefined;
  createdBy: string;
};

type EnvironmentRoleLookup = Record<
  string,
  Record<string, EnvironmentAccessRole>
>;

const editableEnvironmentRoles = new Set<EnvironmentAccessRole>([
  "OWNER",
  "MAINTAINER",
]);

const buildEnvironmentRoleLookup = (
  projects: DetailedProject[],
): EnvironmentRoleLookup =>
  projects.reduce<EnvironmentRoleLookup>((lookup, project) => {
    const projectRoles = lookup[project.id] ?? {};
    const fallbackRole = project.currentUserRole?.trim().toUpperCase();
    const normalizedFallbackRole = editableEnvironmentRoles.has(
      fallbackRole as EnvironmentAccessRole,
    )
      ? (fallbackRole as EnvironmentAccessRole)
      : null;

    for (const assignment of project.currentUserEnvironments ?? []) {
      if (assignment.environmentId && assignment.role) {
        projectRoles[assignment.environmentId] = assignment.role;
      }
    }

    if (normalizedFallbackRole) {
      for (const environment of project.environments ?? []) {
        if (environment.id && !projectRoles[environment.id]) {
          projectRoles[environment.id] = normalizedFallbackRole;
        }
      }
    }

    lookup[project.id] = projectRoles;
    return lookup;
  }, {});

const buildDetailedProjectLookup = (
  projects: DetailedProject[],
): Record<string, DetailedProject> =>
  projects.reduce<Record<string, DetailedProject>>((lookup, project) => {
    lookup[project.id] = project;
    return lookup;
  }, {});

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [detailedProjectsById, setDetailedProjectsById] = useState<
    Record<string, DetailedProject>
  >({});
  const [environmentRoleLookup, setEnvironmentRoleLookup] =
    useState<EnvironmentRoleLookup>({});
  const [auditLogsByEnvironment, setAuditLogsByEnvironment] = useState<
    Record<string, AuditLog[]>
  >({});
  const [secrets, setSecrets] = useState<SecretRow[]>([]);
  const [secretsCount, setSecretsCount] = useState(0);
  const [copiedSecretId, setCopiedSecretId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddKeyDialogOpen, setisAddKeyDialogOpen] = useState(false);
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] =
    useState(false);
  const [isMobileProjectPickerOpen, setIsMobileProjectPickerOpen] =
    useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null);
  const [selectedSecretId, setSelectedSecretId] = useState<string | null>(null);
  const [settingsProject, setSettingsProject] = useState<OwnedProject | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const normalizeSecret = (secret: DecryptedSecret): SecretRow => ({
    id: secret.id,
    keyName: secret.keyName,
    value: secret.value ?? secret.version?.value ?? "",
    environment: secret.environment,
    versionId: secret.version?.id ?? secret.id,
    version: secret.version?.version ?? 1,
    createdAt: secret.createdAt,
    updatedAt: secret.updatedAt,
    createdBy: secret.version?.createdBy ?? "Unknown",
  });

  const [searchParams] = useSearchParams();
  const initialProjectId = useRef(searchParams.get("projectId"));

  const loadEnvironmentRoleLookup = async () => {
    const [ownedDetailedProjects, memberDetailedProjects] = await Promise.all([
      getOwnedProjectsDetailed(),
      getMemberProjectsDetailed(),
    ]);
    const detailedProjects = [
      ...(Array.isArray(ownedDetailedProjects) ? ownedDetailedProjects : []),
      ...(Array.isArray(memberDetailedProjects) ? memberDetailedProjects : []),
    ];

    setDetailedProjectsById(buildDetailedProjectLookup(detailedProjects));
    setEnvironmentRoleLookup(buildEnvironmentRoleLookup(detailedProjects));
  };

  const applyProjectSelection = (
    fetchedProjects: Project[],
    preferredProjectId?: string | null,
  ) => {
    setProjects(fetchedProjects);

    if (fetchedProjects.length === 0) {
      setActiveProjectId(null);
      setSelectedEnvId(null);
      setSecrets([]);
      setSecretsCount(0);
      setAuditLogsByEnvironment({});
      return;
    }

    const targetProject =
      (preferredProjectId
        ? fetchedProjects.find((project) => project.id === preferredProjectId)
        : null) ?? fetchedProjects[0];

    setActiveProjectId(targetProject.id);
    setSelectedEnvId(targetProject.environments?.[0]?.id ?? null);
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const fetchProjects = async () => {
      try {
        const [fetchedProjects, ownedDetailedProjects, memberDetailedProjects] =
          await Promise.all([
            getProjectsByUser(),
            getOwnedProjectsDetailed(),
            getMemberProjectsDetailed(),
          ]);
        const detailedProjects = [
          ...(Array.isArray(ownedDetailedProjects) ? ownedDetailedProjects : []),
          ...(Array.isArray(memberDetailedProjects) ? memberDetailedProjects : []),
        ];
        setDetailedProjectsById(buildDetailedProjectLookup(detailedProjects));
        setEnvironmentRoleLookup(buildEnvironmentRoleLookup(detailedProjects));
        applyProjectSelection(fetchedProjects, initialProjectId.current);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchProjectAudits = async () => {
      if (!activeProjectId) {
        setAuditLogsByEnvironment({});
        return;
      }

      try {
        const audits = await getAuditsByProjects(activeProjectId);
        console.log(audits);
        const groupedAudits = audits.reduce<Record<string, AuditLog[]>>(
          (accumulator, audit) => {
            const details =
              typeof audit.details === "object" &&
              audit.details !== null &&
              !Array.isArray(audit.details)
                ? (audit.details as Record<string, unknown>)
                : null;
            const envId =
              audit.environmentId ??
              (details?.["environmentId"] as string | null | undefined);
            if (!envId) {
              return accumulator;
            }

            if (!accumulator[envId]) {
              accumulator[envId] = [];
            }

            accumulator[envId].push(audit);
            return accumulator;
          },
          {},
        );

        Object.values(groupedAudits).forEach((entries) => {
          entries.sort(
            (left, right) =>
              new Date(right.timestamp ?? 0).getTime() -
              new Date(left.timestamp ?? 0).getTime(),
          );
        });

        setAuditLogsByEnvironment(groupedAudits);
      } catch (auditError) {
        console.error("Failed to load audit logs", auditError);
        setAuditLogsByEnvironment({});
      }
    };

    fetchProjectAudits();
  }, [activeProjectId]);
  const selectedProject = useMemo(() => {
    if (!projects.length) return null;
    return projects.find((p) => p.id === activeProjectId) ?? projects[0];
  }, [activeProjectId, projects]);

  const selectedEnv = useMemo(() => {
    if (!selectedProject) return null;

    return (
      selectedProject.environments?.find((e) => e.id === selectedEnvId) ??
      selectedProject.environments?.[0] ??
      null
    );
  }, [selectedProject, selectedEnvId]);

  const settingsDialogProject = useMemo<OwnedProject | null>(() => {
    if (!selectedProject) {
      return null;
    }

    return {
      id: selectedProject.id,
      name: selectedProject.name ?? "Untitled project",
      description: selectedProject.description ?? null,
      environments: (selectedProject.environments ?? []).map((environment) => ({
        id: environment.id,
        name: environment.name ?? "Unknown",
        slug: environment.slug ?? undefined,
      })),
      members: [],
    };
  }, [selectedProject]);

  const selectedEnvAuditLogs = useMemo(() => {
    if (!selectedEnvId) {
      return [];
    }

    return auditLogsByEnvironment[selectedEnvId] ?? [];
  }, [auditLogsByEnvironment, selectedEnvId]);

  const currentUserEnvironmentRole = useMemo(() => {
    if (!selectedProject?.id || !selectedEnvId) {
      return null;
    }

    return environmentRoleLookup[selectedProject.id]?.[selectedEnvId] ?? null;
  }, [environmentRoleLookup, selectedEnvId, selectedProject?.id]);

  const canManageSecrets = useMemo(
    () =>
      currentUserEnvironmentRole !== null &&
      editableEnvironmentRoles.has(currentUserEnvironmentRole),
    [currentUserEnvironmentRole],
  );

  const canViewSecrets = useMemo(
    () =>
      currentUserEnvironmentRole !== null &&
      currentUserEnvironmentRole !== "NO_ACCESS",
    [currentUserEnvironmentRole],
  );

  const secretManagementMessage = useMemo(() => {
    if (!selectedEnvId || canManageSecrets) {
      return null;
    }

    const roleLabel = currentUserEnvironmentRole
      ? formatRoleLabel(currentUserEnvironmentRole)
      : "No Access";

    return `${roleLabel} users cannot create, update, or delete secrets in this environment.`;
  }, [canManageSecrets, currentUserEnvironmentRole, selectedEnvId]);

  const teamAccessMembers = useMemo(() => {
    const detailedProject =
      (activeProjectId ? detailedProjectsById[activeProjectId] : null) ?? null;
    const detailedMembers: DetailedProjectMember[] = detailedProject?.members ?? [];

    return detailedMembers.map((member) => {
      const environmentAssignment = (
        member.environmentRoles ??
        member.environments ??
        []
      ).find(
        (assignment: { environmentId: string }) =>
          assignment.environmentId === selectedEnvId,
      );
      const normalizedRole =
        environmentAssignment?.role?.toUpperCase() ?? "NO_ACCESS";
      const roleLabel = formatRoleLabel(environmentAssignment?.role);

      return {
        id: member.memberId ?? member.id ?? member.userId ?? "unknown-member",
        name: member.user?.displayName ?? member.user?.email ?? "Unknown user",
        role: roleLabel,
        secondaryText:
          environmentAssignment?.environmentName ??
          selectedEnv?.name ??
          "No access to this environment",
        avatarInitials: getInitials(
          member.user?.displayName ?? member.user?.email ?? "Unknown user",
        ),
        roleBadgeClassName: getRoleBadgeColor(normalizedRole),
      };
    });
  }, [activeProjectId, detailedProjectsById, selectedEnv?.name, selectedEnvId]);

  useEffect(() => {
    const fetchSecrets = async () => {
      if (!selectedEnvId || !activeProjectId) {
        setSecrets([]);
        setSecretsCount(0);
        setSelectedSecretId(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await getKeysByEnvironment(activeProjectId, selectedEnvId);
        const decryptedSecrets = Array.isArray(response?.secrets)
          ? response.secrets
          : [];
        const decryptionErrors = Array.isArray(response?.errors)
          ? response.errors
          : [];
        setSecrets(decryptedSecrets.map(normalizeSecret));
        setSecretsCount(
          typeof response?.count === "number"
            ? response.count
            : decryptedSecrets.length,
        );
        if (decryptionErrors.length > 0) {
          setError(
            `Some keys could not be loaded: ${decryptionErrors
              .slice(0, 2)
              .map((item) => `${item.keyName} (${item.error})`)
              .join(", ")}`,
          );
        }
      } catch (e: any) {
        setSecrets([]);
        setSecretsCount(0);
        setError(e?.message ?? "Failed to load keys");
      } finally {
        setIsLoading(false);
      }
    };

    setSelectedSecretId(null);
    void fetchSecrets();
  }, [activeProjectId, selectedEnvId]);

  useEffect(() => {
    if (!canManageSecrets) {
      setisAddKeyDialogOpen(false);
    }
  }, [canManageSecrets]);

  const selectedSecret = useMemo(
    () => secrets.find((secret) => secret.id === selectedSecretId) ?? null,
    [selectedSecretId, secrets],
  );

  const handleOpenSecretDetails = (secretId: string) => {
    setSelectedSecretId(secretId);
  };

  const handleCloseSecretDetails = () => {
    setSelectedSecretId(null);
  };

  const handleSaveSecretChanges = async (keyName: string, value: string) => {
    if (!canManageSecrets) {
      setError("You do not have permission to update secrets in this environment.");
      return;
    }

    if (!selectedSecret) {
      return;
    }

    const normalizedName = keyName.trim();
    const hasChanged =
      normalizedName !== (selectedSecret.keyName ?? "").trim() ||
      value !== selectedSecret.value;

    if (!normalizedName || !hasChanged) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (!activeProjectId) {
        throw new Error("No project selected");
      }

      await updateKey(activeProjectId, value, selectedSecret.id, normalizedName);
      setSecrets((prev) =>
        prev.map((secret) =>
          secret.id === selectedSecret.id
            ? {
                ...secret,
                keyName: normalizedName,
                value,
                version: secret.version + 1,
                updatedAt: new Date().toISOString(),
              }
            : secret,
        ),
      );
      setSelectedSecretId(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to update secret");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canManageSecrets) {
      setError("You do not have permission to delete secrets in this environment.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this secret?")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await removeKey(id);
      setSecrets((prev) => prev.filter((secret) => secret.id !== id));
      setSecretsCount((prev) => Math.max(prev - 1, 0));
      setSelectedSecretId((prev) => (prev === id ? null : prev));
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete secret");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (secret: SecretRow) => {
    try {
      await navigator.clipboard.writeText(secret.value);
      setCopiedSecretId(secret.id);
      setTimeout(
        () => setCopiedSecretId((prev) => (prev === secret.id ? null : prev)),
        1200,
      );
    } catch (e) {
      console.error("Failed to copy secret value", e);
    }
  };

  const handleProjectClick = (projectId: string) => {
    const clickedProject = projects.find((project) => project.id === projectId);
    if (!clickedProject) {
      return;
    }

    setActiveProjectId(clickedProject.id);
    if (
      !clickedProject.environments?.some(
        (environment) => environment.id === selectedEnvId,
      )
    ) {
      setSelectedEnvId(clickedProject.environments?.[0]?.id ?? null);
    }
  };

  const handleProjectSettingsClick = () => {
    setSettingsError(null);
    setSettingsProject(settingsDialogProject);
  };

  const handleDeleteCurrentProject = async (projectId: string) => {
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
      const [refreshedProjects] = await Promise.all([
        getProjectsByUser(),
        loadEnvironmentRoleLookup(),
      ]);
      applyProjectSelection(Array.isArray(refreshedProjects) ? refreshedProjects : []);
      setSettingsProject(null);
    } catch (e: any) {
      setSettingsError(e?.message ?? "Failed to delete project");
    } finally {
      setIsDeletingProject(false);
    }
  };

  const handleEnvClick = (environmentId: string) => {
    if (selectedEnvId === environmentId) {
      setIsMobileProjectPickerOpen(false);
      return;
    }
    const nextProject = projects.find((project) =>
      project.environments?.some(
        (environment) => environment.id === environmentId,
      ),
    );
    if (nextProject) {
      setActiveProjectId(nextProject.id);
    }
    setSelectedEnvId(environmentId);
    setIsMobileProjectPickerOpen(false);
  };

  const handleCreateKey = async (keyName: string, keyValue: string) => {
    if (!canManageSecrets) {
      setError("You do not have permission to create secrets in this environment.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const targetEnvId = selectedEnvId;

      if (!targetEnvId) {
        throw new Error("No environment selected");
      }

      if (!activeProjectId) {
        throw new Error("No project selected");
      }

      await createKey(activeProjectId, keyName, targetEnvId, keyValue, "");
      const refreshed = await getKeysByEnvironment(activeProjectId, targetEnvId);
      const decryptedSecrets = Array.isArray(refreshed?.secrets)
        ? refreshed.secrets
        : [];
      setSecrets(decryptedSecrets.map(normalizeSecret));
      setSecretsCount(
        typeof refreshed?.count === "number"
          ? refreshed.count
          : decryptedSecrets.length,
      );
    } catch (e: any) {
      setError(e?.message ?? "Failed to create secret");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (
    projectName: string,
    description: string,
    environments: EnvironmentValues[],
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const createdProject = await createProject(
        projectName,
        description,
        environments,
      );
      const [refreshedProjects] = await Promise.all([
        getProjectsByUser(),
        loadEnvironmentRoleLookup(),
      ]);

      applyProjectSelection(
        Array.isArray(refreshedProjects) ? refreshedProjects : [],
        createdProject?.id ?? null,
      );
      setIsCreateProjectDialogOpen(false);
      initialProjectId.current = createdProject?.id ?? null;
    } catch (e: any) {
      setError(e?.message ?? "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const hasProjects = projects.length > 0;

  return (
    <React.Fragment>
    <div className="flex h-screen bg-[#0f111a] text-slate-300 font-sans overflow-hidden selection:bg-indigo-500/30">
      {hasProjects && (
        <ProjectList
          projects={projects}
          onProjectClick={handleProjectClick}
          onEnvClick={handleEnvClick}
          selectedEnv={selectedEnvId ?? ""}
          selectedProject={activeProjectId ?? ""}
        />
      )}
      {isLoading && <LoadingSpinner />}
      {isCreateProjectDialogOpen && (
        <CreateProjectDialog
          onClose={() => setIsCreateProjectDialogOpen(false)}
          handleCreateProject={handleCreateProject}
        />
      )}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {hasProjects ? (
          <header className="h-16 flex items-center justify-between px-6 border-b border-[#30363d] bg-[#161b22] z-10">
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white leading-tight">
                Secrets
              </h1>
              <nav className="flex items-center text-xs text-slate-400 mt-0.5">
                <span>{selectedProject?.name}</span>
                <ChevronRight size={12} className="mx-1" />
                <span className="text-indigo-400 font-medium">
                  {selectedEnv?.name}
                </span>
              </nav>
            </div>
          </header>
        ) : null}

        {!hasProjects ? (
          <div className="flex flex-1 items-center justify-center overflow-y-auto p-6 lg:p-10">
            <div className="w-full max-w-xl rounded-3xl border border-[#30363d] bg-[#161b22] px-8 py-12 text-center shadow-xl">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                <FolderOpen size={28} />
              </div>
              <h2 className="text-2xl font-bold text-white">
                No projects yet
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
                Create your first project to start managing environments,
                secrets, and team access from one place.
              </p>
              <button
                onClick={() => setIsCreateProjectDialogOpen(true)}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-500"
              >
                <Plus size={18} />
                Create Project
              </button>
              {error && (
                <div className="mt-6 rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 flex gap-6">
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <div className="lg:hidden rounded-2xl border border-[#30363d] bg-[#161b22] p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                    Active Scope
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                    <span className="truncate font-semibold text-white">
                      {selectedProject?.name ?? "Select a project"}
                    </span>
                    <ChevronRight size={14} className="shrink-0 text-slate-600" />
                    <span className="truncate text-indigo-300">
                      {selectedEnv?.name ?? "Select environment"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileProjectPickerOpen(true)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-700 bg-[#0f141e] px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
                >
                  Switch
                  <ChevronDown size={16} />
                </button>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">
                Change project and environment here on mobile before viewing or
                editing secrets.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {selectedProject?.name}{" "}
                  <span className="text-slate-500">/</span>{" "}
                  <span className="text-indigo-400">{selectedEnv?.name}</span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {secretsCount} secret(s) configured for this environment
                </p>
                {secretManagementMessage && (
                  <div className="mt-3 inline-flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <span>{secretManagementMessage}</span>
                  </div>
                )}
              </div>
              {isAddKeyDialogOpen && (
                <AddKeyDialog
                  onClose={() => setisAddKeyDialogOpen(false)}
                  handleAddKey={handleCreateKey}
                />
              )}
              {selectedSecret && (
                <SecretDetailsDialog
                  onClose={handleCloseSecretDetails}
                  secretName={selectedSecret.keyName ?? ""}
                  secretValue={selectedSecret.value}
                  onSave={handleSaveSecretChanges}
                  canEdit={canManageSecrets}
                />
              )}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  onClick={handleProjectSettingsClick}
                  disabled={!settingsDialogProject}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-[#30363d] bg-[#161b22] px-4 py-2.5 text-sm font-medium text-slate-200 transition-all hover:border-slate-500 hover:bg-[#1b2330] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Settings size={16} />
                  Project Settings
                </button>
                {canManageSecrets && (
                  <button
                    onClick={() => setisAddKeyDialogOpen(true)}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 transition-all text-sm font-medium"
                  >
                    <Plus size={18} />
                    Create Secret
                  </button>
                )}
              </div>
            </div>

            {/* Secrets Table */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-sm overflow-hidden">
              {secrets.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <div className="min-w-[720px]">
                      <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#30363d] bg-[#0d1017] text-xs font-semibold text-slate-400 uppercase tracking-wider items-center">
                        <div className="col-span-5 pl-1">Secret Name</div>
                        <div className="col-span-4 pl-1">Value</div>
                        <div className="col-span-1 text-center">Version</div>
                        <div className="col-span-2 text-right pr-2">Actions</div>
                      </div>

                      {secrets.map((secret) => (
                        <div
                          key={secret.id}
                          onClick={
                            canViewSecrets
                              ? () => handleOpenSecretDetails(secret.id)
                              : undefined
                          }
                          className={`group grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#30363d] items-center transition-colors relative ${
                            canViewSecrets
                              ? "cursor-pointer hover:bg-[#1c2128]"
                              : "cursor-default"
                          }`}
                        >
                          <div className="col-span-5 flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-slate-800 text-slate-400">
                              <KeyIcon size={18} />
                            </div>
                            <div className="min-w-0">
                              <div
                                className="block max-w-full truncate font-mono text-left text-sm font-medium text-slate-200 transition-colors group-hover:text-white"
                                title={secret.keyName}
                              >
                                {secret.keyName}
                              </div>
                            </div>
                          </div>

                          <div className="col-span-4 flex items-center">
                            <div className="relative group/value w-full max-w-[200px]">
                              <div className="inline-flex items-center w-full rounded border border-transparent bg-slate-800 px-3 py-1.5 transition-colors hover:border-slate-600">
                                <span className="overflow-hidden whitespace-nowrap font-mono text-xs leading-3 translate-y-0.5 select-none tracking-[3px] text-slate-500 text-lg">
                                  *****************
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="col-span-1 flex justify-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              v{secret.version}
                            </span>
                          </div>

                          <div className="col-span-2 flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            {canManageSecrets && (
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleCopy(secret);
                                }}
                                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
                                title={
                                  copiedSecretId === secret.id
                                    ? "Copied"
                                    : "Copy Value"
                                }
                              >
                                {copiedSecretId === secret.id ? (
                                  <Check size={18} />
                                ) : (
                                  <Copy size={18} />
                                )}
                              </button>
                            )}
                            {canManageSecrets && (
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleDelete(secret.id);
                                }}
                                className="p-1.5 rounded-md text-slate-500 hover:bg-red-900/30 hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex max-h-[55vh] flex-col items-center overflow-y-auto px-6 pt-8 pb-12 text-center sm:max-h-none sm:pt-10 sm:pb-14">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                    <FolderOpen size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    No secrets in this environment
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                    This environment does not have any secrets yet. Create the
                    first secret to start managing environment-specific values.
                  </p>
                  {canManageSecrets && (
                    <button
                      onClick={() => setisAddKeyDialogOpen(true)}
                      className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-500"
                    >
                      <Plus size={16} />
                      Create First Secret
                    </button>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="mt-4">
              <div className="py-6">
                <h3 className="text-sm font-medium text-white mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {selectedEnvAuditLogs.length > 0 ? (
                    selectedEnvAuditLogs.map((audit) => {
                      const content = getActivityContent(audit);

                      return (
                        <ActivityItem
                          key={audit.id}
                          user={content.user}
                          action={content.action}
                          target={content.target}
                          targetType={content.targetType}
                          time={formatRelativeTime(audit.timestamp)}
                        />
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-400">
                      No recent activity for this environment.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="w-72 shrink-0 hidden xl:block">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 sticky top-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">
                  Team Access
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                These project members are shown with their assigned project role.
                The note below indicates whether they are part of the{" "}
                <code className="bg-slate-800 px-1 rounded">
                  {selectedEnv?.name ?? "selected"}
                </code>{" "}
                environment.
              </p>
              <div className="space-y-3">
                {teamAccessMembers.map((member) => (
                  <TeamMember
                    key={member.id}
                    name={member.name}
                    role={member.role}
                    secondaryText={member.secondaryText}
                    avatarInitials={member.avatarInitials}
                    roleBadgeClassName={member.roleBadgeClassName}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
        )}
      </main>

      {isMobileProjectPickerOpen && (
        <div className="fixed inset-0 z-40 flex items-end lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileProjectPickerOpen(false)}
          />
          <div className="relative max-h-[82vh] w-full overflow-hidden rounded-t-3xl border-t border-[#30363d] bg-[#111722] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#30363d] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Switch Project
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Pick a project first, then choose its environment.
                </p>
              </div>
              <button
                onClick={() => setIsMobileProjectPickerOpen(false)}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5">
              <div className="space-y-3">
                {projects.map((project) => {
                  const isActiveProject = project.id === activeProjectId;

                  return (
                    <div
                      key={project.id}
                      className={`rounded-2xl border p-4 transition-colors ${
                        isActiveProject
                          ? "border-indigo-500/30 bg-indigo-500/10"
                          : "border-[#30363d] bg-[#161b22]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleProjectClick(project.id)}
                        className="flex w-full items-center justify-between gap-3 text-left"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">
                            {project.name ?? "Untitled Project"}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {project.environments?.length ?? 0} environment(s)
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            isActiveProject
                              ? "bg-indigo-500/20 text-indigo-200"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {isActiveProject ? "Selected" : "Open"}
                        </span>
                      </button>

                      {isActiveProject && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(project.environments ?? []).map((environment) => {
                            const isActiveEnv = environment.id === selectedEnvId;

                            return (
                              <button
                                key={environment.id}
                                type="button"
                                onClick={() => handleEnvClick(environment.id)}
                                className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                                  isActiveEnv
                                    ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-200"
                                    : "border-slate-700 bg-[#0f141e] text-slate-300 hover:border-slate-500 hover:text-white"
                                }`}
                              >
                                {environment.name ?? "Unknown environment"}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    <ProjectSettingsDialog
      isOpen={Boolean(settingsProject)}
      project={settingsProject}
      isDeleting={isDeletingProject}
      errorMessage={settingsError}
      onClose={() => {
        setSettingsProject(null);
        setSettingsError(null);
      }}
      onDelete={handleDeleteCurrentProject}
    />
    </React.Fragment>
  );
};

const getInitials = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "NA";

const formatRoleLabel = (role?: string) => {
  const normalized = role?.trim();
  if (!normalized) {
    return "Member";
  }

  return normalized
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "OWNER":
      return "text-blue-300 bg-blue-500/15 border-blue-500/25";
    case "ADMIN":
    case "MAINTAINER":
      return "text-emerald-300 bg-emerald-500/15 border-emerald-500/25";
    case "DEVELOPER":
      return "text-amber-300 bg-amber-500/15 border-amber-500/25";
    case "GUEST":
    case "READ_ONLY":
      return "text-slate-300 bg-slate-700/40 border-slate-600/50";
    default:
      return "text-slate-300 bg-slate-800 border-slate-700";
  }
};

const getActivityContent = (audit: AuditLog) => {
  return resolveAuditActivityContent(audit);
};

const formatRelativeTime = (value: string | Date | undefined) => {
  if (!value) {
    return "Just now";
  }

  const timestamp = new Date(value);
  const diffInSeconds = Math.max(
    0,
    Math.floor((Date.now() - timestamp.getTime()) / 1000),
  );

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
};

const ActivityItem = ({ user, action, target, targetType, time }: any) => (
  <div className="flex gap-4">
    <div className="mt-1 shrink-0">
      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-300">
        AM
      </div>
    </div>
    <div>
      <p className="text-sm text-slate-300">
        <span className="font-medium text-white">{user}</span> {action}{" "}
        {targetType === "code" && (
          <span className="font-mono text-xs bg-slate-800 px-1 py-0.5 rounded">
            {target}
          </span>
        )}
        {targetType === "text" && <span>{target}</span>}
      </p>
      <p className="text-xs text-slate-500 mt-0.5">{time}</p>
    </div>
  </div>
);

const TeamMember = ({
  name,
  role,
  avatarColor,
  avatarInitials,
  roleBadgeClassName,
}: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      {avatarColor ? (
        <div className={`w-8 h-8 rounded-full ${avatarColor}`}></div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
          {avatarInitials}
        </div>
      )}
      <div>
        <div className="text-xs font-medium text-white">{name}</div>
      </div>
    </div>
    <span
      className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${roleBadgeClassName}`}
    >
      {role}
    </span>
  </div>
);

export default Projects;
