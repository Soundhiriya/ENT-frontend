// PrescriptionView.tsx
// Pure presentational renderer for a prescription — shared by the real
// post-save prescription page and the pre-save confirmation preview, so
// what the doctor confirms is exactly what they'll get afterwards.
//
// Styling note: this renders a clinical document, not an app screen. Body
// copy uses `font-rx-sans` (IBM Plex Sans) and the letterhead/headings use
// `font-rx-serif` (Merriweather) — both declared in app/globals.css and fed
// by next/font in app/layout.tsx. Every section keeps `break-inside-avoid`
// so it never splits across a page break, and the root deliberately stays
// `mx-auto max-w-4xl` with no height constraints so the parent page's
// `@page` margin — which reserves the pre-printed letterhead bands on every
// page — governs the printed geometry unopposed.

"use client";

import QRCode from "react-qr-code";
import { PrescriptionViewData } from "@/src/types/prescription";

interface PrescriptionViewProps {
  data: PrescriptionViewData;
  prescriptionUrl?: string;
  onPrint?: () => void;
  // Billing is deliberately off by default: neither the doctor's printed
  // prescription nor the patient-facing e-prescription should carry fee
  // information. Kept as an opt-in rather than deleted so an internal
  // admin/billing screen can reuse this renderer with the amounts shown.
  showBilling?: boolean;
}

// Small caps rule used for every section title, so the document reads with a
// single consistent hierarchy instead of ad-hoc bold text.
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-1.5 border-b border-slate-300 pb-1 font-rx-sans text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">
      {children}
    </h2>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
      {children}
    </span>
  );
}

