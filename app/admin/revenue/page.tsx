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
          <p className="text-zinc-500">Track all financial transactions and platform revenue.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export Statement
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                  <DollarSign size={24} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-zinc-500">Net Revenue</p>
                <p className="text-3xl font-black text-zinc-900 dark:text-white">{formatCurrency(stats?.totalRevenue || 0)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <CheckCircle2 size={24} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-zinc-500">Month Revenue</p>
                <p className="text-3xl font-black text-zinc-900 dark:text-white">{formatCurrency(stats?.monthRevenue || 0)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                  <TrendingUp size={24} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-zinc-500">Today Revenue</p>
                <p className="text-3xl font-black text-zinc-900 dark:text-white">{formatCurrency(stats?.todayRevenue || 0)}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Revenue Performance</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Total', amount: stats?.totalRevenue || 0 },
                  { name: 'Month', amount: stats?.monthRevenue || 0 },
                  { name: 'Today', amount: stats?.todayRevenue || 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px' }} />
                  <Bar dataKey="amount" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
