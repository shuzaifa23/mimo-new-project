"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PackageCheck, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui/core';
import { signInAdmin } from '@/lib/admin-api';

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

    const { user, error } = await signInAdmin(email, password);

    if (error || !user) {
      setError((error as any)?.message || 'Invalid credentials. Please try again.');
      setLoading(false);
      return;
    }

    localStorage.setItem("admin-auth", "true");
    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-indigo-50/30 to-zinc-50 px-4 dark:from-zinc-950 dark:via-indigo-950/20 dark:to-zinc-950">
      {/* Background grid pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      <div className="relative w-full max-w-md">
        {/* Logo & Heading */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30 ring-4 ring-indigo-600/20">
            <PackageCheck size={30} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">MIMO Admin</h1>
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
              className="w-full h-12 gap-2 bg-indigo-600 text-base font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-60"
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

        <p className="mt-8 text-center text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} MIMO Printing Platform &mdash; All rights reserved by S. Huzaifa.
        </p>
      </div>
    </div>
  );
}
