// PrescriptionPreviewModal.tsx
// Shown when the doctor clicks "Save Consultation".
// This renders the prescription preview from the current unsaved form state
// and requires explicit confirmation before the actual save happens.

"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

import PrescriptionView from "./PrescriptionView";

import { PrescriptionViewData } from "@/src/types/prescription";

import {
  AppointmentDetailsDto,
  ChargeDto,
  ComplaintDto,
  DiagnosisDto,
  FindingDto,
  MedicineDto,
  YoutubeVideoDto,
} from "@/src/types/consultationtypes";

interface PrescriptionPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  saving: boolean;

  appointmentDetails: AppointmentDetailsDto | null;

  complaints: ComplaintDto[];
  findings: FindingDto[];
  otoendoscopies: FindingDto[];
  diagnosticNasalEndoscopies: FindingDto[];
  videoLaryngoscopies: FindingDto[];

  diagnoses: DiagnosisDto[];

  medicines: MedicineDto[];
  charges: ChargeDto[];

  consultationFee: string;
  advice: string;
  followUpDate: string;

  endoscopyImages: File[];
  youtubeVideos: YoutubeVideoDto[];
}

// ================================================================
// Calculate Age
// ================================================================

function calculateAge(dateOfBirth?: string | null): number | null {
  if (!dateOfBirth) {
    return null;
  }

  const today = new Date();
  const dob = new Date(dateOfBirth);

  let age =
    today.getFullYear() -
    dob.getFullYear();

  const month =
    today.getMonth() -
    dob.getMonth();

  if (
    month < 0 ||
    (
      month === 0 &&
      today.getDate() < dob.getDate()
    )
  ) {
    age--;
  }

  return age;
}

// ================================================================
// Format Chief Complaint
//
// LEFT + Fever
//      -> LEFT - Fever
//
// RIGHT + Cold
//      -> RIGHT - Cold
//
// BILATERAL + Pain
//      -> BILATERAL - Pain
//
// OVERALL + Headache
//      -> OVERALL - Headache
//
// NONE + Headache
//      -> NONE - Headache
// ================================================================

function formatComplaint(
  complaint: string,
  side?: string | null
): string {

  if (!complaint || complaint.trim() === "") {
    return complaint;
  }

  const formattedComplaint =
    complaint.trim();

  if (!side || side.trim() === "") {
    return formattedComplaint;
  }

  const normalizedSide =
    side.trim().toUpperCase();

  // ------------------------------------------------------------
  // LEFT - Fever
  // RIGHT - Cold
  // BILATERAL - Pain
  // OVERALL - Headache
  // NONE - Headache
  // ------------------------------------------------------------

  return `${normalizedSide} - ${formattedComplaint}`;
}

// ================================================================
// Format Diagnosis
//
// PROVISIONAL + Viral
//      -> PROVISIONAL - Viral
//
// FINAL + Chronic Sinusitis
//      -> FINAL - Chronic Sinusitis
// ================================================================

function formatDiagnosis(
  diagnosis: string,
  type?: string | null
): string {

  if (!diagnosis || diagnosis.trim() === "") {
    return diagnosis;
  }

  const formattedDiagnosis =
    diagnosis.trim();

  if (!type || type.trim() === "") {
    return formattedDiagnosis;
  }

  const normalizedType =
    type.trim().toUpperCase();

  return `${normalizedType} - ${formattedDiagnosis}`;
}

// ================================================================
// Component
// ================================================================

