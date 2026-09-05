import {
    ComplaintDto,
    ComplaintSide,
} from "@/src/types/consultationtypes";
import { MessageSquareText } from "lucide-react";
import { useState } from "react";

interface ComplaintDetailsScreenProps {
    complaints: ComplaintDto[];
    setComplaints: React.Dispatch<
        React.SetStateAction<ComplaintDto[]>
    >;
}

const sides: ComplaintSide[] = [
    "LEFT",
    "RIGHT",
    "BILATERAL",
    "OVERALL",
];

export default function ComplaintDetailsScreen({
    complaints,
    setComplaints,
}: ComplaintDetailsScreenProps) {
    const [values, setValues] = useState<
        Record<ComplaintSide, string>
    >({
        LEFT: "",
        RIGHT: "",
        BILATERAL: "",
        OVERALL: "",
    });

    const addComplaint = (side: ComplaintSide) => {
        const value = values[side].trim();

        if (!value) return;

        const alreadyExists = complaints.some(
            (item) =>
                item.side === side &&
                item.complaint.toLowerCase() ===
                    value.toLowerCase()
        );

        if (alreadyExists) {
            setValues((prev) => ({
                ...prev,
                [side]: "",
            }));
            return;
        }

        setComplaints((prev) => [
            ...prev,
            {
                complaint: value,
                side,
                displayOrder: prev.length + 1,
            },
        ]);

        setValues((prev) => ({
            ...prev,
            [side]: "",
        }));
    };

    const removeComplaint = (
        side: ComplaintSide,
        complaint: string
    ) => {
        setComplaints((prev) =>
            prev.filter(
                (item) =>
                    !(
                        item.side === side &&
                        item.complaint === complaint
                    )
            )
        );
    };

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            {/* Header */}
            <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50">
                    <MessageSquareText className="h-3.5 w-3.5 text-blue-600" />
                </div>

                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                    Chief Complaints
                </h2>
            </div>

            {/* Complaint Rows */}
            <div className="space-y-2.5">
                {sides.map((side) => {
                    const sideComplaints = complaints.filter(
                        (item) => item.side === side
                    );

                    return (
                        <div key={side}>
                            {/* Input Row */}
                            <div className="flex items-center gap-2">
                                <div className="w-[66px] shrink-0">
                                    <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                                        {side}
                                    </label>
                                </div>

                                <input
                                    type="text"
                                    value={values[side]}
                                    placeholder="Enter complaint"
                                    onChange={(e) =>
                                        setValues((prev) => ({
                                            ...prev,
                                            [side]: e.target.value,
                                        }))
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addComplaint(side);
                                        }
                                    }}
                                    onBlur={() => addComplaint(side)}
                                    className="
                                        h-8
                                        min-w-0
                                        flex-1
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
                            </div>

                            {/* Added Complaints */}
                            {sideComplaints.length > 0 && (
                                <div className="ml-[68px] mt-1.5 flex flex-wrap gap-1">
                                    {sideComplaints.map((item) => (
                                        <div
                                            key={`${item.side}-${item.complaint}`}
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
                                            <span>
                                                {item.complaint}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeComplaint(
                                                        side,
                                                        item.complaint
                                                    )
                                                }
                                                className="
                                                    font-bold
                                                    text-blue-400
                                                    hover:text-red-500
                                                "
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}