"use client";

import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminNavbar } from "@/components/admin/Navbar";
import { useState } from "react";

export function AdminDashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </>
  );
}
