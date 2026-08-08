import { request } from "./api"

export interface DiagnosesDropdown{
    id:number;
    diagnosis:string
}

export interface ComplaintDropdown{
    id:number;
    complaint:string
}
export interface MedicineDropdown{
    id:number;
    medicineName:string
}

export interface YoutubeLinkDropdown {
    id: number;
    title: string;
    youtubeUrl: string;
}


export const getDiagnosesMasterData = async():Promise<DiagnosesDropdown[]> => {
    return await request<DiagnosesDropdown[]>("/master/diagnoses");
}
export const getComplaintMasterData = async():Promise<ComplaintDropdown[]> => {
    return await request<ComplaintDropdown[]>("/master/complaints");
}
export const getMedicineMasterData = async():Promise<MedicineDropdown[]> => {
    return await request<MedicineDropdown[]>("/master/medicines");
}

export const getYoutubeLinkMasterData = async(): Promise<YoutubeLinkDropdown[]> => {
    return await request<YoutubeLinkDropdown[]>("/master/youtube-links");
}


export async function searchMedicines(
    search: string
): Promise<MedicineDropdown[]> {
    return request<MedicineDropdown[]>(
        `/master/search-medicines?search=${encodeURIComponent(search)}`
    );
}

export async function searchDiagnoses(
    search: string
): Promise<DiagnosesDropdown[]> {
    return request<DiagnosesDropdown[]>(
        `/master/search-diagnoses?search=${encodeURIComponent(search)}`

    );

}

export async function searchComplaints(
    search: string
): Promise<ComplaintDropdown[]> {
    return request<ComplaintDropdown[]>(
        `/master/search-complaints?search=${encodeURIComponent(search)}`
    );

}

export async function searchYoutubeLinks(
    search: string
): Promise<YoutubeLinkDropdown[]> {
    return request<YoutubeLinkDropdown[]>(
        `/master/search-youtube-links?search=${encodeURIComponent(search)}`
    );
}

// ---- Diagnosis CRUD ----

export const createDiagnosisMaster = (diagnosis: string): Promise<DiagnosesDropdown> =>
    request<DiagnosesDropdown>("/master/diagnoses", {
        method: "POST",
        body: JSON.stringify({ diagnosis }),
    });

export const updateDiagnosisMaster = (id: number, diagnosis: string): Promise<DiagnosesDropdown> =>
    request<DiagnosesDropdown>(`/master/diagnoses/${id}`, {
        method: "PUT",
        body: JSON.stringify({ diagnosis }),
    });

export const deleteDiagnosisMaster = (id: number): Promise<{ message: string }> =>
    request<{ message: string }>(`/master/diagnoses/${id}`, { method: "DELETE" });

// ---- Complaint CRUD ----

export const createComplaintMaster = (complaint: string): Promise<ComplaintDropdown> =>
    request<ComplaintDropdown>("/master/complaints", {
        method: "POST",
        body: JSON.stringify({ complaint }),
    });

export const updateComplaintMaster = (id: number, complaint: string): Promise<ComplaintDropdown> =>
    request<ComplaintDropdown>(`/master/complaints/${id}`, {
        method: "PUT",
        body: JSON.stringify({ complaint }),
    });

export const deleteComplaintMaster = (id: number): Promise<{ message: string }> =>
    request<{ message: string }>(`/master/complaints/${id}`, { method: "DELETE" });

// ---- Medicine CRUD ----

export const createMedicineMaster = (medicineName: string): Promise<MedicineDropdown> =>
    request<MedicineDropdown>("/master/medicines", {
        method: "POST",
        body: JSON.stringify({ medicineName }),
    });

export const updateMedicineMaster = (id: number, medicineName: string): Promise<MedicineDropdown> =>
    request<MedicineDropdown>(`/master/medicines/${id}`, {
        method: "PUT",
        body: JSON.stringify({ medicineName }),
    });

export const deleteMedicineMaster = (id: number): Promise<{ message: string }> =>
    request<{ message: string }>(`/master/medicines/${id}`, { method: "DELETE" });

// ---- YouTube link CRUD ----

export const createYoutubeLinkMaster = (
    title: string,
    youtubeUrl: string
): Promise<YoutubeLinkDropdown> =>
    request<YoutubeLinkDropdown>("/master/youtube-links", {
        method: "POST",
        body: JSON.stringify({ title, youtubeUrl }),
    });

export const updateYoutubeLinkMaster = (
    id: number,
    title: string,
    youtubeUrl: string
): Promise<YoutubeLinkDropdown> =>
    request<YoutubeLinkDropdown>(`/master/youtube-links/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title, youtubeUrl }),
    });

export const deleteYoutubeLinkMaster = (id: number): Promise<{ message: string }> =>
    request<{ message: string }>(`/master/youtube-links/${id}`, { method: "DELETE" });
