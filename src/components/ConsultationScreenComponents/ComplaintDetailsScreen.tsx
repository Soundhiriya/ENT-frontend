// ComplaintDetailsScreen.tsx

import { ComplaintDto } from "@/src/types/consultationtypes";
import { ComplaintDropdown, searchComplaints } from "@/src/services/masterservices";
import { MessageSquareText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ComplaintDetailsScreenProps {
complaints: ComplaintDto[];
setComplaints: React.Dispatch<React.SetStateAction<ComplaintDto[]>>;
}

export default function ComplaintDetailsScreen({
complaints,
setComplaints,
}: ComplaintDetailsScreenProps) {
const [complaint, setComplaint] = useState("");
const [suggestions, setSuggestions] = useState<ComplaintDropdown[]>([]);

const handleSearch = async (value: string) => {
setComplaint(value);

if (value.trim().length < 2) {
    setSuggestions([]);
    return;
}

try {
    const response = await searchComplaints(value);
    setSuggestions(response);
} catch (error) {
    toast.error(error instanceof Error ? error.message : "Could not search complaints.");
}
};

const addComplaint = (value: string) => {
if (!value.trim()) return;

const exists = complaints.some(
    (c) => c.complaint.toLowerCase() === value.trim().toLowerCase()
);

if (exists) {
    toast.error("Complaint already added");
    return;
}

setComplaints((prev) => [...prev, { complaint: value.trim() }]);

setComplaint("");
setSuggestions([]);
};

const removeComplaint = (complaint: string) => {
setComplaints((prev) => prev.filter((c) => c.complaint !== complaint));
};

return (
<div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
    <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
    <MessageSquareText className="h-3.5 w-3.5" />
    Chief Complaints
    </h2>

    <div className="relative">
    <input
        type="text"
        value={complaint}
        placeholder="Search or enter complaint"
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={(e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addComplaint(complaint);
        }
        }}
        // Commit pending text on focus loss so it is not lost when Enter is
        // never pressed. Suggestion clicks preventDefault on mousedown, so
        // focus stays and they cannot double-add.
        onBlur={() => addComplaint(complaint)}
        className="h-8 w-full rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />

    {suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-slate-200 bg-white text-sm shadow-lg">
        {suggestions.map((item) => (
            <div
            key={item.id}
            onMouseDown={(e) => {
                e.preventDefault();
                addComplaint(item.complaint);
            }}
            className="cursor-pointer px-2 py-1.5 hover:bg-slate-100"
            >
            {item.complaint}
            </div>
        ))}
        </div>
    )}
    </div>

    {complaints.length > 0 && (
    <div className="mt-2 flex flex-wrap gap-1.5">
        {complaints.map((item) => (
        <div
            key={item.complaint}
            className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
        >
            <span>{item.complaint}</span>
            <button
            type="button"
            onClick={() => removeComplaint(item.complaint)}
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
}