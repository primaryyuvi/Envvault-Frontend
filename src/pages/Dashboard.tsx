import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  Plus,
  Webhook,
  Download,
  Edit2,
  Unlock,
  Copy,
  FolderPlus,
} from "lucide-react";
import {
  createProject,
  getPaginatedProjectsByUser,
} from "../services/Project.service";
import { getAuditsByUser } from "../services/AuditLogs.service";
import type {
  DashboardProject,
  DashboardProjectsPagination,
} from "../types/project";
import { CreateProjectDialog } from "../components/CreateProjectDialogBox";
import LoadingSpinner from "../utils/LoadingSpinner";
import { ProjectCard } from "../components/ProjectCard";
import { ActivityItem } from "../components/ActivityItem";
import type { EnvironmentValues } from "../types/environment";
import type { AuditLog } from "../types/audit";
import { resolveAuditActivityContent } from "../utils/auditActivity";

const PAGE_SIZE = 10;

const DEFAULT_PAGINATION: DashboardProjectsPagination = {
  page: 1,
  pageSize: PAGE_SIZE,
  totalProjects: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const normalizeProject = (project: DashboardProject): DashboardProject => ({
  id: project.id ?? "",
  name: project.name ?? "Untitled Project",
  description: project.description ?? "",
  createdAt: project.createdAt ?? "",
  updatedAt: project.updatedAt ?? "",
  members: (project.members ?? []).map((member) => ({
    id: member.id,
    displayName: member.displayName ?? "NA",
  })),
  environments: (project.environments ?? []).map((environment) => ({
    id: environment.id,
    name: environment.name ?? "Unknown",
  })),
  totalSecrets: project.totalSecrets ?? 0,
});

const Dashboard = () => {
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [pagination, setPagination] =
    useState<DashboardProjectsPagination>(DEFAULT_PAGINATION);
  const [activityLogs, setActivityLogs] = useState<AuditLog[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(DEFAULT_PAGINATION.page);
  const [projectsRefreshToken, setProjectsRefreshToken] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    const fetchProjects = async () => {
      try {
        const paginatedProjects = await getPaginatedProjectsByUser(page, PAGE_SIZE);
        setProjects((paginatedProjects.projects ?? []).map(normalizeProject));
        setPagination(paginatedProjects.pagination ?? DEFAULT_PAGINATION);
        if (paginatedProjects.pagination?.page !== undefined) {
          setPage((currentPage) =>
            currentPage === paginatedProjects.pagination.page
              ? currentPage
              : paginatedProjects.pagination.page,
          );
        }
      } catch (e: any) {
        console.log(e);
        setProjects([]);
        setPagination(DEFAULT_PAGINATION);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [page, projectsRefreshToken]);

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        const fetchedAudits = await getAuditsByUser();
        setActivityLogs(
          (fetchedAudits ?? [])
            .slice()
            .sort(
              (left, right) =>
                new Date(right.timestamp).getTime() -
                new Date(left.timestamp).getTime(),
            ),
        );
      } catch (e: any) {
        console.error("Failed to load activity logs:", e);
        setActivityLogs([]);
      }
    };

    fetchActivityLogs();
  }, []);

  const handleCreateProject = async (
    project_name: string,
    description: string,
    environments: EnvironmentValues[],
  ) => {
    setIsLoading(true);
    try {
      await createProject(project_name, description, environments);
      setPage(DEFAULT_PAGINATION.page);
      setProjectsRefreshToken((currentValue) => currentValue + 1);
    } catch (e: any) {
      console.log(e);
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  const hasProjects = pagination.totalProjects > 0;
  const startProjectNumber = hasProjects
    ? (pagination.page - 1) * pagination.pageSize + 1
    : 0;
  const endProjectNumber = hasProjects
    ? startProjectNumber + projects.length - 1
    : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f111a] text-slate-50 font-sans selection:bg-blue-500/30">
      <main className="flex-1 flex flex-col min-w-0 bg-[#0f111a] relative">
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Projects Dashboard
            </h1>
            <p className="text-slate-400">
              Manage access and monitor secret usage across your organization.
            </p>
          </div>

          <div className="flex flex-col xl:flex-row gap-8 h-full">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Active Projects
                </h2>
                <div className="flex items-center gap-3">
                  <button className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                    <Filter size={16} /> Filter
                  </button>
                  <button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 border border-blue-400/20"
                  >
                    <Plus size={18} /> New Project
                  </button>
                </div>
              </div>

              <div className=" border-[#30363d] bg-[#161b22] rounded-xl shadow-xl overflow-hidden">
                {hasProjects ? (
                  <>
                    <ul className="divide-y divide-slate-800/50">
                      {projects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          title={project.name}
                          desc={project.description ?? ""}
                          secrets={project.totalSecrets}
                          projectMembers={project.members}
                          onClick={() =>
                            navigate(`/projects?projectId=${project.id}`)
                          }
                          onManageAccess={() => navigate("/teams")}
                          icon={
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                              <Webhook size={20} />
                            </div>
                          }
                        />
                      ))}
                    </ul>
                    <div className="px-6 py-4 bg-slate-950/30 border-t border-[#30363d] flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Showing {startProjectNumber} - {endProjectNumber} of{" "}
                        {pagination.totalProjects} project
                        {pagination.totalProjects !== 1 ? "s" : ""}
                      </span>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 border border-slate-800 rounded-md text-xs font-medium text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!pagination.hasPreviousPage}
                          onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                        >
                          Previous
                        </button>
                        <button
                          className="px-3 py-1 border border-slate-800 rounded-md text-xs font-medium text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!pagination.hasNextPage}
                          onClick={() => setPage((currentPage) => currentPage + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
                      <FolderPlus size={28} />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      No projects yet
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                      Create your first project to organize environments, manage
                      team access, and store secrets in one place.
                    </p>
                    <button
                      onClick={() => setIsDialogOpen(true)}
                      className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500"
                    >
                      <Plus size={16} />
                      Create First Project
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full xl:w-80 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Recent Activity
                </h2>
              </div>

              <div className=" border-[#30363d] bg-[#161b22] rounded-xl p-5 shadow-xl h-fit mb-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {activityLogs.length > 0 ? (
                      activityLogs.slice(0, 6).map((audit, index, arr) => {
                        const content = getDashboardActivityContent(audit);

                        return (
                          <ActivityItem
                            key={audit.id}
                            user={content.user}
                            action={content.action}
                            target={content.target}
                            targetType={content.targetType}
                            time={formatRelativeTime(audit.timestamp)}
                            icon={content.icon}
                            iconBg={content.iconBg}
                            iconColor={content.iconColor}
                            isLast={index === arr.length - 1}
                          />
                        );
                      })
                    ) : (
                      <li className="pb-8 text-sm text-slate-400">
                        No recent activity available.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="mt-6 hidden md:block bg-linear-to-br from-indigo-900/60 to-[#161b22] border border-indigo-500/30 rounded-xl p-5 text-white shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-500 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
                <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-1">Install the CLI</h3>
                  <p className="text-indigo-200/80 text-sm mb-3">
                    Manage secrets directly from your terminal securely.
                  </p>
                  <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded px-3 py-2 mb-3 group-hover:bg-black/60 transition-colors">
                    <code className="text-xs font-mono text-indigo-100">
                      npm i -g @yuvaraj0808/envvault-cli
                    </code>
                    <Copy
                      size={12}
                      className="opacity-50 cursor-pointer hover:opacity-100 shrink-0 ml-2"
                    />
                  </div>
                </div>
              </div>
            </div>
            {isDialogOpen && (
              <CreateProjectDialog
                onClose={() => setIsDialogOpen(false)}
                handleCreateProject={handleCreateProject}
              />
            )}

            {isLoading && <LoadingSpinner />}
          </div>
        </div>
      </main>
    </div>
  );
};

