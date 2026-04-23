import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Code2,
  LoaderCircle,
  Moon,
  Save,
  Sun,
} from "lucide-react";
import { getUser, updateUser } from "../services/Profile.service";
import { AuthContext } from "../contexts/AuthContext";
import LoadingSpinner from "../utils/LoadingSpinner";

const maxBioLength = 200;

export default function SettingsPage(): React.JSX.Element {
  return <AccountSettings />;
}

const AccountSettings: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [displayName, setDisplayName] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [bio, setBio] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [defaultWorkspace, setDefaultWorkspace] = useState("staging");

  const [initialValues, setInitialValues] = useState({
    displayName: "",
    githubUsername: "",
    bio: "",
    defaultWorkspace: "staging",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const user = await getUser();
        const nextDisplayName = user.displayName?.trim() ?? "";
        const nextUsername =
          user.username?.trim() ?? user.userName?.trim() ?? "";
        const nextBio = user.bio?.trim() ?? "";
        const nextWorkspace =
          user.defaultWorkspace?.trim() ??
          user.workspace?.trim() ??
          "staging";

        setDisplayName(nextDisplayName);
        setGithubUsername(nextUsername);
        setBio(nextBio);
        setDefaultWorkspace(nextWorkspace);
        setInitialValues({
          displayName: nextDisplayName,
          githubUsername: nextUsername,
          bio: nextBio,
          defaultWorkspace: nextWorkspace,
        });
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadUser();
  }, []);

  const hasChanges = useMemo(
    () =>
      displayName !== initialValues.displayName ||
      githubUsername !== initialValues.githubUsername ||
      bio !== initialValues.bio ||
      defaultWorkspace !== initialValues.defaultWorkspace,
    [bio, defaultWorkspace, displayName, githubUsername, initialValues],
  );

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedUser = await updateUser({
        displayName: displayName.trim(),
        username: githubUsername.trim(),
        bio: bio.trim(),
        workspace: defaultWorkspace,
      });

      const nextDisplayName = updatedUser.displayName?.trim() ?? displayName.trim();
      const nextUsername =
        updatedUser.username?.trim() ??
        updatedUser.userName?.trim() ??
        githubUsername.trim();
      const nextBio = updatedUser.bio?.trim() ?? bio.trim();
      const nextWorkspace =
        updatedUser.defaultWorkspace?.trim() ??
        updatedUser.workspace?.trim() ??
        defaultWorkspace;

      setDisplayName(nextDisplayName);
      setGithubUsername(nextUsername);
      setBio(nextBio);
      setDefaultWorkspace(nextWorkspace);
      setInitialValues({
        displayName: nextDisplayName,
        githubUsername: nextUsername,
        bio: nextBio,
        defaultWorkspace: nextWorkspace,
      });
      authContext?.updateCurrentUser({
        ...(authContext.user ?? updatedUser),
        ...updatedUser,
        displayName: nextDisplayName,
        username: nextUsername,
        bio: nextBio,
        defaultWorkspace: nextWorkspace,
        workspace: nextWorkspace,
      });
      setSuccessMessage("Settings saved successfully.");
      window.setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-[#0a0e18] font-sans text-white antialiased selection:bg-[#3B82F6]/30 selection:text-[#3B82F6]">
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Account Settings
            </h1>
            <p className="mt-2 text-[#9aa7bc]">
              Manage your profile and platform configuration.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || !hasChanges}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#3B82F6]/20 transition-all hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save All Changes
          </button>
        </div>

        {(errorMessage || successMessage) && (
          <div className="mb-8 space-y-3">
            {errorMessage && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                {successMessage}
              </div>
            )}
          </div>
        )}

        <div className="space-y-8">
          <section className="overflow-hidden rounded-xl border border-[#2d3748] bg-[#111620] shadow-sm">
            <div className="border-b border-[#2d3748] px-6 py-5">
              <h2 className="text-lg font-semibold tracking-tight text-white">
                Public Profile
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="display-name"
                      className="text-xs font-bold uppercase tracking-wider text-[#9aa7bc]"
                    >
                      Display Name
                    </label>
                    <input
                      id="display-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-lg border border-[#2d3748] bg-[#0a0e18] px-4 py-2.5 text-white placeholder-[#9aa7bc] outline-none transition-all focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="github-username"
                      className="text-xs font-bold uppercase tracking-wider text-[#9aa7bc]"
                    >
                      GitHub Username
                    </label>
                    <div className="relative">
                      <Code2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9aa7bc]" />
                      <input
                        id="github-username"
                        type="text"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                        className="w-full rounded-lg border border-[#2d3748] bg-[#0a0e18] py-2.5 pl-10 pr-4 text-white placeholder-[#9aa7bc] outline-none transition-all focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="bio"
                    className="text-xs font-bold uppercase tracking-wider text-[#9aa7bc]"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={maxBioLength}
                    className="w-full resize-none rounded-lg border border-[#2d3748] bg-[#0a0e18] px-4 py-2.5 text-white placeholder-[#9aa7bc] outline-none transition-all focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-right text-[10px] text-[#9aa7bc]">
                    {maxBioLength - bio.length} characters remaining
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#2d3748] bg-[#111620] shadow-sm">
            <div className="border-b border-[#2d3748] px-6 py-5">
              <h2 className="text-lg font-semibold tracking-tight text-white">
                Application Settings
              </h2>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#9aa7bc]">
                    Appearance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">
                          Interface Theme
                        </span>
                        <span className="text-[11px] text-[#9aa7bc]">
                          Switch between light and dark mode.
                        </span>
                      </div>

                      <div className="flex rounded-lg border border-[#2d3748] bg-[#0a0e18] p-1">
                        <button
                          type="button"
                          onClick={() => setTheme("light")}
                          className={`rounded-md p-1.5 transition-colors ${
                            theme === "light"
                              ? "bg-[#3B82F6] text-white shadow-sm"
                              : "text-[#9aa7bc] hover:text-white"
                          }`}
                          aria-label="Light mode"
                        >
                          <Sun className="h-[18px] w-[18px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme("dark")}
                          className={`rounded-md p-1.5 transition-colors ${
                            theme === "dark"
                              ? "bg-[#3B82F6] text-white shadow-sm"
                              : "text-[#9aa7bc] hover:text-white"
                          }`}
                          aria-label="Dark mode"
                        >
                          <Moon className="h-[18px] w-[18px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#9aa7bc]">
                    Default Workspace
                  </h3>
                  <div className="space-y-2">
                    <label
                      htmlFor="default-workspace"
                      className="text-[11px] text-[#9aa7bc]"
                    >
                      Default environment upon login
                    </label>
                    <select
                      id="default-workspace"
                      value={defaultWorkspace}
                      onChange={(e) => setDefaultWorkspace(e.target.value)}
                      className="w-full cursor-pointer rounded-lg border border-[#2d3748] bg-[#0a0e18] px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                    >
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Failed to update settings.";
};
