    // DoctorWorkspace.tsx

    "use client";

    import { Patient } from "@/src/types/patient";
    import AppointmentDetailsScreen from "./ConsultationScreenComponents/AppointmentDetailsScreen";
    import { useEffect, useState } from "react";
    import { AppointmentDetailsDto, ChargeDto, ComplaintDto, CreateConsultationDto, DiagnosisDto, FindingDto, MedicineDto, YoutubeVideoDto } from "../types/consultationtypes";
    import ComplaintDetailsScreen from "./ConsultationScreenComponents/ComplaintDetailsScreen";
    import DiagnosisDetailsScreen from "./ConsultationScreenComponents/DiagnosisDetailsScreen";
    import FindingDetailsScreen from "./ConsultationScreenComponents/FindingDetailsScreen";
    import ClinicalFindingsSection from "./ConsultationScreenComponents/ClinicalFindingsSection";
    import MedicineDetailsScreen from "./ConsultationScreenComponents/MedicineDetailsScreen";
    import ChargeDetailsScreen from "./ConsultationScreenComponents/ChargeDetailsScreen";
    import EndoscopyImageDetailScreen from "./ConsultationScreenComponents/EndoscopyImageDetailScreen";
    import YoutubeDetailsScreen from "./ConsultationScreenComponents/YoutubeDetailsScreen";
    import { createConsultation } from "../services/consultationservice";
    import { toast } from "sonner";
    import { BookmarkResponse } from "../types/bookmark";
    import { getBookmarks } from "../services/bookmarkService";
    import BookmarkTemplatePanel from "./BookmarkTemplatePanel";
    import PrescriptionPreviewModal from "./PrescriptionPreviewModal";
    import { ClipboardList, Save, UserSearch } from "lucide-react";
