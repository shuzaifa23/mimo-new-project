"use client";

import Link from "next/link";
import { Sparkles, Truck, FileStack } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const isOldUser = localStorage.getItem("student_phone");
    if (isOldUser) {
      router.push("/upload");
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-white dark:bg-zinc-950 transition-colors duration-300 relative">

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="relative w-full max-w-6xl mx-auto px-4 pt-28 sm:pt-36 md:pt-40 pb-16 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-outfit font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
              You Focus on <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-[#66DFC0] via-[#2DBDD5] to-[#2553B5] bg-clip-text text-transparent pb-2 block md:inline">Your Research.</span>
            </h1>
          </div>
          <div className="flex-1 w-full flex justify-center md:justify-end relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[400px] bg-gradient-to-tr from-[#66DFC0]/40 to-[#2553B5]/40 blur-[80px] -z-10 rounded-full"></div>
            <div className="relative w-full max-w-[400px] group mix-blend-multiply dark:mix-blend-normal overflow-hidden rounded-[2rem] shadow-2xl">
              {/* Fallback styling in case image is missing */}
              <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 flex flex-col items-center justify-center text-center p-6 text-zinc-400 -z-10">
                <FileStack size={48} className="mb-4 opacity-50" />
                <p>Please save the student image as <br /> <code className="text-xs bg-zinc-200 dark:bg-zinc-800 p-1 rounded">public/images/student-stressed.png</code></p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/student-stressed.png"
                alt="Student stressed with papers"
                className="w-full h-full object-cover relative z-10 transform transition-transform duration-700 group-hover:scale-105"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            </div>
          </div>
        </section>

        {/* Feature Section 1 */}
        <section className="w-full bg-white dark:bg-zinc-950 py-20">
          <div className="max-w-6xl mx-auto px-4 flex flex-col-reverse md:flex-row items-center gap-12">
            <div className="flex-1 w-full relative flex justify-center md:justify-start">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[500px] bg-gradient-to-tr from-[#2DBDD5]/30 to-[#66DFC0]/30 blur-[80px] -z-10 rounded-full"></div>
              <div className="relative w-full max-w-[500px] group mix-blend-multiply dark:mix-blend-normal overflow-hidden rounded-[2rem] shadow-2xl">
                <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 flex flex-col items-center justify-center text-center p-6 text-zinc-500 -z-10">
                  <p>Please save the bear image as <br /> <code className="text-xs bg-zinc-300 dark:bg-zinc-700 p-1 rounded">public/images/bear-notebooks.png</code></p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/bear-notebooks.png"
                  alt="AI Assistant Bear"
                  className="w-full h-full object-cover relative z-10 transform transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-5xl sm:text-7xl md:text-8xl font-outfit font-black tracking-tight text-zinc-900 dark:text-white mb-6 leading-[1.1]">
                We Print, Bind, <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-[#66DFC0] via-[#2DBDD5] to-[#2553B5] bg-clip-text text-transparent pb-2 block md:inline">and Prepare.</span>
              </h2>
            </div>
          </div>
        </section>

        {/* Feature Section 2 */}
        <section className="relative w-full min-h-[80vh] sm:min-h-[90vh] md:min-h-screen flex items-start pt-24 sm:pt-0 sm:items-center overflow-hidden">
          <div className="absolute inset-0 z-0 [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:[mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_80%,transparent_100%)] md:[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_80%,transparent_100%)]">
            {/* Fallback styling in case image is missing */}
            <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <p>Please save the handoff image as <br /> <code className="text-xs bg-zinc-200 dark:bg-zinc-800 p-1 rounded">public/images/bear-handoff.png</code></p>
            </div>
            <img
              src="/images/bear-handoff.png"
              alt="Bear handing project to student"
              className="w-full h-full object-cover object-[30%_center] sm:object-center relative z-10"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
            <div className="absolute inset-0 z-20 bg-gradient-to-b from-zinc-950/90 via-zinc-950/50 to-transparent md:bg-gradient-to-r md:from-zinc-950/80 md:via-zinc-950/20 md:to-transparent pointer-events-none"></div>
          </div>

          <div className="relative z-30 w-full max-w-6xl mx-auto px-4 py-8 sm:py-24 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-left w-full max-w-2xl">
              <h2 className="text-6xl sm:text-8xl md:text-9xl font-outfit font-black tracking-tighter text-white mb-6 leading-[1.0] drop-shadow-2xl">
                We Deliver <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-[#66DFC0] via-[#2DBDD5] to-[#4AA5FF] bg-clip-text text-transparent pb-4 block sm:inline drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">Your Relief.</span>
              </h2>
              <div className="mt-[35vh] sm:mt-10 flex flex-col sm:flex-row items-center justify-start gap-4 w-full pb-4 sm:pb-0">
                <Link
                  href="/student/login?next=/upload"
                  className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-[#28AEDC] to-[#2553B5] hover:from-[#3ACFC6] hover:to-[#2568C2] text-white rounded-2xl font-black text-xl transition-all shadow-xl shadow-[#28AEDC]/30 hover:shadow-[#2DBDD5]/50 hover:-translate-y-1 inline-flex items-center justify-center"
                >
                  Start Printing
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full hidden md:flex justify-end">
              {/* Keeping the right side empty so the background image is fully visible on this side */}
            </div>
          </div>
        </section>


      </main>

      {/* Footer */}
      <footer className="bg-white py-8 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 text-center flex flex-col items-center">
          <Link href="/vendor" className="inline-flex items-center justify-center transition-transform hover:scale-105 active:scale-95 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mimo-x-light.png" alt="MIMO X Logo" className="w-28 md:w-36 h-8 md:h-10 object-cover object-center block dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mimo-x-dark.png" alt="MIMO X Logo" className="w-28 md:w-36 h-8 md:h-10 object-cover object-center hidden dark:block" />
          </Link>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
            Software Designed & Developed by{" "}
            <Link href="/admin" className="font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent hover:from-cyan-400 hover:to-blue-400 transition-colors">
              S Md Huzaifa
            </Link>
          </p>
          <p className="mt-2 text-xs font-medium text-zinc-800 dark:text-zinc-400">
            © {new Date().getFullYear()} Vision Printt Technologies. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

