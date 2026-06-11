"use client";

import Link from "next/link";
import { Button } from "@/components/ui/core";
import { Printer, FileText, ArrowRight, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300 relative overflow-x-hidden">
      {/* Fixed background container to prevent image stretching over scroll height */}
      <div 
        style={{ backgroundImage: 'var(--bg-mockup)' }}
        className="fixed inset-0 -z-10 bg-white dark:bg-zinc-950 bg-[length:125%_auto] xs:bg-[length:115%_auto] sm:bg-cover md:bg-[length:100%_100%] bg-center bg-no-repeat transition-colors duration-300" 
      />

      <main className="flex-1 flex flex-col justify-center items-center px-4 pt-20 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20">
        {/* Hero Section */}
        <section className="relative w-full max-w-4xl text-center">

          <h1 className="mt-6 text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
            From Screen, <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">To Sheets.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto font-medium">
            Upload documents, enter your specifications, and get them delivered to YOU. <span className="italic font-bold">No more Waiting</span> for 200 pages to print !
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm sm:max-w-none mx-auto px-4">
            <Link href="/student/order" className="w-full sm:w-auto block">
              <Button size="lg" className="h-14 w-full px-8 text-base sm:text-lg rounded-2xl shadow-lg shadow-indigo-600/35 hover:shadow-indigo-600/50 font-bold transition-all">
                Start Printing Now
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white/90 py-10 dark:border-zinc-800 dark:bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Link href="/vendor" className="inline-flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
            <img src="/mimo-x-light.png" alt="MIMO X Logo" className="h-6 object-contain block dark:hidden" />
            <img src="/mimo-x-dark.png" alt="MIMO X Logo" className="h-6 object-contain hidden dark:block" />
          </Link>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            © 2026 vision printt technologies All rights reserved by{" "}
            <Link href="/admin" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
              S.Huzaifa
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
