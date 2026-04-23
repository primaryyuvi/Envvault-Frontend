import { useEffect, useState } from "react";
import { PlusCircle, ChevronDown, ChevronRight } from "lucide-react";
import type { Project } from "../types/project";
import type { Environment } from "../types/environment";

interface ProjectListProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
  onEnvClick: (environmentId: string) => void;
  selectedProject: string;
  selectedEnv: string;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onProjectClick,
  onEnvClick,
  selectedProject,
  selectedEnv,
}) => {
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    setExpandedProjects((prev) => {
      const next = { ...prev };

      projects.forEach((project) => {
        if (!(project.id in next)) {
          next[project.id] = true;
        }
      });

      return next;
    });
  }, [projects]);

  const handleToggleProject = (projectId: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
    onProjectClick(projectId);
  };

  return (
    <aside className="w-64 shrink-0 bg-[#161b22] border-r border-[#30363d] flex-col z-10 hidden lg:flex">
      <div className="h-16 flex items-center px-4 border-b border-[#30363d]">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-400">
          Projects
        </h2>
        <button className="ml-auto text-slate-400 hover:text-indigo-400 transition-colors">
          <PlusCircle size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {projects.map((project) => (
          <ProjectItem
            key={project.id}
            projectId={project.id}
            label={project.name ?? "Untitled Project"}
            onProjectClick={() => handleToggleProject(project.id)}
            onEnvClick={onEnvClick}
            environments={project.environments ?? []}
            isExpanded={expandedProjects[project.id] ?? true}
            isSelected={project.id === selectedProject}
            selectedEnv={selectedEnv}
          />
        ))}
      </div>
    </aside>
  );
};

const ProjectItem = ({
  projectId,
  label,
  onProjectClick,
  environments,
  onEnvClick,
  isExpanded,
  isSelected,
  selectedEnv,
}: {
  projectId: string;
  label: string;
  onProjectClick: () => void;
  environments: Environment[];
  onEnvClick: (environmentId: string) => void;
  isExpanded: boolean;
  isSelected: boolean;
  selectedEnv?: string;
}) => (
  <div className="px-2 mb-1">
    <button
      onClick={onProjectClick}
      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group border ${
        isSelected
          ? "bg-indigo-500/12 text-indigo-200 border-indigo-500/30 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.08)]"
          : "text-slate-300 border-transparent hover:bg-slate-800"
      }`}
    >
      <span className="min-w-0 truncate pr-3">{label}</span>
      <span className="ml-auto">
        {isExpanded ? (
          <ChevronDown
            size={16}
            className={isSelected ? "text-indigo-300" : "text-slate-500 group-hover:text-slate-300"}
          />
        ) : (
          <ChevronRight
            size={16}
            className={isSelected ? "text-indigo-300" : "text-slate-500 group-hover:text-slate-300"}
          />
        )}
      </span>
    </button>
    {isExpanded && <div className="px-2 mb-1">
      {environments.map((env) => (
        <SubProjectItem
          key={`${projectId}-${env.id}`}
          label={env.name ?? "Unknown environment"}
          active={env.id === selectedEnv}
          onClick={() => onEnvClick(env.id)}
        />
      ))}
    </div>}
  </div>
);

const SubProjectItem = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center px-3 py-2 text-sm rounded-md font-medium transition-colors ${
      active
        ? "bg-indigo-500/10 text-indigo-400"
        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full mr-2 ${active ? "bg-indigo-500" : "bg-slate-500"}`}
    ></span>
    {label}
  </button>
);
