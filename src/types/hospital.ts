export interface HospitalDropdown {
    id: number;
    hospitalCode: string;
    name: string;
}

export interface DoctorDropdownDto {
    id: number;
    name: string;
}

export interface CreateHospitalDto {
    name: string;
    hospitalCode: string;
}