"use client";

import { useEffect, useState } from "react";
import { UserPlus, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { getAllUsers } from "@/src/services/adminService";
import { UserManagementDto } from "@/src/types/admin";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";

interface Props {
    open: boolean;
    onClose: () => void;
}

const ROLE_BADGE_STYLES: Record<string, string> = {
    ADMIN: "border-purple-200 bg-purple-50 text-purple-700",
    DOCTOR: "border-blue-200 bg-blue-50 text-blue-700",
    NURSE: "border-emerald-200 bg-emerald-50 text-emerald-700",
    RECEPTIONIST: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export default function ManageUsersModal({ open, onClose }: Props) {
    const [users, setUsers] = useState<UserManagementDto[]>([]);
    const [loading, setLoading] = useState(true);

    const [addOpen, setAddOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserManagementDto | null>(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllUsers();
            setUsers(response);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            loadUsers();
        }
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-[10px] border border-[#E5E7EB] bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Manage Users</h2>
                        <p className="text-xs text-slate-400">
                            {users.length} {users.length === 1 ? "user" : "users"} across all roles
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setAddOpen(true)}
                            className="flex items-center gap-1.5 rounded-[10px] bg-[var(--brand-primary)] px-3 py-2 text-xs font-medium text-white shadow-sm transition-opacity duration-150 hover:opacity-90"
                        >
                            <UserPlus size={15} />
                            Add User
                        </button>

                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="py-12 text-center text-sm text-slate-400">
                            Loading users...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="py-12 text-center text-sm text-slate-400">
                            No users found.
                        </div>
                    ) : (
                        <table className="w-full border-collapse text-sm">
                            <thead className="sticky top-0 z-[1]">
                                <tr className="border-b border-[#E5E7EB] bg-slate-50 text-xs text-slate-500">
                                    <th className="p-3 text-left font-medium">Name</th>
                                    <th className="p-3 text-left font-medium">Email</th>
                                    <th className="p-3 text-left font-medium">Role</th>
                                    <th className="p-3 text-left font-medium">Organization</th>
                                    <th className="p-3 text-left font-medium">Status</th>
                                    <th className="p-3 text-center font-medium">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-slate-100 last:border-b-0"
                                    >
                                        <td className="p-3 font-medium text-slate-800">
                                            {user.name}
                                        </td>
                                        <td className="p-3 text-slate-600">{user.email}</td>
                                        <td className="p-3">
                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                                                    ROLE_BADGE_STYLES[user.role] ??
                                                    "border-slate-200 bg-slate-50 text-slate-600"
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-600">
                                            {user.organizationName}
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                                                    user.active
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        : "border-red-200 bg-red-50 text-red-600"
                                                }`}
                                            >
                                                {user.active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="inline-flex items-center gap-1 rounded-[10px] border border-[#E5E7EB] px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50"
                                            >
                                                <Pencil size={12} />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} onSuccess={loadUsers} />

            <EditUserModal
                open={editingUser !== null}
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSuccess={loadUsers}
            />
        </div>
    );
}
