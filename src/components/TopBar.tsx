"use client";

import { Menu } from "lucide-react";
import { useAuth } from "../Context/AuthProvider";

interface TopBarProps {
  // Opens the sidebar drawer — only rendered below `md`, since the sidebar
  // is a fixed, always-visible rail at `md` and up.
  onOpenSidebar: () => void;
}

export default function TopBar({ onOpenSidebar }: TopBarProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex h-12 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 sm:px-6 print:hidden md:justify-end">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-xs font-bold text-white">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className="leading-tight">
          <p className="text-xs font-semibold text-slate-800">{user.name}</p>
        </div>

        <span className="rounded-full border border-[#E5E7EB] bg-slate-50 px-2 py-0.5 text-sm font-medium uppercase tracking-wide text-slate-500 sm:text-[10px]">
          {user.role}
        </span>
      </div>
    </div>
  );
}
