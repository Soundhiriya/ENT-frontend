"use client";

import QRCode from "react-qr-code";
import { PlayCircle } from "lucide-react";

import { PrescriptionViewData } from "@/src/types/prescription";

interface PrescriptionViewProps {
  data: PrescriptionViewData;
  prescriptionUrl?: string;
  onPrint?: () => void;
  showBilling?: boolean;
  showMediaInline?: boolean;
}

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2
      className="
        mb-1.5
        border-b
        border-slate-300
        pb-1
        font-rx-sans
        text-[10.5px]
        font-semibold
        uppercase
        tracking-[0.16em]
        text-slate-600
      "
    >
      {children}
    </h2>
  );
}

/* ============================================================
   FIELD LABEL
============================================================ */

function FieldLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span
      className="
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.1em]
        text-slate-500
      "
    >
      {children}
    </span>
  );
}

/* ============================================================
   CLEAN COMPLAINT TEXT
============================================================ */

function cleanComplaintText(
  complaint: string
): string {
  if (!complaint) {
    return "";
  }

  return complaint
    .trim()
    .replace(
      /^(LEFT|RIGHT|BILATERAL|OVERALL|NONE)\s*[-+]\s*/i,
      ""
    )
    .trim();
}

/* ============================================================
   NORMALIZE COMPLAINT SIDE
============================================================ */

function normalizeComplaintSide(
  side?: string | null
): string {
  if (!side || side.trim() === "") {
    return "OVERALL";
  }

  const normalized = side
    .trim()
    .toUpperCase();

  if (normalized === "NONE") {
    return "OVERALL";
  }

  return normalized;
}

/* ============================================================
   COMPLAINT DISPLAY

   Examples:

   LEFT + Fever
   -> LEFT - Fever

   RIGHT + Cold
   -> RIGHT - Cold

   BILATERAL + Fever
   -> BILATERAL - Fever

   NONE + Cold
   -> OVERALL - Cold

   empty side + Cold
   -> OVERALL - Cold

   Only SIDE is semibold.
   Complaint text is normal.
============================================================ */

function ComplaintDisplay({
  complaint,
  side,
}: {
  complaint: string;
  side?: string | null;
}) {
  if (
    !complaint ||
    complaint.trim() === ""
  ) {
    return null;
  }

  const normalizedSide =
    normalizeComplaintSide(side);

  const complaintText =
    cleanComplaintText(complaint);

  if (!complaintText) {
    return null;
  }

  return (
    <>
      <span
        className="
          font-semibold
          text-slate-900
        "
      >
        {normalizedSide}
      </span>

      <span
        className="
          font-normal
          text-slate-700
        "
      >
        {" - "}
        {complaintText}
      </span>
    </>
  );
}

/* ============================================================
   CLEAN DIAGNOSIS TEXT
============================================================ */

function cleanDiagnosisText(
  diagnosis: string
): string {
  if (!diagnosis) {
    return "";
  }

  return diagnosis
    .trim()
    .replace(
      /^(PROVISIONAL|FINAL)\s*[-+]\s*/i,
      ""
    )
    .trim();
}

/* ============================================================
   NORMALIZE DIAGNOSIS TYPE
============================================================ */

function normalizeDiagnosisType(
  type?: string | null
): string {
  if (
    !type ||
    type.trim() === ""
  ) {
    return "";
  }

  return type
    .trim()
    .toUpperCase();
}

/* ============================================================
   DIAGNOSIS DISPLAY

   Examples:

   PROVISIONAL + Allergic Rhinitis
   -> PROVISIONAL - Allergic Rhinitis

   FINAL + Chronic Sinusitis
   -> FINAL - Chronic Sinusitis

   Only TYPE is semibold.
   Diagnosis text is normal.
============================================================ */

function DiagnosisDisplay({
  diagnosis,
  type,
}: {
  diagnosis: string;
  type?: string | null;
}) {
  if (
    !diagnosis ||
    diagnosis.trim() === ""
  ) {
    return null;
  }

  const normalizedType =
    normalizeDiagnosisType(type);

  const diagnosisText =
    cleanDiagnosisText(diagnosis);

  if (!diagnosisText) {
    return null;
  }

  if (!normalizedType) {
    return (
      <span
        className="
          font-normal
          text-slate-700
        "
      >
        {diagnosisText}
      </span>
    );
  }

  return (
    <>
      <span
        className="
          font-semibold
          text-slate-900
        "
      >
        {normalizedType}
      </span>

      <span
        className="
          font-normal
          text-slate-700
        "
      >
        {" - "}
        {diagnosisText}
      </span>
    </>
  );
}

