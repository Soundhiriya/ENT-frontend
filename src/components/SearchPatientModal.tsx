    "use client";

    import React, { useEffect, useState, useRef, useCallback } from "react";
    import { Search, ChevronLeft, ChevronRight, X, Loader2, UserRound } from "lucide-react";
    import { toast } from "sonner";

    import { searchPatients } from "../services/patientService";
    import { Patient } from "../types/patient";
    import { PageResponse } from "../types/page";

    interface SearchPatientProps {
    open: boolean;
    close: () => void;
    onSelect: (patient: Patient) => void;
    }

    export default function SearchPatientModal({
    open,
    close,
    onSelect,
    }: SearchPatientProps) {
    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const size = 10;

    const [patients, setPatients] = useState<PageResponse<Patient> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset state whenever modal opens
    useEffect(() => {
    if (open) {
        setKeyword("");
        setDebouncedKeyword("");
        setPage(0);
        setPatients(null);
        setTimeout(() => inputRef.current?.focus(), 50);
    }
    }, [open]);

    // Debounce the keyword so we don't hit the API on every keystroke
    useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 350);
    return () => clearTimeout(t);
    }, [keyword]);

    const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
        const response = await searchPatients(debouncedKeyword, page, size);
        setPatients(response);
    } catch (error: any) {
        toast.error(error.message || "Unable to search patients");
    } finally {
        setLoading(false);
    }
    }, [debouncedKeyword, page]);

    useEffect(() => {
    if (!open) return;
    handleSearch();
    }, [open, debouncedKeyword, page, handleSearch]);

    // Close on Escape key
    useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    }, [open, close]);

    if (!open) return null;

    const nextPage = () => {
    if (!patients?.last) setPage((prev) => prev + 1);
    };

    const prevPage = () => {
    if (!patients?.first) setPage((prev) => Math.max(prev - 1, 0));
    };

    return (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={close}
    >
        <div
        className="w-full max-w-3xl rounded-xl bg-white shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
            <div>
            <h2 className="text-2xl font-bold text-gray-900">Search Patient</h2>
            <p className="text-sm text-gray-500 mt-0.5">
                Find an existing patient to continue
            </p>
            </div>

            <button
            onClick={close}
            className="flex items-center justify-center rounded-lg p-2 max-lg:min-h-[40px] max-lg:min-w-[40px] text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
            aria-label="Close"
            >
            <X size={22} />
            </button>
        </div>

        {/* Search input */}
        <div className="p-6 pb-4">
            <div className="relative">
            <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
                ref={inputRef}
                type="text"
                value={keyword}
                placeholder="Search by Name, Phone or Patient ID"
                onChange={(e) => {
                setPage(0);
                setKeyword(e.target.value);
                }}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />

            {loading && (
                <Loader2
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin"
                />
            )}
            </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 min-h-[200px]">
            {loading && !patients && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Loader2 size={28} className="animate-spin mb-3" />
                Searching patients...
            </div>
            )}

            {!loading && patients?.content.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <UserRound size={36} className="mb-3 text-gray-300" />
                <p className="font-medium">No patients found</p>
                <p className="text-sm text-gray-400 mt-1">
                Try a different name, phone number, or patient ID
                </p>
            </div>
            )}

            {patients?.content.map((patient) => (
            <div
                key={patient.id}
                className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
            >
                <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                    {patient.name?.charAt(0).toUpperCase()}
                </div>

                <div>
                    <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                    <div className="flex flex-wrap gap-x-3 text-sm text-gray-500">
                    <span>{patient.patientId}</span>
                    <span>{patient.phone}</span>
                    <span>{patient.gender}</span>
                    </div>
                </div>
                </div>

                <button
                onClick={() => onSelect(patient)}
                className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 max-lg:min-h-[40px]"
                >
                Select
                </button>
            </div>
            ))}
        </div>

        {/* Footer / Pagination */}
        <div className="flex items-center justify-between border-t p-6">
            <button
            onClick={prevPage}
            disabled={patients?.first}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 max-lg:min-h-[40px]"
            >
            <ChevronLeft size={18} />
            Previous
            </button>

            <div className="text-sm text-gray-500">
            Page {(patients?.number ?? 0) + 1} of {patients?.totalPages || 1}
            </div>

            <button
            onClick={nextPage}
            disabled={patients?.last}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 max-lg:min-h-[40px]"
            >
            Next
            <ChevronRight size={18} />
            </button>
        </div>
        </div>
    </div>
    );
    }