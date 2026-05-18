"use client";

import React from 'react';
import { Bell, Search, Moon, Sun, User } from 'lucide-react';
import { Button } from '@/components/ui/core';
import { RealtimeNotifications } from './RealtimeNotifications';

export function AdminNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-4 sm:px-8 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 lg:hidden dark:bg-zinc-900 dark:text-zinc-400"
        >
          <Search size={20} className="sm:hidden" />
          <User size={20} className="hidden" /> {/* Placeholder icons */}
          <div className="space-y-1">
            <div className="h-0.5 w-4 bg-zinc-600"></div>
            <div className="h-0.5 w-4 bg-zinc-600"></div>
            <div className="h-0.5 w-4 bg-zinc-600"></div>
          </div>
        </button>
        
        <div className="hidden w-96 items-center gap-2 rounded-xl bg-zinc-100 px-3 py-1.5 sm:flex dark:bg-zinc-900">
          <Search size={18} className="text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search orders, vendors, users..." 
            className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500 dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <RealtimeNotifications />
        
        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold text-sm">
            AD
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-zinc-900 dark:text-white">Admin User</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
