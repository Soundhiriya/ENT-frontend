"use client";

import { useState } from "react";
import { X } from "lucide-react";
import SimpleMasterListTab from "./SimpleMasterListTab";
import YoutubeLinkMasterTab from "./YoutubeLinkMasterTab";
import {
    DiagnosesDropdown,
    ComplaintDropdown,
    MedicineDropdown,
    getDiagnosesMasterData,
    getComplaintMasterData,
    getMedicineMasterData,
    createDiagnosisMaster,
    updateDiagnosisMaster,
    deleteDiagnosisMaster,
    createComplaintMaster,
    updateComplaintMaster,
    deleteComplaintMaster,
    createMedicineMaster,
    updateMedicineMaster,
    deleteMedicineMaster,
} from "@/src/services/masterservices";

interface Props {
    open: boolean;
    onClose: () => void;
}

type Tab = "diagnoses" | "complaints" | "medicines" | "youtube";

const TABS: { key: Tab; label: string }[] = [
    { key: "diagnoses", label: "Diagnoses" },
    { key: "complaints", label: "Chief Complaints" },
    { key: "medicines", label: "Medicines" },
    { key: "youtube", label: "YouTube Links" },
];

export default function MasterDataModal({ open, onClose }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("diagnoses");

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-[10px] border border-[#E5E7EB] bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Master Data</h2>
                        <p className="text-xs text-slate-400">
                            Manage the diagnoses, complaints, medicines, and YouTube links doctors pick
                            from
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-8 w-8 max-lg:h-10 max-lg:w-10 items-center justify-center rounded-[10px] text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto border-b border-[#E5E7EB] px-4 pt-2">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`shrink-0 whitespace-nowrap rounded-t-[10px] px-3 py-2 text-xs font-medium transition-colors duration-150 max-lg:min-h-[40px] ${
                                activeTab === tab.key
                                    ? "border-b-2 border-[var(--brand-primary)] text-[var(--brand-primary)]"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Scrollable body — all four tabs stay mounted for the
                    modal's lifetime (each fetches its own data once) and
                    switching just toggles visibility, so it's instant and
                    doesn't re-fetch/flash every time you click a tab. */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className={activeTab === "diagnoses" ? "block" : "hidden"}>
                        <SimpleMasterListTab<DiagnosesDropdown>
                            label="Diagnosis"
                            placeholder="Enter diagnosis"
                            fetchAll={getDiagnosesMasterData}
                            create={createDiagnosisMaster}
                            update={updateDiagnosisMaster}
                            remove={deleteDiagnosisMaster}
                            getValue={(item) => item.diagnosis}
                        />
                    </div>

                    <div className={activeTab === "complaints" ? "block" : "hidden"}>
                        <SimpleMasterListTab<ComplaintDropdown>
                            label="Complaint"
                            placeholder="Enter chief complaint"
                            fetchAll={getComplaintMasterData}
                            create={createComplaintMaster}
                            update={updateComplaintMaster}
                            remove={deleteComplaintMaster}
                            getValue={(item) => item.complaint}
                        />
                    </div>

                    <div className={activeTab === "medicines" ? "block" : "hidden"}>
                        <SimpleMasterListTab<MedicineDropdown>
                            label="Medicine"
                            placeholder="Enter medicine name"
                            fetchAll={getMedicineMasterData}
                            create={createMedicineMaster}
                            update={updateMedicineMaster}
                            remove={deleteMedicineMaster}
                            getValue={(item) => item.medicineName}
                        />
                    </div>

                    <div className={activeTab === "youtube" ? "block" : "hidden"}>
                        <YoutubeLinkMasterTab />
                    </div>
                </div>
            </div>
        </div>
    );
}
