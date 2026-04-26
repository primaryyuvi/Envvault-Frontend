import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  LayoutDashboard, 
  Lock, 
  WifiOff, 
  Database, 
  Zap, 
  Key, 
  History, 
  Code, 
  Github, 
  Twitter, 
  Linkedin, 
  Loader2 
} from 'lucide-react';
import AppLogo from '../components/AppLogo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const onSignInClick = (event : React.FormEvent) => {
    event.preventDefault();
    navigate("/signin");
  }
  
  const onSignUpClick = (event : React.FormEvent) => {
    event.preventDefault();
    navigate("/signup");
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <AppLogo className="h-8 w-8" />
            <span className="font-bold text-lg tracking-tight text-white">EnvVault</span>
          </div>
          
          <nav className="hidden md:flex gap-6 items-center">
            <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#">How it works</a>
            <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1" href="https://github.com/primaryyuvi/EnvVault-Frontend" target="_blank"  rel="noopener noreferrer">
              GitHub
              <ExternalLink size={14} />
            </a>
            
            <button className='text-sm' onClick={onSignInClick}>
              Sign In
            </button>
            
            <button className="items-center justify-center rounded-lg text-sm  bg-blue-500 text-white h-9 px-4 shadow-lg transition-transform hover:-translate-y-0.5" onClick={onSignUpClick}>
              Get Started
            </button>
          </nav>
          
         
          
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800">
           <div className="px-4 py-4 space-y-4">
            <a className="block text-sm font-medium text-slate-400 hover:text-white" href="#">How it works</a>
            <a className="block text-sm font-medium text-slate-400 hover:text-white" href="#">GitHub</a>
           </div>
        </div>
      )}
    </header>
  );
};

