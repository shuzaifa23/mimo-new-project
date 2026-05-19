"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui/core';
import { supabase } from '@/lib/supabase';

export default function VendorLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (email === "visionprintt@gmail.com" && password === "Vishal@2006") {
      localStorage.setItem("vendor-auth", "true");
      localStorage.setItem("vendor-email", email);
      router.push('/vendor/orders');
      router.refresh();
      setLoading(false);
      return;
    }

    // Clear any broken or expired sessions before attempting login
    await supabase.auth.signOut();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      setError(error?.message || 'Invalid credentials.');
      setLoading(false);
      return;
    }

    // Verify role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role !== 'vendor' && profile?.role !== 'admin') {
      await supabase.auth.signOut();
      setError('Access denied. Vendor account required.');
      setLoading(false);
      return;
    }

    router.push('/vendor/orders');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-emerald-50/30 to-zinc-50 px-4 dark:from-zinc-950 dark:via-emerald-950/20 dark:to-zinc-950">
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-2xl shadow-emerald-500/30 ring-4 ring-emerald-600/20">
            <Store size={30} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Vendor Portal</h1>
          <p className="mt-2 text-sm text-zinc-500">Manage your assigned print orders</p>
        </div>

        <div className="rounded-3xl border border-zinc-200/80 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/80">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Email Address</label>
              <Input
                type="email"
                placeholder="vendor@mimo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              type="submit"
              className="w-full h-12 gap-2 bg-emerald-600 text-base font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
              {loading ? 'Signing in…' : 'Sign In to Vendor Portal'}
              {!loading && <ArrowRight size={16} className="ml-1 opacity-60" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
