import React from 'react';
import { AdminDashboardWrapper } from "@/components/admin/DashboardWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth is handled client-side in AdminDashboardWrapper via sessionStorage
  // Server-side Supabase auth check is intentionally skipped here

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--admin-bg)' }}>
      <AdminDashboardWrapper>
        {children}
      </AdminDashboardWrapper>
    </div>
  );
}