const Hero = () => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center rounded-full border border-blue-600/20 bg-blue-600/5 px-3 py-1 text-xs font-medium text-blue-500 mb-6">
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
            Open Source Project
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
            Stop committing .env files.<br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-400 drop-shadow-[0_0_20px_rgba(37,99,235,0.5)]">Sync secrets securely.</span>
          </h1>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            A lightweight, zero-knowledge CLI tool to manage environment variables across your team and infrastructure. Built with TypeScript for flexibility.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="relative group cursor-pointer" onClick={handleCopy}>
              <div className="absolute -inset-0.5 bg-linear-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-200"></div>
              <div className="relative flex items-center bg-slate-900 text-slate-300 rounded-lg px-4 py-3 font-mono text-sm border border-slate-800">
                <span className="text-blue-500 mr-2">$</span>
                <span>npm install -g envvault</span>
                <button className="ml-4 hover:text-white transition-colors" title="Copy to clipboard">
                  {copied ? <Check size={16} className="text-emerald-500"/> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 max-w-6xl mx-auto">
          {/* Terminal Card */}
          <div className="md:col-span-2 md:row-span-2 bg-slate-950 rounded-xl border border-slate-800/60 shadow-xl overflow-hidden flex flex-col group hover:border-blue-600/40 transition-all duration-300 relative">
             <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"></div>
             <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 bg-[#0b1121]">
               <div className="flex gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
               </div>
               <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">envvault-cli — zsh</div>
               <div className="w-8"></div>
             </div>
             <div className="p-6 font-mono text-sm bg-[#0b1121] text-slate-300 flex-1 overflow-hidden relative">
               <div className="flex flex-col gap-3 relative z-10">
                 <div className="flex gap-2 items-center">
                   <span className="text-emerald-400">➜</span>
                   <span className="text-blue-400 font-bold">~</span>
                   <span className="text-slate-100">envvault run production -- npm start</span>
                 </div>
                 <div className="pl-4 border-l border-slate-700/50 space-y-2 mt-2">
                   <div className="flex items-center gap-2 text-xs text-slate-500">
                     <Loader2 size={14} className="animate-spin"/>
                     Syncing secrets from vault...
                   </div>
                   <div className="flex items-center gap-2 text-xs text-emerald-500">
                     <Check size={14} />
                     Decrypted 14 variables (0.2s)
                   </div>
                 </div>
                 <div className="mt-4 p-3 bg-slate-800/30 rounded border border-slate-700/50 text-xs">
                   <div className="text-slate-500 mb-2">// Injected Environment</div>
                   <div className="grid grid-cols-[140px_1fr] gap-y-1">
                     <span className="text-purple-400">DATABASE_URL</span>
                     <span className="text-slate-500">postgres://user:***@db.aws...</span>
                     <span className="text-purple-400">STRIPE_KEY</span>
                     <span className="text-slate-500">sk_live_51Mz...</span>
                     <span className="text-purple-400">REDIS_HOST</span>
                     <span className="text-slate-500">redis-prod.internal</span>
                   </div>
                 </div>
                 <div className="flex gap-2 mt-2">
                   <span className="text-emerald-400">➜</span>
                   <span className="text-blue-400 font-bold">~/app</span>
                   <span className="text-slate-100">&gt; node server.js</span>
                 </div>
                 <div className="text-slate-400">Server listening on port 3000...</div>
                 <span className="w-2 h-5 bg-blue-600/50 animate-pulse inline-block align-middle mt-1"></span>
               </div>
             </div>
          </div>

          {/* Web Dashboard Card */}
          <div className="bg-slate-950 rounded-xl border border-slate-800/60 shadow-lg p-6 flex flex-col justify-between hover:border-blue-600/40 transition-colors duration-300 group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-colors"></div>
            <div className="mb-4 relative z-10">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3 border border-blue-500/20">
                <LayoutDashboard size={20} />
              </div>
              <h3 className="text-base font-semibold text-white">Web Dashboard</h3>
              <p className="text-sm text-slate-500 mt-1">Manage project keys and access rights visually.</p>
            </div>
            <div className="mt-auto relative z-10">
              <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 text-xs shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-300">Staging Env</span>
                  <span className="text-[10px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">Active</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between bg-slate-800 p-1.5 rounded border border-slate-700">
                    <span className="font-mono text-[10px] text-slate-500">API_KEY</span>
                    <span className="flex gap-1">
                      <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                      <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                      <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-800 p-1.5 rounded border border-slate-700">
                    <span className="font-mono text-[10px] text-slate-500">DB_HOST</span>
                    <span className="flex gap-1">
                      <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                      <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                      <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zero Knowledge Card */}
          <div className="bg-slate-950 rounded-xl border border-slate-800/60 shadow-lg p-6 hover:border-blue-600/40 transition-colors duration-300 flex flex-col relative overflow-hidden">
            <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-base font-semibold text-white flex items-center gap-2">
                 <Lock size={20} className="text-emerald-500" />
                 Zero Knowledge
               </h3>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-3">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Database Storage</span>
                  <span className="text-[10px] text-emerald-500 font-mono">Hashes Only</span>
                </div>
                <div className="flex gap-1 text-[10px] font-mono text-slate-400 break-all leading-tight opacity-70">
                  7d9a3b2c1e8f4...
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                We only store hashes. Your raw secrets never touch our database and cannot be read by us.
              </p>
            </div>
          </div>

          {/* Local-First Card */}
          <div className="bg-slate-950 rounded-xl border border-slate-800/60 shadow-lg p-6 hover:border-blue-600/40 transition-colors duration-300 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full bg-linear-to-l from-white/5 to-transparent pointer-events-none"></div>
            <div className="flex flex-col h-full justify-between relative z-10">
              <div>
                <h3 className="text-base font-semibold text-white">Local-First</h3>
                <p className="text-xs text-slate-500 mt-1">Works offline. Syncs when online.</p>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                  <WifiOff size={16} className="text-slate-400" />
                </div>
                <div className="h-px flex-1 bg-slate-700 border-t border-dashed border-slate-400"></div>
                <div className="h-8 w-8 rounded-full bg-green-900/30 flex items-center justify-center border border-green-800">
                  <Database size={16} className="text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const UnderTheHood = () => {
  return (
    <section className="py-20 border-y border-slate-800 bg-slate-900/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold text-white mb-4">Under the hood</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            EnvVault is designed to be simple but robust. It uses industry-standard cryptography and a simple JSON-based storage format that is easy to audit.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full opacity-20"></div>
            <div className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-[#0b1121] relative">
              <div className="flex items-center px-4 py-2 border-b border-white/5 bg-white/5">
                <span className="text-xs font-mono text-slate-400">src/utils/crypto.ts</span>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="font-mono text-xs leading-relaxed text-slate-300">
                  <code>
                    <span className="text-purple-400">export</span> <span className="text-purple-400">async</span> <span className="text-blue-400">function</span> <span className="text-blue-400">encryptSecret</span>(<br/>
                    &nbsp;&nbsp;val: <span className="text-emerald-400">string</span>,<br/>
                    &nbsp;&nbsp;key: <span className="text-emerald-400">Buffer</span><br/>
                    ): <span className="text-emerald-400">Promise</span>&lt;<span className="text-emerald-400">Buffer</span>&gt; &#123;<br/>
                    &nbsp;&nbsp;<span className="text-purple-400">const</span> iv = crypto.<span className="text-blue-400">randomBytes</span>(12);<br/>
                    &nbsp;&nbsp;<span className="text-purple-400">const</span> cipher = crypto.<span className="text-blue-400">createCipheriv</span>(<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">'aes-256-gcm'</span>, key, iv<br/>
                    &nbsp;&nbsp;);<br/>
                    &nbsp;&nbsp;<span className="text-slate-500">// Encrypt payload</span><br/>
                    &nbsp;&nbsp;<span className="text-purple-400">const</span> encrypted = <span className="text-emerald-400">Buffer</span>.<span className="text-blue-400">concat</span>([<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;cipher.<span className="text-blue-400">update</span>(val, <span className="text-emerald-400">'utf8'</span>),<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;cipher.<span className="text-blue-400">final</span>()<br/>
                    &nbsp;&nbsp;]);<br/>
                    &nbsp;&nbsp;<span className="text-purple-400">return</span> <span className="text-emerald-400">Buffer</span>.<span className="text-blue-400">concat</span>([iv, encrypted]);<br/>
                    &#125;
                  </code>
                </pre>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">TypeScript Native</h3>
                <p className="text-sm text-slate-400 mt-1">Written in TypeScript for easy integration with your existing Node.js workflows. Familiar and type-safe.</p>
              </div>
            </div>
            
             <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Key size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Zero Knowledge</h3>
                <p className="text-sm text-slate-400 mt-1">The server only stores hashes. Without your master key, the data is just noise.</p>
              </div>
            </div>
            
             <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <History size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Version Control Friendly</h3>
                <p className="text-sm text-slate-400 mt-1">Encrypted vaults can be safely committed to git, allowing you to track history of secret changes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden text-center bg-slate-950">
       <div className="max-w-3xl mx-auto px-4 relative z-10">
         <h2 className="text-3xl font-bold text-white mb-6">Ready to secure your env?</h2>
         <p className="text-slate-400 mb-8">
           EnvVault is open source and free to use for personal projects.
           Check out the code on GitHub or contribute.
         </p>
         <div className="flex justify-center gap-4">
          <a href="https://github.com/primaryyuvi/EnvVault-Frontend"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg text-sm font-bold bg-slate-100 text-slate-900 hover:bg-slate-200 h-11 px-6 shadow-lg transition-transform hover:-translate-y-0.5">
            <Code size={18} className="mr-2" />
             View Source
           </a>
         </div>
       </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="border-t border-slate-800 py-8 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <AppLogo className="h-6 w-6" />
          <span className="font-bold text-sm text-slate-300">EnvVault</span>
        </div>
        <div className="flex gap-6">
          <a href="https://github.com/primaryyuvi/EnvVault-Frontend" className="text-slate-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
            <Github size={20} />
          </a>
          <a href="https://x.com/yuvicoder" className="text-slate-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
            <Twitter size={20} />
          </a>
          <a href="https://www.linkedin.com/in/yuvaraj0808/" className="text-slate-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
             <Linkedin size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600/20">
      <div className="fixed inset-0 bg-[#020617] -z-20"></div>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(at_0%_0%,rgba(37,99,235,0.15)_0px,transparent_50%),radial-gradient(at_100%_0%,rgba(59,130,246,0.08)_0px,transparent_50%)]"></div>
      
      <Navbar />
      <main className="grow">
        <Hero />
        <UnderTheHood />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
