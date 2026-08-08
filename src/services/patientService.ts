import { PageResponse } from "../types/page";
import { AppointmentCreationResponseDto, AppointmentQueueDto, CreateAppointmentDto, Patient, PatientRegisterDto, UpdatePatientDto } from "../types/patient"
import { request } from "./api"

export const registerPatient= async(patient:PatientRegisterDto) : Promise<Patient> => {

    try {
        const response = await request<Patient>("/appointment/patient-registration",{
        method:"POST",
        body:JSON.stringify(patient)
    })
        console.log(response);
        return response
        
    } catch (error:any) {
        const message = error.message;
        console.log(error);
        throw error;
    }
}

export const getAllPatients= async(page: number,
    size: number = 10):Promise<PageResponse<Patient>> => {

    try {
        const response = await request<PageResponse<Patient>>(`/appointment/getAllPatients?page=${page}&size=${size}`)
        console.log(response);
        return response
    } catch (error:any) {
        const message = error.message;
        console.log(error);
        throw error;
    }
}

export const searchPatients= async(keyword:string,page:number=0,size:number=10):Promise<PageResponse<Patient>> => {
    try {
        const response = await request
        <PageResponse<Patient>>(`/appointment/searchPatients?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`)
        console.log(response);
        return response
        
    } catch (error:any) {
        const message = error.message;
        console.log(error);
        throw error;
    }
}

export const createAppointments= async(appointmentDto:CreateAppointmentDto) => {
    try {
        const response = await request<AppointmentCreationResponseDto>("/appointment/createAppointment",{
            method:"POST",
            body:JSON.stringify(appointmentDto)
        })
        console.log(response);
        return response;
    } catch (error:any) {
        const message = error.message;
        console.log(error);
        throw error;
    }
}

export const getTodayQueue = async (): Promise<AppointmentQueueDto[]> => {

    try {
        const response = await request<AppointmentQueueDto[]>("/appointment/todayQueue");
        return response;
    } catch (error) {
        throw error;
    }

};

export const getTodayAllQueue = async (): Promise<AppointmentQueueDto[]> => {

    try {
        const response = await request<AppointmentQueueDto[]>("/appointment/todayQueue/all");
        return response;
    } catch (error) {
        throw error;
    }

};


export async function getPatientById(id: number): Promise<Patient> {
    return request<Patient>(`/appointment/patient/${id}`);
}

export async function getPatientDetailsById(patientId: number): Promise<Patient> {
    return request<Patient>(`/appointment/patients/${patientId}`);
}

export async function updatePatientDetails(
    patientId: number,
    dto: UpdatePatientDto
): Promise<Patient> {
    return request<Patient>(`/appointment/patients/${patientId}`, {
        method: "PUT",
        body: JSON.stringify(dto),
    });
}


