"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { registerPatient } from "@/src/services/patientService";
import { Patient } from "../types/patient";

interface Props {
open: boolean;
onClose: () => void;
onSelect: (patient: Patient) => void;
}

export default function RegisterPatientModal({ open, onClose, onSelect }: Props) {
const [loading, setLoading] = useState(false);
const [errors, setErrors] = useState<Record<string, string>>({});

const [form, setForm] = useState({
name: "",
dateOfBirth: "",
gender: "MALE",
phone: "",
location: "",
});


useEffect(() => {

  if (open) {

    setForm({

      name: "",

      dateOfBirth: "",

      gender: "MALE",

      phone: "",

      location: "",

    });

    setErrors({});

  }

}, [open]);

if (!open) return null;

const handleChange = (
e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
setForm({
    ...form,
    [e.target.name]: e.target.value,
});
};


const submit = async (e: React.FormEvent) => {
e.preventDefault();

try {
    setLoading(true);
    setErrors({});

    const response = await registerPatient(form);

    toast.success("Patient Registered");
    onSelect(response);

    onClose();
} catch (err: any) {
    setErrors(err?.fieldErrors ?? {});
    toast.error(err?.message ?? "Failed to register patient");
} finally {
    setLoading(false);
}
};



const inputClass =
"mt-1 w-full rounded-[10px] border border-[#E5E7EB] bg-slate-50 p-3 text-sm outline-none focus:border-[var(--brand-secondary)] focus:ring-2 focus:ring-[var(--brand-secondary)]/20";

const labelClass = "text-xs font-medium text-slate-600";

return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="w-full max-w-2xl rounded-[10px] border border-[#E5E7EB] bg-white p-6 shadow-xl">
    <div className="mb-6 flex items-center justify-between">
        <div>
        <h2 className="text-xl font-bold text-slate-800">Register Patient</h2>
        <p className="text-xs text-slate-400">Guru ENT Clinic · new patient intake</p>
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
        {/* Name */}
        <div>
        <label className={labelClass}>Name</label>
        <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
        />
        {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
        </div>

        {/* DOB */}
        <div>
        <label className={labelClass}>Date Of Birth</label>
        <input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            className={inputClass}
        />
        {errors.dateOfBirth && (
            <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth}</p>
        )}
        </div>

        {/* Gender */}
        <div>
        <label className={labelClass}>Gender</label>
        <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className={inputClass}
        >
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
            <option value="OTHER">OTHER</option>
        </select>
        </div>

        {/* Phone */}
        <div>
        <label className={labelClass}>Phone Number</label>
        <input
            name="phone"
            value={form.phone}
            maxLength={10}
            onChange={handleChange}
            className={inputClass}
        />
        {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
        )}
        </div>

        {/* Location */}
        <div>
        <label className={labelClass}>Location</label>
        <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className={inputClass}
        />
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
            className="flex-1 rounded-[10px] bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[var(--brand-primary-dark)] disabled:opacity-60"
        >
            {loading ? "Registering..." : "Register Patient"}
        </button>
        </div>
    </form>
    </div>
</div>
);
}