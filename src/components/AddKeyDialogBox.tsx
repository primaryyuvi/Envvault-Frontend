import React, { useEffect, useState } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  Shield,
  Lock,
  X,
  Save,
  PencilLine,
} from 'lucide-react';
// import type { EnvironmentValues } from '../types/environment';

interface AddSecretDialogProps {
  onClose: () => void;
  // handleAddKey: (keyName: string, keyValue: string, environment: string) => void;
  handleAddKey: (keyName: string, keyValue: string) => void;
}

interface SecretDetailsDialogProps {
  onClose: () => void;
  secretName: string;
  secretValue: string;
  onSave: (keyName: string, keyValue: string) => void;
  canEdit?: boolean;
}

const DialogShell: React.FC<{
  onClose: () => void;
  children: React.ReactNode;
}> = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    />

    <div
      className="relative flex w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0f141e] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
      >
        <X size={20} />
      </button>
      {children}
    </div>
  </div>
);

export const AddKeyDialog: React.FC<AddSecretDialogProps> = ({ onClose,handleAddKey }) => {
  const [secretName, setSecretName] = useState<string>('');
  const [secretValue, setSecretValue] = useState<string>('');
  const [showValue, setShowValue] = useState<boolean>(false);
  // const [selectedEnv, setSelectedEnv] = useState<EnvironmentValues>('development');

  const handleAddSecret = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // handleAddKey(secretName, secretValue, selectedEnv);
    handleAddKey(secretName, secretValue);
    onClose();
  };

  return (
    <DialogShell onClose={onClose}>
        <div className="p-8 pb-8">
          <div className="flex items-start gap-4 mb-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1e293b]/50 border border-slate-700/50 shadow-inner">
              <KeyRound className="h-6 w-6 text-blue-500" strokeWidth={2.5} />
            </div>
            <div className="mt-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">Add New Secret</h2>
              <p className="text-sm text-slate-400 mt-1">Securely store environment variables for your project.</p>
            </div>
          </div>

      
          <div className="space-y-6">

            <div className="space-y-2.5">
              <label htmlFor="secretName" className="block text-sm font-medium text-slate-200">
                Secret Name
              </label>
              <input
                type="text"
                id="secretName"
                value={secretName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSecretName(e.target.value)}
                placeholder="DATABASE_URL"
                className="w-full rounded-xl border border-slate-800 bg-[#0b0e14] px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-mono"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label htmlFor="secretValue" className="block text-sm font-medium text-slate-200">
                  Secret Value
                </label>
                <button 
                  type="button"
                  onClick={() => setShowValue(!showValue)}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors"
                >
                  {showValue ? (
                    <>
                      <EyeOff size={14} />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      Show
                    </>
                  )}
                </button>
              </div>
              <textarea
                id="secretValue"
                value={secretValue}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSecretValue(e.target.value)}
                placeholder="postgres://user:password@localhost:5432/mydb"
                rows={4}
                className={`w-full resize-none rounded-xl border border-slate-800 bg-[#0b0e14] px-4 py-3 text-sm placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${showValue ? 'text-white font-mono' : 'text-slate-400 font-mono tracking-widest'}`}
                style={{ WebkitTextSecurity: showValue ? 'none' : 'disc' } as any} 
              />
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-[#1e3a8a]/50 bg-[#172554]/30 p-4">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
              <div>
                <h4 className="text-sm font-medium text-blue-400">Zero-Knowledge Encryption</h4>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Your secret is encrypted in the browser with the project key before it is sent to the server.
                </p>
              </div>
            </div>
            
          </div>
          
     
          <div className="mt-8 flex items-center justify-between">
            <button 
              onClick={onClose}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-4 py-2"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddSecret}
              className="flex items-center gap-2 rounded-lg bg-[#2563eb] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              Add Secret
              <Lock className="h-4 w-4" />
            </button>
          </div>

        </div>
    </DialogShell>
  );
};

