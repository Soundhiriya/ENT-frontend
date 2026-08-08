"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { getHospitals } from "@/src/services/hospitalservice";
import { HospitalDropdown } from "@/src/types/hospital";
import AddEditHospitalModal from "./AddEditHospitalModal";

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function ManageHospitalsModal({ open, onClose }: Props) {
    const [hospitals, setHospitals] = useState<HospitalDropdown[]>([]);
    const [loading, setLoading] = useState(true);

    const [addOpen, setAddOpen] = useState(false);
    const [editingHospital, setEditingHospital] = useState<HospitalDropdown | null>(null);

    const loadHospitals = async () => {
        setLoading(true);
        try {
            const response = await getHospitals();
            setHospitals(response);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load hospitals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            loadHospitals();
        }
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-[10px] border border-[#E5E7EB] bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Manage Hospitals</h2>
                        <p className="text-xs text-slate-400">
                            {hospitals.length} {hospitals.length === 1 ? "hospital" : "hospitals"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setAddOpen(true)}
                            className="flex items-center gap-1.5 rounded-[10px] bg-[var(--brand-primary)] px-3 py-2 text-xs font-medium text-white shadow-sm transition-opacity duration-150 hover:opacity-90"
                        >
                            <Plus size={15} />
                            Add Hospital
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

                {/* Scrollable list — shown at the top of the dialog */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="py-12 text-center text-sm text-slate-400">
                            Loading hospitals...
                        </div>
                    ) : hospitals.length === 0 ? (
                        <div className="py-12 text-center text-sm text-slate-400">
                            No hospitals added yet.
                        </div>
                    ) : (
                        <table className="w-full border-collapse text-sm">
                            <thead className="sticky top-0 z-[1]">
                                <tr className="border-b border-[#E5E7EB] bg-slate-50 text-xs text-slate-500">
                                    <th className="p-3 text-left font-medium">Name</th>
                                    <th className="p-3 text-left font-medium">Code</th>
                                    <th className="p-3 text-center font-medium">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {hospitals.map((hospital) => (
                                    <tr
                                        key={hospital.id}
                                        className="border-b border-slate-100 last:border-b-0"
                                    >
                                        <td className="p-3 font-medium text-slate-800">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={14} className="text-slate-400" />
                                                {hospital.name}
                                            </div>
                                        </td>
                                        <td className="p-3 text-slate-600">{hospital.hospitalCode}</td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => setEditingHospital(hospital)}
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

            <AddEditHospitalModal
                open={addOpen}
                hospital={null}
                onClose={() => setAddOpen(false)}
                onSuccess={loadHospitals}
            />

            <AddEditHospitalModal
                open={editingHospital !== null}
                hospital={editingHospital}
                onClose={() => setEditingHospital(null)}
                onSuccess={loadHospitals}
            />
        </div>
    );
}
