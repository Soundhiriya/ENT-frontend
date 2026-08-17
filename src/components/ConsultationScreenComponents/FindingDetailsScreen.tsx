    // FindingDetailsScreen.tsx

    import { FindingDto } from "@/src/types/consultationtypes";
    import { Search } from "lucide-react";
    import React, { useState } from "react";

    interface FindingDetailsScreenProps {
    findings: FindingDto[];
    setFindings: React.Dispatch<React.SetStateAction<FindingDto[]>>;
    }

    const FindingDetailsScreen = ({
    findings,
    setFindings,
    }: FindingDetailsScreenProps) => {
    const [finding, setFinding] = useState("");

    const addFinding = () => {
        if (!finding.trim()) return;

        const exists = findings.some(
        (f) => f.finding.toLowerCase() === finding.trim().toLowerCase()
        );

        if (exists) return;

        setFindings((prev) => [...prev, { finding: finding.trim() }]);

        setFinding("");
    };

    const removeFinding = (finding: string) => {
        setFindings((prev) => prev.filter((f) => f.finding !== finding));
    };

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Search className="h-3.5 w-3.5" />
            Findings
        </h2>

        <input
            type="text"
            value={finding}
            onChange={(e) => setFinding(e.target.value)}
            placeholder="Enter examination finding"
            className="h-8 w-full rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onKeyDown={(e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                addFinding();
            }
            }}
            // Commit pending text on focus loss so a finding is not lost when
            // Enter is never pressed.
            onBlur={addFinding}
        />

        {findings.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
            {findings.map((item) => (
                <div
                key={item.finding}
                className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                >
                <span>{item.finding}</span>
                <button
                    type="button"
                    onClick={() => removeFinding(item.finding)}
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

    export default FindingDetailsScreen;