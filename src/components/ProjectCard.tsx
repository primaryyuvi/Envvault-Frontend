import type { ProjectCardMember } from "../types/project";

const getMemberInitials = (displayName: string) =>
  displayName.trim().slice(0, 2).toUpperCase() || "NA";

export const ProjectCard = ({
  title,
  desc,
  secrets,
  projectMembers,
  icon,
  onClick,
  onManageAccess,
}: {
  title: string;
  desc: string;
  secrets: number;
  projectMembers: ProjectCardMember[];
  icon: React.ReactNode;
  onClick?: () => void;
  onManageAccess?: () => void;
}) => {
  return (
    <li
      className="group hover:bg-slate-800/30 transition-colors duration-150 cursor-pointer"
      onClick={onClick}
    >
      <div className="px-6 py-5 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="mt-1 shrink-0">{icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                {title}
              </h3>
            </div>
            <p className="mt-1 text-sm text-slate-400 line-clamp-1">{desc}</p>
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                {secrets} Secrets
              </span>
              <span className="text-slate-700">•</span>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <div className="flex -space-x-2 overflow-hidden">
            {projectMembers.map((member) => (
              <div
                key={member.id}
                title={member.displayName}
                className="h-6 w-6 rounded-full ring-2 ring-slate-900 bg-slate-700 flex items-center justify-center text-[8px] text-white"
              >
                {getMemberInitials(member.displayName)}
              </div>
            ))}
          </div>
          <button
            className="text-slate-400 hover:text-white hover:border-white/30 transition-all border border-slate-800 rounded-md px-3 py-1.5 text-xs font-medium bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              onManageAccess?.();
            }}
          >
            Manage Access
          </button>
        </div>
      </div>
    </li>
  );
};
