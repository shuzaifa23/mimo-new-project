"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Ticket,
  Users,
  CreditCard,
  LogOut,
  ChevronRight,
  Package,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { signOutAdmin } from '../../lib/admin-api';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview',  href: '/admin' },
  { icon: ShoppingBag,     label: 'Orders',    href: '/admin/orders' },
  { icon: Store,           label: 'Vendors',   href: '/admin/vendors' },
  { icon: Ticket,          label: 'Coupons',   href: '/admin/coupons' },
  { icon: Users,           label: 'Users',     href: '/admin/users' },
  { icon: CreditCard,      label: 'Revenue',   href: '/admin/revenue' },
];

export function AdminSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleSignOut = async () => {
    await signOutAdmin();
    sessionStorage.removeItem("admin-auth");
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-blue-900/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-blue-100 bg-white transition-transform duration-300 dark:border-blue-900/30 dark:bg-zinc-950",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      {/* Logo */}
      <Link href="/admin" className="flex items-center gap-1 border-b border-blue-100 px-4 py-3 dark:border-blue-900/20">
        <div className="flex items-center overflow-hidden">
          <img src="/mimo-x-light.png" alt="MIMO X PRESS Logo" className="w-36 h-12 object-cover object-center block dark:hidden mix-blend-multiply" />
          <img src="/mimo-x-dark.png" alt="MIMO X PRESS Logo" className="w-36 h-12 object-cover object-center hidden dark:block" />
        </div>
        <span className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400"
          style={{ backgroundColor: 'var(--blue-light)' }}>
          Admin
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {menuItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'group flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:text-blue-700 dark:text-zinc-400 dark:hover:text-blue-300'
              )}
              style={isActive ? { background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' } : {}}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--blue-light)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '';
                }
              }}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  size={20}
                  className={cn(
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-300'
                  )}
                />
                {item.label}
              </div>
              {isActive && (
                <ChevronRight size={14} className="text-white/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="border-t border-blue-100 p-3 dark:border-blue-900/20">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-rose-900/10 dark:hover:text-rose-400"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
    </>
  );
}
