"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, ShoppingBag, Store, Users,
  Clock, CheckCircle2, XCircle, IndianRupee,
  ArrowUpRight, RefreshCw
} from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { fetchDashboardStats, fetchAllOrders, fetchWeeklyRevenue } from '@/lib/admin-api';
import { supabase } from '@/lib/supabase';
import type { DashboardStats, Order } from '@/types/supabase';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { cn } from '@/lib/utils';

// Status pill colour map
const STATUS_COLOR: Record<string, string> = {
  Completed:  'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  Accepted:   'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  Printing:   'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  Ready:      'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
  Pending:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400',
  Cancelled:  'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
};


function formatCurrency(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export default function AdminDashboard() {
  const [stats,         setStats]         = useState<DashboardStats | null>(null);
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<{ name: string; revenue: number }[]>([]);
  const [loading,       setLoading]       = useState(true);

  const router = useRouter();

  useEffect(() => {
    const admin = sessionStorage.getItem("admin-auth");
    if (!admin) {
      router.push("/admin/login");
    }
  }, []);

  const load = async () => {
    setLoading(true);
    
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 8000));
    
    try {
      const [s, o, w] = await Promise.race([
        Promise.all([fetchDashboardStats(), fetchAllOrders(), fetchWeeklyRevenue()]),
        timeoutPromise.then(() => [null, [], []]) 
      ]) as [DashboardStats | null, Order[], { name: string; revenue: number }[]];
      
      if (s) setStats(s);
      setOrders(o.slice(0, 8));
      if (w && w.length > 0) setWeeklyRevenue(w);
    } catch (err) {
      console.warn("Dashboard load failed (no Supabase config?):", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Realtime: re-fetch whenever orders change ──────────────────────────────
  useEffect(() => {
    load();

    const channel = supabase
      .channel('admin_dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-slate-400">Live data — updates in real time</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:border-blue-800/40 dark:bg-zinc-950 dark:text-blue-300"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Primary KPI Cards ── */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-blue-100/60 dark:bg-blue-900/10" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Revenue"    value={formatCurrency(stats?.totalRevenue ?? 0)}   icon={TrendingUp}   trend={{ value: 12, isPositive: true }}  color="violet" />
            <StatCard label="Today Revenue"    value={formatCurrency(stats?.todayRevenue ?? 0)}   icon={IndianRupee}  trend={{ value: 8,  isPositive: true }}  color="solid-pink"  />
            <StatCard label="Today Orders"     value={stats?.todayOrders ?? 0}                    icon={ShoppingBag}  trend={{ value: 15, isPositive: true }}  color="solid-purple" />
            <StatCard label="Pending Orders"   value={stats?.pendingOrders ?? 0}                  icon={Clock}        trend={{ value: 2,  isPositive: false }} color="pink"   />
          </div>

        </>
      )}

      {/* ── Charts + Recent Orders ── */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue Area Chart */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] p-6 shadow-xl shadow-blue-900/20 text-white lg:col-span-4">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Platform Performance</h3>
            <p className="text-xs text-blue-200">Weekly revenue trends</p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyRevenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#c3baf6' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#c3baf6' }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', color: '#5f4bb6', fontSize: 12, fontWeight: 'bold' }}
                  itemStyle={{ color: '#5f4bb6' }}
                  formatter={(v: any) => [`₹${v}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={3} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-2xl border border-blue-100/80 bg-white p-6 shadow-sm dark:border-blue-900/20 dark:bg-zinc-950 lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Recent Orders</h3>
            <a href="/admin/orders" className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400">
              View All →
            </a>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-blue-100/60 dark:bg-blue-900/10" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-zinc-900 dark:text-white">
                      {order.customer_name ?? 'Unknown'}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                      {order.file_name} · {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">₹{order.amount}</p>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider', STATUS_COLOR[order.status] ?? 'bg-blue-50 text-blue-600')}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
