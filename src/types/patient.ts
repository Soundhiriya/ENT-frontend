
export interface PatientRegisterDto {
    name: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    location: string;
}

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface Patient {
    id: number;
    patientId: string;
    name: string;
    dateOfBirth: string;
    gender: Gender;
    phone: string;
    location: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;

}

export interface UpdatePatientDto {
    name: string;
    dateOfBirth: string;
    gender: Gender;
    phone: string;
    location: string;
    active: boolean;
}

export interface CreateAppointmentDto {
    patientId: number;
    doctorId: number;
    bp?: string;
    weight?: number;
    height?: number;
    temperature?: number;
    diabetes?: boolean;
    hypertension?: boolean;
    tuberculosis?: boolean;
    bronchialAsthma?: boolean;
    epilepsy?: boolean;
    antenatal?: boolean;
    customMedicalHistory?: string[];
    hospitalId: number;
}


    export interface AppointmentQueueDto {
    id: number;
    appointmentId: string;
    tokenNumber: number;
    patientName: string;
    doctorName: string;
    status: string;
    phoneNumber: string;
    location: string;
    patientId: string;
    dateOfBirth: string; // LocalDate -> ISO string
    gender: Gender;
    createdBy: string;
    consultationId?: number | null;
    }


export interface AppointmentDetails {

  // Appointment
appointmentDbId: number;
appointmentId: string;
tokenNumber: number;
appointmentDate: string;
createdAt: string;
status: "WAITING" | "COMPLETED" | "CANCELLED";

// Patient
patientDbId: number;
patientId: string;
patientName: string;
dateOfBirth: string;
gender: "MALE" | "FEMALE" | "OTHER";
phone: string;
location: string;

// Doctor
doctorId: number;
doctorName: string;

// Hospital
hospitalId: number;
hospitalName: string;

// Created By (Receptionist / Nurse / Admin)
createdById: number;
createdByName: string;

// Vitals
bp: string | null;
weight: number | null;
height: number | null;
temperature: number | null;
}

export type AppointmentStatus =
| "WAITING"
| "IN_PROGRESS"
| "COMPLETED"
| "CANCELLED";

export interface AppointmentCreationResponseDto {
id: number;
appointmentId: string;
tokenNumber: number;
patientName: string;
doctorName: string;
status: AppointmentStatus;
createdBy: string;
}
