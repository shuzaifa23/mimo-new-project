"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/core';
import { fetchDashboardStats, fetchAllOrders } from '@/lib/admin-api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import type { DashboardStats, Order } from '@/types/supabase';

export default function RevenuePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const s = await fetchDashboardStats();
    setStats(s);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (n: number) => `₹${n.toLocaleString()}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Revenue & Payments</h1>
          <p className="text-slate-400">Track all financial transactions and platform revenue.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="p-2 rounded-xl border border-violet-200 bg-white hover:bg-violet-50 text-violet-600 dark:border-violet-800/40 dark:hover:bg-violet-900/10">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <Button variant="outline" className="gap-2 border-violet-200 text-violet-600 hover:bg-violet-50 dark:border-violet-800/40">
            <Download size={16} />
            Export Statement
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-violet-600" size={40} />
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-violet-100/80 bg-white p-6 shadow-sm hover:shadow-md hover:shadow-violet-200/40 dark:border-violet-900/20 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                  <DollarSign size={24} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-400">Net Revenue</p>
                <p className="text-3xl font-black text-zinc-900 dark:text-white">{formatCurrency(stats?.totalRevenue || 0)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-violet-100/80 bg-white p-6 shadow-sm hover:shadow-md hover:shadow-violet-200/40 dark:border-violet-900/20 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <CheckCircle2 size={24} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-400">Month Revenue</p>
                <p className="text-3xl font-black text-zinc-900 dark:text-white">{formatCurrency(stats?.monthRevenue || 0)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-violet-100/80 bg-white p-6 shadow-sm hover:shadow-md hover:shadow-violet-200/40 dark:border-violet-900/20 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400">
                  <TrendingUp size={24} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-400">Today Revenue</p>
                <p className="text-3xl font-black text-zinc-900 dark:text-white">{formatCurrency(stats?.todayRevenue || 0)}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-violet-100/80 bg-white p-8 shadow-sm dark:border-violet-900/20 dark:bg-zinc-950">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Revenue Performance</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Total', amount: stats?.totalRevenue || 0 },
                  { name: 'Month', amount: stats?.monthRevenue || 0 },
                  { name: 'Today', amount: stats?.todayRevenue || 0 },
                ]}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={1} />
                      <stop offset="100%" stopColor="#EC4899" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ede9fe" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a78bfa', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} tick={{ fill: '#a78bfa', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(124,58,237,0.05)' }}
                    contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '12px', color: '#ede9fe', fontSize: 12 }}
                    formatter={(v: any) => [`₹${v}`, 'Revenue']}
                  />
                  <Bar dataKey="amount" fill="url(#barGrad)" radius={[8, 8, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