/* ============================================================
   MAIN PRESCRIPTION VIEW
============================================================ */

export default function PrescriptionView({
  data,
  prescriptionUrl,
  onPrint,
  showBilling = false,
  showMediaInline = false,
}: PrescriptionViewProps) {

  /* ==========================================================
     VITALS
  ========================================================== */

  const hasVitals =
    !!data.bp ||
    data.temperature != null ||
    data.weight != null ||
    data.height != null;

  /* ==========================================================
     MEDICAL HISTORY
  ========================================================== */

  const medicalHistoryLabels: {
    key: keyof PrescriptionViewData;
    label: string;
  }[] = [
    {
      key: "diabetes",
      label: "Diabetes",
    },
    {
      key: "hypertension",
      label: "Hypertension",
    },
    {
      key: "tuberculosis",
      label: "Tuberculosis",
    },
    {
      key: "bronchialAsthma",
      label: "Bronchial Asthma",
    },
    {
      key: "epilepsy",
      label: "Epilepsy",
    },
    {
      key: "antenatal",
      label: "Antenatal",
    },
  ];

  const activeMedicalHistory =
    medicalHistoryLabels.filter(
      ({ key }) => data[key]
    );

  const customMedicalHistory =
    data.customMedicalHistory ?? [];

  /* ==========================================================
     BILLING

     ChargeDto has NO displayOrder.

     Therefore:
       data.charges.map(...)

     DO NOT:
       charge.displayOrder
  ========================================================== */

  const billingTotal =
    (data.consultationFee ?? 0) +
    data.charges.reduce(
      (sum, charge) =>
        sum + charge.amount,
      0
    );

  /* ==========================================================
     MEDIA
  ========================================================== */

  const hasMedia =
    (data.endoscopyImages?.length ?? 0) > 0 ||
    (data.youtubeVideos?.length ?? 0) > 0;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      className="
        mx-auto
        max-w-4xl
        rounded-lg
        border
        border-slate-200
        bg-white
        p-8
        font-rx-sans
        text-[13px]
        leading-relaxed
        text-slate-800
        shadow-lg

        print:max-w-full
        print:rounded-none
        print:border-0
        print:p-0
        print:shadow-none
      "
    >

      {/* ========================================================
          LETTERHEAD
      ======================================================== */}

      <div
        className="
          flex
          break-inside-avoid
          items-start
          justify-between
          gap-2
          border-b-2
          border-slate-800
          pb-3
        "
      >

        <div className="min-w-0">

          <h1
            className="
              font-rx-serif
              text-[28px]
              font-bold
              leading-tight
              tracking-tight
              text-slate-900
            "
          >
            {data.hospitalName}
          </h1>

          <div
            className="
              mt-1.5
              flex
              flex-wrap
              items-baseline
              gap-x-3
              gap-y-0.5
            "
          >

            <p
              className="
                font-rx-serif
                text-[13px]
                font-semibold
                tracking-wide
                text-slate-700
              "
            >
              Dr.G.SubaJothiKumar MBBS.,MS(ENT)
            </p>

            <span className="text-slate-300">
              |
            </span>

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.12em]
                text-slate-500
              "
            >
              ENT Specialist
            </p>

            <span className="text-slate-300">
              |
            </span>

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.12em]
                text-slate-500
              "
            >
              Reg. No. 127855
            </p>

          </div>

        </div>

        {/* QR CODE */}

        {hasMedia && (

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
            "
          >

            {prescriptionUrl ? (

              <>
                <p
                  className="
                    max-w-[118px]
                    text-right
                    text-[10px]
                    uppercase
                    leading-tight
                    tracking-[0.06em]
                    text-slate-500
                  "
                >
                  Scan for endoscopy images &amp; videos
                </p>

                <QRCode
                  value={prescriptionUrl}
                  size={64}
                />
              </>

            ) : (

              <div
                className="
                  flex
                  h-[64px]
                  w-[64px]
                  flex-col
                  items-center
                  justify-center
                  rounded-sm
                  border
                  border-dashed
                  border-slate-300
                  bg-slate-50
                  p-1.5
                  text-center
                  text-[9px]
                  leading-tight
                  text-slate-400
                "
              >
                QR after saving
              </div>

            )}

          </div>

        )}

      </div>

      <div
        className="
          mt-[3px]
          border-b
          border-slate-300
        "
      />

      {/* ========================================================
          PATIENT DETAILS
      ======================================================== */}

      <div
        className="
          mt-3
          grid
          break-inside-avoid
          grid-cols-2
          gap-x-8
          gap-y-1
          pb-2.5
        "
      >

        <div className="space-y-1">

          <p>

            <FieldLabel>
              Patient
            </FieldLabel>

            <span
              className="
                ml-2
                font-medium
                text-slate-900
              "
            >
              {data.patientName}
            </span>

          </p>

          <p>

            <FieldLabel>
              Phone
            </FieldLabel>

            <span
              className="
                ml-2
                text-slate-800
              "
            >
              {data.phone}
            </span>

          </p>

        </div>

        <div className="space-y-1">

          <p>

            {data.age != null && (

              <>
                <FieldLabel>
                  Age
                </FieldLabel>

                <span
                  className="
                    ml-2
                    mr-5
                    text-slate-800
                  "
                >
                  {data.age}
                </span>
              </>

            )}

            <FieldLabel>
              Gender
            </FieldLabel>

            <span
              className="
                ml-2
                text-slate-800
              "
            >
              {data.gender}
            </span>

          </p>

          <p>

            <FieldLabel>
              Consultation Date
            </FieldLabel>

            <span
              className="
                ml-2
                text-slate-800
              "
            >
              {data.consultationDate}
            </span>

          </p>

        </div>

      </div>

      {/* ========================================================
          VITALS
      ======================================================== */}

      {hasVitals && (

        <div
          className="
            flex
            break-inside-avoid
            flex-wrap
            items-baseline
            gap-x-6
            gap-y-1
            border-t
            border-slate-200
            pt-2
          "
        >

          <FieldLabel>
            Vitals
          </FieldLabel>

          {data.bp && (

            <span>

              <span className="text-slate-500">
                BP
              </span>

              {" "}

              <span
                className="
                  font-medium
                  text-slate-900
                "
              >
                {data.bp}
              </span>

            </span>

          )}

          {data.temperature != null && (

            <span>

              <span className="text-slate-500">
                Temp
              </span>

              {" "}

              <span
                className="
                  font-medium
                  text-slate-900
                "
              >
                {data.temperature}
              </span>

            </span>

          )}

          {data.weight != null && (

            <span>

              <span className="text-slate-500">
                Weight
              </span>

              {" "}

              <span
                className="
                  font-medium
                  text-slate-900
                "
              >
                {data.weight}
              </span>

            </span>

          )}

          {data.height != null && (

            <span>

              <span className="text-slate-500">
                Height
              </span>

              {" "}

              <span
                className="
                  font-medium
                  text-slate-900
                "
              >
                {data.height}
              </span>

            </span>

          )}

        </div>

      )}

      <div
        className="
          mt-2.5
          border-t
          border-slate-200
        "
      />

      {/* ========================================================
          MEDICAL HISTORY
      ======================================================== */}

      {(
        activeMedicalHistory.length > 0 ||
        customMedicalHistory.length > 0
      ) && (

        <div
          className="
            mt-4
            break-inside-avoid
          "
        >

          <SectionHeading>
            Medical History
          </SectionHeading>

          <div
            className="
              flex
              flex-wrap
              gap-1.5
            "
          >

            {activeMedicalHistory.map(
              ({ key, label }) => (

                <span
                  key={String(key)}
                  className="
                    rounded-sm
                    border
                    border-red-300
                    bg-red-50
                    px-2.5
                    py-0.5
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.06em]
                    text-red-700
                    [print-color-adjust:exact]
                  "
                >
                  {label}
                </span>

              )
            )}

            {customMedicalHistory.map(
              (condition) => (

                <span
                  key={condition}
                  className="
                    rounded-sm
                    border
                    border-red-300
                    bg-red-50
                    px-2.5
                    py-0.5
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.06em]
                    text-red-700
                    [print-color-adjust:exact]
                  "
                >
                  {condition}
                </span>

              )
            )}

          </div>

        </div>

      )}

      {/* ========================================================
          COMPLAINTS / DIAGNOSIS / FINDINGS
      ======================================================== */}

      <div
        className="
          mt-4
          grid
          grid-cols-1
          gap-x-6
          gap-y-4
          sm:grid-cols-3
        "
      >

        {/* ======================================================
            CHIEF COMPLAINTS
        ====================================================== */}

        {data.complaints.length > 0 && (

          <div
            className="
              break-inside-avoid
            "
          >

            <SectionHeading>
              Chief Complaints
            </SectionHeading>

            <ul
              className="
                list-disc
                space-y-0.5
                pl-5
                marker:text-slate-400
              "
            >

              {data.complaints
                .slice()
                .sort(
                  (a, b) =>
                    (a.displayOrder ?? 0) -
                    (b.displayOrder ?? 0)
                )
                .map(
                  (item, index) => (

                    <li
                      key={index}
                      className="
                        text-[13px]
                        font-normal
                        leading-6
                        text-slate-700
                      "
                    >

                      <ComplaintDisplay
                        complaint={
                          item.complaint
                        }
                        side={
                          item.side
                        }
                      />

                    </li>

                  )
                )}

            </ul>

          </div>

        )}

        {/* ======================================================
            DIAGNOSIS
        ====================================================== */}

        {data.diagnoses.length > 0 && (

          <div
            className="
              break-inside-avoid
            "
          >

            <SectionHeading>
              Diagnosis
            </SectionHeading>

            <ul
              className="
                list-disc
                space-y-0.5
                pl-5
                marker:text-slate-400
              "
            >

              {data.diagnoses
                .slice()
                .sort(
                  (a, b) =>
                    (a.displayOrder ?? 0) -
                    (b.displayOrder ?? 0)
                )
                .map(
                  (item, index) => (

                    <li
                      key={index}
                      className="
                        text-[13px]
                        font-normal
                        leading-6
                        text-slate-700
                      "
                    >

                      <DiagnosisDisplay
                        diagnosis={
                          item.diagnosis
                        }
                        type={
                          item.type
                        }
                      />

                    </li>

                  )
                )}

            </ul>

          </div>

        )}

        {/* ======================================================
            FINDINGS

            FindingDto has NO displayOrder.
        ====================================================== */}

        {data.findings.length > 0 && (

          <div
            className="
              break-inside-avoid
            "
          >

            <SectionHeading>
              Findings
            </SectionHeading>

            <ul
              className="
                list-disc
                space-y-0.5
                pl-5
                marker:text-slate-400
              "
            >

              {data.findings.map(
                (item, index) => (

                  <li
                    key={index}
                    className="
                      text-[13px]
                      font-normal
                      leading-6
                      text-slate-700
                    "
                  >
                    {item.finding}
                  </li>

                )
              )}

            </ul>

          </div>

        )}

      </div>

      {/* ========================================================
          OTOENDOSCOPY

          FindingDto has NO displayOrder.
      ======================================================== */}

      {data.otoendoscopies.length > 0 && (

        <div
          className="
            mt-4
            break-inside-avoid
          "
        >

          <SectionHeading>
            Otoendoscopy
          </SectionHeading>

          <ul
            className="
              list-disc
              space-y-0.5
              pl-5
              marker:text-slate-400
            "
          >

            {data.otoendoscopies.map(
              (item, index) => (

                <li
                  key={index}
                  className="
                    whitespace-pre-wrap
                    text-[13px]
                    leading-6
                    text-slate-700
                  "
                >
                  {item.finding}
                </li>

              )
            )}

          </ul>

        </div>

      )}

      {/* ========================================================
          DIAGNOSTIC NASAL ENDOSCOPY

          FindingDto has NO displayOrder.
      ======================================================== */}

      {data.diagnosticNasalEndoscopies.length > 0 && (

        <div
          className="
            mt-4
            break-inside-avoid
          "
        >

          <SectionHeading>
            Diagnostic Nasal Endoscopy
          </SectionHeading>

          <ul
            className="
              list-disc
              space-y-0.5
              pl-5
              marker:text-slate-400
            "
          >

            {data.diagnosticNasalEndoscopies.map(
              (item, index) => (

                <li
                  key={index}
                  className="
                    whitespace-pre-wrap
                    text-[13px]
                    leading-6
                    text-slate-700
                  "
                >
                  {item.finding}
                </li>

              )
            )}

          </ul>

        </div>

      )}

      {/* ========================================================
          VIDEO LARYNGOSCOPY

          FindingDto has NO displayOrder.
      ======================================================== */}

      {data.videoLaryngoscopies.length > 0 && (

        <div
          className="
            mt-4
            break-inside-avoid
          "
        >

          <SectionHeading>
            Video Laryngoscopy
          </SectionHeading>

          <ul
            className="
              list-disc
              space-y-0.5
              pl-5
              marker:text-slate-400
            "
          >

            {data.videoLaryngoscopies.map(
              (item, index) => (

                <li
                  key={index}
                  className="
                    whitespace-pre-wrap
                    text-[13px]
                    leading-6
                    text-slate-700
                  "
                >
                  {item.finding}
                </li>

              )
            )}

          </ul>

        </div>

      )}

      {/* ========================================================
          MEDICINES

          IMPORTANT:
          MedicineDto DOES NOT have displayOrder.

          Therefore DO NOT use:

          .sort(
            (a, b) =>
              (a.displayOrder ?? 0) -
              (b.displayOrder ?? 0)
          )
      ======================================================== */}

      {data.medicines.length > 0 && (

        <div
          className="
            mt-6
            break-inside-avoid
          "
        >

          <SectionHeading>
            Medicines
          </SectionHeading>

          <div className="overflow-x-auto">

            <table
              className="
                w-full
                border-collapse
                text-left
                text-[12px]
              "
            >

              <thead>

                <tr>

                  <th
                    className="
                      border
                      border-slate-200
                      px-3
                      py-2
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.1em]
                      text-slate-500
                    "
                  >
                    Medicine
                  </th>

                  <th
                    className="
                      border
                      border-slate-200
                      px-3
                      py-2
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.1em]
                      text-slate-500
                    "
                  >
                    Dosage
                  </th>

                  <th
                    className="
                      border
                      border-slate-200
                      px-3
                      py-2
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.1em]
                      text-slate-500
                    "
                  >
                    Frequency
                  </th>

                  <th
                    className="
                      border
                      border-slate-200
                      px-3
                      py-2
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.1em]
                      text-slate-500
                    "
                  >
                    Duration
                  </th>

                  <th
                    className="
                      border
                      border-slate-200
                      px-3
                      py-2
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.1em]
                      text-slate-500
                    "
                  >
                    Instructions
                  </th>

                </tr>

              </thead>

              <tbody>

                {data.medicines.map(
                  (medicine, index) => (

                    <tr
                      key={index}
                      className="
                        break-inside-avoid
                        align-top
                      "
                    >

                      <td
                        className="
                          border
                          border-slate-200
                          px-3
                          py-2.5
                        "
                      >
                        {medicine.medicineName}
                      </td>

                      <td
                        className="
                          border
                          border-slate-200
                          px-3
                          py-2.5
                        "
                      >
                        {medicine.dosage}
                      </td>

                      <td
                        className="
                          border
                          border-slate-200
                          px-3
                          py-2.5
                        "
                      >
                        {medicine.frequency}
                      </td>

                      <td
                        className="
                          border
                          border-slate-200
                          px-3
                          py-2.5
                        "
                      >
                        {medicine.duration}
                      </td>

                      <td
                        className="
                          border
                          border-slate-200
                          px-3
                          py-2.5
                        "
                      >
                        {medicine.instructions}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

      {/* ========================================================
          BILLING

          ChargeDto has NO displayOrder.
      ======================================================== */}

      {showBilling && (

        <div
          className="
            mt-6
            break-inside-avoid
          "
        >

          <SectionHeading>
            Billing
          </SectionHeading>

          {/* Consultation Fee */}

          <div
            className="
              flex
              justify-between
              border
              border-slate-200
              bg-slate-50
              px-4
              py-3
              text-sm
            "
          >

            <span className="text-slate-600">
              Consultation Fee
            </span>

            <span
              className="
                font-medium
                text-slate-900
              "
            >
              {data.consultationFee ?? 0}
            </span>

          </div>

          {/* Additional Charges */}

          {data.charges.length > 0 && (

            <div className="mt-2 space-y-1">

              {data.charges.map(
                (charge, index) => (

                  <div
                    key={index}
                    className="
                      flex
                      justify-between
                      px-4
                      py-1
                      text-sm
                    "
                  >

                    <span className="text-slate-600">
                      {charge.label}
                    </span>

                    <span className="text-slate-900">
                      {charge.amount}
                    </span>

                  </div>

                )
              )}

            </div>

          )}

          {/* Total */}

          <div
            className="
              mt-2
              flex
              justify-between
              border-t
              border-slate-300
              px-4
              pt-2
              text-sm
              font-semibold
            "
          >

            <span>
              Total
            </span>

            <span>
              {billingTotal}
            </span>

          </div>

        </div>

      )}

      {/* ========================================================
          ADVICE
      ======================================================== */}

      {data.advice && (

        <div
          className="
            mt-6
            break-inside-avoid
          "
        >

          <SectionHeading>
            Advice
          </SectionHeading>

          <div
            className="
              whitespace-pre-wrap
              rounded-lg
              border
              border-slate-200
              bg-slate-50
              p-4
              text-sm
              text-slate-700
            "
          >
            {data.advice}
          </div>

        </div>

      )}

      {/* ========================================================
          FOLLOW-UP
      ======================================================== */}

      {data.followUpDate && (

        <div
          className="
            mt-6
            break-inside-avoid
          "
        >

          <SectionHeading>
            Follow-up Date
          </SectionHeading>

          <div
            className="
              rounded-lg
              border
              border-slate-200
              bg-slate-50
              p-4
              text-sm
              text-slate-700
            "
          >
            {data.followUpDate}
          </div>

        </div>

      )}

      {/* ========================================================
          ENDOSCOPY IMAGES & VIDEOS
      ======================================================== */}

      {showMediaInline && hasMedia && (

        <div
          className="
            mt-4
            break-inside-avoid
            print:hidden
          "
        >

          <SectionHeading>
            Endoscopy Images &amp; Videos
          </SectionHeading>

          {/* IMAGES */}

          {data.endoscopyImages.length > 0 && (

            <div
              className="
                mt-2
                grid
                grid-cols-3
                gap-2
                sm:grid-cols-4
                md:grid-cols-6
              "
            >

              {data.endoscopyImages
                .slice()
                .sort(
                  (a, b) =>
                    a.displayOrder -
                    b.displayOrder
                )
                .map(
                  (image) => (

                    <a
                      key={image.imageUrl}
                      href={image.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        block
                        overflow-hidden
                        rounded-md
                        border
                        border-slate-200
                        bg-slate-50
                        transition-opacity
                        hover:opacity-80
                      "
                    >

                      <img
                        src={image.imageUrl}
                        alt={
                          image.imageName ||
                          "Endoscopy image"
                        }
                        className="
                          h-20
                          w-full
                          object-cover
                        "
                      />

                    </a>

                  )
                )}

            </div>

          )}

          {/* YOUTUBE VIDEOS */}

          {data.youtubeVideos.length > 0 && (

            <div
              className={`
                flex
                flex-col
                gap-1.5
                ${
                  data.endoscopyImages.length > 0
                    ? "mt-3"
                    : "mt-2"
                }
              `}
            >

              {data.youtubeVideos.map(
                (video) => (

                  <a
                    key={video.youtubeUrl}
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      text-[12px]
                      text-blue-600
                      hover:underline
                    "
                  >

                    <PlayCircle
                      className="
                        h-3.5
                        w-3.5
                        shrink-0
                      "
                    />

                    {video.title ||
                      video.youtubeUrl}

                  </a>

                )
              )}

            </div>

          )}

        </div>

      )}

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <div
        className="
          mt-10
          break-inside-avoid
          border-t
          border-slate-200
          pt-4
          text-center
          text-xs
          text-slate-400
        "
      >
        This is a digitally generated prescription from
        Dr. G. SubaJothiKumar, MBBS., MS(ENT) — ENT Specialist.
      </div>

    </div>
  );
}