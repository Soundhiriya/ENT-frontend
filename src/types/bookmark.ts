import { ComplaintDto, DiagnosisDto, FindingDto, MedicineDto, YoutubeVideoDto } from "./consultationtypes";

export interface BookmarkResponse {
    id: number;
    bookmarkName: string;
    doctorId: number;
    doctorName: string;
}

export interface CreateBookmarkDto {
    bookmarkName: string;
    complaints: ComplaintDto[];
    findings: FindingDto[];
    otoendoscopies: FindingDto[];
    diagnosticNasalEndoscopies: FindingDto[];
    videoLaryngoscopies: FindingDto[];
    diagnoses: DiagnosisDto[];
    medicines: MedicineDto[];
    advice: string;
    youtubeVideos: YoutubeVideoDto[];
}

export interface BookmarkDetailDto {
    id: number;
    bookmarkName: string;
    doctorId: number;
    doctorName: string;
    complaints: ComplaintDto[];
    findings: FindingDto[];
    otoendoscopies: FindingDto[];
    diagnosticNasalEndoscopies: FindingDto[];
    videoLaryngoscopies: FindingDto[];
    diagnoses: DiagnosisDto[];
    medicines: MedicineDto[];
    advice: string;
    youtubeVideos: YoutubeVideoDto[];
}