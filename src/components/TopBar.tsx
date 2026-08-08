"use client";

import { useAuth } from "../Context/AuthProvider";

export default function TopBar() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex h-12 items-center justify-end border-b border-[#E5E7EB] bg-white px-4 sm:px-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-xs font-bold text-white">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className="leading-tight">
          <p className="text-xs font-semibold text-slate-800">{user.name}</p>
        </div>

        <span className="rounded-full border border-[#E5E7EB] bg-slate-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
          {user.role}
        </span>
      </div>
    </div>
  );
}
