import {
    ChargeDto,
    ComplaintDto,
    DiagnosisDto,
    EndoscopyImageDto,
    FindingDto,
    MedicineDto,
    YoutubeVideoDto,
    } from "./consultationtypes";;

    export interface PrescriptionDto {
    consultationId: number;
    prescriptionToken: string;

    hospitalName: string;

    doctorName: string;

    patientName: string;
    age: number | null;
    gender: string;
    phone: string;

    consultationDate: string;

    consultationFee: number;
    charges: ChargeDto[];

    bp: string | null;
    temperature: number | null;
    weight: number | null;
    height: number | null;

    diabetes?: boolean | null;
    hypertension?: boolean | null;
    tuberculosis?: boolean | null;
    bronchialAsthma?: boolean | null;
    epilepsy?: boolean | null;
    antenatal?: boolean | null;
    customMedicalHistory?: string[];

    complaints: ComplaintDto[];
    findings: FindingDto[];
    otoendoscopies: FindingDto[];
    diagnosticNasalEndoscopies: FindingDto[];
    videoLaryngoscopies: FindingDto[];
    diagnoses: DiagnosisDto[];
    medicines: MedicineDto[];

    advice: string;
    followUpDate: string;

    endoscopyImages:EndoscopyImageDto[];
    youtubeVideos: YoutubeVideoDto[];
    }

    // Shape used by the shared <PrescriptionView> renderer. Identical to
    // PrescriptionDto except consultationId/prescriptionToken are optional —
    // a not-yet-saved consultation (preview mode) has neither yet.
    export type PrescriptionViewData = Omit<
    PrescriptionDto,
    "consultationId" | "prescriptionToken"
    > & {
    consultationId?: number;
    prescriptionToken?: string;
    };