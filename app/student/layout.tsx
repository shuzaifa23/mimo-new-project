"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/student/login";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-16">
      {!isLoginPage && (
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="flex gap-6 border-b border-zinc-200 pb-3 dark:border-zinc-800">
            <Link 
              href="/student/order" 
              className={`text-sm font-bold transition-colors ${
                pathname === "/student/order" 
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-3 -mb-[14px]" 
                  : "text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
              }`}
            >
              Order Print
            </Link>
            <Link 
              href="/student/research" 
              className={`text-sm font-bold transition-colors ${
                pathname === "/student/research" 
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-3 -mb-[14px]" 
                  : "text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
              }`}
            >
              Research Paper
            </Link>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
