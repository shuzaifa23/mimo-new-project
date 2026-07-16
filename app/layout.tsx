import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Outfit } from "next/font/google";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MIMO X PRESS | The Ultimate Student Printing Portal",
  description: "Lightning-fast modern student printing platform. Experience seamless document printing and order tracking with MIMO X PRESS.",
};

import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FileProvider } from "@/components/FileContext";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6488030243565665"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white transition-colors duration-300 dark:bg-zinc-950">
        <ThemeProvider>
          <FileProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </FileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
