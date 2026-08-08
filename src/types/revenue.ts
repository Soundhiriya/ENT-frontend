export interface DoctorRevenueDto {
    doctorId: number;
    doctorName: string;
    consultationCount: number;
    consultationFeeTotal: number;
    chargesTotal: number;
    totalRevenue: number;
}

export interface RevenueReportDto {
    startDate: string;
    endDate: string;
    totalRevenue: number;
    totalConsultations: number;
    doctorBreakdown: DoctorRevenueDto[];
}
