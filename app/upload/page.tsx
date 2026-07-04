"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { useGlobalFile } from "@/components/FileContext";

export default function UploadPage() {
  const router = useRouter();
  const { setFile } = useGlobalFile();
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [progress, setProgress] = useState(0);

  const processFileAndRedirect = (selectedFile: File) => {
    setFile(selectedFile);
    setIsUploading(true);
    setProgress(0);
    setLoadingText("Uploading document...");

    // Simulate an attractive loading sequence
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress > 90) currentProgress = 90;
      setProgress(currentProgress);
    }, 300);

    setTimeout(() => setLoadingText("Analyzing pages..."), 1000);
    setTimeout(() => setLoadingText("Preparing print options..."), 2000);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        router.push("/student/order");
      }, 300);
    }, 2800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && !isUploading) {
      processFileAndRedirect(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
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

      <main className="flex-1 flex flex-col justify-center items-center px-4 pt-20 pb-12">
        <section className="relative w-full max-w-4xl text-center">
          <h1 className="mt-6 text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
            From Screen, <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">To Sheets.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto font-medium">
            Upload documents, enter your specifications, and get them delivered to YOU. <span className="italic font-bold">No more Waiting</span> for 200 pages to print!
          </p>
          <div className="mt-10 flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`w-full relative rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center transition-all ${
                isUploading ? "cursor-wait opacity-80" : "cursor-pointer"
              } ${
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
                disabled={isUploading}
              />
              <label htmlFor="home-file-upload" className={`block w-full h-full ${isUploading ? 'cursor-wait pointer-events-none' : 'cursor-pointer'}`}>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                  {isUploading ? (
                    <Loader2 size={32} className="animate-spin text-indigo-600" />
                  ) : (
                    <Upload size={32} />
                  )}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {isUploading ? "Processing..." : "Drag & drop or click to upload"}
                </h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  {isUploading ? "Please wait while we prepare your file" : "PDF, DOC, or Images up to 20MB"}
                </p>
              </label>
            </div>

            {/* Loading Status Indicator beneath upload box */}
            <div className={`w-full transition-all duration-500 ease-out overflow-hidden ${isUploading ? 'max-h-24 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
              <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
                    {loadingText}
                  </span>
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
