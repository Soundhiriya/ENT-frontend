    // DoctorQueuePanel.tsx

    "use client";

    import { useState } from "react";
    import { ChevronLeft, ChevronRight } from "lucide-react";
    import { AppointmentQueueDto } from "../types/patient";

    interface DoctorQueuePanelProps {
    queue: AppointmentQueueDto[];
    selectedAppointmentId?: number | null;
    onSelect: (appointmentId: number) => Promise<void>;
    onSelectCompleted?: (consultationId: number) => void;
    }

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

    export default function DoctorQueuePanel({
    queue,
    selectedAppointmentId,
    onSelect,
    onSelectCompleted,
    }: DoctorQueuePanelProps) {
    const [collapsed, setCollapsed] = useState(false);

    // Cancelled appointments aren't actionable from here, so they're left
    // out of both groups.
    const waitingItems = queue.filter(
        (item) => item.status !== "COMPLETED" && item.status !== "CANCELLED"
    );
    const completedItems = queue.filter((item) => item.status === "COMPLETED");

    const handleSelect = (item: AppointmentQueueDto) => {
        if (item.status === "COMPLETED") {
        if (item.consultationId != null) {
            onSelectCompleted?.(item.consultationId);
        }
        return;
        }

        onSelect(item.id);
    };

    const renderRow = (item: AppointmentQueueDto) => {
        const age = calculateAge(item.dateOfBirth);
        const isSelected = selectedAppointmentId === item.id;
        const isCompleted = item.status === "COMPLETED";

        if (collapsed) {
        return (
            <button
            key={item.id}
            onClick={() => handleSelect(item)}
            title={`${item.patientName} · ${item.status}`}
            className={`flex w-full flex-col items-center gap-1.5 border-b border-l-2 border-slate-100 py-3 transition-colors ${
                isSelected
                ? "border-l-slate-900 bg-slate-50"
                : "border-l-transparent hover:bg-slate-50"
            }`}
            >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-600 sm:text-[11px]">
                {item.tokenNumber}
            </div>
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                isCompleted ? "bg-emerald-500" : "bg-amber-500"
                }`}
            />
            </button>
        );
        }

        return (
        <button
            key={item.id}
            onClick={() => handleSelect(item)}
            title={
            isCompleted
                ? item.consultationId != null
                ? "View prescription"
                : "Prescription unavailable"
                : `Patient ID: ${item.patientId}`
            }
            className={`flex w-full items-start gap-2 border-b border-l-2 border-slate-100 px-2.5 py-2.5 text-left transition-colors ${
            isSelected
                ? "border-l-slate-900 bg-slate-50"
                : "border-l-transparent hover:bg-slate-50"
            }`}
        >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-600 sm:text-[11px]">
            {item.tokenNumber}
            </div>

            <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-slate-900">
                {item.patientName}
            </p>
            <p className="mt-0.5 truncate text-sm text-slate-500 sm:text-[11px]">
                {age !== null ? `${age}y` : "-"}
                <span className="mx-1 text-slate-300">·</span>
                <span className="font-mono">{item.appointmentId}</span>
            </p>
            <span
                className={`mt-1 inline-block rounded px-1.5 py-0.5 text-sm sm:text-[10px] font-medium ${
                isCompleted
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-amber-200 bg-amber-50 text-amber-700"
                }`}
            >
                {item.status}
            </span>
            </div>
        </button>
        );
    };

    const renderGroupLabel = (label: string, count: number) =>
        !collapsed && (
        <div className="sticky top-0 z-[1] bg-slate-50 px-2.5 py-1.5 text-sm font-semibold uppercase tracking-wide text-slate-500 sm:text-[10px]">
            {label} ({count})
        </div>
        );

    return (
        <div
        className={`relative w-full flex-shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-in-out ${
            collapsed ? "lg:w-[64px]" : "lg:w-[240px]"
        }`}
        >
        {/* Collapse toggle — sits on the panel's left edge at lg+ (beside the
            workspace); below lg the panel stacks full-width, so the toggle
            moves inside the top-right corner instead of protruding off the
            left edge into the workspace above it. */}
        <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand queue" : "Collapse queue"}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700 lg:right-auto lg:top-6 lg:-left-3 lg:h-6 lg:w-6"
        >
            {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className={`border-b border-slate-200 ${collapsed ? "px-2 py-3" : "px-3 py-3"}`}>
            {collapsed ? (
            <div className="flex flex-col items-center gap-2">
                <span
                className="text-sm font-semibold uppercase tracking-wide text-slate-400 sm:text-[10px]"
                style={{ writingMode: "vertical-rl" }}
                >
                Queue
                </span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white sm:text-[11px]">
                {queue.length}
                </span>
            </div>
            ) : (
            <>
                <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                Today's Queue
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                {queue.length} {queue.length === 1 ? "Patient" : "Patients"}
                </p>
            </>
            )}
        </div>

        <div className="max-h-[calc(100vh-240px)] overflow-y-auto">
            {queue.length === 0 ? (
            !collapsed && (
                <div className="p-6 text-center text-xs text-slate-400">
                No patients in queue
                </div>
            )
            ) : (
            <>
                {waitingItems.length > 0 && (
                <div>
                    {renderGroupLabel("Waiting", waitingItems.length)}
                    {waitingItems.map(renderRow)}
                </div>
                )}

                {completedItems.length > 0 && (
                <div>
                    {renderGroupLabel("Completed", completedItems.length)}
                    {completedItems.map(renderRow)}
                </div>
                )}
            </>
            )}
        </div>
        </div>
    );
    }