export default function PrescriptionView({
  data,
  prescriptionUrl,
  onPrint,
  showBilling = false,
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

  // The QR only ever points at endoscopy images / YouTube links, so there is
  // nothing to scan for when neither is attached — hide the whole slot in
  // that case rather than printing a dead code.
  const hasMedia =
    (data.endoscopyImages?.length ?? 0) > 0 ||
    (data.youtubeVideos?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-8 font-rx-sans text-[13px] leading-relaxed text-slate-800 shadow-lg print:max-w-full print:rounded-none print:border-0 print:p-0 print:shadow-none">

      {/* Letterhead — heavy rule under the hospital name, hairline beneath it,
          the way a printed prescription pad is set. */}

      <div className="flex break-inside-avoid items-start justify-between gap-2 border-b-2 border-slate-800 pb-3">
        <div className="min-w-0">
          <h1 className="font-rx-serif text-[28px] font-bold leading-tight tracking-tight text-slate-900">
            {data.hospitalName}
          </h1>

          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <p className="font-rx-serif text-[13px] font-semibold tracking-wide text-slate-700">
              Dr.G.SubaJothiKumar MBBS.,MS(ENT)
            </p>

            <span className="text-slate-300">|</span>

            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
              ENT Specialist
            </p>

            <span className="text-slate-300">|</span>

            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
              Reg. No. 127855
            </p>
          </div>
        </div>

        {/* QR sits in the letterhead's dead space to the right of the
            credentials line rather than in a footer of its own, so it costs
            no extra vertical height — the block is already as tall as the
            hospital name. Still gated on hasMedia: nothing to scan for when
            no endoscopy images or videos are attached. */}

        {hasMedia && (
          <div className="flex shrink-0 items-center gap-2">
            {prescriptionUrl ? (
              <>
                {/* max-w tuned to break this onto exactly two lines at
                    10px: "Scan for endoscopy" measures ~118px, so anything
                    narrower spills to three lines and anything much wider
                    steals room from the credentials line and wraps
                    "Reg. No." onto its own row. The parent gap is kept at
                    gap-2 for the same reason. */}
                <p className="max-w-[118px] text-right text-[10px] uppercase leading-tight tracking-[0.06em] text-slate-500">
                  Scan for endoscopy images &amp; videos
                </p>
                <QRCode value={prescriptionUrl} size={64} />
              </>
            ) : (
              <div className="flex h-[64px] w-[64px] flex-col items-center justify-center rounded-sm border border-dashed border-slate-300 bg-slate-50 p-1.5 text-center text-[9px] leading-tight text-slate-400">
                QR after saving
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-[3px] border-b border-slate-300" />

      {/* Patient Details */}

      <div className="mt-3 grid break-inside-avoid grid-cols-2 gap-x-8 gap-y-1 pb-2.5">

        <div className="space-y-1">
          <p>
            <FieldLabel>Patient</FieldLabel>
            <span className="ml-2 font-medium text-slate-900">
              {data.patientName}
            </span>
          </p>

          <p>
            <FieldLabel>Phone</FieldLabel>
            <span className="ml-2 text-slate-800">{data.phone}</span>
          </p>
        </div>

        <div className="space-y-1">
          <p>
            {data.age != null && (
              <>
                <FieldLabel>Age</FieldLabel>
                <span className="ml-2 mr-5 text-slate-800">{data.age}</span>
              </>
            )}
            <FieldLabel>Gender</FieldLabel>
            <span className="ml-2 text-slate-800">{data.gender}</span>
          </p>

          <p>
            <FieldLabel>Consultation Date</FieldLabel>
            <span className="ml-2 text-slate-800">
              {data.consultationDate}
            </span>
          </p>
        </div>
      </div>

      {/* Vitals — an inline run rather than a boxed grid: four numbers don't
          earn a bordered four-column table, and the flat version costs one
          line instead of ~15mm. */}

      {hasVitals && (
        <div className="flex break-inside-avoid flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-slate-200 pt-2">
          <FieldLabel>Vitals</FieldLabel>

          {data.bp && (
            <span>
              <span className="text-slate-500">BP</span>{" "}
              <span className="font-medium text-slate-900">{data.bp}</span>
            </span>
          )}

          {data.temperature != null && (
            <span>
              <span className="text-slate-500">Temp</span>{" "}
              <span className="font-medium text-slate-900">
                {data.temperature}
              </span>
            </span>
          )}

          {data.weight != null && (
            <span>
              <span className="text-slate-500">Weight</span>{" "}
              <span className="font-medium text-slate-900">{data.weight}</span>
            </span>
          )}

          {data.height != null && (
            <span>
              <span className="text-slate-500">Height</span>{" "}
              <span className="font-medium text-slate-900">{data.height}</span>
            </span>
          )}
        </div>
      )}

      <div className="mt-2.5 border-t border-slate-200" />

      {/* Medical History — only conditions the front desk ticked */}

      {activeMedicalHistory.length > 0 && (
        <div className="mt-4 break-inside-avoid">

          <SectionHeading>Medical History</SectionHeading>

          <div className="flex flex-wrap gap-1.5">
            {activeMedicalHistory.map(({ key, label }) => (
              <span
                key={key}
                className="rounded-sm border border-red-300 bg-red-50 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-red-700 [print-color-adjust:exact]"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Clinical details — short list sections sit side by side instead of
          each taking a full row, so the prescription stays compact. */}

      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">

        {data.complaints.length > 0 && (
          <div className="break-inside-avoid">
            <SectionHeading>Chief Complaints</SectionHeading>

            <ul className="list-disc space-y-0.5 pl-5 marker:text-slate-400">
              {data.complaints.map((item, index) => (
                <li key={index}>{item.complaint}</li>
              ))}
            </ul>
          </div>
        )}

        {data.findings.length > 0 && (
          <div className="break-inside-avoid">
            <SectionHeading>Findings</SectionHeading>

            <ul className="list-disc space-y-0.5 pl-5 marker:text-slate-400">
              {data.findings.map((item, index) => (
                <li key={index}>{item.finding}</li>
              ))}
            </ul>
          </div>
        )}

        {data.otoendoscopies.length > 0 && (
          <div className="break-inside-avoid">
            <SectionHeading>Otoendoscopy</SectionHeading>

            <ul className="list-disc space-y-0.5 pl-5 marker:text-slate-400">
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
            <SectionHeading>Diagnostic Nasal Endoscopy</SectionHeading>

            <ul className="list-disc space-y-0.5 pl-5 marker:text-slate-400">
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
            <SectionHeading>Video Laryngoscopy</SectionHeading>

            <ul className="list-disc space-y-0.5 pl-5 marker:text-slate-400">
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
            <SectionHeading>Diagnosis</SectionHeading>

            <ul className="list-disc space-y-0.5 pl-5 marker:text-slate-400">
              {data.diagnoses.map((item, index) => (
                <li key={index} className="font-medium text-slate-900">
                  {item.diagnosis}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {/* Medicines */}

      {/* Medicines — deliberately NOT break-inside-avoid on the wrapper. A
          long table that refuses to split gets shunted whole onto the next
          page, stranding the remaining space on this one; the rows carry
          break-inside-avoid individually so a row never splits mid-cell, and
          the header repeats via <thead> if the table does span pages. */}

      {data.medicines.length > 0 && (
        <div className="mt-4">
          <SectionHeading>Medicines</SectionHeading>

          <table className="w-full border-collapse border border-slate-200 text-[12.5px]">
            <thead className="bg-slate-50 [print-color-adjust:exact]">
              <tr>
                <th className="border border-slate-200 px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Medicine
                </th>
                <th className="border border-slate-200 px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Dosage
                </th>
                <th className="border border-slate-200 px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Frequency
                </th>
                <th className="border border-slate-200 px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Duration
                </th>
                <th className="border border-slate-200 px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Instructions
                </th>
              </tr>
            </thead>

            <tbody>
              {data.medicines.map((medicine, index) => (
                <tr key={index} className="break-inside-avoid align-top">
                  <td className="border border-slate-200 px-3 py-1.5 font-medium text-slate-900">
                    {medicine.medicineName}
                  </td>
                  <td className="border border-slate-200 px-3 py-1.5">
                    {medicine.dosage}
                  </td>
                  <td className="border border-slate-200 px-3 py-1.5">
                    {medicine.frequency}
                  </td>
                  <td className="border border-slate-200 px-3 py-1.5">
                    {medicine.duration}
                  </td>
                  <td className="border border-slate-200 px-3 py-1.5">
                    {medicine.instructions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Billing — opt-in only (see showBilling above). */}

      {showBilling && (
        <div className="mt-4 break-inside-avoid">
          <SectionHeading>Billing</SectionHeading>

          <table className="w-full border-collapse border border-slate-200 text-[12.5px]">
            <tbody>
              <tr>
                <td className="border border-slate-200 px-3 py-1.5">
                  Consultation Fee
                </td>
                <td className="border border-slate-200 px-3 py-1.5 text-right tabular-nums">
                  ₹{data.consultationFee}
                </td>
              </tr>

              {data.charges.map((charge, index) => (
                <tr key={index}>
                  <td className="border border-slate-200 px-3 py-1.5">
                    {charge.label}
                  </td>
                  <td className="border border-slate-200 px-3 py-1.5 text-right tabular-nums">
                    ₹{charge.amount}
                  </td>
                </tr>
              ))}

              <tr className="bg-slate-50 [print-color-adjust:exact]">
                <td className="border border-slate-200 px-3 py-1.5 font-semibold text-slate-900">
                  Total
                </td>
                <td className="border border-slate-200 px-3 py-1.5 text-right font-semibold tabular-nums text-slate-900">
                  ₹{billingTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Advice & Follow-up — side by side */}

      {(data.advice?.trim() || data.followUpDate) && (
        <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">

          {data.advice?.trim() && (
            <div className="break-inside-avoid">
              <SectionHeading>Advice</SectionHeading>

              <div className="whitespace-pre-wrap">{data.advice}</div>
            </div>
          )}

          {data.followUpDate && (
            <div className="break-inside-avoid">
              <SectionHeading>Follow-up Date</SectionHeading>

              <div className="font-medium text-slate-900">
                {data.followUpDate}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Screen-only action row. print:hidden on the wrapper, not just the
          button — otherwise the rule and its margins still consume ~8mm of
          printed height around an invisible control. */}

      {onPrint && (
        <div className="mt-5 flex justify-end border-t border-slate-300 pt-3 print:hidden">
          <button
            onClick={onPrint}
            className="rounded-sm bg-slate-800 px-6 py-2 text-[12px] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-slate-900"
          >
            Print Prescription
          </button>
        </div>
      )}

    </div>
  );
}
