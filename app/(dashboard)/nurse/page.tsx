    "use client";

    import { AppointmentCreationModal } from "@/src/components/AppointmentCreationModal";
    import LoadingSpinner from "@/src/components/LoadingSpinner";
    import RegisterPatientModal from "@/src/components/RegisterPatientModal";
    import SearchPatientModal from "@/src/components/SearchPatientModal";
    import { getTodayAllQueue, getTodayQueue } from "@/src/services/patientService";
    import { HospitalDropdown } from "@/src/types/hospital";
    import { AppointmentQueueDto, Patient } from "@/src/types/patient";
    import { useRouter } from "next/navigation";
    import { useEffect, useMemo, useState } from "react";
    import { toast, Toaster } from "sonner";
    import { RoleGaurd } from "@/src/security/RoleGuard";

    export default function NursePage() {
    const router = useRouter();
    const [registerOpenModal, setRegisterOpenModal] = useState(false);
    const [searchOpenModal, setSearchOpenModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [appointmentOpenModal, setAppointmentOpenModal] = useState(false);
    const [dailyQueue, setDailyQueue] = useState<AppointmentQueueDto[]>([]);
    const [loading, setLoading] = useState(true);

        async function loadData() {
            try {
                setLoading(true);
                const  queueData = await getTodayAllQueue()
                // await new Promise((resolve) => setTimeout(resolve, 1000));
                setDailyQueue(queueData);
            } catch (error: any) {
                toast.error(error?.message || "Failed to load data");
            } finally {
                setLoading(false);
            }
            }

        function calculateAge(dateOfBirth: string): number {
            const dob = new Date(dateOfBirth);
            const today = new Date();

            let age = today.getFullYear() - dob.getFullYear();

            const monthDiff = today.getMonth() - dob.getMonth();

            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < dob.getDate())
            ) {
                age--;
            }

            return age;
            }

        useEffect(() => {
            loadData();
        }, []);

        const stats = useMemo(() => {
        const total = dailyQueue.length;
        const waiting = dailyQueue.filter((q) => q.status === "WAITING").length;
        const completed = dailyQueue.filter((q) => q.status === "COMPLETED").length;
        return { total, waiting, completed };
    }, [dailyQueue]);


    return (
        <RoleGaurd allowed={["DOCTOR", "NURSE", "ADMIN"]}>
        <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-8">

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
            <div>
                <h1 className="text-xl font-semibold text-slate-900">
                Nurse Dashboard
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                Today&apos;s patient queue
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button
    onClick={() => setRegisterOpenModal(true)}
    className="bg-[var(--brand-primary)] hover:opacity-90 text-white text-sm font-semibold px-4 py-2.5 rounded-[10px] transition-all"
    >
    Register Patient
    </button>
            <button
    onClick={() => setSearchOpenModal(true)}
    className="border border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white hover:bg-blue-50 text-sm font-semibold px-4 py-2.5 rounded-[10px] transition-all"
    >
    Book Appointment
    </button>
            </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-lg px-5 py-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Total Patients
                </p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">
                {stats.total}
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg px-5 py-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Waiting
                </p>
                <p className="text-2xl font-semibold text-amber-600 mt-1">
                {stats.waiting}
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg px-5 py-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Completed
                </p>
                <p className="text-2xl font-semibold text-emerald-600 mt-1">
                {stats.completed}
                </p>
            </div>
            </div>

            {/* Queue table */}
            {/* Queue table */}
        <div className="relative bg-white border border-slate-200 rounded-lg overflow-hidden">

        {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
            <LoadingSpinner />
            </div>
        )}

        {dailyQueue.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">
            No patients in today's queue.
            </div>
        ) : (

       <table className="min-w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wide">
                        Token
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wide">
                        Patient ID
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wide">
                        Appointment ID
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wide">
                        Age
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wide">
                        Patient
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wide">
                        Doctor
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wide">
                        Phone
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wide">
                        Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wide">
                        Created By
                    </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                    {dailyQueue.map((queue) => (
                    <tr key={queue.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">
                        {queue.tokenNumber}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                        {queue.patientId}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                        {queue.appointmentId}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                        {calculateAge(queue.dateOfBirth)}
                        </td>

                        <td className="px-4 py-3 text-slate-900">
                        {queue.patientName}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                        {queue.doctorName}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                        {queue.phoneNumber}
                        </td>

                        <td className="px-4 py-3">
                        <span
                            className={
                            queue.status === "COMPLETED"
                                ? "inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
                            }
                        >
                            {queue.status}
                        </span>
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                        {queue.createdBy}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
        
        )}
        </div>

            <SearchPatientModal
            onSelect={(patient) => {
                setSelectedPatient(patient);
                setSearchOpenModal(false);
                setAppointmentOpenModal(true);
            }}
            open={searchOpenModal}
            close={() => setSearchOpenModal(false)}
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
            onSuccess={loadData}
            />
        </div>
        </div>
        </RoleGaurd>
    );
    }


