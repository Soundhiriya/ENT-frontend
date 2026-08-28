"use client";

import { setPasswordRequest } from "@/src/services/auth.service";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const MIN_PASSWORD_LENGTH = 8;

// useSearchParams in a client component requires a Suspense boundary above it,
// or the production build fails with "Missing Suspense boundary with
// useSearchParams".
const SetPasswordPage = () => {
  return (
    <Suspense fallback={null}>
      <SetPasswordPageContent />
    </Suspense>
  );
};

const SetPasswordPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Captured ONCE on first render, deliberately not re-read afterwards.
  // The effect below strips the query string from the URL, and Next.js
  // syncs history.replaceState back into useSearchParams() — so re-reading
  // searchParams on later renders returns null for both and the component
  // falls into the "Invalid or Expired Link" branch even though the link
  // was perfectly valid. useState's initializer runs only on mount, which
  // pins the values before the strip happens.
  const [credentials] = useState(() => ({
    token: searchParams.get("token"),
    email: searchParams.get("email"),
  }));

  const { token, email } = credentials;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Strip the raw reset token out of the visible URL/history once it's been
  // read, so it doesn't linger in browser history on a shared machine.
  useEffect(() => {
    if (typeof window !== "undefined" && (token || email)) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const passwordTooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const canSubmit =
    !!token &&
    !!email &&
    password.length >= MIN_PASSWORD_LENGTH &&
    password === confirmPassword &&
    !loading;

  async function createPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!token || !email) return;

    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await setPasswordRequest({ password, email, token });
      setSuccess(true);
      toast.success("Password set successfully");
      setTimeout(() => router.push("/"), 1500);
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to set password");
    } finally {
      setLoading(false);
    }
  }

  // Missing/invalid link — nothing to do here.
  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={28} />
          </div>
          <h1 className="text-lg font-semibold text-slate-800">
            Invalid or Expired Link
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This password-setup link is missing required information. Please
            request a new link and try again.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="text-lg font-semibold text-slate-800">
            Password Set Successfully
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Redirecting you to login…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
            <KeyRound size={22} />
          </div>
          <h1 className="text-lg font-semibold text-slate-800">
            Set Your Password
          </h1>
          <p className="mt-1 text-center text-xs text-slate-500">
            Create a new password for <span className="font-medium text-slate-700">{email}</span>
          </p>
        </div>

        <form onSubmit={createPassword} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                data-no-capitalize
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="h-10 w-full rounded-[10px] border border-[#E5E7EB] bg-slate-50 px-3 pr-10 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center max-lg:min-h-[40px] max-lg:min-w-[40px] text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordTooShort && (
              <p className="mt-1 text-xs text-red-500">
                Password must be at least {MIN_PASSWORD_LENGTH} characters
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                data-no-capitalize
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="h-10 w-full rounded-[10px] border border-[#E5E7EB] bg-slate-50 px-3 pr-10 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center max-lg:min-h-[40px] max-lg:min-w-[40px] text-slate-400 hover:text-slate-600"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordsMismatch && (
              <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--brand-primary)] py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Setting Password..." : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPasswordPage;
