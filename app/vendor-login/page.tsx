"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui/core';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

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

    const lowerEmail = email.trim().toLowerCase();

    // Hardcoded vendor bypass (no Supabase auth account needed)
    if (lowerEmail === "visionprintt@gmail.com" && password === "Vishal@2006") {
      localStorage.setItem("vendor-auth", "true");
      localStorage.setItem("vendor-email", lowerEmail);
      router.push('/vendor/orders');
      router.refresh();
      setLoading(false);
      return;
    }

    try {
      // Clear any broken or expired sessions before attempting login
      await supabase.auth.signOut();

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Direct validation against vendors table
        const { data: vendor, error: vendorError } = await supabase
          .from("vendors")
          .select("*")
          .eq("email", email)
          .single();

        if (vendorError || !vendor) {
          await supabase.auth.signOut();
          setError("Unauthorized: This account does not have vendor access.");
          return;
        }

        // Auto-bind user_id if it's missing in the vendors table
        if (!vendor.user_id) {
          await supabase
            .from("vendors")
            .update({ user_id: data.user.id })
            .eq("email", email);
        }

        // Persist session in localStorage for frontend persistence
        localStorage.setItem("vendor-auth", "true");
        localStorage.setItem("vendor-email", email);
        console.log("LOGIN SAVED");

        // Redirect to vendor dashboard
        router.push('/vendor/orders');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Vendor Portal</h1>
          <p className="text-zinc-500 mt-2">Sign in to manage your print shop orders</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <Input
                  type="email"
                  placeholder="name@shop.com"
                  className="pl-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-800/30">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2" size={18} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-500">
              Don't have an account? <span className="text-indigo-600 font-bold cursor-pointer hover:underline">Contact Admin</span>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} MIMO Printing Platform. All rights reserved by S. Huzaifa.
        </p>
      </div>
    </div>
  );
}
