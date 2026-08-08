import { request } from "./api";

import { PrescriptionDto } from "../types/prescription";

import { PublicPrescriptionRequestDto } from "../types/publicPrescription";

export const getPublicPrescription = async (dto: PublicPrescriptionRequestDto): Promise<PrescriptionDto> => {

    return request<PrescriptionDto>("/public/prescription", {
        method: "POST",
        body: JSON.stringify(dto),

    });

};