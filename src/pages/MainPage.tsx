import React, { useContext, useState } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Projects from "./Projects";
import SettingsPage from "./SettingsPage";
import { AuthContext } from "../contexts/AuthContext";
import { Team } from "./Team";
import AppLogo from "../components/AppLogo";

type ViewState = "dashboard" | "projects" | "settings" | "teams";

const getViewFromPath = (pathname: string): ViewState => {
  if (pathname.startsWith("/projects")) return "projects";
  if (pathname.startsWith("/teams")) return "teams";
  if (pathname.startsWith("/settings")) return "settings";
  return "dashboard";
};

const NavItem = ({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      active
        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`}
  >
    {icon}
    {label}
  </button>
);

const SidebarContent = ({
  email,
  displayName,
  activeView,
  onNavigate,
  onLogoutButtonClicked,
}: {
  email: string;
  displayName: string;
  activeView: ViewState;
  onNavigate: (path: string) => void;
  onLogoutButtonClicked: () => void;
}) => (
  <>
    <div className="h-16 flex items-center px-6 border-b border-[#30363d]">
      <div className="flex items-center gap-3">
        <AppLogo className="h-8 w-8" />
        <span className="font-bold text-lg tracking-tight text-white">
          EnvVault
        </span>
      </div>
    </div>

    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
      <NavItem
        icon={<LayoutDashboard size={20} />}
        label="Dashboard"
        active={activeView === "dashboard"}
        onClick={() => onNavigate("/dashboard")}
      />
      <NavItem
        icon={<FolderOpen size={20} />}
        label="Projects"
        active={activeView === "projects"}
        onClick={() => onNavigate("/projects")}
      />
      <NavItem
        icon={<Users size={20} />}
        label="Team"
        active={activeView === "teams"}
        onClick={() => onNavigate("/teams")}
      />
      <NavItem
        icon={<Settings size={20} />}
        label="Settings"
        active={activeView === "settings"}
        onClick={() => onNavigate("/settings")}
      />
    </nav>

    <div className="p-4 border-t border-[#30363d] bg-[#0d1017]/50">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold border border-slate-600">
          {displayName.trim().slice(0, 2).toUpperCase() || "YG"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-white">
            {displayName}
          </p>
          <p className="text-xs text-slate-400 truncate">{email}</p>
        </div>
        <button
          onClick={onLogoutButtonClicked}
          className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  </>
);

const DesktopSidebar = ({
  email,
  displayName,
  activeView,
  onNavigate,
  onLogoutButtonClicked,
}: {
  email: string;
  displayName: string;
  activeView: ViewState;
  onNavigate: (path: string) => void;
  onLogoutButtonClicked: () => void;
}) => (
  <aside className="w-64 shrink-0 border-r border-[#30363d] bg-[#0d1017] flex-col hidden md:flex">
    <SidebarContent
      email={email}
      displayName={displayName}
      activeView={activeView}
      onNavigate={onNavigate}
      onLogoutButtonClicked={onLogoutButtonClicked}
    />
  </aside>
);

const MobileSidebar = ({
  email,
  displayName,
  isOpen,
  onClose,
  activeView,
  onNavigate,
  onLogoutButtonClicked,
}: {
  email: string;
  displayName: string;
  isOpen: boolean;
  onClose: () => void;
  activeView: ViewState;
  onNavigate: (path: string) => void;
  onLogoutButtonClicked: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <aside className="relative w-64 max-w-xs h-full bg-[#0d1017] border-r border-[#30363d] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>
        <SidebarContent
          email={email}
          displayName={displayName}
          activeView={activeView}
          onNavigate={(path) => {
            onNavigate(path);
            onClose();
          }}
          onLogoutButtonClicked={onLogoutButtonClicked}
        />
      </aside>
    </div>
  );
};

const MainPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("MainPage must be used within an AuthProvider");
  }

  const { logout, user } = context;
  const activeView = getViewFromPath(location.pathname);

  const onLogoutButtonClicked = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case "projects":
        return <Projects />;
      case "settings":
        return <SettingsPage />;
      case "teams":
        return <Team />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f111a] text-slate-300 font-sans selection:bg-indigo-500/30">
      <DesktopSidebar
        email={user?.email ?? ""}
        displayName={user?.displayName ?? ""}
        activeView={activeView}
        onNavigate={navigate}
        onLogoutButtonClicked={onLogoutButtonClicked}
      />
      <MobileSidebar
        email={user?.email ?? ""}
        displayName={user?.displayName ?? ""}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeView={activeView}
        onNavigate={navigate}
        onLogoutButtonClicked={onLogoutButtonClicked}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-[#0f111a] relative overflow-hidden">
        <header className="md:hidden h-16 flex items-center justify-between px-6 border-b border-[#30363d] bg-[#161b22] sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        {renderView()}
      </main>
    </div>
  );
};

export default MainPage;
