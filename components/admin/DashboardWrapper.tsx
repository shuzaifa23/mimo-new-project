"use client";

import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminNavbar } from "@/components/admin/Navbar";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AdminDashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check on the login page itself
    if (pathname === "/admin/login") {
      setAuthChecked(true);
      setIsAuthed(true);
      return;
    }

    const admin = sessionStorage.getItem("admin-auth");
    if (!admin) {
      router.replace("/admin/login");
    } else {
      setIsAuthed(true);
    }
    setAuthChecked(true);
  }, [pathname, router]);

  // Show nothing until the auth check completes (prevents content flash)
  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // If not authenticated (and not on login page), render nothing while redirecting
  if (!isAuthed) {
    return null;
  }

  // On the login page, render children without the sidebar/navbar chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

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
