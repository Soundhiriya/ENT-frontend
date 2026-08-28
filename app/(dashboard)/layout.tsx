"use client";

import SideBar from "@/src/components/SideBar";
import TopBar from "@/src/components/TopBar";
import React, { useState } from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
const [sidebarOpen, setSidebarOpen] = useState(false);
const [collapsed, setCollapsed] = useState(true);

return (
<div className="flex min-h-screen">
    <SideBar
    sidebarOpen={sidebarOpen}
    setSidebarOpen={setSidebarOpen}
    collapsed={collapsed}
    setCollapsed={setCollapsed}
    />

    <main
    // print:ml-0 — the sidebar is hidden when printing, so its gutter must
    // collapse too, otherwise printed content sits off-centre on the sheet.
    className={`flex-1 min-w-0 overflow-x-hidden transition-all duration-150 print:ml-0 ${
        collapsed ? "md:ml-[72px]" : "md:ml-[220px]"
    }`}
    >
    <TopBar onOpenSidebar={() => setSidebarOpen(true)} />
    {children}
    </main>
</div>
);
};

export default DashboardLayout;