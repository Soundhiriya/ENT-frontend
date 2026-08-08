// PrescriptionView.tsx
// Pure presentational renderer for a prescription — shared by the real
// post-save prescription page and the pre-save confirmation preview, so
// what the doctor confirms is exactly what they'll get afterwards.

"use client";

import QRCode from "react-qr-code";
import { PrescriptionViewData } from "@/src/types/prescription";

interface PrescriptionViewProps {
  data: PrescriptionViewData;
  prescriptionUrl?: string;
  onPrint?: () => void;
}

export default function PrescriptionView({
  data,
  prescriptionUrl,
  onPrint,
}: PrescriptionViewProps) {
  const hasVitals =
    !!data.bp ||
    data.temperature != null ||
    data.weight != null ||
    data.height != null;

  const medicalHistoryLabels: { key: keyof PrescriptionViewData; label: string }[] = [
    { key: "diabetes", label: "Diabetes" },
    { key: "hypertension", label: "Hypertension" },
    { key: "tuberculosis", label: "Tuberculosis" },
    { key: "bronchialAsthma", label: "Bronchial Asthma" },
    { key: "epilepsy", label: "Epilepsy" },
    { key: "antenatal", label: "Antenatal" },
  ];

  const activeMedicalHistory = medicalHistoryLabels.filter(
    ({ key }) => data[key]
  );

  const billingTotal =
    (data.consultationFee ?? 0) +
    data.charges.reduce((sum, charge) => sum + charge.amount, 0);

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-lg print:max-w-full print:rounded-none print:p-0 print:shadow-none">

      {/* Header */}

      <div className="border-b pb-5">
        <h1 className="text-3xl font-bold">
          {data.hospitalName}
        </h1>

        <p className="text-sm text-slate-500">
          ENT Specialist
        </p>
      </div>

      {/* Patient Details */}

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">

        <div>
          <p>
            <span className="font-semibold">Doctor :</span>{" "}
            {data.doctorName}
          </p>

          <p>
            <span className="font-semibold">Patient :</span>{" "}
            {data.patientName}
          </p>

          <p>
            <span className="font-semibold">Phone :</span>{" "}
            {data.phone}
          </p>
        </div>

        <div>
          {data.age != null && (
            <p>
              <span className="font-semibold">Age :</span>{" "}
              {data.age}
            </p>
          )}

          <p>
            <span className="font-semibold">Gender :</span>{" "}
            {data.gender}
          </p>

          <p>
            <span className="font-semibold">Consultation Date :</span>{" "}
            {data.consultationDate}
          </p>
        </div>
      </div>

      {/* Vitals */}

      {hasVitals && (
        <div className="mt-8 break-inside-avoid">

          <h2 className="mb-3 text-lg font-semibold">
            Vitals
          </h2>

          <div className="grid grid-cols-4 gap-4 rounded border p-4">

            {data.bp && (
              <div>
                <p className="text-sm text-slate-500">BP</p>
                <p>{data.bp}</p>
              </div>
            )}

            {data.temperature != null && (
              <div>
                <p className="text-sm text-slate-500">
                  Temperature
                </p>
                <p>{data.temperature}</p>
              </div>
            )}

            {data.weight != null && (
              <div>
                <p className="text-sm text-slate-500">
                  Weight
                </p>
                <p>{data.weight}</p>
              </div>
            )}

            {data.height != null && (
              <div>
                <p className="text-sm text-slate-500">
                  Height
                </p>
                <p>{data.height}</p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Medical History — only conditions the front desk ticked */}

      {activeMedicalHistory.length > 0 && (
        <div className="mt-8 break-inside-avoid">

          <h2 className="mb-3 text-lg font-semibold">
            Medical History
          </h2>

          <div className="flex flex-wrap gap-2">
            {activeMedicalHistory.map(({ key, label }) => (
              <span
                key={key}
                className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Clinical details — short list sections sit side by side instead of
          each taking a full row, so the prescription stays compact. */}

      <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">

        {data.complaints.length > 0 && (
          <div className="break-inside-avoid">
            <h2 className="mb-3 text-lg font-semibold">
              Chief Complaints
            </h2>

            <ul className="list-disc pl-6">
              {data.complaints.map((item, index) => (
                <li key={index}>{item.complaint}</li>
              ))}
            </ul>
          </div>
        )}

        {data.findings.length > 0 && (
          <div className="break-inside-avoid">
            <h2 className="mb-3 text-lg font-semibold">
              Findings
            </h2>

            <ul className="list-disc pl-6">
              {data.findings.map((item, index) => (
                <li key={index}>{item.finding}</li>
              ))}
            </ul>
          </div>
        )}

        {data.otoendoscopies.length > 0 && (
          <div className="break-inside-avoid">
            <h2 className="mb-3 text-lg font-semibold">
              Otoendoscopy
            </h2>

            <ul className="list-disc pl-6">
              {data.otoendoscopies.map((item, index) => (
                <li key={index} className="whitespace-pre-wrap">
                  {item.finding}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.diagnosticNasalEndoscopies.length > 0 && (
          <div className="break-inside-avoid">
            <h2 className="mb-3 text-lg font-semibold">
              Diagnostic Nasal Endoscopy
            </h2>

            <ul className="list-disc pl-6">
              {data.diagnosticNasalEndoscopies.map((item, index) => (
                <li key={index} className="whitespace-pre-wrap">
                  {item.finding}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.videoLaryngoscopies.length > 0 && (
          <div className="break-inside-avoid">
            <h2 className="mb-3 text-lg font-semibold">
              Video Laryngoscopy
            </h2>

            <ul className="list-disc pl-6">
              {data.videoLaryngoscopies.map((item, index) => (
                <li key={index} className="whitespace-pre-wrap">
                  {item.finding}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.diagnoses.length > 0 && (
          <div className="break-inside-avoid">
            <h2 className="mb-3 text-lg font-semibold">
              Diagnosis
            </h2>

            <ul className="list-disc pl-6">
              {data.diagnoses.map((item, index) => (
                <li key={index}>{item.diagnosis}</li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {/* Medicines */}

      {data.medicines.length > 0 && (
        <div className="mt-8 break-inside-avoid">
          <h2 className="mb-3 text-lg font-semibold">
            Medicines
          </h2>

          <table className="w-full border">
            <thead className="bg-slate-100">
              <tr>
                <th className="border p-2 text-left">Medicine</th>
                <th className="border p-2">Dosage</th>
                <th className="border p-2">Frequency</th>
                <th className="border p-2">Duration</th>
                <th className="border p-2">Instructions</th>
              </tr>
            </thead>

            <tbody>
              {data.medicines.map((medicine, index) => (
                <tr key={index}>
                  <td className="border p-2">{medicine.medicineName}</td>
                  <td className="border p-2">{medicine.dosage}</td>
                  <td className="border p-2">{medicine.frequency}</td>
                  <td className="border p-2">{medicine.duration}</td>
                  <td className="border p-2">{medicine.instructions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Billing */}

      <div className="mt-8 break-inside-avoid">
        <h2 className="mb-3 text-lg font-semibold">
          Billing
        </h2>

        <table className="w-full border">
          <tbody>
            <tr>
              <td className="border p-2">Consultation Fee</td>
              <td className="border p-2 text-right">
                ₹{data.consultationFee}
              </td>
            </tr>

            {data.charges.map((charge, index) => (
              <tr key={index}>
                <td className="border p-2">{charge.label}</td>
                <td className="border p-2 text-right">
                  ₹{charge.amount}
                </td>
              </tr>
            ))}

            <tr>
              <td className="border p-2 font-semibold">Total</td>
              <td className="border p-2 text-right font-semibold">
                ₹{billingTotal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Advice & Follow-up — side by side */}

      {(data.advice?.trim() || data.followUpDate) && (
        <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">

          {data.advice?.trim() && (
            <div className="break-inside-avoid">
              <h2 className="mb-2 text-lg font-semibold">
                Advice
              </h2>

              <div className="rounded border p-4">
                {data.advice}
              </div>
            </div>
          )}

          {data.followUpDate && (
            <div className="break-inside-avoid">
              <h2 className="mb-2 text-lg font-semibold">
                Follow-up Date
              </h2>

              <div className="rounded border p-4">
                {data.followUpDate}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Footer */}

      <div className="mt-12 flex items-end justify-between border-t pt-6 break-inside-avoid">
        <div className="flex flex-col items-center gap-2">
          {prescriptionUrl ? (
            <>
              <QRCode value={prescriptionUrl} size={120} />
              <p className="text-center text-xs text-slate-500">
                Scan to view Endoscopy images and youtube links.
              </p>
            </>
          ) : (
            <div className="flex h-[120px] w-[120px] flex-col items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 p-2 text-center text-[11px] text-slate-400">
              QR code will be generated after saving
            </div>
          )}
        </div>

        {onPrint && (
          <button
            onClick={onPrint}
            className="rounded bg-blue-600 px-6 py-2 text-white print:hidden"
          >
            Print Prescription
          </button>
        )}
      </div>

    </div>
  );
}
