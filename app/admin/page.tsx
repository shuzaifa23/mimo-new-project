"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, ShoppingBag, Store, Users,
  Clock, CheckCircle2, XCircle, IndianRupee,
  ArrowUpRight, RefreshCw
} from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { fetchDashboardStats, fetchAllOrders } from '@/lib/admin-api';
import { supabase } from '@/lib/supabase';
import type { DashboardStats, Order } from '@/types/supabase';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { cn } from '@/lib/utils';

const STATUS_COLOR: Record<string, string> = {
  Completed:  'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  Accepted:   'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  Printing:   'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
  Ready:      'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
  Pending:    'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  Cancelled:  'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
};

// --- placeholder chart data (replace with real aggregations from Supabase Edge Functions if needed) ---
const WEEK_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const placeholderRevenue = WEEK_LABELS.map((name, i) => ({
  name,
  revenue: 4000 + i * 800 + Math.floor(Math.random() * 1500),
}));

function formatCurrency(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState<DashboardStats | null>(null);
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const admin = sessionStorage.getItem("admin-auth");
    if (!admin) {
      router.push("/admin/login");
    }
  }, []);

  const load = async () => {
    setLoading(true);
    
    // Safety timeout to ensure skeletons don't hang forever
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 8000));
    
    try {
      const [s, o] = await Promise.race([
        Promise.all([fetchDashboardStats(), fetchAllOrders()]),
        timeoutPromise.then(() => [null, []]) // Fallback values on timeout
      ]) as [DashboardStats | null, Order[]];
      
      if (s) setStats(s);
      setOrders(o.slice(0, 8));
    } catch (err) {
      console.error("Dashboard load failed:", err);
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
          <p className="text-sm text-zinc-500">Live data — updates in real time</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Primary KPI Cards ── */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Revenue"    value={formatCurrency(stats?.totalRevenue ?? 0)}   icon={TrendingUp}   trend={{ value: 12, isPositive: true }}  color="indigo" />
            <StatCard label="Today Revenue"    value={formatCurrency(stats?.todayRevenue ?? 0)}   icon={IndianRupee}  trend={{ value: 8,  isPositive: true }}  color="green"  />
            <StatCard label="Today Orders"     value={stats?.todayOrders ?? 0}                    icon={ShoppingBag}  trend={{ value: 15, isPositive: true }}  color="blue"   />
            <StatCard label="Pending Orders"   value={stats?.pendingOrders ?? 0}                  icon={Clock}        trend={{ value: 2,  isPositive: false }} color="orange" />
          </div>

          {/* ── Vendor Performance Section ── */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Vendor Performance</h3>
              <p className="text-xs text-zinc-400">Top 5 vendors by revenue</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              {(stats?.vendorPerformance || []).length === 0 ? (
                <div className="col-span-full py-8 text-center text-sm text-zinc-400">No vendor data assigned yet.</div>
              ) : (
                stats?.vendorPerformance.map((v) => (
                  <div key={v.name} className="flex flex-col gap-2 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/50">
                    <p className="text-xs font-bold text-zinc-500 uppercase truncate">{v.name}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-xl font-black text-zinc-900 dark:text-white">{v.orders} <span className="text-[10px] font-medium text-zinc-400">orders</span></p>
                      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">₹{v.revenue}</p>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div 
                        className="h-full bg-indigo-600" 
                        style={{ width: `${Math.min(100, (v.revenue / (stats?.totalRevenue || 1)) * 100)}%` }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Charts + Recent Orders ── */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue Area Chart */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-4">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Platform Performance</h3>
            <p className="text-xs text-zinc-400">Weekly revenue trends</p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={placeholderRevenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '10px', color: '#fff', fontSize: 12 }}
                  formatter={(v: any) => [`₹${v}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Recent Orders</h3>
            <a href="/admin/orders" className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400">
              View All →
            </a>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-400">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-zinc-900 dark:text-white">
                      {order.profiles?.name ?? 'Unknown'}
                    </p>
                    <p className="truncate text-[10px] text-zinc-500">
                      {order.file_name} · {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">₹{order.amount}</p>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider', STATUS_COLOR[order.status] ?? 'bg-zinc-100 text-zinc-600')}>
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
