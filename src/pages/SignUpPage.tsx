import {
  Terminal,
  Key,
  Lock,
  Github,
  ArrowRight,
  FileText,
  Activity,
} from "lucide-react";

import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import LoadingSpinner from "../utils/LoadingSpinner";

type SignUpFormProps = {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFullnameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formdata: {
    email: string;
    password: string;
    fullname: string;
  };
  isLoading: boolean;
};

const BrandingPanel = () => {
  return (
    <div className="relative hidden w-1/2 flex-col bg-slate-900 p-10 text-white lg:flex border-r border-slate-800 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute top-[-20%] left-[-10%] w-125 h-125 bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <div className="relative z-20 flex items-center gap-2 text-lg font-bold tracking-tight">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)]">
          <Terminal size={20} />
        </div>
        EnvVault
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 flex flex-1 flex-col justify-center items-center gap-8 py-8">
        {/* Schematic Visualization */}
        <div className="relative z-20 max-w-lg w-full">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-1 backdrop-blur-sm shadow-2xl">
            <div className="rounded-lg border border-slate-800 bg-[#0B1121] p-6 relative overflow-hidden">
              {/* Glows */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-cyan-900/20 blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-blue-900/10 blur-3xl pointer-events-none"></div>

              {/* Header */}
              <div className="flex items-center justify-between mb-8 border-b border-slate-800/60 pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="text-cyan-500" size={14} />
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                    Hashing Flow
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                  <span className="text-[10px] font-mono text-slate-400">
                    ENCRYPTION ACTIVE
                  </span>
                </div>
              </div>

              {/* Flow Diagram */}
              <div className="flex items-center justify-between relative z-10 gap-2">
                {/* Step 1: File */}
                <div className="flex flex-col items-center gap-3 group cursor-default">
                  <div className="h-14 w-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center relative shadow-lg group-hover:border-slate-500 transition-colors group-hover:-translate-y-1 duration-300">
                    <FileText className="text-slate-400" size={20} />
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-slate-600 border border-slate-800"></span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    .env
                  </span>
                </div>

                {/* Line 1 */}
                <div className="flex-1 px-1 flex justify-center opacity-50">
                  <div className="h-px w-full bg-slate-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-500 to-transparent w-1/3 animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>

                {/* Step 2: Hashing */}
                <div className="relative flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-[#0f172a] border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.15)] z-10 relative">
                    <Key
                      className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]"
                      size={24}
                    />
                  </div>
                  <div className="absolute inset-0 -m-1 rounded-full border border-cyan-500/10 border-dashed animate-[spin_12s_linear_infinite]"></div>
                  <div className="absolute inset-0 -m-3 rounded-full border border-cyan-500/5 animate-[spin_8s_linear_infinite_reverse]"></div>
                  <span className="text-[9px] font-mono text-cyan-600 mt-2 absolute -bottom-6">
                    PBKDF2
                  </span>
                </div>

                {/* Line 2 */}
                <div className="flex-1 px-1 flex justify-center opacity-50">
                  <div className="h-px w-full bg-slate-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-500 to-transparent w-1/3 animate-[shimmer_2s_infinite_0.5s]"></div>
                  </div>
                </div>

                {/* Step 3: Vault */}
                <div className="flex flex-col items-center gap-3 group cursor-default">
                  <div className="h-14 w-12 rounded-lg bg-linear -to-br from-slate-900 to-cyan-950/40 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:-translate-y-1 transition-transform duration-300">
                    <Lock className="text-cyan-400" size={20} />
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Vault
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-2 gap-px bg-slate-800/40 rounded border border-slate-800 overflow-hidden">
                <div className="bg-slate-900/50 p-3 flex flex-col justify-center gap-1 hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
                      Strength
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300">
                    AES-256-GCM
                  </span>
                </div>
                <div className="bg-slate-900/50 p-3 flex flex-col justify-center gap-1 hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
                      Latency
                    </span>
                    <div className="flex gap-0.5 items-end h-2">
                      <div className="w-0.5 h-full bg-cyan-800 rounded-full"></div>
                      <div className="w-0.5 h-2/3 bg-cyan-600 rounded-full"></div>
                      <div className="w-0.5 h-full bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-white">
                    12ms <span className="text-slate-600">avg</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

const SignupForm: React.FC<SignUpFormProps> = ({
  handleSubmit,
  handleEmailChange,
  handlePasswordChange,
  formdata,
  isLoading,
  handleFullnameChange,
}) => {
  return (
    <div className="flex w-full flex-col justify-center p-8 lg:w-1/2 relative bg-slate-950 min-h-screen">
      <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2 text-white">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
          <Terminal size={18} />
        </div>
        <span className="font-bold tracking-tight">EnvVault</span>
      </div>

      <div className="absolute right-4 top-4 md:right-8 md:top-8 z-10">
        <a
          className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          href="/signin"
        >
          Already have an account?{" "}
          <span className="text-blue-500 hover:text-blue-400 ml-1">
            Sign In
          </span>
        </a>
      </div>

      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-95">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Create an account
          </h1>
          <p className="text-sm text-slate-400">
            Enter your email below to create your account
          </p>
        </div>

        <div className="grid gap-6">
          <button
            className="relative inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 shadow-sm"
            type="button"
          >
            <Github size={20} />
            Continue with GitHub
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-950 px-2 text-slate-500 font-medium tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={(e) => handleSubmit(e)}>
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-slate-300 ml-0.5"
                htmlFor="name"
              >
                Full Name
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50"
                id="name"
                name="name"
                placeholder="John Doe"
                required
                value={formdata.fullname}
                onChange={(e) => handleFullnameChange(e)}
                type="text"
              />
            </div>
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-slate-300 ml-0.5"
                htmlFor="email"
              >
                Work Email
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50"
                id="email"
                name="email"
                value={formdata.email}
                placeholder="name@company.com"
                onChange={(e) => handleEmailChange(e)}
                required
                type="email"
              />
            </div>
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-slate-300 ml-0.5"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                  id="password"
                  name="password"
                  required
                  value={formdata.password}
                  type="password"
                  onChange={(e) => handlePasswordChange(e)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
              </div>
            </div>

            {/* Password Strength */}
            <div className="space-y-2 pt-1">
              <div className="flex gap-1 h-1 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="w-1/4 bg-red-500/80"></div>
                <div className="w-1/4 bg-slate-800"></div>
                <div className="w-1/4 bg-slate-800"></div>
                <div className="w-1/4 bg-slate-800"></div>
              </div>
              <p className="text-[11px] text-slate-500 ml-0.5">
                Password must be at least 8 characters
              </p>
            </div>

            {isLoading && <LoadingSpinner />}
            <button
              className="w-full text-white bg-blue-600 hover:bg-blue-500 focus:ring-4 focus:outline-none focus:ring-blue-500/30 font-semibold rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-200 flex items-center justify-center gap-2 group mt-4 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
              type="submit"
            >
              Create Account
              <ArrowRight
                size={18}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </form>

          <p className="px-8 text-center text-xs text-slate-500">
            By clicking continue, you agree to our{" "}
            <a
              className="underline underline-offset-4 hover:text-blue-500 transition-colors"
              href="#"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              className="underline underline-offset-4 hover:text-blue-500 transition-colors"
              href="#"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullname : ""
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("LoginPage must be used within an AuthProvider");
  }
  const { register } = context;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("submit", formData);
    setIsLoading(true);
    try {
      await register(formData.fullname,formData.fullname,formData.email, formData.password);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      ["email"]: value,
    }));
    if (error) {
      setError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      ["password"]: value,
    }));
    if (error) {
      setError("");
    }
  };
  
  const handleFullnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      ["fullname"]: value,
    }));
    if (error) {
      setError("");
    }
  };

  return (
    <div className="h-screen overflow-hidden flex bg-slate-950 font-sans selection:bg-blue-500/30">
      <BrandingPanel />
      <SignupForm
        handleEmailChange={handleEmailChange}
        handleFullnameChange={handleFullnameChange}
        handleSubmit={handleSubmit}
        handlePasswordChange={handlePasswordChange}
        isLoading={isLoading}
        formdata={formData}
      />
    </div>
  );
};

export default SignUpPage;
