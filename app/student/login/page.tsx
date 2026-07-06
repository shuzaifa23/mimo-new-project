"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input } from "@/components/ui/core";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, ArrowRight, Printer, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";

function ThreeDLogo() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Scale down rotation (max 15 degrees)
    const rotateX = -(y / (rect.height / 2)) * 15;
    const rotateY = (x / (rect.width / 2)) * 15;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <Link href="/">
      <div 
        className="flex h-12 items-center justify-center cursor-pointer select-none"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: "1000px" }}
      >
        <div 
          className="flex items-end gap-0 transition-all duration-200 ease-out p-2 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
          style={{
            transform: isHovered 
              ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(1.05)` 
              : `rotateX(0deg) rotateY(0deg) scale(1)`,
            transformStyle: "preserve-3d"
          }}
        >
          <div 
            style={{ transform: "translateZ(15px)" }}
            className="flex items-center"
          >
            <img src="/mimo-x-light.png" alt="MIMO X Logo" className="w-32 md:w-40 h-auto object-contain block dark:hidden mix-blend-multiply" />
            <img src="/mimo-x-dark.png" alt="MIMO X Logo" className="w-32 md:w-40 h-auto object-contain hidden dark:block" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function StudentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    errorParam === "auth-failed"
      ? { type: "error", text: "Authentication failed. Please try again." }
      : null
  );

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ type: "error", text: "Please enter both email and password." });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const nextPath = searchParams.get("next") || "/";
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${nextPath}`,
          },
        });

        if (error) throw error;
        
        if (data.user && data.session === null) {
          setMessage({
            type: "success",
            text: "Registration successful! Please check your email to confirm your account.",
          });
        } else {
          setMessage({ type: "success", text: "Welcome! Redirecting..." });
          router.push(nextPath);
          router.refresh();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage({ type: "success", text: "Welcome back! Redirecting..." });
        router.push(nextPath);
        router.refresh();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An authentication error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setMessage(null);

    const nextPath = searchParams.get("next") || "/";

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${nextPath}`,
          queryParams: {
            prompt: 'select_account'
          }
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Could not initialize Google login." });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f2fb] to-[#f4f8fb] flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Top Header Section */}
      <div className="flex flex-col items-center mb-8 mt-[-4rem]">
        <div className="bg-white p-4 rounded-3xl shadow-sm mb-4">
          <Printer size={32} className="text-[#2553B5]" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black text-[#2553B5] tracking-tight">
          {isSignUp ? "Sign up for MIMO" : "Sign in to MIMO"}
        </h1>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 sm:p-10 border border-white/50">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-zinc-900">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-zinc-500 mt-2 text-sm">
            {isSignUp ? "Enter your details to create your account" : "Enter your credentials to access your account"}
          </p>
        </div>

        {message && (
          <div className={`mb-6 rounded-2xl p-4 text-sm font-bold border ${
            message.type === "success" 
              ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
              : "bg-rose-50 border-rose-100 text-rose-800"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[15px] font-semibold text-zinc-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-indigo-500" />
              <Input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 bg-slate-300/40 border-slate-300 text-zinc-800 placeholder:text-zinc-400 rounded-xl font-medium focus-visible:ring-2 focus-visible:ring-[#2553B5] focus-visible:bg-white transition-all text-base"
                required
                disabled={loading || googleLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[15px] font-semibold text-zinc-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-14 bg-slate-300/40 border-slate-300 text-zinc-800 placeholder:text-zinc-400 rounded-xl font-medium focus-visible:ring-2 focus-visible:ring-[#2553B5] focus-visible:bg-white transition-all text-lg tracking-widest"
                required
                disabled={loading || googleLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-5 h-5 border-2 border-[#5A85E5] rounded bg-white checked:bg-[#5A85E5] checked:border-[#5A85E5] cursor-pointer transition-all"
                  defaultChecked
                />
                <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-zinc-600 font-semibold group-hover:text-zinc-800 transition-colors">
                Remember me
              </span>
            </label>
            
            <button 
              type="button" 
              className="text-[#2553B5] font-bold hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-14 bg-[#1444b2] hover:bg-[#10368e] text-white rounded-[14px] font-bold text-[16px] mt-4 shadow-lg shadow-blue-900/20"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                {isSignUp ? "Sign Up" : "Sign In"}
                <ArrowRight size={18} />
              </span>
            )}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-[11px] font-bold tracking-widest text-zinc-400">
            <span className="bg-white px-4">OR CONTINUE WITH</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-14 rounded-[14px] font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 shadow-sm gap-3"
          onClick={handleGoogleAuth}
          disabled={loading || googleLoading}
        >
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </Button>

        <p className="mt-8 text-center text-sm font-medium text-zinc-500">
          {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
          <button
            type="button"
            className="font-bold text-[#2553B5] hover:underline"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage(null);
            }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function StudentLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#e6f2fb] to-[#f4f8fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#2553B5]" />
          <p className="text-zinc-500 font-bold text-sm">Loading Student Portal...</p>
        </div>
      </div>
    }>
      <StudentLoginForm />
    </Suspense>
  );
}
