import { PrescriptionDto } from "../types/prescription";
import { PageResponse } from "../types/page";
import { request } from "./api";

export const    getPrescription = async (
    consultationId: number
    ): Promise<PrescriptionDto> => {
    return request<PrescriptionDto>(`/prescription/${consultationId}`, {
        method: "GET",
    });
};

export async function getPatientHistory(
    patientId: number,
    page: number = 0,
    size: number = 10
    ): Promise<PageResponse<PrescriptionDto>> {
    return request<PageResponse<PrescriptionDto>>(
        `/consultation/patient/${patientId}/history?page=${page}&size=${size}`
    );
}