import { RevenueReportDto } from "../types/revenue";
import { request } from "./api";

export async function getRevenueReport(
    startDate: string,
    endDate: string
): Promise<RevenueReportDto> {
    return request<RevenueReportDto>(
        `/admin/revenue?startDate=${startDate}&endDate=${endDate}`
    );
}