export default function PrescriptionPreviewModal({
  open,
  onClose,
  onConfirm,
  saving,

  appointmentDetails,

  complaints,
  findings,
  otoendoscopies,
  diagnosticNasalEndoscopies,
  videoLaryngoscopies,

  diagnoses,

  medicines,
  charges,

  consultationFee,
  advice,
  followUpDate,

  endoscopyImages,
  youtubeVideos,
}: PrescriptionPreviewModalProps) {

  const [imageUrls, setImageUrls] =
    useState<string[]>([]);

  // ================================================================
  // Create temporary image URLs for preview
  // ================================================================

  useEffect(() => {

    if (!open) {
      return;
    }

    const urls =
      endoscopyImages.map((file) =>
        URL.createObjectURL(file)
      );

    setImageUrls(urls);

    return () => {

      urls.forEach((url) => {
        URL.revokeObjectURL(url);
      });

    };

  }, [open, endoscopyImages]);

  // ================================================================
  // Prepare formatted complaints
  // ================================================================

  const formattedComplaints =
    useMemo<ComplaintDto[]>(() => {

      return complaints.map((item) => {

        return {
          ...item,

          complaint: formatComplaint(
            item.complaint,
            item.side
          ),
        };

      });

    }, [complaints]);

  // ================================================================
  // Prepare formatted diagnoses
  // ================================================================

  const formattedDiagnoses =
    useMemo<DiagnosisDto[]>(() => {

      return diagnoses.map((item) => {

        return {
          ...item,

          diagnosis: formatDiagnosis(
            item.diagnosis,
            item.type
          ),
        };

      });

    }, [diagnoses]);

  // ================================================================
  // Build Prescription Preview Data
  // ================================================================

  const previewData:
    PrescriptionViewData | null = useMemo(() => {

    if (!appointmentDetails) {
      return null;
    }

    return {

      // ============================================================
      // Hospital
      // ============================================================

      hospitalName:
        appointmentDetails.hospitalName,

      // ============================================================
      // Doctor
      // ============================================================

      doctorName:
        appointmentDetails.doctorName,

      // ============================================================
      // Patient
      // ============================================================

      patientName:
        appointmentDetails.patientName,

      age:
        calculateAge(
          appointmentDetails.dateOfBirth
        ),

      gender:
        appointmentDetails.gender,

      phone:
        appointmentDetails.phone,

      // ============================================================
      // Consultation
      // ============================================================

      consultationDate:
        appointmentDetails.appointmentDate,

      // ============================================================
      // Vitals
      // ============================================================

      bp:
        appointmentDetails.bp,

      temperature:
        appointmentDetails.temperature ?? null,

      weight:
        appointmentDetails.weight ?? null,

      height:
        appointmentDetails.height ?? null,

      // ============================================================
      // Medical History
      // ============================================================

      diabetes:
        appointmentDetails.diabetes ?? null,

      hypertension:
        appointmentDetails.hypertension ?? null,

      tuberculosis:
        appointmentDetails.tuberculosis ?? null,

      bronchialAsthma:
        appointmentDetails.bronchialAsthma ?? null,

      epilepsy:
        appointmentDetails.epilepsy ?? null,

      antenatal:
        appointmentDetails.antenatal ?? null,

      customMedicalHistory:
        appointmentDetails.customMedicalHistory ?? [],

      // ============================================================
      // Billing
      // ============================================================

      consultationFee:
        Number(consultationFee) || 0,

      charges,

      // ============================================================
      // Formatted Complaints
      // ============================================================

      complaints:
        formattedComplaints,

      // ============================================================
      // Findings
      // ============================================================

      findings,

      // ============================================================
      // Otoendoscopy
      // ============================================================

      otoendoscopies,

      // ============================================================
      // Diagnostic Nasal Endoscopy
      // ============================================================

      diagnosticNasalEndoscopies,

      // ============================================================
      // Video Laryngoscopy
      // ============================================================

      videoLaryngoscopies,

      // ============================================================
      // Formatted Diagnoses
      // ============================================================

      diagnoses:
        formattedDiagnoses,

      // ============================================================
      // Medicines
      // ============================================================

      medicines,

      // ============================================================
      // Clinical
      // ============================================================

      advice,

      followUpDate,

      // ============================================================
      // Endoscopy Images
      // ============================================================

      endoscopyImages:
        endoscopyImages.map(
          (file, index) => ({
            imageUrl:
              imageUrls[index] ?? "",

            imageName:
              file.name,

            displayOrder:
              index + 1,
          })
        ),

      // ============================================================
      // YouTube Videos
      // ============================================================

      youtubeVideos,

    };

  }, [
    appointmentDetails,

    consultationFee,
    charges,

    formattedComplaints,

    findings,
    otoendoscopies,
    diagnosticNasalEndoscopies,
    videoLaryngoscopies,

    formattedDiagnoses,

    medicines,

    advice,
    followUpDate,

    endoscopyImages,
    imageUrls,

    youtubeVideos,
  ]);

  // ================================================================
  // Don't render when closed
  // ================================================================

  if (!open) {
    return null;
  }

  // ================================================================
  // Render
  // ================================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* ==========================================================
            Header
        ========================================================== */}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">

          <div>

            <h2 className="text-sm font-semibold text-slate-800">
              Review Prescription
            </h2>

            <p className="text-xs text-slate-500">
              This is exactly what will be saved — review before confirming.
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </button>

        </div>

        {/* ==========================================================
            Warning
        ========================================================== */}

        <div className="mx-5 mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">

          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />

          <span>
            Once saved, this consultation cannot be edited.
            Please check every section carefully before confirming.
          </span>

        </div>

        {/* ==========================================================
            Prescription Preview
        ========================================================== */}

        <div className="flex-1 overflow-y-auto bg-slate-100 p-4">

          {previewData ? (

            <PrescriptionView
              data={previewData}
            />

          ) : (

            <div className="flex h-40 items-center justify-center text-sm text-slate-500">

              Appointment details not loaded yet.

            </div>

          )}

        </div>

        {/* ==========================================================
            Footer
        ========================================================== */}

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">

          {/* Keep Editing */}

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Keep Editing
          </button>

          {/* Confirm & Save */}

          <button
            type="button"
            onClick={onConfirm}
            disabled={
              saving ||
              !previewData
            }
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {saving && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {saving
              ? "Saving..."
              : "Confirm & Save"}

          </button>

        </div>

      </div>

    </div>
  );
}