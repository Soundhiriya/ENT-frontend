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
    className={`flex-1 min-w-0 overflow-x-hidden transition-all duration-150 ${
        collapsed ? "ml-[72px]" : "ml-[220px]"
    }`}
    >
    <TopBar />
    {children}
    </main>
</div>
);
};

export default DashboardLayout;