import { useRouter } from "next/navigation";

    interface DoctorWorkspaceProps {
    selectedPatient: Patient | null;
    selectedAppointmentId: number | null;
    }

    export default function DoctorWorkspace({
    selectedPatient,
    selectedAppointmentId,
    }: DoctorWorkspaceProps) {
    const [appointmentDetails, setAppointmentDetails] =
        useState<AppointmentDetailsDto | null>(null);

    const [complaints, setComplaints] = useState<ComplaintDto[]>([]);
    const [findings, setFindings] = useState<FindingDto[]>([]);
    const [otoendoscopies, setOtoendoscopies] = useState<FindingDto[]>([]);
    const [diagnosticNasalEndoscopies, setDiagnosticNasalEndoscopies] = useState<FindingDto[]>([]);
    const [videoLaryngoscopies, setVideoLaryngoscopies] = useState<FindingDto[]>([]);
    const [diagnoses, setDiagnoses] = useState<DiagnosisDto[]>([]);
    const [medicines, setMedicines] = useState<MedicineDto[]>([]);
    const [charges, setCharges] = useState<ChargeDto[]>([]);
    const [youtubeVideos, setYoutubeVideos] = useState<YoutubeVideoDto[]>([]);

    const [consultationFee, setConsultationFee] = useState("");
    const [advice, setAdvice] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");
    const [endoscopyImages, setEndoscopyImages] = useState<File[]>([]);

    const [bookmarks, setBookmarks] = useState<BookmarkResponse[]>([]);
    const [selectedBookmarkId, setSelectedBookmarkId] = useState<number>();

    const [showPreview, setShowPreview] = useState(false);
    const [saving, setSaving] = useState(false);

    const router = useRouter();

    useEffect(() => {
        async function loadBookmarks() {
        try {
            const response = await getBookmarks();
            setBookmarks(response);
        } catch (error) {
            console.log(error);
        }
        }

        loadBookmarks();
    }, []);

    const handleOpenPreview = () => {
        if (!selectedAppointmentId) {
        alert("Please select an appointment.");
        return;
        }

        if (!consultationFee.trim() || Number(consultationFee) < 0) {
        toast.error("Please enter a valid consultation fee.");
        return;
        }

        setShowPreview(true);
    };

    const handleConfirmSaveConsultation = async () => {
        if (!selectedAppointmentId) return;

        const dto: CreateConsultationDto = {
        appointmentId: selectedAppointmentId,
        bp: appointmentDetails?.bp,
        weight: appointmentDetails?.weight,
        height: appointmentDetails?.height,
        temperature: appointmentDetails?.temperature,
        consultationFee: Number(consultationFee),
        advice,
        followUpDate: followUpDate || undefined,
        complaints,
        findings,
        otoendoscopies,
        diagnosticNasalEndoscopies,
        videoLaryngoscopies,
        diagnoses,
        medicines,
        charges,
        youtubeVideos,
        };

        const formData = new FormData();

        formData.append(
        "consultation",
        new Blob([JSON.stringify(dto)], { type: "application/json" })
        );

        endoscopyImages.forEach((file) => {
        formData.append("endoscopyImages", file);
        });

        try {
        setSaving(true);
        const response = await createConsultation(formData);
        toast.success(response.message);
        setShowPreview(false);
        router.push(`/doctor/prescription/${response.consultationId}`);
        } catch (error: any) {
        toast.error(error);
        } finally {
        setSaving(false);
        }
    };

    if (!selectedPatient || !selectedAppointmentId) {
        return (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50/60 p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <UserSearch className="h-6 w-6" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">
                No patient selected
            </h2>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
                Select a patient from today&apos;s queue, or register / search
                for a patient and create an appointment to begin a
                consultation.
            </p>
            </div>
        </div>
        );
    }

    return (
        <>
        <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/60 shadow-sm">
        <div className="mx-auto flex max-w-[1700px] flex-col gap-3 p-3 lg:p-4">
            {/* Top bar */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="lg:col-span-1">
                <BookmarkTemplatePanel
                complaints={complaints}
                findings={findings}
                otoendoscopies={otoendoscopies}
                diagnosticNasalEndoscopies={diagnosticNasalEndoscopies}
                videoLaryngoscopies={videoLaryngoscopies}
                diagnoses={diagnoses}
                medicines={medicines}
                advice={advice}
                youtubeVideos={youtubeVideos}
                setComplaints={setComplaints}
                setFindings={setFindings}
                setOtoendoscopies={setOtoendoscopies}
                setDiagnosticNasalEndoscopies={setDiagnosticNasalEndoscopies}
                setVideoLaryngoscopies={setVideoLaryngoscopies}
                setDiagnoses={setDiagnoses}
                setMedicines={setMedicines}
                setAdvice={setAdvice}
                setYoutubeVideos={setYoutubeVideos}
                />
            </div>

            <div className="lg:col-span-2">
                <AppointmentDetailsScreen
                appointmentDetails={appointmentDetails}
                setAppointmentDetails={setAppointmentDetails}
                selectedAppointmentId={selectedAppointmentId}
                selectedPatient={selectedPatient}
                />
            </div>
            </div>

            {/* Complaints / Diagnosis / Findings / Endoscopy row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ComplaintDetailsScreen
                complaints={complaints}
                setComplaints={setComplaints}
            />

            <DiagnosisDetailsScreen
                diagnoses={diagnoses}
                setDiagnoses={setDiagnoses}
            />

            <FindingDetailsScreen
                findings={findings}
                setFindings={setFindings}
            />

            <EndoscopyImageDetailScreen
                endoscopyImages={endoscopyImages}
                setEndoscopyImages={setEndoscopyImages}
            />
            </div>

            {/* Clinical Findings — full width row, below the Findings card */}
            <ClinicalFindingsSection
            otoendoscopies={otoendoscopies}
            setOtoendoscopies={setOtoendoscopies}
            diagnosticNasalEndoscopies={diagnosticNasalEndoscopies}
            setDiagnosticNasalEndoscopies={setDiagnosticNasalEndoscopies}
            videoLaryngoscopies={videoLaryngoscopies}
            setVideoLaryngoscopies={setVideoLaryngoscopies}
            />

            {/* Medicines — full width row */}
            <MedicineDetailsScreen
            medicines={medicines}
            setMedicines={setMedicines}
            />

            {/* Youtube videos — full width row */}
            <YoutubeDetailsScreen
            youtubeVideos={youtubeVideos}
            setYoutubeVideos={setYoutubeVideos}
            />

            {/* Charges (Consultation Fee + Additional) — bottom-most section before Advice & Save */}
            <ChargeDetailsScreen
            consultationFee={consultationFee}
            setConsultationFee={setConsultationFee}
            charges={charges}
            setCharges={setCharges}
            />

            {/* Advice & Follow-up + Save */}
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <ClipboardList className="h-3.5 w-3.5" />
                Advice &amp; Follow-up
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                    Follow-up Date
                </label>
                <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="h-8 w-full rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                </div>

                <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                    Advice
                </label>
                <textarea
                    rows={2}
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    placeholder="Enter doctor's advice..."
                    className="w-full resize-none rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                </div>
            </div>

            <div className="mt-3 flex justify-end">
                <button
                type="button"
                onClick={handleOpenPreview}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                <Save className="h-4 w-4" />
                Save Consultation
                </button>
            </div>
            </div>
        </div>
        </div>

        <PrescriptionPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleConfirmSaveConsultation}
        saving={saving}
        appointmentDetails={appointmentDetails}
        complaints={complaints}
        findings={findings}
        otoendoscopies={otoendoscopies}
        diagnosticNasalEndoscopies={diagnosticNasalEndoscopies}
        videoLaryngoscopies={videoLaryngoscopies}
        diagnoses={diagnoses}
        medicines={medicines}
        charges={charges}
        consultationFee={consultationFee}
        advice={advice}
        followUpDate={followUpDate}
        endoscopyImages={endoscopyImages}
        youtubeVideos={youtubeVideos}
        />
        </>
    );
    }