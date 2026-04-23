import { useState } from "react";
import type { EnvironmentValues } from "../types/environment";
import {
  Code2,
  TerminalSquare,
  Rocket,
  ArrowRight,
  CheckCircle2,
  X,
} from "lucide-react";

interface CreateProjectDialogProps {
  onClose: () => void;
  handleCreateProject: (
    project_name: string,
    description: string,
    environments: EnvironmentValues[],
  ) => void;
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  onClose,
  handleCreateProject,
}) => {
  const [environments, setEnvironments] = useState<
    Record<EnvironmentValues, boolean>
  >({
    development: true,
    staging: true,
    production: true,
  });
  const [projectName, setprojectName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateProjectClick = async () => {
    if (!projectName) return;
    const envs = Object.keys(environments).filter(
      (key) => environments[key as EnvironmentValues]
    ) as EnvironmentValues[];
    console.log(projectName, description);
    handleCreateProject(projectName, description,envs);
  };

  const toggleEnv = (env: EnvironmentValues) => {
    setEnvironments((prev) => ({ ...prev, [env]: !prev[env] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-[560px] rounded-2xl border border-slate-800 bg-[#0f141e] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 pb-6">

          <div className="flex items-start gap-4 mb-8">
            <div className="mt-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Create New Project
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Get started by defining your project workspace.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2.5">
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-slate-200"
              >
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                placeholder="e.g. Acme Marketing Site"
                value={projectName}
                onChange={(e) => setprojectName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#0b0e14] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-200"
                >
                  Description
                </label>
                <span className="text-xs text-slate-500">Optional</span>
              </div>
              <textarea
                id="description"
                placeholder="Add a brief description of your project context..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-xl border border-slate-800 bg-[#0b0e14] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-200">
                  Default Environments
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => toggleEnv("development")}
                  className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                    environments.development
                      ? "border-blue-600 bg-blue-900/10"
                      : "border-slate-800 bg-transparent hover:border-slate-700"
                  }`}
                >
                  {environments.development && (
                    <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 fill-blue-600 text-[#0f141e]" />
                  )}
                  <Code2
                    className={`h-6 w-6 ${environments.development ? "text-slate-300" : "text-slate-500"}`}
                  />
                  <span
                    className={`text-sm font-medium ${environments.development ? "text-slate-200" : "text-slate-400"}`}
                  >
                    Development
                  </span>
                </button>

           
                <button
                  type="button"
                  onClick={() => toggleEnv("staging")}
                  className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                    environments.staging
                      ? "border-blue-600 bg-blue-900/10"
                      : "border-slate-800 bg-transparent hover:border-slate-700"
                  }`}
                >
                  {environments.staging && (
                    <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 fill-blue-600 text-[#0f141e]" />
                  )}
                  <TerminalSquare
                    className={`h-6 w-6 ${environments.staging ? "text-slate-300" : "text-slate-500"}`}
                  />
                  <span
                    className={`text-sm font-medium ${environments.staging ? "text-slate-200" : "text-slate-400"}`}
                  >
                    Staging
                  </span>
                </button>

    
                <button
                  type="button"
                  onClick={() => toggleEnv("production")}
                  className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                    environments.production
                      ? "border-blue-600 bg-blue-900/10"
                      : "border-slate-800 bg-transparent hover:border-slate-700"
                  }`}
                >
                  {environments.production && (
                    <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 fill-blue-600 text-[#0f141e]" />
                  )}
                  <Rocket
                    className={`h-6 w-6 ${environments.production ? "text-slate-300" : "text-slate-500"}`}
                  />
                  <span
                    className={`text-sm font-medium ${environments.production ? "text-slate-200" : "text-slate-400"}`}
                  >
                    Production
                  </span>
                </button>
              </div>
            </div>
          </div>


          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProjectClick}
              className="flex items-center gap-2 rounded-lg bg-[#2563eb] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              Create Project
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
