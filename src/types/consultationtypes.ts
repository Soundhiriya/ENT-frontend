    export type Gender = "MALE" | "FEMALE" | "OTHER";
    export type AppointmentStatus =
    | "WAITING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";

export interface EndoscopyImageDto {
    imageUrl: string;
    imageName: string;
    displayOrder: number;
}

    export interface AppointmentDetailsDto {
    // Appointment
    id: number;
    appointmentId: string;
    tokenNumber: number;
    appointmentDate: string;
    status: AppointmentStatus;

    // Patient
    patientId: number;
    patientCode: string;
    patientName: string;
    phone: string;
    gender: Gender;
    dateOfBirth: string;
    location: string | null;

    // Doctor
    doctorId: number;
    doctorName: string;

    // Hospital
    hospitalId: number;
    hospitalName: string;
    hospitalCode: string;

    // Vitals
    bp: string;
    weight?: number;
    height?: number;
    temperature?: number;

    // Medical History
    diabetes?: boolean;
    hypertension?: boolean;
    tuberculosis?: boolean;
    bronchialAsthma?: boolean;
    epilepsy?: boolean;
    antenatal?: boolean;
    }


    export interface ComplaintDto {
    complaint: string;
}

export interface FindingDto {
    finding: string;
}

export interface DiagnosisDto {
    diagnosis: string;
}

export interface MedicineDto {
    medicineName: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
}

export interface YoutubeVideoDto {
    youtubeUrl: string;
    title?: string;
}

export interface ChargeDto {
    label: string;
    amount: number;
}

export interface CreateConsultationDto {
    appointmentId: number;

    bp?: string;
    weight?: number;
    height?: number;
    temperature?: number;

    // Mirrors the appointment's medical history. The doctor can correct what
    // the front desk ticked; omitting a field leaves the existing value alone.
    diabetes?: boolean;
    hypertension?: boolean;
    tuberculosis?: boolean;
    bronchialAsthma?: boolean;
    epilepsy?: boolean;
    antenatal?: boolean;

    consultationFee: number;

    advice?: string;
    followUpDate?: string;

    complaints: ComplaintDto[];
    findings: FindingDto[];
    otoendoscopies: FindingDto[];
    diagnosticNasalEndoscopies: FindingDto[];
    videoLaryngoscopies: FindingDto[];
    diagnoses: DiagnosisDto[];
    medicines: MedicineDto[];
    charges: ChargeDto[];
    youtubeVideos: YoutubeVideoDto[];
}


export interface ConsultationResponseDto{
    consultationId:number;
    appointmentId:number;
    message:string
}