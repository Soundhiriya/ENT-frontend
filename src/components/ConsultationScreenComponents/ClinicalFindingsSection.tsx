// ClinicalFindingsSection.tsx

"use client";

import { FindingDto } from "@/src/types/consultationtypes";
import { Ear, Microscope, Video, Wind } from "lucide-react";
import DynamicFindingListEditor from "./DynamicFindingListEditor";

interface ClinicalFindingsSectionProps {
  otoendoscopies: FindingDto[];
  setOtoendoscopies: React.Dispatch<React.SetStateAction<FindingDto[]>>;
  diagnosticNasalEndoscopies: FindingDto[];
  setDiagnosticNasalEndoscopies: React.Dispatch<
    React.SetStateAction<FindingDto[]>
  >;
  videoLaryngoscopies: FindingDto[];
  setVideoLaryngoscopies: React.Dispatch<React.SetStateAction<FindingDto[]>>;
}

export default function ClinicalFindingsSection({
  otoendoscopies,
  setOtoendoscopies,
  diagnosticNasalEndoscopies,
  setDiagnosticNasalEndoscopies,
  videoLaryngoscopies,
  setVideoLaryngoscopies,
}: ClinicalFindingsSectionProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Microscope className="h-3.5 w-3.5" />
        Clinical Findings
      </h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DynamicFindingListEditor
          label="Otoendoscopy"
          icon={Ear}
          items={otoendoscopies}
          setItems={setOtoendoscopies}
        />

        <DynamicFindingListEditor
          label="Diagnostic Nasal Endoscopy"
          icon={Wind}
          items={diagnosticNasalEndoscopies}
          setItems={setDiagnosticNasalEndoscopies}
        />

        <DynamicFindingListEditor
          label="Video Laryngoscopy"
          icon={Video}
          items={videoLaryngoscopies}
          setItems={setVideoLaryngoscopies}
        />
      </div>
    </div>
  );
}