export const SecretDetailsDialog: React.FC<SecretDetailsDialogProps> = ({
  onClose,
  secretName,
  secretValue,
  onSave,
  canEdit = true,
}) => {
  const [draftName, setDraftName] = useState(secretName);
  const [draftValue, setDraftValue] = useState(secretValue);
  const [showValue, setShowValue] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setDraftName(secretName);
    setDraftValue(secretValue);
    setShowValue(false);
    setIsEditing(false);
  }, [canEdit, secretName, secretValue]);

  const hasChanges =
    draftName.trim() !== (secretName ?? '').trim() || draftValue !== secretValue;

  const handleSaveChanges = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onSave(draftName.trim(), draftValue);
  };

  return (
    <DialogShell onClose={onClose}>
      <div className="p-8 pb-8">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-700/50 bg-[#1e293b]/50 shadow-inner">
            <KeyRound className="h-6 w-6 text-blue-500" strokeWidth={2.5} />
          </div>
          <div className="mt-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isEditing ? 'Edit Secret' : 'Secret Details'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {isEditing
                ? 'Update the secret name and value in the same secure form.'
                : 'Review the secret name and reveal the value only when needed.'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2.5">
            <label htmlFor="detailsSecretName" className="block text-sm font-medium text-slate-200">
              Secret Name
            </label>
            <input
              type="text"
              id="detailsSecretName"
              value={draftName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraftName(e.target.value)}
              readOnly={!isEditing}
              className={`w-full rounded-xl border px-4 py-3 text-sm text-white placeholder-slate-600 transition-colors font-mono focus:outline-none ${
                isEditing
                  ? 'border-slate-800 bg-[#0b0e14] focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  : 'border-slate-800/80 bg-[#0b0e14]/70 text-slate-200'
              }`}
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="detailsSecretValue" className="block text-sm font-medium text-slate-200">
                Secret Value
              </label>
              <button
                type="button"
                onClick={() => setShowValue((prev) => !prev)}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-500 transition-colors hover:text-blue-400"
              >
                {showValue ? (
                  <>
                    <EyeOff size={14} />
                    Hide value
                  </>
                ) : (
                  <>
                    <Eye size={14} />
                    Show naked
                  </>
                )}
              </button>
            </div>
            <textarea
              id="detailsSecretValue"
              value={draftValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraftValue(e.target.value)}
              rows={4}
              readOnly={!isEditing}
              className={`w-full resize-none rounded-xl border px-4 py-3 text-sm placeholder-slate-600 transition-colors font-mono focus:outline-none ${
                isEditing
                  ? 'border-slate-800 bg-[#0b0e14] focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  : 'border-slate-800/80 bg-[#0b0e14]/70'
              } ${showValue ? 'text-white' : 'tracking-widest text-slate-400'}`}
              style={{ WebkitTextSecurity: showValue ? 'none' : 'disc' } as React.CSSProperties}
            />
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-[#1e3a8a]/50 bg-[#172554]/30 p-4">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
            <div>
              <h4 className="text-sm font-medium text-blue-400">Protected Reveal</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Values stay masked by default. Reveal them only when you need to inspect or update them.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={isEditing ? () => {
              setDraftName(secretName);
              setDraftValue(secretValue);
              setIsEditing(false);
            } : onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            {isEditing ? 'Cancel' : 'Close'}
          </button>
          {isEditing ? (
            <button
              onClick={handleSaveChanges}
              disabled={!draftName.trim() || !hasChanges}
              className="flex items-center gap-2 rounded-lg bg-[#2563eb] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Changes
              <Save className="h-4 w-4" />
            </button>
          ) : canEdit ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-lg bg-[#2563eb] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              Edit Secret
              <PencilLine className="h-4 w-4" />
            </button>
          ) : (
            <div className="rounded-lg border border-slate-800 bg-[#0b0e14] px-4 py-2 text-xs font-medium text-slate-400">
              Read-only access
            </div>
          )}
        </div>
      </div>
    </DialogShell>
  );
};
