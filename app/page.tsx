"use client";

import { useEffect, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  X,
  Mail,
  Loader2,
  CheckCircle2,
  User,
  Stethoscope,
  Ear,
  Activity,
  Globe,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMe, login, forgotPassword } from "@/src/services/auth.service";
import { useAuth } from "@/src/Context/AuthProvider";
import { AuthMe } from "@/src/types/auth";
import LoadingSpinner from "@/src/components/LoadingSpinner";

/* ------------------------------------------------------------------ */
/*  Brand tokens, pulled from the "Gift a Smile" mark: a teal G and   */
/*  an orange a, joined by a single ECG trace.                        */
/* ------------------------------------------------------------------ */
const BRAND_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

  .gas-scope {
    --font-display: 'Quicksand', 'Inter', system-ui, sans-serif;
    --font-body: 'Inter', system-ui, sans-serif;

    --ink: #16282c;
    --ink-soft: #5c7377;
    --teal: #2fa6b3;
    --teal-deep: #147c86;
    --teal-darker: #0d5c64;
    --teal-pale: #eaf7f8;
    --orange: #e0803d;
  }

  .gas-scope input::placeholder { color: #9fb4b7; }

  @keyframes gas-draw {
    to { stroke-dashoffset: 0; }
  }
  .gas-ecg path {
    stroke-dasharray: 2000;
    stroke-dashoffset: 2000;
    animation: gas-draw 2.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
  }

  @keyframes gas-bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  .gas-bob { animation: gas-bob 5s ease-in-out infinite; }
  .gas-bob-slow { animation: gas-bob 7s ease-in-out infinite; }

  @media (prefers-reduced-motion: reduce) {
    .gas-ecg path { animation: none; stroke-dashoffset: 0; }
    .gas-bob, .gas-bob-slow { animation: none; }
  }
`;

export default function LoginScreen() {
  const router = useRouter();
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [forgotOpen, setForgotOpen] = useState(false);

  const { user } = useAuth();

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
    <main
      className="gas-scope min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #5FCBD3 0%, #1E96A0 45%, #0E6870 100%)",
      }}
    >
      <style>{BRAND_STYLES}</style>

      {/* paper-cut corner accents */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 bg-white pointer-events-none"
        style={{ clipPath: "polygon(30% 0, 100% 0, 100% 70%)" }}
      />
      <div
        className="absolute -bottom-28 -left-28 w-80 h-80 bg-white/95 pointer-events-none"
        style={{ clipPath: "polygon(0 30%, 0 100%, 70% 100%)" }}
      />

      {/* ECG trace across the background */}
      <svg
        className="gas-ecg absolute bottom-[9%] left-0 w-full h-16 pointer-events-none"
        viewBox="0 0 1200 60"
        fill="none"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M0,30 L520,30 L545,10 L568,50 L590,4 L610,45 L635,30 L980,30 L1000,52 L1020,6 L1040,44 L1060,18 L1080,30 L1200,30"
          stroke="white"
          strokeOpacity="0.5"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* floating decorative bubbles */}
      <div className="hidden md:flex absolute left-[8%] top-[38%] w-28 h-28 rounded-full bg-white/10 border border-white/25 backdrop-blur-sm items-center justify-center gas-bob-slow">
        <Ear size={38} strokeWidth={1.5} className="text-white/85" />
      </div>
      <div className="hidden md:flex absolute right-[9%] top-[52%] w-32 h-32 rounded-full bg-white/10 border border-white/25 backdrop-blur-sm items-center justify-center gas-bob">
        <Stethoscope size={42} strokeWidth={1.5} className="text-white/85" />
      </div>
      <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-[12%] w-20 h-20 rounded-full bg-white/10 border border-white/25 backdrop-blur-sm items-center justify-center gas-bob">
        <Activity size={30} strokeWidth={1.5} className="text-white/85" />
      </div>

      {/* language pill */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center gap-1.5 bg-[var(--teal-darker)]/90 text-white text-sm rounded-full pl-3 pr-2.5 py-1.5 backdrop-blur-sm">
        <Globe size={14} />
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>EN</span>
        <ChevronDown size={14} />
      </div>

      {/* card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[28px] shadow-[0_30px_80px_-20px_rgba(10,50,55,0.45)] p-8 sm:p-10">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-2">
            <Image
              src="/logo.png"
              alt="Gift a Smile"
              width={570}
              height={579}
              preload
              className="w-14 h-auto"
            />
          </div>
          <h2
            className="mt-3 text-[1.7rem] sm:text-3xl text-[var(--ink)] text-center"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
          >
            Welcome back!
          </h2>
          <p
            className="mt-1 text-sm text-[var(--ink-soft)] text-center"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Sign in to continue to your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm text-[var(--teal-deep)]"
              style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}
            >
              Email address
            </label>
            <div className="mt-2 flex items-end gap-2 border-b-2 border-[#dfeceb] focus-within:border-[var(--teal)] transition pb-2">
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="doctor@guruent.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ fontFamily: "var(--font-body)" }}
                className="flex-1 bg-transparent text-[var(--ink)] focus:outline-none"
              />
              <User size={18} className="text-[var(--ink-soft)] shrink-0" />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm text-[var(--teal-deep)]"
              style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}
            >
              Password
            </label>
            <div className="mt-2 flex items-end gap-2 border-b-2 border-[#dfeceb] focus-within:border-[var(--teal)] transition pb-2">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                data-no-capitalize
                autoComplete="current-password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ fontFamily: "var(--font-body)" }}
                className="flex-1 bg-transparent text-[var(--ink)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="flex items-center justify-center max-lg:min-h-[40px] max-lg:min-w-[40px] text-[var(--ink-soft)] hover:text-[var(--teal-deep)] transition shrink-0"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}
                className="text-xs text-[var(--teal-deep)] hover:text-[var(--teal-darker)] hover:underline underline-offset-2"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            style={{ fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: "0.03em" }}
            className="w-full rounded-2xl bg-[var(--teal-deep)] py-3.5 text-white uppercase text-sm hover:bg-[var(--teal-darker)] disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-[0_10px_25px_-8px_rgba(20,124,134,0.6)]"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading
              ? "Signing in..."
              : cooldown > 0
              ? `Try again in ${cooldown}s`
              : "Sign in"}
          </button>
        </form>
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
      className="gas-scope fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
    >
      <style>{BRAND_STYLES}</style>

      {/* backdrop */}
      <div
        className="absolute inset-0 bg-[var(--ink)]/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* panel */}
      <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-[24px] shadow-2xl p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex items-center justify-center max-lg:min-h-[40px] max-lg:min-w-[40px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition"
        >
          <X size={18} />
        </button>

        {!sent ? (
          <>
            <div className="w-11 h-11 rounded-xl bg-[var(--teal-pale)] flex items-center justify-center mb-4">
              <Mail size={20} className="text-[var(--teal-deep)]" />
            </div>

            <h3
              id="forgot-password-title"
              className="text-lg text-[var(--ink)]"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
            >
              Reset your password
            </h3>
            <p
              className="text-sm text-[var(--ink-soft)] mt-1.5 leading-6"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Enter the email associated with your account and we&apos;ll
              send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-sm text-[var(--teal-deep)]"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}
                >
                  Email address
                </label>
                <div className="mt-2 border-b-2 border-[#dfeceb] focus-within:border-[var(--teal)] transition pb-2">
                  <input
                    ref={inputRef}
                    id="forgot-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="doctor@guruent.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ fontFamily: "var(--font-body)" }}
                    className="w-full bg-transparent text-[var(--ink)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1" style={{ fontFamily: "var(--font-body)" }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-[#dfeceb] py-2.5 text-[var(--ink-soft)] font-medium hover:bg-[var(--teal-pale)] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !email || cooldown > 0}
                  className="flex-1 rounded-2xl bg-[var(--teal-deep)] py-2.5 text-white font-medium hover:bg-[var(--teal-darker)] disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
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
          <div className="text-center py-2" style={{ fontFamily: "var(--font-body)" }}>
            <div className="w-12 h-12 rounded-full bg-[var(--teal-pale)] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-[var(--teal-deep)]" />
            </div>
            <h3
              className="text-lg text-[var(--ink)]"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
            >
              Check your email
            </h3>
            <p className="text-sm text-[var(--ink-soft)] mt-1.5 leading-6">
              If an account exists for <span className="font-medium text-[var(--ink)]">{email}</span>,
              a password reset link is on its way.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-2xl bg-[var(--teal-deep)] py-2.5 text-white font-medium hover:bg-[var(--teal-darker)] transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}