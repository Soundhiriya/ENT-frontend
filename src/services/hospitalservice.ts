import { CreateHospitalDto, DoctorDropdownDto, HospitalDropdown } from "../types/hospital";
import { request } from "./api";

export const getHospitals = async (): Promise<HospitalDropdown[]> => {
    return await request<HospitalDropdown[]>("/hospital/dropdown");
};

export const getDoctors = async (): Promise<DoctorDropdownDto[]> => {
    return await request<DoctorDropdownDto[]>("/hospital/Doctorsdropdown");
};

export const createHospital = async (dto: CreateHospitalDto): Promise<HospitalDropdown> => {
    return await request<HospitalDropdown>("/hospital", {
        method: "POST",
        body: JSON.stringify(dto),
    });
};

export const updateHospital = async (
    id: number,
    dto: CreateHospitalDto
): Promise<HospitalDropdown> => {
    return await request<HospitalDropdown>(`/hospital/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
    });
};