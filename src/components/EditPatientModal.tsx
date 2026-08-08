"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { updatePatientDetails } from "@/src/services/patientService";
import { Gender, Patient } from "@/src/types/patient";

interface Props {
    open: boolean;
    patient: Patient | null;
    onClose: () => void;
    onSuccess: () => void;
}

const GENDERS: Gender[] = ["MALE", "FEMALE", "OTHER"];

export default function EditPatientModal({ open, patient, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [name, setName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState<Gender>("MALE");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [active, setActive] = useState(true);

    useEffect(() => {
        if (open && patient) {
            setName(patient.name);
            setDateOfBirth(patient.dateOfBirth);
            setGender(patient.gender);
            setPhone(patient.phone);
            setLocation(patient.location ?? "");
            setActive(patient.active);
            setErrors({});
        }
    }, [open, patient]);

    if (!open || !patient) return null;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setErrors({});
            await updatePatientDetails(patient.id, {
                name,
                dateOfBirth,
                gender,
                phone,
                location,
                active,
            });
            toast.success("Patient updated successfully");
            onSuccess();
            onClose();
        } catch (err: any) {
            setErrors(err?.fieldErrors ?? {});
            toast.error(err?.message ?? "Failed to update patient");
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[10px] border border-[#E5E7EB] bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Edit Patient</h2>
                        <p className="text-xs text-slate-400">Update patient details</p>
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
                        <label className={labelClass}>Patient ID</label>
                        <input value={patient.patientId} disabled className={readOnlyClass} />
                        <p className="mt-1 text-[11px] text-slate-400">Patient ID cannot be changed</p>
                    </div>

                    <div>
                        <label className={labelClass}>Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClass}
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                        <label className={labelClass}>Date Of Birth</label>
                        <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className={inputClass}
                            required
                        />
                        {errors.dateOfBirth && (
                            <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Gender</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value as Gender)}
                            className={inputClass}
                        >
                            {GENDERS.map((g) => (
                                <option key={g} value={g}>
                                    {g}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Phone Number</label>
                        <input
                            value={phone}
                            maxLength={10}
                            onChange={(e) => setPhone(e.target.value)}
                            className={inputClass}
                            required
                        />
                        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className={labelClass}>Location</label>
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-[10px] border border-[#E5E7EB] bg-slate-50 p-3">
                        <div>
                            <p className="text-sm font-medium text-slate-700">Active</p>
                            <p className="text-[11px] text-slate-400">
                                Inactive patients are hidden from booking flows
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
