"use client";

import { useEffect, useState } from "react";
import { getPrescription } from "../services/prescriptionservice";
import { PrescriptionDto } from "../types/prescription";

interface Props {
consultationId: number;
}

export default function PrescriptionPage({ consultationId }: Props) {
const [prescription, setPrescription] = useState<PrescriptionDto | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
const loadPrescription = async () => {
    try {
    const data = await getPrescription(consultationId);
    setPrescription(data);
    } catch (error) {
    console.error(error);
    } finally {
    setLoading(false);
    }
};

loadPrescription();
}, [consultationId]);

if (loading) return <div>Loading...</div>;

if (!prescription) return <div>Prescription not found.</div>;

return (
<div>
    <h1>Prescription</h1>

    <p>Doctor: {prescription.doctorName}</p>
    <p>Patient: {prescription.patientName}</p>
    <p>Age: {prescription.age}</p>

    {/* Render medicines, complaints, etc. */}
</div>
);
}