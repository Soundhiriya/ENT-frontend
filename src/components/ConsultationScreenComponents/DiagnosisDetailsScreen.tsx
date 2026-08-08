    // DiagnosisDetailsScreen.tsx

    import { DiagnosisDto } from "@/src/types/consultationtypes";
    import { DiagnosesDropdown, searchDiagnoses } from "@/src/services/masterservices";
    import { Activity } from "lucide-react";
    import React, { useState } from "react";
    import { toast } from "sonner";

    interface DiagnosisDetailsScreenProps {
    diagnoses: DiagnosisDto[];
    setDiagnoses: React.Dispatch<React.SetStateAction<DiagnosisDto[]>>;
    }

    const DiagnosisDetailsScreen = ({
    diagnoses,
    setDiagnoses,
    }: DiagnosisDetailsScreenProps) => {
    const [diagnosis, setDiagnosis] = useState("");
    const [suggestions, setSuggestions] = useState<DiagnosesDropdown[]>([]);

    const handleSearch = async (value: string) => {
        setDiagnosis(value);

        if (value.trim().length < 2) {
        setSuggestions([]);
        return;
        }

        try {
        const response = await searchDiagnoses(value);
        setSuggestions(response);
        } catch (error: any) {
        toast.error(error.message || error);
        }
    };

    const addDiagnosis = (value: string) => {
        if (!value.trim()) return;

        const exists = diagnoses.some(
        (d) => d.diagnosis.toLowerCase() === value.trim().toLowerCase()
        );

        if (exists) {
        toast.error("Diagnosis already added");
        return;
        }

        setDiagnoses((prev) => [...prev, { diagnosis: value.trim() }]);

        setDiagnosis("");
        setSuggestions([]);
    };

    const removeDiagnosis = (diagnosis: string) => {
        setDiagnoses((prev) => prev.filter((d) => d.diagnosis !== diagnosis));
    };

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Activity className="h-3.5 w-3.5" />
            Diagnosis
        </h2>

        <div className="relative">
            <input
            type="text"
            value={diagnosis}
            placeholder="Search or enter diagnosis"
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                e.preventDefault();
                addDiagnosis(diagnosis);
                }
            }}
            className="h-8 w-full rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-slate-200 bg-white text-sm shadow-lg">
                {suggestions.map((item) => (
                <div
                    key={item.id}
                    onMouseDown={(e) => {
                    e.preventDefault();
                    addDiagnosis(item.diagnosis);
                    }}
                    className="cursor-pointer px-2 py-1.5 hover:bg-slate-100"
                >
                    {item.diagnosis}
                </div>
                ))}
            </div>
            )}
        </div>

        {diagnoses.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
            {diagnoses.map((item) => (
                <div
                key={item.diagnosis}
                className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                >
                <span>{item.diagnosis}</span>
                <button
                    type="button"
                    onClick={() => removeDiagnosis(item.diagnosis)}
                    className="font-bold text-red-500 hover:text-red-700"
                >
                    ×
                </button>
                </div>
            ))}
            </div>
        )}
        </div>
    );
    };

    export default DiagnosisDetailsScreen;