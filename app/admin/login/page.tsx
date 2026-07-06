"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PackageCheck, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui/core';
import { signInAdmin } from '@/lib/admin-api';

import ThemeToggle from '@/components/ThemeToggle';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const lowerEmail = email.trim().toLowerCase();

    // Hardcoded bypass for vendor-admin access (no Supabase auth account needed)
    if (lowerEmail === "visionprintt@gmail.com" && password === "Vishal@2006") {
      sessionStorage.setItem("admin-auth", "true");
      router.push('/admin');
      router.refresh();
      setLoading(false);
      return;
    }

    const { user, error } = await signInAdmin(email, password);

    if (error || !user) {
      setError((error as any)?.message || 'Invalid credentials. Please try again.');
      setLoading(false);
      return;
    }

    sessionStorage.setItem("admin-auth", "true");
    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 relative">
      {/* Theme Toggle in Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background grid pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      <div className="relative w-full max-w-md">
        {/* Logo & Heading */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex items-center justify-center">
            <img src="/mimo-x-light.png" alt="MIMO X Logo" className="w-48 md:w-56 h-auto object-contain block dark:hidden mix-blend-multiply" />
            <img src="/mimo-x-dark.png" alt="MIMO X Logo" className="w-48 md:w-56 h-auto object-contain hidden dark:block" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Admin Console</h1>
          <p className="mt-2 text-sm text-zinc-500">Secure admin console — authorized users only</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/80">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                Admin Email
              </label>
              <Input
                id="admin-email"
                type="email"
                placeholder="you@mimo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
              </div>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-600 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-400">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              id="admin-login-btn"
              type="submit"
              className="w-full h-12 gap-2 text-base font-bold shadow-lg shadow-violet-500/20 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)', color: '#fff' }}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <ShieldCheck size={20} />
              )}
              {loading ? 'Signing in…' : 'Sign In to Console'}
              {!loading && <ArrowRight size={16} className="ml-1 opacity-60" />}
            </Button>
          </form>
        </div>

        <div className="mt-8 flex flex-col items-center gap-1.5 text-center">
          <p className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">
            Software Designed & Developed by <span className="font-bold text-indigo-600 dark:text-indigo-400">S Huzaifa</span>
          </p>
          <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
            &copy; 2026 Vision Printt Technologies. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
