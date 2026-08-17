"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { getOrganizations, getRoles, registerUser } from "@/src/services/adminService";
import { Role } from "@/src/types/auth";
import { Organization } from "@/src/types/admin";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddUserModal({ open, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [roles, setRoles] = useState<Role[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);

    const [form, setForm] = useState({
        name: "",
        email: "",
        role: "DOCTOR" as Role,
        organizationName: "",
    });

    useEffect(() => {
        if (!open) return;

        setForm({ name: "", email: "", role: "DOCTOR", organizationName: "" });
        setErrors({});

        async function loadOptions() {
            try {
                const [rolesRes, orgsRes] = await Promise.all([getRoles(), getOrganizations()]);
                setRoles(rolesRes);
                setOrganizations(orgsRes);
                setForm((prev) => ({
                    ...prev,
                    organizationName: orgsRes[0]?.name ?? "",
                }));
            } catch (err) {
                console.error(err);
                toast.error("Failed to load roles/organizations");
            }
        }

        loadOptions();
    }, [open]);

    if (!open) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setErrors({});

            await registerUser(form);

            toast.success(`${form.name} registered — a password setup email has been sent.`);
            onSuccess();
            onClose();
        } catch (err: any) {
            setErrors(err?.message ?? {});
            toast.error(err?.message ?? "Failed to register user");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "mt-1 w-full rounded-[10px] border border-[#E5E7EB] bg-slate-50 p-3 text-sm outline-none focus:border-[var(--brand-secondary)] focus:ring-2 focus:ring-[var(--brand-secondary)]/20";

    const labelClass = "text-xs font-medium text-slate-600";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-[10px] border border-[#E5E7EB] bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Add User</h2>
                        <p className="text-xs text-slate-400">Invite a doctor, nurse, or admin</p>
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
                        <label className={labelClass}>Name</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className={inputClass}
                            required
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className={inputClass}
                            required
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Role</label>
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className={inputClass}
                        >
                            {roles.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Organization</label>
                        <select
                            name="organizationName"
                            value={form.organizationName}
                            onChange={handleChange}
                            className={inputClass}
                        >
                            {organizations.map((org) => (
                                <option key={org.id} value={org.name}>
                                    {org.name}
                                </option>
                            ))}
                        </select>
                        {errors.organizationName && (
                            <p className="mt-1 text-xs text-red-500">{errors.organizationName}</p>
                        )}
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
                            {loading ? "Adding..." : "Add User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
