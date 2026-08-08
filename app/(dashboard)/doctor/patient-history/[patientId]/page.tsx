"use client";

import { useParams, useRouter } from "next/navigation";
import { RoleGaurd } from "@/src/security/RoleGuard";
import PatientHistoryModal from "@/src/components/PatientHistoryModal";

// Standalone route for a direct/bookmarked link to a patient's history.
// The in-workflow "History" button on /doctor opens PatientHistoryModal
// directly instead of navigating here, so an in-progress consultation form
// never gets unmounted — see doctor/page.tsx.
export default function PatientHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = Number(params.patientId);

  return (
    <RoleGaurd allowed={["ADMIN", "DOCTOR"]}>
      <PatientHistoryModal patientId={patientId} onClose={() => router.back()} />
    </RoleGaurd>
  );
}
