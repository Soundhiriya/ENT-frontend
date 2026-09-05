// PatientPrescriptionPage.tsx

"use client";

import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import Image from "next/image";
import { useReactToPrint } from "react-to-print";
import { Printer, Stethoscope, Loader2 } from "lucide-react";

import logo from "@/app/icon.png";

import { getPublicPrescription } from "@/src/services/publicPrescriptionService";
import { PrescriptionDto } from "@/src/types/prescription";

export default function PatientPrescriptionPage() {
  const params = useParams();
  const token = params.token as string;

  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [prescription, setPrescription] =
    useState<PrescriptionDto | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${prescription?.patientName}-Prescription`,
  });

  const medicalHistoryLabels: {
    key: keyof Pick<
      PrescriptionDto,
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

  const activeMedicalHistory = prescription
    ? medicalHistoryLabels.filter(({ key }) => prescription[key])
    : [];

  const customMedicalHistory =
    prescription?.customMedicalHistory ?? [];

  const verify = async () => {
    try {
      setLoading(true);

      const data = await getPublicPrescription({
        token,
        phoneNumber,
      });

      setPrescription(data);
    } catch (error) {
      console.error(error);
      alert(String(error));
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // VERIFY PRESCRIPTION SCREEN
  // ============================================================

  if (!prescription) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">

          {/* CLINIC LOGO */}
          <div className="mb-5 flex flex-col items-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center">
              <Image
                src={logo}
                alt="Clinic Logo"
                width={64}
                height={64}
                priority
                className="h-16 w-16 object-contain"
              />
            </div>

            <h1 className="text-lg font-semibold text-slate-800">
              View Prescription
            </h1>

            <p className="mt-1 text-center text-xs text-slate-500">
              Enter the mobile number registered with the clinic to view your
              prescription.
            </p>
          </div>

          {/* MOBILE NUMBER */}
          <input
            type="tel"
            className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="Registered Mobile Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                verify();
              }
            }}
          />

          {/* VERIFY BUTTON */}
          <button
  onClick={verify}
  disabled={loading}
  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 py-3 text-sm font-medium text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading && (
    <Loader2
      size={16}
      className="animate-spin"
    />
  )}

  {loading ? "Viewing..." : "View"}
</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // PRESCRIPTION SCREEN
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-100 pb-16">

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          nextjs-portal {
            display: none !important;
          }

          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }

          .print-page {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            max-width: 100% !important;
          }

          .avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .image-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* ========================================================
          STICKY ACTION BAR
      ======================================================== */}

      <div className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">

          <div className="flex items-center gap-2 text-sm text-slate-600">

            <Stethoscope
              size={16}
              className="text-slate-400"
            />

            <span className="font-medium text-slate-800">
              {prescription.patientName}
            </span>

            <span className="text-slate-400">
              •
            </span>

            <span>
              {prescription.consultationDate}
            </span>

          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Printer size={16} />
            Download PDF
          </button>

        </div>
      </div>

      {/* ========================================================
          PRESCRIPTION DOCUMENT
      ======================================================== */}

      <div
        ref={printRef}
        className="print-page mx-auto mt-8 max-w-4xl rounded-lg border border-slate-200 bg-white p-8 font-rx-sans text-[13px] leading-relaxed text-slate-800 shadow-lg sm:p-10"
      >

        {/* ======================================================
            LETTERHEAD
        ====================================================== */}

        <div className="avoid-break flex items-start justify-between border-b-2 border-slate-800 pb-3">

          <div>

            <h1 className="font-rx-serif text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-[28px]">
              {prescription.hospitalName}
            </h1>

            <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">

              <p className="font-rx-serif text-[13px] font-semibold tracking-wide text-slate-700">
                Dr.G.SubaJothiKumar MBBS.,MS(ENT)
              </p>

              <span className="text-slate-300">
                |
              </span>

              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                ENT Specialist
              </p>

              <span className="text-slate-300">
                |
              </span>

              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                Reg. No. 127855
              </p>

            </div>

          </div>

          <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white sm:flex">
            <Stethoscope size={26} />
          </div>

        </div>

        <div className="mt-[3px] border-b border-slate-300" />

        {/* ======================================================
            PATIENT / DOCTOR INFORMATION
        ====================================================== */}

        <div className="avoid-break mt-6 grid grid-cols-1 gap-x-6 gap-y-1 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">

          <div className="space-y-1">

            <p>
              <span className="font-semibold text-slate-600">
                Doctor:
              </span>{" "}

              <span className="text-slate-800">
                {prescription.doctorName}
              </span>
            </p>

            <p>
              <span className="font-semibold text-slate-600">
                Patient:
              </span>{" "}

              <span className="text-slate-800">
                {prescription.patientName}
              </span>
            </p>

            <p>
              <span className="font-semibold text-slate-600">
                Phone:
              </span>{" "}

              <span className="text-slate-800">
                {prescription.phone}
              </span>
            </p>

          </div>

          <div className="space-y-1">

            <p>
              <span className="font-semibold text-slate-600">
                Age:
              </span>{" "}

              <span className="text-slate-800">
                {prescription.age}
              </span>
            </p>

            <p>
              <span className="font-semibold text-slate-600">
                Gender:
              </span>{" "}

              <span className="text-slate-800">
                {prescription.gender}
              </span>
            </p>

            <p>
              <span className="font-semibold text-slate-600">
                Date:
              </span>{" "}

              <span className="text-slate-800">
                {prescription.consultationDate}
              </span>
            </p>

          </div>

        </div>

        {/* ======================================================
            VITALS
        ====================================================== */}

        <div className="avoid-break mt-6">

          <h2 className="mb-2.5 border-b border-slate-300 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            Vitals
          </h2>

          <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-4">

            <div>
              <p className="text-xs text-slate-500">
                BP
              </p>

              <p className="text-sm font-semibold text-slate-800">
                {prescription.bp || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Temperature
              </p>

              <p className="text-sm font-semibold text-slate-800">
                {prescription.temperature || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Weight
              </p>

              <p className="text-sm font-semibold text-slate-800">
                {prescription.weight || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Height
              </p>

              <p className="text-sm font-semibold text-slate-800">
                {prescription.height || "-"}
              </p>
            </div>

          </div>

        </div>

        {/* ======================================================
            MEDICAL HISTORY
        ====================================================== */}

        {(activeMedicalHistory.length > 0 ||
          customMedicalHistory.length > 0) && (

          <div className="avoid-break mt-6">

            <h2 className="mb-2.5 border-b border-slate-300 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Medical History
            </h2>

            <div className="flex flex-wrap gap-2">

              {activeMedicalHistory.map(
                ({ key, label }) => (
                  <span
                    key={key}
                    className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700"
                  >
                    {label}
                  </span>
                )
              )}

              {customMedicalHistory.map(
                (condition) => (
                  <span
                    key={condition}
                    className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700"
                  >
                    {condition}
                  </span>
                )
              )}

            </div>

          </div>
        )}

        {/* ======================================================
            ENDOSCOPY IMAGES
        ====================================================== */}

        {prescription.endoscopyImages.length > 0 && (

          <div className="mt-8">

            <h2 className="mb-4 border-b border-slate-300 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Endoscopy Images
            </h2>

            <div className="space-y-6">

              {prescription.endoscopyImages.map(
                (image, index) => (

                  <div
                    key={index}
                    className="image-card overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                  >

                    <img
                      src={image.imageUrl}
                      alt={
                        image.imageName ||
                        `Endoscopy image ${index + 1}`
                      }
                      className="h-[420px] w-full bg-black object-contain sm:h-[480px]"
                    />

                    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2.5">

                      <p className="text-sm font-medium text-slate-800">
                        {image.imageName ||
                          `Image ${index + 1}`}
                      </p>

                      <span className="text-xs font-medium text-slate-400">
                        {index + 1} /{" "}
                        {prescription.endoscopyImages.length}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>
        )}

        {/* ======================================================
            RECOMMENDED VIDEOS
        ====================================================== */}

        {prescription.youtubeVideos.length > 0 && (

          <div className="avoid-break mt-8">

            <h2 className="mb-2.5 border-b border-slate-300 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Recommended Videos
            </h2>

            <ul className="space-y-1.5 rounded-lg border border-slate-200 p-4">

              {prescription.youtubeVideos.map(
                (video, index) => (

                  <li
                    key={index}
                    className="text-sm"
                  >

                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-blue-600 underline"
                    >
                      {video.youtubeUrl}
                    </a>

                  </li>

                )
              )}

            </ul>

          </div>
        )}

        {/* ======================================================
            CHIEF COMPLAINTS
        ====================================================== */}

        {prescription.complaints.length > 0 && (

          <div className="avoid-break mt-8">

            <h2 className="mb-2.5 border-b border-slate-300 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Chief Complaints
            </h2>

            <div className="flex flex-wrap gap-2">

              {prescription.complaints.map(
                (c, index) => (

                  <span
                    key={index}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                  >
                    {c.complaint}
                  </span>

                )
              )}

            </div>

          </div>
        )}

        {/* ======================================================
            FINDINGS
        ====================================================== */}

        {prescription.findings.length > 0 && (

          <div className="avoid-break mt-6">

            <h2 className="mb-2.5 border-b border-slate-300 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Findings
            </h2>

            <div className="flex flex-wrap gap-2">

              {prescription.findings.map(
                (f, index) => (

                  <span
                    key={index}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                  >
                    {f.finding}
                  </span>

                )
              )}

            </div>

          </div>
        )}

        {/* ======================================================
            OTOENDOSCOPY
        ====================================================== */}

        {prescription.otoendoscopies.length > 0 && (

          <div className="avoid-break mt-6">

            <h2 className="mb-2.5 border-b border-slate-300 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Otoendoscopy
            </h2>

            <div className="flex flex-wrap gap-2">

              {prescription.otoendoscopies.map(
                (item, index) => (

                  <span
                    key={index}
                    className="whitespace-pre-wrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                  >
                    {item.finding}
                  </span>

                )
              )}

            </div>

          </div>
        )}

        {/* ======================================================
            DIAGNOSTIC NASAL ENDOSCOPY
        ====================================================== */}

        {prescription.diagnosticNasalEndoscopies.length > 0 && (

          <div className="avoid-break mt-6">

            <h2 className="mb-2.5 border-b border-slate-300 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Diagnostic Nasal Endoscopy
            </h2>

            <div className="flex flex-wrap gap-2">

              {prescription.diagnosticNasalEndoscopies.map(
                (item, index) => (

                  <span
                    key={index}
                    className="whitespace-pre-wrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                  >
                    {item.finding}
                  </span>

                )
              )}

            </div>

          </div>
        )}

        {/* ======================================================
            VIDEO LARYNGOSCOPY
        ====================================================== */}

        {prescription.videoLaryngoscopies.length > 0 && (

          <div className="avoid-break mt-6">

            <h2 className="mb-2.5 border-b border-slate-300 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Video Laryngoscopy
            </h2>

            <div className="flex flex-wrap gap-2">

              {prescription.videoLaryngoscopies.map(
                (item, index) => (

                  <span
                    key={index}
                    className="whitespace-pre-wrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                  >
                    {item.finding}
                  </span>

                )
              )}

            </div>

          </div>
        )}

        {/* ======================================================
            DIAGNOSIS
        ====================================================== */}

        {prescription.diagnoses.length > 0 && (

          <div className="avoid-break mt-6">

            <h2 className="mb-2.5 border-b border-slate-300 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Diagnosis
            </h2>

            <div className="flex flex-wrap gap-2">

              {prescription.diagnoses.map(
                (d, index) => (

                  <span
                    key={index}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700"
                  >
                    {d.diagnosis}
                  </span>

                )
              )}

            </div>

          </div>
        )}

        {/* ======================================================
            MEDICINES
        ====================================================== */}

        {prescription.medicines.length > 0 && (

          <div className="avoid-break mt-8">

            <h2 className="mb-2.5 border-b border-slate-300 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Medicines
            </h2>

            <table className="w-full border-collapse border border-slate-200 text-[12.5px]">

              <thead className="bg-slate-50 [print-color-adjust:exact]">

                <tr>

                  <th className="border border-slate-200 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Medicine
                  </th>

                  <th className="border border-slate-200 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Dosage
                  </th>

                  <th className="border border-slate-200 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Frequency
                  </th>

                  <th className="border border-slate-200 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Duration
                  </th>

                  <th className="border border-slate-200 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Instructions
                  </th>

                </tr>

              </thead>

              <tbody>

                {prescription.medicines.map(
                  (m, index) => (

                    <tr
                      key={index}
                      className="avoid-break align-top"
                    >

                      <td className="border border-slate-200 px-3 py-2.5">
                        {m.medicineName}
                      </td>

                      <td className="border border-slate-200 px-3 py-2.5">
                        {m.dosage}
                      </td>

                      <td className="border border-slate-200 px-3 py-2.5">
                        {m.frequency}
                      </td>

                      <td className="border border-slate-200 px-3 py-2.5">
                        {m.duration}
                      </td>

                      <td className="border border-slate-200 px-3 py-2.5">
                        {m.instructions}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>
        )}

        {/* ======================================================
            ADVICE
        ====================================================== */}

        {prescription.advice && (

          <div className="avoid-break mt-8">

            <h2 className="mb-2.5 border-b border-slate-300 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Advice
            </h2>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {prescription.advice}
            </div>

          </div>
        )}

        {/* ======================================================
            FOLLOW-UP
        ====================================================== */}

        {prescription.followUpDate && (

          <div className="avoid-break mt-6">

            <h2 className="mb-2.5 border-b border-slate-300 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Follow-up Date
            </h2>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {prescription.followUpDate}
            </div>

          </div>
        )}

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div className="avoid-break mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
          This is a digitally generated prescription from Dr. G.
          SubaJothiKumar, MBBS., MS(ENT) — ENT Specialist.
        </div>

      </div>
    </div>
  );
}