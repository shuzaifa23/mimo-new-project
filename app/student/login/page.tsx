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
            className="flex items-end"
          >
            <img src="/mimo-x-light.png" alt="MIMO X Logo" className="h-8 md:h-10 object-contain block dark:hidden" />
            <img src="/mimo-x-dark.png" alt="MIMO X Logo" className="h-8 md:h-10 object-contain hidden dark:block" />
          </div>
          <span 
            style={{ transform: "translateZ(10px)" }}
            className="text-[10px] md:text-xs font-black tracking-widest text-zinc-900 dark:text-white -ml-4 md:-ml-5 mb-1 md:mb-1.5 italic uppercase"
          >
            PRESS
          </span>
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
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
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
          router.push("/");
          router.refresh();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage({ type: "success", text: "Welcome back! Redirecting..." });
        router.push("/");
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

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/`,
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
    <div className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 py-12">
      {/* Logo in Top Left */}
      <div className="absolute top-4 left-4 z-50">
        <ThreeDLogo />
      </div>

      {/* Theme Toggle in Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 translate-x-1/2 rounded-full bg-pink-400/20 blur-3xl dark:bg-pink-600/10" />

      <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-zinc-200/60 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/70 dark:shadow-none sm:p-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {isSignUp ? "Create Account" : "Welcome to MIMO"}
          </h2>
          <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {isSignUp 
              ? "Sign up to track and place your print orders" 
              : "Sign in to access your student portal"}
          </p>
        </div>

        {message && (
          <div className={`mb-6 rounded-2xl p-4 text-sm font-bold border ${
            message.type === "success" 
              ? "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400" 
              : "bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-12"
                required
                disabled={loading || googleLoading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-12"
                required
                disabled={loading || googleLoading}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-2xl font-bold mt-2"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {isSignUp ? "Sign Up" : "Sign In"}
                <ArrowRight size={16} className="ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-zinc-400 dark:bg-zinc-900 font-bold tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-12 rounded-2xl font-bold gap-3 border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
          onClick={handleGoogleAuth}
          disabled={loading || googleLoading}
        >
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </Button>

        <p className="mt-8 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
          <button
            type="button"
            className="font-bold text-indigo-600 hover:underline dark:text-indigo-400"
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
      <div className="relative flex min-h-[85vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-zinc-500 font-bold text-sm">Loading Student Portal...</p>
        </div>
      </div>
    }>
      <StudentLoginForm />
    </Suspense>
  );
}
