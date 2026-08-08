"use client";

import { useEffect, useState } from "react";
import { X, IndianRupee, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { getRevenueReport } from "@/src/services/revenueService";
import { RevenueReportDto } from "@/src/types/revenue";

interface Props {
    open: boolean;
    onClose: () => void;
}

function formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function firstDayOfMonth(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function today(): string {
    return new Date().toISOString().slice(0, 10);
}

export default function RevenueModal({ open, onClose }: Props) {
    const [startDate, setStartDate] = useState(firstDayOfMonth());
    const [endDate, setEndDate] = useState(today());
    const [report, setReport] = useState<RevenueReportDto | null>(null);
    const [loading, setLoading] = useState(false);

    const loadReport = async () => {
        if (!startDate || !endDate) return;

        if (startDate > endDate) {
            toast.error("Start date must be before end date");
            return;
        }

        setLoading(true);
        try {
            const response = await getRevenueReport(startDate, endDate);
            setReport(response);
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message ?? "Failed to load revenue report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            loadReport();
        } else {
            setReport(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-[10px] border border-[#E5E7EB] bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Revenue</h2>
                        <p className="text-xs text-slate-400">
                            Organization and per-doctor revenue for a date range
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-8 w-8 items-center justify-center rounded-[10px] text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700"
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
                                className="mt-1 rounded-[10px] border border-[#E5E7EB] bg-slate-50 p-2.5 text-sm outline-none focus:border-[var(--brand-secondary)] focus:ring-2 focus:ring-[var(--brand-secondary)]/20"
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
                                className="mt-1 rounded-[10px] border border-[#E5E7EB] bg-slate-50 p-2.5 text-sm outline-none focus:border-[var(--brand-secondary)] focus:ring-2 focus:ring-[var(--brand-secondary)]/20"
                            />
                        </div>

                        <button
                            onClick={loadReport}
                            disabled={loading}
                            className="rounded-[10px] bg-[var(--brand-primary)] px-4 py-2.5 text-xs font-medium text-white shadow-sm transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
                        >
                            {loading ? "Loading..." : "Generate Report"}
                        </button>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="py-12 text-center text-sm text-slate-400">
                            Loading revenue report...
                        </div>
                    ) : !report ? (
                        <div className="py-12 text-center text-sm text-slate-400">
                            Select a date range and generate a report.
                        </div>
                    ) : (
                        <>
                            {/* Summary cards */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="flex items-center gap-3 rounded-[10px] border border-[#E5E7EB] bg-slate-50 p-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                                        <IndianRupee size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                            Total Revenue
                                        </p>
                                        <p className="mt-0.5 text-lg font-bold text-slate-800">
                                            {formatCurrency(report.totalRevenue)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-[10px] border border-[#E5E7EB] bg-slate-50 p-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                                        <Stethoscope size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                            Total Consultations
                                        </p>
                                        <p className="mt-0.5 text-lg font-bold text-slate-800">
                                            {report.totalConsultations}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Per-doctor breakdown */}
                            <div className="mt-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Revenue by Doctor
                                </p>

                                {report.doctorBreakdown.length === 0 ? (
                                    <div className="rounded-[10px] border border-[#E5E7EB] bg-white py-8 text-center text-sm text-slate-400">
                                        No consultations in this date range.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-[10px] border border-[#E5E7EB]">
                                        <table className="w-full border-collapse text-sm">
                                            <thead>
                                                <tr className="border-b border-[#E5E7EB] bg-slate-50 text-xs text-slate-500">
                                                    <th className="p-3 text-left font-medium">Doctor</th>
                                                    <th className="p-3 text-right font-medium">
                                                        Consultations
                                                    </th>
                                                    <th className="p-3 text-right font-medium">
                                                        Consultation Fees
                                                    </th>
                                                    <th className="p-3 text-right font-medium">
                                                        Additional Charges
                                                    </th>
                                                    <th className="p-3 text-right font-medium">
                                                        Total Revenue
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {report.doctorBreakdown.map((doctor) => (
                                                    <tr
                                                        key={doctor.doctorId}
                                                        className="border-b border-slate-100 last:border-b-0"
                                                    >
                                                        <td className="p-3 font-medium text-slate-800">
                                                            Dr. {doctor.doctorName}
                                                        </td>
                                                        <td className="p-3 text-right text-slate-600">
                                                            {doctor.consultationCount}
                                                        </td>
                                                        <td className="p-3 text-right text-slate-600">
                                                            {formatCurrency(doctor.consultationFeeTotal)}
                                                        </td>
                                                        <td className="p-3 text-right text-slate-600">
                                                            {formatCurrency(doctor.chargesTotal)}
                                                        </td>
                                                        <td className="p-3 text-right font-semibold text-slate-800">
                                                            {formatCurrency(doctor.totalRevenue)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>

                                            <tfoot>
                                                <tr className="bg-slate-50">
                                                    <td className="p-3 font-semibold text-slate-700">
                                                        Total
                                                    </td>
                                                    <td className="p-3 text-right font-semibold text-slate-700">
                                                        {report.totalConsultations}
                                                    </td>
                                                    <td className="p-3 text-right font-semibold text-slate-700">
                                                        {formatCurrency(
                                                            report.doctorBreakdown.reduce(
                                                                (sum, d) => sum + d.consultationFeeTotal,
                                                                0
                                                            )
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right font-semibold text-slate-700">
                                                        {formatCurrency(
                                                            report.doctorBreakdown.reduce(
                                                                (sum, d) => sum + d.chargesTotal,
                                                                0
                                                            )
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right font-semibold text-slate-800">
                                                        {formatCurrency(report.totalRevenue)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
