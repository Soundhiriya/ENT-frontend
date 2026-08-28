"use client";

import { useEffect, useState } from "react";
import { Search, Pencil, History, X } from "lucide-react";
import { toast } from "sonner";
import { getAllPatients, searchPatients } from "@/src/services/patientService";
import { Patient } from "@/src/types/patient";
import { PageResponse } from "@/src/types/page";
import EditPatientModal from "./EditPatientModal";
import PatientHistoryModal from "./PatientHistoryModal";

interface Props {
    open: boolean;
    onClose: () => void;
}

const PAGE_SIZE = 10;

function calculateAge(dateOfBirth?: string): number | null {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    return age;
}

export default function ManagePatientsModal({ open, onClose }: Props) {
    const [patientsPage, setPatientsPage] = useState<PageResponse<Patient> | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [keyword, setKeyword] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [historyPatientId, setHistoryPatientId] = useState<number | null>(null);

    const loadPatients = async () => {
        setLoading(true);
        try {
            const response = keyword.trim()
                ? await searchPatients(keyword.trim(), page, PAGE_SIZE)
                : await getAllPatients(page, PAGE_SIZE);
            setPatientsPage(response);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load patients");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            loadPatients();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, page, keyword]);

    useEffect(() => {
        if (!open) {
            setKeyword("");
            setSearchInput("");
            setPage(0);
        }
    }, [open]);

    if (!open) return null;

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setKeyword(searchInput);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-[10px] border border-[#E5E7EB] bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Manage Patients</h2>
                        <p className="text-xs text-slate-400">
                            {patientsPage ? `${patientsPage.totalElements} patients` : "Loading..."}
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

                {/* Search */}
                <div className="border-b border-[#E5E7EB] p-4">
                    <form onSubmit={submitSearch} className="flex flex-wrap gap-2">
                        <div className="relative min-w-0 flex-1">
                            <Search
                                size={15}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by name, patient ID, or phone..."
                                className="w-full rounded-[10px] border border-[#E5E7EB] bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--brand-secondary)] focus:ring-2 focus:ring-[var(--brand-secondary)]/20 max-lg:min-h-[40px]"
                            />
                        </div>

                        <button
                            type="submit"
                            className="rounded-[10px] bg-[var(--brand-primary)] px-4 py-2 text-xs font-medium text-white shadow-sm transition-opacity duration-150 hover:opacity-90 max-lg:min-h-[40px]"
                        >
                            Search
                        </button>

                        {keyword && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchInput("");
                                    setKeyword("");
                                    setPage(0);
                                }}
                                className="rounded-[10px] border border-[#E5E7EB] px-4 py-2 text-xs font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50 max-lg:min-h-[40px]"
                            >
                                Clear
                            </button>
                        )}
                    </form>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="py-12 text-center text-sm text-slate-400">
                            Loading patients...
                        </div>
                    ) : !patientsPage || patientsPage.content.length === 0 ? (
                        <div className="py-12 text-center text-sm text-slate-400">
                            No patients found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] border-collapse text-sm">
                            <thead className="sticky top-0 z-[1]">
                                <tr className="border-b border-[#E5E7EB] bg-slate-50 text-xs text-slate-500">
                                    <th className="p-3 text-left font-medium">Name</th>
                                    <th className="p-3 text-left font-medium">Patient ID</th>
                                    <th className="p-3 text-left font-medium">Age / Gender</th>
                                    <th className="p-3 text-left font-medium">Phone</th>
                                    <th className="p-3 text-left font-medium">Location</th>
                                    <th className="p-3 text-left font-medium">Status</th>
                                    <th className="p-3 text-center font-medium">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {patientsPage.content.map((patient) => (
                                    <tr
                                        key={patient.id}
                                        className="border-b border-slate-100 last:border-b-0"
                                    >
                                        <td className="p-3 font-medium text-slate-800">
                                            {patient.name}
                                        </td>
                                        <td className="p-3 text-slate-600">{patient.patientId}</td>
                                        <td className="p-3 text-slate-600">
                                            {calculateAge(patient.dateOfBirth) ?? "-"}y ·{" "}
                                            {patient.gender}
                                        </td>
                                        <td className="p-3 text-slate-600">{patient.phone}</td>
                                        <td className="p-3 text-slate-600">
                                            {patient.location ?? "-"}
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                                                    patient.active
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        : "border-red-200 bg-red-50 text-red-600"
                                                }`}
                                            >
                                                {patient.active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setHistoryPatientId(patient.id)}
                                                    className="inline-flex items-center gap-1 rounded-[10px] border border-[#E5E7EB] px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50 max-lg:min-h-[40px]"
                                                >
                                                    <History size={12} />
                                                    History
                                                </button>

                                                <button
                                                    onClick={() => setEditingPatient(patient)}
                                                    className="inline-flex items-center gap-1 rounded-[10px] border border-[#E5E7EB] px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50 max-lg:min-h-[40px]"
                                                >
                                                    <Pencil size={12} />
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {patientsPage && patientsPage.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-[#E5E7EB] p-3">
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={patientsPage.first}
                            className="rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 max-lg:min-h-[40px]"
                        >
                            Previous
                        </button>

                        <span className="text-xs text-slate-500">
                            Page {patientsPage.number + 1} of {patientsPage.totalPages}
                        </span>

                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={patientsPage.last}
                            className="rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 max-lg:min-h-[40px]"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            <EditPatientModal
                open={editingPatient !== null}
                patient={editingPatient}
                onClose={() => setEditingPatient(null)}
                onSuccess={loadPatients}
            />

            {historyPatientId !== null && (
                <PatientHistoryModal
                    patientId={historyPatientId}
                    onClose={() => setHistoryPatientId(null)}
                />
            )}
        </div>
    );
}
