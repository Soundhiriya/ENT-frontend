    "use client";

    import { useEffect, useState } from "react";
    import { useParams } from "next/navigation";
    import { getPrescription } from "@/src/services/prescriptionservice";
    import { PrescriptionDto } from "@/src/types/prescription";
    import PrescriptionView from "@/src/components/PrescriptionView";
    import { RoleGaurd } from "@/src/security/RoleGuard";

    export default function PrescriptionPage() {
    const params = useParams();
    const consultationId = Number(params.consultationid);

    const [prescription, setPrescription] =
        useState<PrescriptionDto | null>(null);

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

        if (!isNaN(consultationId)) {
        loadPrescription();
        }
    }, [consultationId]);

    if (loading) {
        return (
        <RoleGaurd allowed={["ADMIN", "DOCTOR"]}>
        <div className="flex h-screen items-center justify-center">
            Loading Prescription...
        </div>
        </RoleGaurd>
        );
    }

    if (!prescription) {
        return (
        <RoleGaurd allowed={["ADMIN", "DOCTOR"]}>
        <div className="flex h-screen items-center justify-center">
            Prescription not found.
        </div>
        </RoleGaurd>
        );
    }

    const prescriptionUrl = `${window.location.origin}/patient/prescription/${prescription.prescriptionToken}`;

    return (
        <RoleGaurd allowed={["ADMIN", "DOCTOR"]}>
        <div className="flex min-h-screen justify-center bg-slate-100 py-8 print:min-h-0 print:block print:bg-white print:py-0">
        {/* A4 print sizing — content is centered on screen and spans the
            full printable width; it's allowed to spill onto a 2nd page
            rather than being force-shrunk to fit one. */}
        <style>{`
            @media print {
                @page {
                    size: A4;
                    margin: 10mm;
                }
                /* Next.js dev-mode indicator — only present when running
                   next dev, never in a production build, but hide it
                   defensively just in case. */
                nextjs-portal {
                    display: none !important;
                }
            }
        `}</style>

        <PrescriptionView
            data={prescription}
            prescriptionUrl={prescriptionUrl}
            onPrint={() => window.print()}
        />
        </div>
        </RoleGaurd>
    );
    }
