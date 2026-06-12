"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { useGlobalFile } from "@/components/FileContext";

export default function Home() {
  const router = useRouter();
  const { setFile } = useGlobalFile();
  const [dragActive, setDragActive] = useState(false);

  const processFileAndRedirect = (selectedFile: File) => {
    setFile(selectedFile);
    router.push("/student/order");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFileAndRedirect(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileAndRedirect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-white dark:bg-zinc-950 transition-colors duration-300 relative overflow-x-hidden">
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
          <div className="mt-10 flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`w-full relative rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center transition-all cursor-pointer ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 scale-[1.02]"
                  : "border-zinc-300 bg-white/80 hover:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900/80 backdrop-blur-sm"
              }`}
            >
              <input
                type="file"
                id="home-file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
              />
              <label htmlFor="home-file-upload" className="cursor-pointer block w-full h-full">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                  <Upload size={32} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Drag & drop or click to upload
                </h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  PDF, DOC, or Images up to 20MB
                </p>
              </label>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white/90 py-6 dark:border-zinc-800 dark:bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Link href="/vendor" className="inline-flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
            <img src="/mimo-x-light.png" alt="MIMO X Logo" className="h-5 object-contain block dark:hidden" />
            <img src="/mimo-x-dark.png" alt="MIMO X Logo" className="h-5 object-contain hidden dark:block" />
          </Link>
          <div className="mt-3 flex flex-col items-center gap-1.5">
            <p className="text-sm font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">
              Software Designed & Developed by{" "}
              <Link href="/admin" className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                S Huzaifa
              </Link>
            </p>
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
              © 2026 Vision Printt Technologies. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