const getDashboardActivityContent = (audit: AuditLog) => {
  const content = resolveAuditActivityContent(audit);

  switch (content.tone) {
    case "create":
      return {
        ...content,
        icon: <Plus size={14} className="text-emerald-400" />,
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-400",
      };
    case "update":
      return {
        ...content,
        icon: <Edit2 size={14} className="text-blue-400" />,
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-400",
      };
    case "delete":
      return {
        ...content,
        icon: <Unlock size={14} className="text-red-400" />,
        iconBg: "bg-red-500/10",
        iconColor: "text-red-400",
      };
    case "access":
      return {
        ...content,
        icon: <Unlock size={14} className="text-yellow-400" />,
        iconBg: "bg-yellow-500/10",
        iconColor: "text-yellow-400",
      };
    case "member":
      return {
        ...content,
        icon: <FolderPlus size={14} className="text-cyan-400" />,
        iconBg: "bg-cyan-500/10",
        iconColor: "text-cyan-400",
      };
    case "request":
      return {
        ...content,
        icon: <Download size={14} className="text-violet-400" />,
        iconBg: "bg-violet-500/10",
        iconColor: "text-violet-400",
      };
    default:
      return {
        ...content,
        icon: <Download size={14} className="text-emerald-400" />,
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-400",
      };
  }
};

const formatRelativeTime = (value: string | Date) => {
  const timestamp = new Date(value);
  const diffInSeconds = Math.max(
    0,
    Math.floor((Date.now() - timestamp.getTime()) / 1000),
  );

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const intervals = [
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count}${interval.label}`;
    }
  }

  return "Just now";
};

export default Dashboard;
