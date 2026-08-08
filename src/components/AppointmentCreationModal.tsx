    "use client";

    import { useEffect, useState } from "react";
    import { X } from "lucide-react";
    import { toast } from "sonner";
    import { createAppointments } from "../services/patientService";
    import { CreateAppointmentDto, Patient } from "../types/patient";
    import { DoctorDropdownDto, HospitalDropdown } from "../types/hospital";
import LoadingSpinner from "./LoadingSpinner";
import { getDoctors, getHospitals } from "../services/hospitalservice";

    interface AppointmentCreationModalProps {
    open: boolean;
    onClose: () => void;
    patient: Patient | null;
    onSuccess?:(appointmentId:number) => void;
    }

    // Remembers the last hospital a doctor picked (per browser) so the
    // dropdown doesn't reset to the first hospital in the list every time
    // this modal opens for a new patient.
    const LAST_HOSPITAL_STORAGE_KEY = "lastSelectedHospitalId";

    export const AppointmentCreationModal = ({
    open,
    onClose,
    patient,
    onSuccess
    }: AppointmentCreationModalProps) => {
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState<CreateAppointmentDto>({
        patientId: 0,
        doctorId: 0,
        bp: "",
        weight: undefined,
        height: undefined,
        temperature: undefined,
        diabetes: false,
        hypertension: false,
        tuberculosis: false,
        bronchialAsthma: false,
        epilepsy: false,
        antenatal: false,
        hospitalId: 0,
    });
    const [doctors, setDoctors] = useState<DoctorDropdownDto[]>([]);
    const [hospitals, setHospitals] = useState<HospitalDropdown[]>([]);
    

    useEffect(() => {
    async function loadDoctors() {
        try {
        const response = await getDoctors();
        const hospitalResponse = await getHospitals()
        console.log("hospitals response ",hospitalResponse)
        setDoctors(response);
        setHospitals(hospitalResponse);
        } catch (error) {
        console.error(error);
        toast.error("Failed to load doctors");
        }
    }
    loadDoctors();
    }, []);

    useEffect(() => {
    const rememberedHospitalId = Number(
        localStorage.getItem(LAST_HOSPITAL_STORAGE_KEY)
    );

    const isRememberedHospitalValid = hospitals.some(
        (hospital) => hospital.id === rememberedHospitalId
    );

    setData({
        patientId: patient?.id ?? 0,
        doctorId: doctors.length > 0 ? doctors[0].id : 0,
        bp: "",
        weight: undefined,
        height: undefined,
        temperature: undefined,
        diabetes: false,
        hypertension: false,
        tuberculosis: false,
        bronchialAsthma: false,
        epilepsy: false,
        antenatal: false,
        hospitalId: isRememberedHospitalValid
        ? rememberedHospitalId
        : hospitals.length > 0
        ? hospitals[0].id
        : 0,
    });
    }, [patient, hospitals, doctors]);

    if (!open) return null;

    const inputClass =
        "mt-1 w-full rounded-[10px] border border-[#E5E7EB] bg-slate-50 p-3 text-sm outline-none focus:border-[var(--brand-secondary)] focus:ring-2 focus:ring-[var(--brand-secondary)]/20";

    const labelClass = "text-xs font-medium text-slate-600";

    const medicalHistoryOptions: {
        key: keyof Pick<
        CreateAppointmentDto,
        | "diabetes"
        | "hypertension"
        | "tuberculosis"
        | "bronchialAsthma"
        | "epilepsy"
        | "antenatal"
        >;
        label: string;
    }[] = [
        { key: "diabetes", label: "Diabetes" },
        { key: "hypertension", label: "Hypertension" },
        { key: "tuberculosis", label: "Tuberculosis" },
        { key: "bronchialAsthma", label: "Bronchial Asthma" },
        { key: "epilepsy", label: "Epilepsy" },
        { key: "antenatal", label: "Antenatal" },
    ];

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
        setLoading(true);
        // await new Promise(resolve => setTimeout(resolve,2000))
        const response = await createAppointments(data);
        console.log("Appointment id",response.id)
        toast.success("Appointment Created");
        await onSuccess?.(response.id)

        onClose();
        } catch (err) {
        console.log(err);
        toast.error("Failed to create appointment");
        } finally {
        setLoading(false);
        }
    }
    if(loading){
        return <LoadingSpinner fullScreen/>

    }
    console.log("Hospitals prop:", hospitals);
