"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { createHospital, updateHospital } from "@/src/services/hospitalservice";
import { HospitalDropdown } from "@/src/types/hospital";

interface Props {
    open: boolean;
    hospital: HospitalDropdown | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddEditHospitalModal({ open, hospital, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [name, setName] = useState("");
    const [hospitalCode, setHospitalCode] = useState("");

    const isEdit = hospital !== null;

    useEffect(() => {
        if (open) {
            setName(hospital?.name ?? "");
            setHospitalCode(hospital?.hospitalCode ?? "");
            setErrors({});
        }
    }, [open, hospital]);

    if (!open) return null;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setErrors({});

            if (isEdit) {
                await updateHospital(hospital.id, { name, hospitalCode });
                toast.success("Hospital updated successfully");
            } else {
                await createHospital({ name, hospitalCode });
                toast.success("Hospital added successfully");
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setErrors(err?.fieldErrors ?? {});
            toast.error(err?.message ?? "Failed to save hospital");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "mt-1 w-full rounded-[10px] border border-[#E5E7EB] bg-slate-50 p-3 text-sm outline-none focus:border-[var(--brand-secondary)] focus:ring-2 focus:ring-[var(--brand-secondary)]/20";

    const labelClass = "text-xs font-medium text-slate-600";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[10px] border border-[#E5E7EB] bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {isEdit ? "Edit Hospital" : "Add Hospital"}
                        </h2>
                        <p className="text-xs text-slate-400">
                            {isEdit ? "Update hospital name and code" : "Enter hospital name and code"}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-8 w-8 max-lg:h-10 max-lg:w-10 items-center justify-center rounded-[10px] text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className={labelClass}>Hospital Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Guru ENT Clinic"
                            className={inputClass}
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                        <label className={labelClass}>Hospital Code</label>
                        <input
                            value={hospitalCode}
                            onChange={(e) => setHospitalCode(e.target.value)}
                            placeholder="e.g. SJK"
                            className={inputClass}
                            required
                        />
                        {errors.hospitalCode && (
                            <p className="mt-1 text-xs text-red-500">{errors.hospitalCode}</p>
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
                            {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Hospital"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
