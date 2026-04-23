import {
  Terminal,
  Key,
  Lock,
  Fingerprint,
  ShieldCheck,
  Github,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import LoadingSpinner from "../utils/LoadingSpinner";

type LoginFormProps = {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formdata: {
    email: string;
    password: string;
  };
  isLoading: boolean;
};

const BrandingPanel = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 flex-col justify-between p-12 text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_0%_0%,rgba(37,99,235,0.15)_0px,transparent_50%),radial-gradient(at_100%_0%,rgba(59,130,246,0.08)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(37,99,235,0.05)_0px,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px]"></div>

        <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-125 h-125 bg-indigo-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        <a
          className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit"
          href="/"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <Terminal size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            EnvVault
          </span>
        </a>
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center justify-center grow py-8">
        <div className="relative w-full flex flex-col items-center gap-8">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800 -translate-x-1/2"></div>

          <div className="relative z-10 w-64 rounded-xl p-1 shadow-lg shadow-blue-900/10 group bg-slate-900/80 backdrop-blur-sm border border-blue-500/20">
            <div className="bg-slate-900/90 rounded-lg p-3 flex items-center justify-between border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
                  <Key size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                    Input Key
                  </span>
                  <span className="text-xs text-blue-100 font-mono tracking-wide">
                    sk_live_...x4b
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full blur-[1px]"></div>
          </div>

          <div className="relative h-8 w-px overflow-hidden z-10">
            <div className="absolute inset-0 bg-blue-400 blur-[2px] w-full h-1/2 animate-[flowDown_2s_ease-in-out_infinite]"></div>
          </div>

          <div className="relative z-10 group">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-all duration-700"></div>
            <div className="relative w-20 h-20 rounded-2xl bg-slate-900 border border-blue-400/30 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(37,99,235,0.3)]">
              <Lock
                size={32}
                className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]"
              />
            </div>
            <div className="absolute -right-12 top-0 bg-slate-800 border border-slate-700 text-[9px] text-emerald-400 px-2 py-0.5 rounded-full font-mono shadow-lg tracking-wider">
              AES-256
            </div>
          </div>

          <div className="relative h-8 w-px overflow-hidden z-10">
            <div
              className="absolute inset-0 bg-emerald-400 blur-[2px] w-full h-1/2 animate-[flowDown_2s_ease-in-out_infinite]"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          <div className="relative z-10 w-64 rounded-xl p-1 shadow-lg shadow-emerald-900/10 group bg-slate-900/80 backdrop-blur-sm border border-emerald-500/20">
            <div className="bg-slate-900/90 rounded-lg p-3 flex items-center justify-between border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
                  <Fingerprint size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                    SHA-256
                  </span>
                  <span className="text-xs text-emerald-100 font-mono tracking-wide">
                    e3b0c44...f8c
                  </span>
                </div>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            </div>
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-full blur-[1px]"></div>
          </div>
        </div>

        <div className="mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/40 border border-blue-500/20 backdrop-blur-md shadow-lg">
            <ShieldCheck size={20} className="text-emerald-400" />
            <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
              Zero-Knowledge Verified
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-sm text-slate-500 flex justify-between items-center w-full">
        <span className="text-xs font-mono opacity-50">v2.4.0-stable</span>
      </div>

      <style>{`
        @keyframes flowDown {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const LoginForm: React.FC<LoginFormProps> = ({
  handleSubmit,
  handleEmailChange,
  handlePasswordChange,
  formdata,
  isLoading
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 bg-slate-950 overflow-y-auto min-h-screen">
      <div className="w-full max-w-md space-y-8">
        <div className="lg:hidden flex justify-center mb-8">
          <a className="flex items-center gap-2" href="#">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Terminal size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              EnvVault
            </span>
          </a>
        </div>

        <div className="text-center">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Don't have an account?{" "}
            <a
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              href="/signup"
            >
              Sign up for free
            </a>
          </p>
        </div>

        <div className="mt-8">
          <button
            className="relative inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 shadow-sm"
            type="button"
          >
            <Github size={20} />
            Continue with GitHub
          </button>
        </div>

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

        <form className="space-y-6" onSubmit={(e) => handleSubmit(e)}>
          <div>
            <label
              className="block text-sm font-medium leading-6 text-slate-300"
              htmlFor="email"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                value={formdata.email}
                autoComplete="email"
                required
                placeholder="name@company.com"
                onChange={(e) => handleEmailChange(e)}
                className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-300 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-shadow focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                className="block text-sm font-medium leading-6 text-slate-300"
                htmlFor="password"
              >
                Password
              </label>
              <div className="text-sm">
                <a
                  className="font-medium text-blue-600 hover:text-blue-500"
                  href="#"
                >
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formdata.password}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                onChange={(e)=> handlePasswordChange(e)}
                className="block w-full rounded-lg border-0 py-2.5 px-3 pr-11 text-slate-300 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-shadow focus:outline-none"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 transition-colors hover:text-slate-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div>
            {isLoading && <LoadingSpinner />}
            {!isLoading && <button
              type="submit"
              className="flex w-full justify-center rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200"
            >
              Sign in
            </button>}
          </div>
        </form>

        <p className="text-center text-xs text-slate-500 mt-8">
          By clicking continue, you agree to our{" "}
          <a className="underline hover:text-slate-800" href="#">
            Terms of Service
          </a>{" "}
          and{" "}
          <a className="underline hover:text-slate-800" href="#">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};

const SignInPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("LoginPage must be used within an AuthProvider");
  }
  const { login } = context;
  
  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault();
    console.log("submit",formData)
    setIsLoading(true)
    try {
      await login(formData.email,formData.password)
    } catch (e: any) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleEmailChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      ["email"] : value
    }));
    if (error) {
      setError('');
    }
  }
  
  const handlePasswordChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      ["password"] : value
    }));
    if (error) {
      setError('');
    }
  }

 

  return (
    <div className="h-screen overflow-hidden flex bg-white font-sans">
      <BrandingPanel />
      <LoginForm
        handleSubmit={handleSubmit}
      handleEmailChange ={handleEmailChange}
        handlePasswordChange={handlePasswordChange}
        formdata={formData}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SignInPage;
