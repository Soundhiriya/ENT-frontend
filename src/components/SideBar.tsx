    "use client";

    import { useState } from "react";
    import Image from "next/image";
    import { useRouter, usePathname } from "next/navigation";
    import {
    Stethoscope,
    HeartPulse,
    Building2,
    LogOut,
    ChevronLeft,
    ChevronRight,
    type LucideIcon,
    } from "lucide-react";
import { Role } from "../types/auth";
import { useAuth } from "../Context/AuthProvider";
import { logout as logoutRequest } from "../services/auth.service";

    interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    collapsed: boolean;
    setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
    }

interface MenuItem {
    name: string;
    path: string;
    icon: LucideIcon;
    roles: Role[];
}

const menuItems: MenuItem[] = [

  {

    name: "Doctor",

    path: "/doctor",

    icon: Stethoscope,

    roles: ["DOCTOR", "ADMIN"],

  },

  {

    name: "Nurse",

    path: "/nurse",

    icon: HeartPulse,

    roles: ["DOCTOR", "NURSE", "RECEPTIONIST", "ADMIN"],

  },

  {

    name: "Management",

    path: "/management",

    icon: Building2,

    roles: ["ADMIN"],

  },

];


    export default function Sidebar({ sidebarOpen, setSidebarOpen ,collapsed,setCollapsed }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [showLogout, setShowLogout] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const{user,logoutUser}=useAuth();

    const navigate = (path: string) => {
        router.push(path);
        setSidebarOpen(false);
    };
    const visibleMenuItems = menuItems
    .filter((item) => user && item.roles.includes(user.role))
    // The front-desk screen is shared by nurses and receptionists, so it
    // takes its label from who's looking at it. Doctors and admins see both
    // kinds of staff use it, so they get the combined label.
    .map((item) =>
        item.path === "/nurse"
        ? {
            ...item,
            name:
                user?.role === "RECEPTIONIST"
                ? "Reception"
                : user?.role === "NURSE"
                ? "Nurse"
                : "Nurse / Reception",
            }
        : item
    );

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await logoutRequest();
        } catch (error) {
            console.error(error);
        } finally {
            logoutUser();
            setLoggingOut(false);
            // Hard navigation, not router.push — forces a full remount so
            // no stale in-memory state from the previous session lingers.
            window.location.href = "/";
        }
    };

    const width = collapsed ? "w-[72px]" : "w-[220px]";

    return (
        <>
        {/* Mobile Overlay */}
        {sidebarOpen && (
            <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden print:hidden"
            onClick={() => setSidebarOpen(false)}
            />
        )}

        <aside
            className={`
            fixed left-0 top-0 z-50 print:hidden
            flex h-screen ${width} flex-col
            border-r border-[#E5E7EB] bg-white
            transition-[width,transform] duration-150
            md:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
        >
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-[#E5E7EB] px-3">
            <Image
                src="/logo.png"
                alt="Gift a Smile"
                width={570}
                height={579}
                className="h-9 w-9 shrink-0 object-contain"
            />

            {!collapsed && (
                <div className="ml-2.5 overflow-hidden">
                <p className="truncate text-sm font-bold text-slate-800">
                    Dr. G. SubaJothiKumar
                </p>
                <p className="truncate text-[11px] text-slate-400">
                    MBBS., MS(ENT) · ENT Specialist
                </p>
                </div>
            )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 py-4">
            {visibleMenuItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.path;

                return (
                <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    title={collapsed ? item.name : undefined}
                    className={`group relative mx-3 flex h-11 w-[calc(100%-24px)] items-center rounded-[10px] transition-colors duration-150 ${
                    collapsed ? "justify-center px-0" : "gap-3 px-3"
                    } ${
                    active
                        ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                >
                    {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-[var(--brand-primary)]" />
                    )}
                    <Icon size={18} strokeWidth={2} className="shrink-0" />
                    {!collapsed && (
                    <span className="truncate text-[13px] font-medium">
                        {item.name}
                    </span>
                    )}
                </button>
                );
            })}
            </nav>

            {/* Logout */}
            <div className="border-t border-[#E5E7EB] p-3">
            <button
                onClick={() => setShowLogout(true)}
                title={collapsed ? "Logout" : undefined}
                className={`flex h-11 w-full items-center rounded-[10px] text-slate-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 ${
                collapsed ? "justify-center px-0" : "gap-3 px-3"
                }`}
            >
                <LogOut size={18} strokeWidth={2} />
                {!collapsed && <span className="text-[13px] font-medium">Logout</span>}
            </button>
            </div>

            {/* Collapse toggle */}
            <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-slate-400 shadow-sm transition-colors duration-150 hover:text-slate-700 md:flex"
            >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
        </aside>

        {/* Logout Modal */}
        {showLogout && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <LogOut size={20} />
                </div>

                <h2 className="text-base font-semibold text-slate-800">Log Out</h2>

                <p className="mt-1.5 text-sm text-slate-500">
                Are you sure you want to log out of your account?
                </p>

                <div className="mt-5 flex gap-2">
                <button
                    onClick={() => setShowLogout(false)}
                    disabled={loggingOut}
                    className="flex-1 rounded-[10px] border border-[#E5E7EB] py-2.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Cancel
                </button>

                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex-1 rounded-[10px] bg-[var(--brand-primary)] py-2.5 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loggingOut ? "Logging out..." : "Log Out"}
                </button>
                </div>
            </div>
            </div>
        )}
        </>
    );
    }