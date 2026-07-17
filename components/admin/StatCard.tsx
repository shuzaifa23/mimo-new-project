import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export function StatCard({ label, value, icon: Icon, trend, color = "violet" }: StatCardProps) {
  const colorClasses: Record<string, { card: string; icon: string; iconBg: string; label: string; value: string; trendPos: string; trendNeg: string }> = {
    violet: {
      card: 'border border-blue-100/80 bg-white shadow-sm hover:shadow-md hover:shadow-blue-200/40 dark:border-blue-900/20 dark:bg-zinc-950',
      icon: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      label: 'text-slate-500 dark:text-zinc-400',
      value: 'text-zinc-900 dark:text-white',
      trendPos: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
      trendNeg: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
    },
    pink: {
      card: 'border border-blue-100/80 bg-white shadow-sm hover:shadow-md hover:shadow-blue-200/40 dark:border-blue-900/20 dark:bg-zinc-950',
      icon: 'text-cyan-600 dark:text-cyan-400',
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
      label: 'text-slate-500 dark:text-zinc-400',
      value: 'text-zinc-900 dark:text-white',
      trendPos: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
      trendNeg: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
    },
    green: {
      card: 'border border-blue-100/80 bg-white shadow-sm hover:shadow-md hover:shadow-blue-200/40 dark:border-blue-900/20 dark:bg-zinc-950',
      icon: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      label: 'text-slate-500 dark:text-zinc-400',
      value: 'text-zinc-900 dark:text-white',
      trendPos: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
      trendNeg: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
    },
    "solid-purple": {
      card: 'bg-[#1e3a8a] text-white shadow-lg shadow-blue-900/20 border-none hover:shadow-xl hover:shadow-blue-900/30',
      icon: 'text-white',
      iconBg: 'bg-white/20',
      label: 'text-blue-200',
      value: 'text-white',
      trendPos: 'bg-white/20 text-white',
      trendNeg: 'bg-white/10 text-white/80'
    },
    "solid-pink": {
      card: 'bg-[#06b6d4] text-white shadow-lg shadow-cyan-900/20 border-none hover:shadow-xl hover:shadow-cyan-900/30',
      icon: 'text-white',
      iconBg: 'bg-white/20',
      label: 'text-cyan-100',
      value: 'text-white',
      trendPos: 'bg-white/20 text-white',
      trendNeg: 'bg-white/10 text-white/80'
    }
  };

  const { card, icon: iconColor, iconBg, label: labelColor, value: valueColor, trendPos, trendNeg } = 
    colorClasses[color] || colorClasses.violet;

  return (
    <div className={cn("rounded-2xl p-6 transition-all", card)}>
      <div className="flex items-center justify-between">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", iconBg, iconColor)}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trend.isPositive ? trendPos : trendNeg
          )}>
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className={cn("text-sm font-medium", labelColor)}>{label}</p>
        <p className={cn("mt-1 text-3xl font-extrabold", valueColor)}>{value}</p>
      </div>
    </div>
  );
}
