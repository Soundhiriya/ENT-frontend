import { downloadFile } from "./api";

export type ReportType = "patients" | "appointments" | "consultations";
export type ReportFormat = "excel" | "pdf";

export async function downloadReport(
    type: ReportType,
    format: ReportFormat,
    startDate: string,
    endDate: string
): Promise<void> {
    const params = new URLSearchParams({ startDate, endDate, format });
    await downloadFile(`/admin/reports/${type}?${params.toString()}`);
}
