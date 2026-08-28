"use client";

import { useState } from "react";
import { X, UserRound, CalendarClock, Stethoscope, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { downloadReport, ReportFormat, ReportType } from "@/src/services/reportService";

interface Props {
    open: boolean;
    onClose: () => void;
}

function firstDayOfMonth(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function today(): string {
    return new Date().toISOString().slice(0, 10);
}

const REPORT_SECTIONS: {
    type: ReportType;
    icon: typeof UserRound;
    title: string;
    description: string;
}[] = [
    {
        type: "patients",
        icon: UserRound,
        title: "Patients",
        description: "Patients who had an appointment in the selected date range.",
    },
    {
        type: "appointments",
        icon: CalendarClock,
        title: "Appointments",
        description: "Every appointment booked within the selected date range.",
    },
    {
        type: "consultations",
        icon: Stethoscope,
        title: "Consultations",
        description:
            "Chief complaints, findings, diagnoses, medicines, and billing for every consultation in range.",
    },
];

export default function ReportsModal({ open, onClose }: Props) {
    const [startDate, setStartDate] = useState(firstDayOfMonth());
    const [endDate, setEndDate] = useState(today());
    const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

    if (!open) return null;

    const handleDownload = async (type: ReportType, format: ReportFormat) => {
        if (!startDate || !endDate) {
            toast.error("Select a start and end date");
            return;
        }

        if (startDate > endDate) {
            toast.error("Start date must be before end date");
            return;
        }

        const key = `${type}-${format}`;
        setDownloadingKey(key);
        try {
            await downloadReport(type, format, startDate, endDate);
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message ?? "Failed to download report");
        } finally {
            setDownloadingKey(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-[10px] border border-[#E5E7EB] bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Reports</h2>
                        <p className="text-xs text-slate-400">
                            Download patient, appointment, and consultation records for a date range.
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

                {/* Date range picker */}
                <div className="border-b border-[#E5E7EB] p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="text-xs font-medium text-slate-600">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                max={endDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1 rounded-[10px] border border-[#E5E7EB] bg-slate-50 p-2.5 text-sm outline-none focus:border-[var(--brand-secondary)] focus:ring-2 focus:ring-[var(--brand-secondary)]/20 max-lg:min-h-[40px]"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-600">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                max={today()}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1 rounded-[10px] border border-[#E5E7EB] bg-slate-50 p-2.5 text-sm outline-none focus:border-[var(--brand-secondary)] focus:ring-2 focus:ring-[var(--brand-secondary)]/20 max-lg:min-h-[40px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Report sections */}
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {REPORT_SECTIONS.map(({ type, icon: Icon, title, description }) => (
                        <div
                            key={type}
                            className="flex flex-col gap-3 rounded-[10px] border border-[#E5E7EB] bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                                    <Icon size={18} />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{title}</p>
                                    <p className="mt-0.5 text-xs text-slate-400">{description}</p>
                                </div>
                            </div>

                            <div className="flex shrink-0 gap-2">
                                <button
                                    onClick={() => handleDownload(type, "excel")}
                                    disabled={downloadingKey !== null}
                                    className="flex items-center gap-1.5 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors duration-150 hover:bg-slate-100 disabled:opacity-60 max-lg:min-h-[40px]"
                                >
                                    <FileSpreadsheet size={14} />
                                    {downloadingKey === `${type}-excel` ? "Downloading..." : "Excel"}
                                </button>

                                <button
                                    onClick={() => handleDownload(type, "pdf")}
                                    disabled={downloadingKey !== null}
                                    className="flex items-center gap-1.5 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors duration-150 hover:bg-slate-100 disabled:opacity-60 max-lg:min-h-[40px]"
                                >
                                    <FileText size={14} />
                                    {downloadingKey === `${type}-pdf` ? "Downloading..." : "PDF"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
