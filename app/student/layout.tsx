"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex gap-6 overflow-x-auto whitespace-nowrap border-b border-zinc-200 pb-3 dark:border-zinc-800 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
