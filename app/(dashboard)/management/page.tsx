"use client";

import React, { useState } from "react";
import { Users, UserRound, IndianRupee, Building2, ListChecks, FileDown } from "lucide-react";
import { RoleGaurd } from "@/src/security/RoleGuard";
import ManageUsersModal from "@/src/components/ManageUsersModal";
import ManagePatientsModal from "@/src/components/ManagePatientsModal";
import RevenueModal from "@/src/components/RevenueModal";
import ManageHospitalsModal from "@/src/components/ManageHospitalsModal";
import MasterDataModal from "@/src/components/MasterDataModal";
import ReportsModal from "@/src/components/ReportsModal";

const Page = () => {
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [patientsModalOpen, setPatientsModalOpen] = useState(false);
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [hospitalsModalOpen, setHospitalsModalOpen] = useState(false);
  const [masterDataModalOpen, setMasterDataModalOpen] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);

  return (
    <RoleGaurd allowed={["ADMIN"]}>
      <div className="flex flex-col gap-4 bg-slate-50 p-4 sm:p-6 md:p-8">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Management</h1>
          <p className="text-xs text-slate-500">Manage clinic staff and access.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => setUsersModalOpen(true)}
            className="flex items-start gap-3 rounded-[10px] border border-[#E5E7EB] bg-white p-4 text-left shadow-sm transition-all duration-150 hover:border-[var(--brand-primary)]/40 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
              <Users size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">Manage Users</p>
              <p className="mt-0.5 text-xs text-slate-400">
                View and edit doctors, nurses, and admins.
              </p>
            </div>
          </button>

          <button
            onClick={() => setPatientsModalOpen(true)}
            className="flex items-start gap-3 rounded-[10px] border border-[#E5E7EB] bg-white p-4 text-left shadow-sm transition-all duration-150 hover:border-[var(--brand-primary)]/40 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
              <UserRound size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">Manage Patients</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Search patients, view history, and edit details.
              </p>
            </div>
          </button>

          <button
            onClick={() => setRevenueModalOpen(true)}
            className="flex items-start gap-3 rounded-[10px] border border-[#E5E7EB] bg-white p-4 text-left shadow-sm transition-all duration-150 hover:border-[var(--brand-primary)]/40 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
              <IndianRupee size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">Revenue</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Organization and per-doctor revenue by date range.
              </p>
            </div>
          </button>

          <button
            onClick={() => setHospitalsModalOpen(true)}
            className="flex items-start gap-3 rounded-[10px] border border-[#E5E7EB] bg-white p-4 text-left shadow-sm transition-all duration-150 hover:border-[var(--brand-primary)]/40 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
              <Building2 size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">Manage Hospitals</p>
              <p className="mt-0.5 text-xs text-slate-400">
                View, add, and edit hospitals.
              </p>
            </div>
          </button>

          <button
            onClick={() => setMasterDataModalOpen(true)}
            className="flex items-start gap-3 rounded-[10px] border border-[#E5E7EB] bg-white p-4 text-left shadow-sm transition-all duration-150 hover:border-[var(--brand-primary)]/40 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
              <ListChecks size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">Master Data</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Diagnoses, complaints, medicines, and YouTube links.
              </p>
            </div>
          </button>

          <button
            onClick={() => setReportsModalOpen(true)}
            className="flex items-start gap-3 rounded-[10px] border border-[#E5E7EB] bg-white p-4 text-left shadow-sm transition-all duration-150 hover:border-[var(--brand-primary)]/40 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
              <FileDown size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">Reports</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Download patient, appointment, and consultation records as Excel or PDF.
              </p>
            </div>
          </button>
        </div>
      </div>

      <ManageUsersModal open={usersModalOpen} onClose={() => setUsersModalOpen(false)} />
      <ManagePatientsModal open={patientsModalOpen} onClose={() => setPatientsModalOpen(false)} />
      <RevenueModal open={revenueModalOpen} onClose={() => setRevenueModalOpen(false)} />
      <ManageHospitalsModal open={hospitalsModalOpen} onClose={() => setHospitalsModalOpen(false)} />
      <MasterDataModal open={masterDataModalOpen} onClose={() => setMasterDataModalOpen(false)} />
      <ReportsModal open={reportsModalOpen} onClose={() => setReportsModalOpen(false)} />
    </RoleGaurd>
  );
};

export default Page;