console.log("Selected hospitalId:", data.hospitalId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-2xl rounded-[10px] border border-[#E5E7EB] bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold text-slate-800">
                Create Appointment
                </h2>
<div className="flex flex-wrap gap-6 mt-3">
<p>
    <span className="font-semibold text-slate-500">Patient:</span>{" "}
    <span className="font-bold text-[var(--brand-primary)]">
    {patient?.name?.toUpperCase()}
    </span>
</p>

<p>
    <span className="font-semibold text-slate-500">Patient ID:</span>{" "}
    <span className="font-bold text-[var(--brand-primary)]">
    {patient?.patientId}
    </span>
</p>

<p>
    <span className="font-semibold text-slate-500">Phone:</span>{" "}
    <span className="font-bold text-[var(--brand-primary)]">
    {patient?.phone}
    </span>
</p>
</div>
            </div>

            <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-[10px] text-slate-400 hover:bg-slate-100"
            >
                <X size={18} />
            </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

            <div>
                <label className={labelClass}>Hospital</label>

                <select
                className={inputClass}
                value={data.hospitalId}
                onChange={(e) => {
                    const hospitalId = Number(e.target.value);
                    localStorage.setItem(
                    LAST_HOSPITAL_STORAGE_KEY,
                    String(hospitalId)
                    );
                    setData((prev) => ({
                    ...prev,
                    hospitalId,
                    }));
                }}
                >
                {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                    {hospital.hospitalCode} - {hospital.name}
                    </option>
                ))}
                </select>
            </div>

            <div>
            <label className={labelClass}>Doctor</label>

            <select
                className={inputClass}
                value={data.doctorId}
                onChange={(e) =>
                setData((prev) => ({
                    ...prev,
                    doctorId: Number(e.target.value),
                }))
                }
            >
                {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                </option>
                ))}
            </select>
            </div>

            <div>
                <label className={labelClass}>Blood Pressure</label>

                <input
                type="text"
                className={inputClass}
                placeholder="120/80"
                value={data.bp}
                onChange={(e) =>
                    setData((prev) => ({
                    ...prev,
                    bp: e.target.value,
                    }))
                }
                />
            </div>

            <div>
                <label className={labelClass}>Weight (kg)</label>

                <input
                type="number"
                className={inputClass}
                value={data.weight ?? ""}
                onChange={(e) =>
                    setData((prev) => ({
                    ...prev,
                    weight:
                        e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    }))
                }
                />
            </div>

            <div>
                <label className={labelClass}>Height (cm)</label>

                <input
                type="number"
                className={inputClass}
                value={data.height ?? ""}
                onChange={(e) =>
                    setData((prev) => ({
                    ...prev,
                    height:
                        e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    }))
                }
                />
            </div>

            <div>
                <label className={labelClass}>Temperature (°F)</label>

                <input
                type="number"
                step="0.1"
                className={inputClass}
                value={data.temperature ?? ""}
                onChange={(e) =>
                    setData((prev) => ({
                    ...prev,
                    temperature:
                        e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    }))
                }
                />
            </div>

            <div>
                <label className={labelClass}>Medical History</label>

                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {medicalHistoryOptions.map((option) => (
                    <label
                    key={option.key}
                    className="flex items-center gap-2 text-sm text-slate-700"
                    >
                    <input
                        type="checkbox"
                        checked={data[option.key] ?? false}
                        onChange={(e) =>
                        setData((prev) => ({
                            ...prev,
                            [option.key]: e.target.checked,
                        }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-[var(--brand-primary)] focus:ring-[var(--brand-secondary)]/20"
                    />
                    {option.label}
                    </label>
                ))}
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-[10px] border border-[#E5E7EB] py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                Cancel
                </button>

                <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-[10px] bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                {loading ? "Creating..." : "Create Appointment"}
                </button>
            </div>

            </form>

        </div>
        </div>
    );
    };