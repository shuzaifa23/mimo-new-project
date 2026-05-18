"use client";

import Link from "next/link";
import { Button } from "@/components/ui/core";
import { Printer, FileText, ArrowRight, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="absolute left-1/2 top-0 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_farthest-side,rgba(79,70,229,0.08),transparent)]"></div>
          
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-900/30 dark:bg-indigo-900/20 dark:text-indigo-300">
              <Zap size={14} />
              <span>Modernizing Printing for Students</span>
            </div>
            <h1 className="mt-6 text-5xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-7xl">
              From Screen, <br />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">To Sheets.</span>
            </h1>
            <p className="mt-4 text-xl text-zinc-600 dark:text-zinc-400 sm:mx-auto sm:max-w-2xl">
              Upload documents, select your preferences, and get them printed at your nearest partner shop. No more waiting in lines.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/student/order">
                <Button size="lg" className="h-14 w-full px-8 text-lg sm:w-auto">
                  Start Printing Now
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link href="/student/research">
                <Button variant="outline" size="lg" className="h-14 w-full px-8 text-lg sm:w-auto">
                  Research Template
                  <FileText className="ml-2 text-indigo-600" size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Link href="/vendor" className="inline-flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Printer size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">MIMO<span className="text-indigo-600">Print</span></span>
          </Link>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            © 2026 MIMO Vision Print. All rights reserved by{" "}
            <Link href="/admin" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
              S.Huzaifa
            </Link>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
