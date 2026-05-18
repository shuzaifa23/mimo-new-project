"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  LogOut,
  ChevronRight,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview',  href: '/vendor' },
  { icon: ShoppingBag,     label: 'My Orders', href: '/vendor/orders' },
];

export function VendorSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/vendor/login');
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {/* Logo */}
      <Link href="/vendor" className="flex items-center gap-3 border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
          <Package size={22} />
        </div>
        <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">MIMO</span>
        <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          Vendor
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {menuItems.map((item) => {
          const isActive =
            item.href === '/vendor'
              ? pathname === '/vendor'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-100'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  size={20}
                  className={cn(
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'
                  )}
                />
                {item.label}
              </div>
              {isActive && (
                <ChevronRight size={14} className="text-indigo-400 dark:text-indigo-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="border-t border-zinc-100 p-3 dark:border-zinc-800">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-500 transition-all hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-rose-900/10 dark:hover:text-rose-400"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
