"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Stethoscope, X, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMe, login, forgotPassword } from "@/src/services/auth.service";
import { useAuth } from "@/src/Context/AuthProvider";
import { AuthMe } from "@/src/types/auth";
import LoadingSpinner from "@/src/components/LoadingSpinner";

export default function LoginScreen() {
  const router = useRouter();
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [forgotOpen, setForgotOpen] = useState(false);

  const {user} = useAuth();

  // Ticks the rate-limit cooldown down to 0 once a second, then stops.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000));
      await login({ email, password });
      const me: AuthMe = await getMe();
      loginUser(me);
      // Listed explicitly rather than relying on the else branch, so a role
      // added later doesn't silently inherit the front-desk landing page.
      if (me?.role === "DOCTOR" || me?.role === "ADMIN") {
          router.replace("/doctor");
      } else if (me?.role === "NURSE" || me?.role === "RECEPTIONIST") {
          router.replace("/nurse");
      } else {
          router.replace("/");
      }
    } catch (err: any) {
      if (err?.status === 429 && err?.retryAfterSeconds) {
        setCooldown(err.retryAfterSeconds);
      }
      toast.error(err?.message || "Login failed");
      setLoading(false)
    }
  }
  if(loading){
    return <LoadingSpinner fullScreen/>
  }
  return (
    
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid lg:grid-cols-2">
        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 p-12 text-white relative overflow-hidden">
          {/* subtle background accent */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-white/5" />

          <div className="relative w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-8">
            <Stethoscope size={30} className="text-slate-200" />
          </div>

          <h1 className="relative text-4xl xl:text-5xl font-semibold leading-tight tracking-tight">
            Guru ENT
            <br />
            Clinic
          </h1>

          <p className="relative mt-6 text-base xl:text-lg text-slate-300 leading-7 max-w-sm">
            Smart clinic management system for doctors, nurses and hospital
            staff.
          </p>

          <div className="relative mt-12 space-y-3 text-slate-300 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Patient Management
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Appointment Scheduling
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Consultation Records
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Billing &amp; Reports
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex justify-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center">
                <Stethoscope size={26} />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 text-center lg:text-left">
              Welcome back
            </h2>

            <p className="text-slate-500 mt-2 text-sm sm:text-base text-center lg:text-left">
              Sign in to continue to your dashboard
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 mt-8" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-600"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="doctor@guruent.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-600"
                >
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    data-no-capitalize
                    autoComplete="current-password"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-sm font-medium text-slate-600 hover:text-slate-800 hover:underline underline-offset-2"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className="w-full rounded-xl bg-slate-800 py-3 text-white font-medium hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading
                  ? "Signing in..."
                  : cooldown > 0
                  ? `Try again in ${cooldown}s`
                  : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </main>
  );
}

/* -------------------------------------------------------------------- */
/*  Forgot Password Dialog                                              */
/* -------------------------------------------------------------------- */

function ForgotPasswordDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // reset internal state whenever the dialog is (re)opened
  useEffect(() => {
    if (open) {
      setEmail("");
      setSent(false);
      setLoading(false);
      setCooldown(0);
      // focus the email field once the dialog mounts
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Ticks the rate-limit cooldown down to 0 once a second, then stops.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await forgotPassword({ email });
      setSent(true);
    } catch (err: any) {
      if (err?.status === 429 && err?.retryAfterSeconds) {
        setCooldown(err.retryAfterSeconds);
      }
      toast.error(err?.message || "Could not send reset link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* panel */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={18} />
        </button>

        {!sent ? (
          <>
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
              <Mail size={20} className="text-slate-600" />
            </div>

            <h3
              id="forgot-password-title"
              className="text-lg font-semibold text-slate-800"
            >
              Reset your password
            </h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-6">
              Enter the email associated with your account and we&apos;ll
              send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="forgot-email"
                  className="text-sm font-medium text-slate-600"
                >
                  Email address
                </label>
                <input
                  ref={inputRef}
                  id="forgot-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="doctor@guruent.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-slate-600 font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !email || cooldown > 0}
                  className="flex-1 rounded-xl bg-slate-800 py-2.5 text-white font-medium hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading
                    ? "Sending..."
                    : cooldown > 0
                    ? `Try again in ${cooldown}s`
                    : "Send link"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              Check your email
            </h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-6">
              If an account exists for <span className="font-medium text-slate-700">{email}</span>,
              a password reset link is on its way.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-slate-800 py-2.5 text-white font-medium hover:bg-slate-900 transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}