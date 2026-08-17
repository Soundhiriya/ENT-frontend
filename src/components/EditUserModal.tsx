"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { updateUser } from "@/src/services/adminService";
import { Role } from "@/src/types/auth";
import { UserManagementDto } from "@/src/types/admin";

interface Props {
    open: boolean;
    user: UserManagementDto | null;
    onClose: () => void;
    onSuccess: () => void;
}

const ROLES: Role[] = ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"];

export default function EditUserModal({ open, user, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [role, setRole] = useState<Role>("DOCTOR");
    const [active, setActive] = useState(true);

    useEffect(() => {
        if (open && user) {
            setName(user.name);
            setRole(user.role);
            setActive(user.active);
        }
    }, [open, user]);

    if (!open || !user) return null;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            await updateUser(user.id, { name, role, active });
            toast.success("User updated successfully");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to update user");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "mt-1 w-full rounded-[10px] border border-[#E5E7EB] bg-slate-50 p-3 text-sm outline-none focus:border-[var(--brand-secondary)] focus:ring-2 focus:ring-[var(--brand-secondary)]/20";

    const readOnlyClass =
        "mt-1 w-full rounded-[10px] border border-[#E5E7EB] bg-slate-100 p-3 text-sm text-slate-500";

    const labelClass = "text-xs font-medium text-slate-600";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-[10px] border border-[#E5E7EB] bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Edit User</h2>
                        <p className="text-xs text-slate-400">Update role and status</p>
                    </div>

                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-8 w-8 items-center justify-center rounded-[10px] text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className={labelClass}>Email</label>
                        <input value={user.email} disabled className={readOnlyClass} />
                        <p className="mt-1 text-[11px] text-slate-400">Email cannot be changed</p>
                    </div>

                    <div>
                        <label className={labelClass}>Organization</label>
                        <input value={user.organizationName} disabled className={readOnlyClass} />
                        <p className="mt-1 text-[11px] text-slate-400">Organization cannot be changed</p>
                    </div>

                    <div>
                        <label className={labelClass}>Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as Role)}
                            className={inputClass}
                        >
                            {ROLES.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-between rounded-[10px] border border-[#E5E7EB] bg-slate-50 p-3">
                        <div>
                            <p className="text-sm font-medium text-slate-700">Active</p>
                            <p className="text-[11px] text-slate-400">
                                Inactive users can no longer log in
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setActive((a) => !a)}
                            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ${
                                active ? "bg-[var(--brand-primary)]" : "bg-slate-300"
                            }`}
                        >
                            <span
                                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ${
                                    active ? "translate-x-[22px]" : "translate-x-0.5"
                                }`}
                            />
                        </button>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-[10px] border border-[#E5E7EB] py-3 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-[10px] bg-[var(--brand-primary)] py-3 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
