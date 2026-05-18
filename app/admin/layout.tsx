import React from 'react';
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminDashboardWrapper } from "@/components/admin/DashboardWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  /*
  if (!user) {
    redirect('/admin/login');
  }

  // Double check role on server side
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/admin/login?error=unauthorized');
  }
  */

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AdminDashboardWrapper>
        {children}
      </AdminDashboardWrapper>
    </div>
  );
}
