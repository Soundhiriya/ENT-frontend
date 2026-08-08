import { AppointmentDetailsDto, ConsultationResponseDto, CreateConsultationDto } from "../types/consultationtypes";
import { request } from "./api";

export async function getAppointmentDetails(
    appointmentId: number
    ): Promise<AppointmentDetailsDto> {
    return request<AppointmentDetailsDto>(
        `/appointment/appointmentDetails/${appointmentId}`
    );
}


export async function createConsultation(formData: FormData): Promise<ConsultationResponseDto> {


        const response = await request<ConsultationResponseDto>("/consultation/createConsultation",{
        method:"POST",
        body:formData,
        })
    return response;

}