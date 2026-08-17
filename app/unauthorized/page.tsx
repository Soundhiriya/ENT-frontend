"use client";

import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/Context/AuthProvider";

function dashboardPathForRole(role?: string) {
  switch (role) {
    case "DOCTOR":
      return "/doctor";
    case "NURSE":
    case "RECEPTIONIST":
      return "/nurse";
    case "ADMIN":
      return "/doctor";
    default:
      return "/";
  }
}

const page = () => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert size={28} />
        </div>

        <h1 className="text-lg font-semibold text-slate-800">Access Denied</h1>

        <p className="mt-2 text-sm text-slate-500">
          You don&apos;t have permission to view this page
          {user?.role && (
            <>
              {" "}
              as a{" "}
              <span className="font-medium text-slate-700">
                {user.role.toLowerCase()}
              </span>
            </>
          )}
          . If you think this is a mistake, contact your administrator.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => router.back()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft size={15} />
            Go Back
          </button>

          <button
            onClick={() => router.push(dashboardPathForRole(user?.role))}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Home size={15} />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default page;
