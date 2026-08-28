    // nurse/page.tsx (NursePage)

    "use client";

    import RegisterPatientModal from "@/src/components/RegisterPatientModal";
    import SearchPatientModal from "@/src/components/SearchPatientModal";
    import React, { Suspense, useEffect, useState } from "react";
    import { UserPlus, Search, History } from "lucide-react";
    import { AppointmentQueueDto, Patient } from "@/src/types/patient";
    import DoctorMainScreen from "@/src/components/DoctorMainScreen";
    import PatientHistoryModal from "@/src/components/PatientHistoryModal";
    import { RoleGaurd } from "@/src/security/RoleGuard";
    import { AppointmentCreationModal } from "@/src/components/AppointmentCreationModal";
    import { HospitalDropdown } from "@/src/types/hospital";
    import { getPatientById, getTodayQueue } from "@/src/services/patientService";
    import { toast } from "sonner";
    import { useRouter, useSearchParams } from "next/navigation";

    const NursePage = () => {
    return (
        <Suspense fallback={null}>
        <NursePageContent />
        </Suspense>
    );
    };

    const NursePageContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [registerOpenModal, setRegisterOpenModal] = useState(false);
    const [searchOpenModal, setSearchOpenModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [appointmentOpenModal, setAppointmentOpenModal] = useState(false);
    const [hospitals, setHospitals] = useState<HospitalDropdown[]>([]);
    const [queue, setQueue] = useState<AppointmentQueueDto[]>([]);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
    const [historyPatientId, setHistoryPatientId] = useState<number | null>(null);

    async function getTodaysQueue() {
        try {
        const response = await getTodayQueue();
        setQueue(response);
        console.log(response);
        } catch (error: any) {
        toast.error(error.message);
        }
    }

    // Shared by "click a queue row" and "restore from the URL after coming
    // back from another page" — both just need appointmentId -> patient.
    const loadPatientForAppointment = async (appointmentId: number) => {
        try {
        setSelectedAppointmentId(appointmentId);
        const patient = await getPatientById(appointmentId);
        setSelectedPatient(patient);
        } catch (error) {
        console.error(error);
        toast.error("Failed to load patient");
        }
    };

    function calculateAge(dateOfBirth: string) {
        const today = new Date();
        const dob = new Date(dateOfBirth);

        let age = today.getFullYear() - dob.getFullYear();
        const month = today.getMonth() - dob.getMonth();

        if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) {
        age--;
        }

        return age;
    }

    useEffect(() => {
        getTodaysQueue();
    }, []);

    // Restore the selected patient from the URL on mount — this is what
    // makes the browser back button (e.g. returning from Patient History)
    // land on the same patient instead of an empty "no patient selected"
    // screen. Runs once; later selections are synced back to the URL by
    // the effect below, not read from it again.
    useEffect(() => {
        const appointmentIdParam = searchParams.get("appointmentId");
        if (!appointmentIdParam) return;

        const appointmentId = Number(appointmentIdParam);
        if (!isNaN(appointmentId)) {
        loadPatientForAppointment(appointmentId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep the URL in sync whenever the selected appointment changes, so
    // there's always something for the effect above to restore from.
    useEffect(() => {
        if (selectedAppointmentId == null) return;

        router.replace(`/doctor?appointmentId=${selectedAppointmentId}`, {
        scroll: false,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAppointmentId]);

    return (
        <RoleGaurd allowed={["ADMIN", "DOCTOR"]}>
        <div className="flex min-h-screen flex-col">
            {/* Header */}
            <div className="flex flex-col gap-3 border-b border-[#E5E7EB] bg-white px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:px-8">
            {selectedPatient ? (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <h1 className="text-base font-semibold text-slate-800">
                    {selectedPatient.name}
                </h1>

                <span className="text-xs text-slate-500">
                    <span className="font-medium text-slate-400">ID</span>{" "}
                    <span className="font-medium text-slate-700">
                    {selectedPatient.patientId}
                    </span>
                </span>

                <span className="text-xs text-slate-500">
                    <span className="font-medium text-slate-400">Age</span>{" "}
                    <span className="font-medium text-slate-700">
                    {calculateAge(selectedPatient.dateOfBirth)}
                    </span>
                </span>

                <span className="text-xs text-slate-500">
                    <span className="font-medium text-slate-400">Gender</span>{" "}
                    <span className="font-medium text-slate-700">
                    {selectedPatient.gender}
                    </span>
                </span>

                <span className="text-xs text-slate-500">
                    <span className="font-medium text-slate-400">Phone</span>{" "}
                    <span className="font-medium text-slate-700">
                    {selectedPatient.phone}
                    </span>
                </span>

                <span className="text-xs text-slate-500">
                    <span className="font-medium text-slate-400">Location</span>{" "}
                    <span className="font-medium text-slate-700">
                    {selectedPatient.location ?? "-"}
                    </span>
                </span>

                <button
                    onClick={() => setHistoryPatientId(selectedPatient.id)}
                    className="flex items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 max-lg:min-h-[40px]"
                >
                    <History size={13} />
                    History
                </button>
                </div>
            ) : (
                <div>
                <h1 className="text-base font-semibold text-slate-800">
                    Doctor Dashboard
                </h1>
                <p className="text-xs text-slate-500">
                    Select a patient from today&apos;s queue to begin consultation.
                </p>
                </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
                <button
                onClick={() => setRegisterOpenModal(true)}
                className="flex items-center justify-center gap-1.5 rounded-md bg-[var(--brand-primary)] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-150 hover:opacity-90 hover:shadow-md active:scale-[0.98] sm:text-sm max-lg:min-h-[40px]"
                >
                <UserPlus size={15} />
                Register Patient
                </button>

                <button
                onClick={() => setSearchOpenModal(true)}
                className="flex items-center justify-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:shadow-md active:scale-[0.98] sm:text-sm max-lg:min-h-[40px]"
                >
                <Search size={15} />
                Book Appointment
                </button>
            </div>
            </div>

            {/* Main content — doctor screen fills the rest of the page */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 md:p-8">
            <DoctorMainScreen
                selectedPatient={selectedPatient}
                queue={queue}
                selectedAppointmentId={selectedAppointmentId}
                onSelect={loadPatientForAppointment}
                onSelectCompleted={(consultationId) => {
                router.push(`/doctor/prescription/${consultationId}`);
                }}
            />
            </div>

            {/* Modals */}
            <SearchPatientModal
            open={searchOpenModal}
            close={() => setSearchOpenModal(false)}
            onSelect={(patient) => {
                setSelectedPatient(patient);
                setSearchOpenModal(false);
                setAppointmentOpenModal(true);
            }}
            />

            <RegisterPatientModal
            open={registerOpenModal}
            onClose={() => setRegisterOpenModal(false)}
            onSelect={(patient) => {
                setSelectedPatient(patient);
                setRegisterOpenModal(false);
                setAppointmentOpenModal(true);
            }}
            />

            <AppointmentCreationModal
            open={appointmentOpenModal}
            onClose={() => setAppointmentOpenModal(false)}
            patient={selectedPatient}
            onSuccess={async (appointmentId: number) => {
                setSelectedAppointmentId(appointmentId);
                await getTodaysQueue();
            }}
            />

            {historyPatientId != null && (
            <PatientHistoryModal
                patientId={historyPatientId}
                onClose={() => setHistoryPatientId(null)}
            />
            )}
        </div>
        </RoleGaurd>
    );
    };

    export default NursePage;