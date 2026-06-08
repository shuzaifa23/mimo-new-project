"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input } from "@/components/ui/core";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, ArrowRight, Sparkles, Loader2 } from "lucide-react";

export default function StudentLoginPage() {
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
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/student`,
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
          router.push("/student");
          router.refresh();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage({ type: "success", text: "Welcome back! Redirecting..." });
        router.push("/student");
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
          redirectTo: `${window.location.origin}/auth/callback?next=/student`,
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
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 translate-x-1/2 rounded-full bg-pink-400/20 blur-3xl dark:bg-pink-600/10" />

      <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-zinc-200/60 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/70 dark:shadow-none sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Sparkles size={26} className="animate-pulse" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
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
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.76 5.76 0 0 1 8.2 12.77a5.76 5.76 0 0 1 5.79-5.77c1.49 0 2.859.55 3.9 1.45l3.05-3.05C19.099 3.73 16.381 2.5 13.99 2.5a9.77 9.77 0 0 0-9.76 9.77 9.77 0 0 0 9.76 9.77c5.44 0 9.76-3.87 9.76-9.77 0-.58-.05-1.17-.15-1.72h-9.61z"
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
