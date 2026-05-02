"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Printer, LayoutDashboard, Home, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/core";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Printer size={22} />
          </div>
          <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
            MIMO <span className="text-indigo-600 italic uppercase">Vision Print</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link 
            href="/" 
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${pathname === '/' ? 'text-indigo-600' : 'text-zinc-500 hover:text-indigo-600'}`}
          >
            <Home size={16} />
            <span>Home</span>
          </Link>
          <Link 
            href="/student/order" 
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${pathname.startsWith('/student/order') ? 'text-indigo-600' : 'text-zinc-500 hover:text-indigo-600'}`}
          >
            <PlusCircle size={16} />
            <span>New Order</span>
          </Link>
          <Link 
            href="/student" 
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${pathname === '/student' ? 'text-indigo-600' : 'text-zinc-500 hover:text-indigo-600'}`}
          >
            <LayoutDashboard size={16} />
            <span>Track Order</span>
          </Link>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-4">
          <Link href="/student/order" className="hidden sm:block">
            <Button size="sm" className="h-9 px-4 rounded-full font-bold shadow-md shadow-indigo-500/20">
              Print Now
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
