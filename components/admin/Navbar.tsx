"use client";

import React from 'react';
import { Bell, Search, Moon, Sun, User } from 'lucide-react';
import { Button } from '@/components/ui/core';
import { RealtimeNotifications } from './RealtimeNotifications';

export function AdminNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-blue-100/80 bg-white/80 px-4 sm:px-8 backdrop-blur-md dark:border-blue-900/20 dark:bg-zinc-950/80">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 lg:hidden dark:bg-blue-900/20 dark:text-blue-400"
        >
          <Search size={20} className="sm:hidden" />
          <User size={20} className="hidden" /> {/* Placeholder icons */}
          <div className="space-y-1">
            <div className="h-0.5 w-4 bg-blue-600"></div>
            <div className="h-0.5 w-4 bg-blue-600"></div>
            <div className="h-0.5 w-4 bg-blue-600"></div>
          </div>
        </button>
        
        <div className="hidden w-96 items-center gap-2 rounded-xl bg-blue-50/70 px-3 py-1.5 sm:flex dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
          <Search size={18} className="text-blue-400" />
          <input 
            type="text" 
            placeholder="Search orders, vendors, users..." 
            className="w-full bg-transparent text-sm outline-none placeholder:text-blue-300 dark:text-white dark:placeholder:text-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <RealtimeNotifications />
        
        <div className="h-8 w-px bg-blue-100 dark:bg-blue-900/30 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-sm text-white shadow-md shadow-blue-500/30"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)' }}>
            AD
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-zinc-900 dark:text-white">Admin User</p>
            <p className="text-[10px] text-blue-500 uppercase tracking-wider font-bold">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
