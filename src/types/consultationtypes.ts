// ============================================================
// Gender
// ============================================================

export type Gender = "MALE" | "FEMALE" | "OTHER";


// ============================================================
// Appointment Status
// ============================================================

export type AppointmentStatus =
    | "WAITING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";


// ============================================================
// Endoscopy Image
// ============================================================

export interface EndoscopyImageDto {
    imageUrl: string;
    imageName: string;
    displayOrder: number;
}


// ============================================================
// Appointment Details
// ============================================================

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
    customMedicalHistory?: string[];
}


// ============================================================
// Chief Complaint
// ============================================================

export type ComplaintSide =
    | "LEFT"
    | "RIGHT"
    | "BILATERAL"
    | "OVERALL";

export interface ComplaintDto {
    complaint: string;
    side: ComplaintSide;
    displayOrder?: number;
}


// ============================================================
// Finding
// ============================================================

export interface FindingDto {
    finding: string;
}


// ============================================================
// Diagnosis
// ============================================================

export type DiagnosisType =
    | "PROVISIONAL"
    | "FINAL";

export interface DiagnosisDto {
    diagnosis: string;
    type: DiagnosisType;
    displayOrder?: number;
}


// ============================================================
// Medicine
// ============================================================

export interface MedicineDto {
    medicineName: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
}


// ============================================================
// YouTube Video
// ============================================================

export interface YoutubeVideoDto {
    youtubeUrl: string;
    title?: string;
}


// ============================================================
// Charge
// ============================================================

export interface ChargeDto {
    label: string;
    amount: number;
}


// ============================================================
// Create Consultation
// ============================================================

export interface CreateConsultationDto {
    // Appointment
    appointmentId: number;

    // Vitals
    bp?: string;
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
    customMedicalHistory?: string[];

    // Consultation
    consultationFee: number;
    advice?: string;
    followUpDate?: string;

    // Chief Complaints
    complaints: ComplaintDto[];

    // Findings
    findings: FindingDto[];

    // Endoscopy
    otoendoscopies: FindingDto[];
    diagnosticNasalEndoscopies: FindingDto[];
    videoLaryngoscopies: FindingDto[];

    // Diagnosis
    diagnoses: DiagnosisDto[];

    // Medicines
    medicines: MedicineDto[];

    // Charges
    charges: ChargeDto[];

    // YouTube Videos
    youtubeVideos: YoutubeVideoDto[];
}


// ============================================================
// Consultation Response
// ============================================================

export interface ConsultationResponseDto {
    consultationId: number;
    appointmentId: number;
    message: string;
    prescriptionToken: string;
}