"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { toast } from "sonner";

import { getPatientDetailsById } from "@/src/services/patientService";
import { getPatientHistory } from "@/src/services/prescriptionservice";
import { Patient } from "@/src/types/patient";
import { PrescriptionDto } from "@/src/types/prescription";
import { PageResponse } from "@/src/types/page";
import PrescriptionView from "@/src/components/PrescriptionView";

const PAGE_SIZE = 5;

function calculateAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

interface PatientHistoryModalProps {
  patientId: number;
  onClose: () => void;
}

// Rendered as an overlay on top of whatever's already on screen (usually
// DoctorWorkspace mid-consultation) — deliberately NOT a route navigation,
// so nothing behind it ever unmounts and no in-progress form data is lost.
export default function PatientHistoryModal({
  patientId,
  onClose,
}: PatientHistoryModalProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [historyPage, setHistoryPage] = useState<PageResponse<PrescriptionDto> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isNaN(patientId)) return;

    async function loadPatient() {
      try {
        const response = await getPatientDetailsById(patientId);
        setPatient(response);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load patient details");
      }
    }

    loadPatient();
  }, [patientId]);

  useEffect(() => {
    if (isNaN(patientId)) return;

    async function loadHistory() {
      setLoading(true);
      try {
        const response = await getPatientHistory(patientId, page, PAGE_SIZE);
        setHistoryPage(response);

        if (response.content.length > 0) {
          setExpandedIds(new Set([response.content[0].consultationId]));
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load patient history");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [patientId, page]);

  const toggleExpanded = (consultationId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(consultationId)) {
        next.delete(consultationId);
      } else {
        next.add(consultationId);
      }
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-slate-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — outside the scrollable body, so it's always visible
            and the close button never requires scrolling back up to reach */}
        <div className="flex shrink-0 items-center justify-between bg-blue-900 px-4 py-4 text-white sm:px-8">
          <h1 className="text-base font-semibold sm:text-lg">
            Patient History
            {patient && (
              <span className="font-normal text-blue-200"> — {patient.name}</span>
            )}
          </h1>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-md p-1.5 max-lg:min-h-[40px] max-lg:min-w-[40px] text-blue-100 transition-colors hover:bg-blue-800 hover:text-white"
            aria-label="Close patient history"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-6 sm:px-8">
          {/* Patient info card */}
          {patient && (
            <div className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {patient.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Patient ID: {patient.patientId}
                  </p>
                </div>

                {historyPage && (
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {historyPage.totalElements} Consultation
                    {historyPage.totalElements === 1 ? "" : "s"}
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-slate-400 sm:text-[10px]">
                    Gender
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {patient.gender}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-slate-400 sm:text-[10px]">
                    Age
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {calculateAge(patient.dateOfBirth) ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-slate-400 sm:text-[10px]">
                    Phone
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {patient.phone}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-slate-400 sm:text-[10px]">
                    Location
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {patient.location ?? "-"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Consultation history */}
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Loading history...
            </div>
          ) : !historyPage || historyPage.content.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">
              No consultation history found.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {historyPage.content.map((item, index) => {
                const isExpanded = expandedIds.has(item.consultationId);
                const visitNumber = page * PAGE_SIZE + index + 1;
                const prescriptionUrl =
                  typeof window !== "undefined"
                    ? `${window.location.origin}/patient/prescription/${item.prescriptionToken}`
                    : undefined;

                return (
                  <div
                    key={item.consultationId}
                    className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                  >
                    <button
                      onClick={() => toggleExpanded(item.consultationId)}
                      className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold ${
                            isExpanded
                              ? "bg-blue-900 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {visitNumber}
                        </span>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Dr. {item.doctorName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.diagnoses.length > 0
                              ? item.diagnoses[0].diagnosis
                              : "No diagnosis recorded"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {item.consultationDate}
                        </span>

                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-200 bg-slate-50 p-4">
                        <PrescriptionView
                          data={item}
                          prescriptionUrl={prescriptionUrl}
                          showMediaInline
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {historyPage && historyPage.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={historyPage.first}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 max-lg:min-h-[40px]"
              >
                Previous
              </button>

              <span className="text-xs text-slate-500">
                Page {historyPage.number + 1} of {historyPage.totalPages}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={historyPage.last}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 max-lg:min-h-[40px]"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
