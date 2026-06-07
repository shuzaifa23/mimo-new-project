"use client";

import React from 'react';
import { Bell, Search, Moon, Sun, User } from 'lucide-react';
import { Button } from '@/components/ui/core';
import { RealtimeNotifications } from './RealtimeNotifications';

export function AdminNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-violet-100/80 bg-white/80 px-4 sm:px-8 backdrop-blur-md dark:border-violet-900/20 dark:bg-zinc-950/80">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 lg:hidden dark:bg-violet-900/20 dark:text-violet-400"
        >
          <Search size={20} className="sm:hidden" />
          <User size={20} className="hidden" /> {/* Placeholder icons */}
          <div className="space-y-1">
            <div className="h-0.5 w-4 bg-violet-600"></div>
            <div className="h-0.5 w-4 bg-violet-600"></div>
            <div className="h-0.5 w-4 bg-violet-600"></div>
          </div>
        </button>
        
        <div className="hidden w-96 items-center gap-2 rounded-xl bg-violet-50/70 px-3 py-1.5 sm:flex dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/20">
          <Search size={18} className="text-violet-400" />
          <input 
            type="text" 
            placeholder="Search orders, vendors, users..." 
            className="w-full bg-transparent text-sm outline-none placeholder:text-violet-300 dark:text-white dark:placeholder:text-violet-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <RealtimeNotifications />
        
        <div className="h-8 w-px bg-violet-100 dark:bg-violet-900/30 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-sm text-white shadow-md shadow-violet-500/30"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' }}>
            AD
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-zinc-900 dark:text-white">Admin User</p>
            <p className="text-[10px] text-violet-500 uppercase tracking-wider font-bold">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
