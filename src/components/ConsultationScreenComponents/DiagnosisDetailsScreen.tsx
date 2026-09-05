import { DiagnosisDto } from "@/src/types/consultationtypes";
import { Stethoscope } from "lucide-react";
import { useState } from "react";

interface DiagnosisDetailsScreenProps {
    diagnoses: DiagnosisDto[];
    setDiagnoses: React.Dispatch<
        React.SetStateAction<DiagnosisDto[]>
    >;
}

type DiagnosisType = "PROVISIONAL" | "FINAL";

export default function DiagnosisDetailsScreen({
    diagnoses,
    setDiagnoses,
}: DiagnosisDetailsScreenProps) {
    const [values, setValues] = useState<
        Record<DiagnosisType, string>
    >({
        PROVISIONAL: "",
        FINAL: "",
    });

    const addDiagnosis = (type: DiagnosisType) => {
        const value = values[type].trim();

        if (!value) return;

        const alreadyExists = diagnoses.some(
            (item) =>
                item.type === type &&
                item.diagnosis.toLowerCase() ===
                    value.toLowerCase()
        );

        if (alreadyExists) {
            setValues((prev) => ({
                ...prev,
                [type]: "",
            }));
            return;
        }

        setDiagnoses((prev) => [
            ...prev,
            {
                diagnosis: value,
                type,
                displayOrder: prev.length + 1,
            },
        ]);

        setValues((prev) => ({
            ...prev,
            [type]: "",
        }));
    };

    const removeDiagnosis = (
        type: DiagnosisType,
        diagnosis: string
    ) => {
        setDiagnoses((prev) =>
            prev.filter(
                (item) =>
                    !(
                        item.type === type &&
                        item.diagnosis === diagnosis
                    )
            )
        );
    };

    const provisionalDiagnoses = diagnoses.filter(
        (item) => item.type === "PROVISIONAL"
    );

    const finalDiagnoses = diagnoses.filter(
        (item) => item.type === "FINAL"
    );

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            {/* Header */}
            <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50">
                    <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
                </div>

                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                    Diagnosis
                </h2>
            </div>

            {/* Provisional Diagnosis */}
            <div className="mb-3">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    Provisional
                </label>

                <input
                    type="text"
                    value={values.PROVISIONAL}
                    placeholder="Enter provisional diagnosis"
                    onChange={(e) =>
                        setValues((prev) => ({
                            ...prev,
                            PROVISIONAL: e.target.value,
                        }))
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addDiagnosis("PROVISIONAL");
                        }
                    }}
                    onBlur={() => addDiagnosis("PROVISIONAL")}
                    className="
                        h-8
                        w-full
                        rounded-md
                        border
                        border-slate-300
                        bg-slate-50
                        px-2.5
                        text-[11px]
                        text-slate-700
                        placeholder:text-slate-400
                        outline-none
                        transition
                        hover:border-slate-400
                        focus:border-blue-500
                        focus:bg-white
                        focus:ring-2
                        focus:ring-blue-100
                    "
                />

                {/* Provisional Added Items */}
                {provisionalDiagnoses.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                        {provisionalDiagnoses.map((item) => (
                            <div
                                key={`${item.type}-${item.diagnosis}`}
                                className="
                                    inline-flex
                                    items-center
                                    gap-1
                                    rounded-full
                                    border
                                    border-blue-200
                                    bg-blue-50
                                    px-2
                                    py-0.5
                                    text-[10px]
                                    font-medium
                                    text-blue-700
                                "
                            >
                                <span>{item.diagnosis}</span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeDiagnosis(
                                            "PROVISIONAL",
                                            item.diagnosis
                                        )
                                    }
                                    className="font-bold text-blue-400 hover:text-red-500"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Final Diagnosis */}
            <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    Final
                </label>

                <input
                    type="text"
                    value={values.FINAL}
                    placeholder="Enter final diagnosis"
                    onChange={(e) =>
                        setValues((prev) => ({
                            ...prev,
                            FINAL: e.target.value,
                        }))
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addDiagnosis("FINAL");
                        }
                    }}
                    onBlur={() => addDiagnosis("FINAL")}
                    className="
                        h-8
                        w-full
                        rounded-md
                        border
                        border-slate-300
                        bg-slate-50
                        px-2.5
                        text-[11px]
                        text-slate-700
                        placeholder:text-slate-400
                        outline-none
                        transition
                        hover:border-slate-400
                        focus:border-blue-500
                        focus:bg-white
                        focus:ring-2
                        focus:ring-blue-100
                    "
                />

                {/* Final Added Items */}
                {finalDiagnoses.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                        {finalDiagnoses.map((item) => (
                            <div
                                key={`${item.type}-${item.diagnosis}`}
                                className="
                                    inline-flex
                                    items-center
                                    gap-1
                                    rounded-full
                                    border
                                    border-blue-200
                                    bg-blue-50
                                    px-2
                                    py-0.5
                                    text-[10px]
                                    font-medium
                                    text-blue-700
                                "
                            >
                                <span>{item.diagnosis}</span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeDiagnosis(
                                            "FINAL",
                                            item.diagnosis
                                        )
                                    }
                                    className="font-bold text-blue-400 hover:text-red-500"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}