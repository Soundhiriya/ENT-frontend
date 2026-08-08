    // AppointmentDetailsScreen.tsx

    import { getAppointmentDetails } from "@/src/services/consultationservice";
    import { AppointmentDetailsDto } from "@/src/types/consultationtypes";
    import { Patient } from "@/src/types/patient";
    import { Stethoscope } from "lucide-react";
    import React, { SetStateAction, useEffect, useState } from "react";

    const medicalHistoryLabels: {
    key: keyof Pick<
        AppointmentDetailsDto,
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

    interface AppointmentDetailsScreenProps {
    selectedAppointmentId: number | null;
    selectedPatient: Patient | null;
    appointmentDetails: AppointmentDetailsDto | null;
    setAppointmentDetails: React.Dispatch<React.SetStateAction<AppointmentDetailsDto | null>>;
    }

    const AppointmentDetailsScreen = ({
    selectedAppointmentId,
    selectedPatient,
    appointmentDetails,
    setAppointmentDetails,
    }: AppointmentDetailsScreenProps) => {
    const handleAptDetails = async () => {
        if (selectedAppointmentId) {
        const response = await getAppointmentDetails(selectedAppointmentId);
        setAppointmentDetails(response);
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
        handleAptDetails();
    }, [selectedAppointmentId]);

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Stethoscope className="h-3.5 w-3.5" />
            Appointment Details
        </h2>

        {appointmentDetails ? (
            <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
            <div className="min-w-[52px]">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Token
                </p>
                <p className="mt-0.5 text-base font-bold text-blue-600">
                #{appointmentDetails.tokenNumber}
                </p>
            </div>

            <div className="min-w-[90px]">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Appt No.
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {appointmentDetails.appointmentId}
                </p>
            </div>

            <div className="min-w-[130px]">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Doctor
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                Dr. {appointmentDetails.doctorName}
                </p>
            </div>

            <div className="min-w-[160px]">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Hospital
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                {appointmentDetails.hospitalCode} - {appointmentDetails.hospitalName}
                </p>
            </div>

            <div className="hidden h-9 w-px bg-slate-200 sm:block" />

            <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                BP
                </label>
                <input
                type="text"
                value={appointmentDetails.bp ?? ""}
                onChange={(e) =>
                    setAppointmentDetails((prev) =>
                    prev ? { ...prev, bp: e.target.value } : prev
                    )
                }
                className="h-8 w-20 rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Weight (kg)
                </label>
                <input
                type="number"
                value={appointmentDetails.weight ?? ""}
                onChange={(e) =>
                    setAppointmentDetails((prev) =>
                    prev
                        ? {
                            ...prev,
                            weight: e.target.value === "" ? undefined : Number(e.target.value),
                        }
                        : prev
                    )
                }
                className="h-8 w-16 rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Height (cm)
                </label>
                <input
                type="number"
                value={appointmentDetails.height ?? ""}
                onChange={(e) =>
                    setAppointmentDetails((prev) =>
                    prev
                        ? {
                            ...prev,
                            height: e.target.value === "" ? undefined : Number(e.target.value),
                        }
                        : prev
                    )
                }
                className="h-8 w-16 rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Temp (°F)
                </label>
                <input
                type="number"
                step="0.1"
                value={appointmentDetails.temperature ?? ""}
                onChange={(e) =>
                    setAppointmentDetails((prev) =>
                    prev
                        ? {
                            ...prev,
                            temperature: e.target.value === "" ? undefined : Number(e.target.value),
                        }
                        : prev
                    )
                }
                className="h-8 w-16 rounded-md border border-slate-300 px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            {medicalHistoryLabels
                .filter(({ key }) => appointmentDetails[key])
                .map(({ key, label }) => (
                <span
                    key={key}
                    className="h-fit rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700"
                >
                    {label}
                </span>
                ))}
            </div>
        ) : (
            <p className="text-sm text-slate-400">Select an appointment to view details</p>
        )}
        </div>
    );
    };

    export default AppointmentDetailsScreen;