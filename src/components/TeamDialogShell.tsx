import React from "react";
import { X } from "lucide-react";

interface TeamDialogShellProps {
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClassName?: string;
}

export const TeamDialogShell: React.FC<TeamDialogShellProps> = ({
  onClose,
  children,
  maxWidthClassName = "max-w-2xl",
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    />

    <div
      className={`relative flex w-full ${maxWidthClassName} max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0f141e] shadow-2xl animate-in fade-in zoom-in-95 duration-200`}
      onClick={(event: React.MouseEvent<HTMLDivElement>) =>
        event.stopPropagation()
      }
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
      >
        <X size={20} />
      </button>
      {children}
    </div>
  </div>
);
