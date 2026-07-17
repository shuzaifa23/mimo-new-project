"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Package, Store, UserPlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'vendor' | 'user';
  time: string;
}

export function RealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const addNotification = (notif: Notification) => {
    setNotifications(prev => [notif, ...prev].slice(0, 5));
    // Optional: play a sound or show a toast
  };

  useEffect(() => {
    // Subscribe to new orders
    const orderSubscription = supabase
      .channel('realtime_orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new;
          addNotification({
            id: Math.random().toString(36).substr(2, 9),
            title: 'New Order Received',
            message: `Order #${newOrder.id} has been placed.`,
            type: 'order',
            time: 'Just now'
          });
        }
      )
      .subscribe();

    // Subscribe to new vendor registrations
    const vendorSubscription = supabase
      .channel('realtime_vendors')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vendors' },
        (payload) => {
          const newVendor = payload.new;
          addNotification({
            id: Math.random().toString(36).substr(2, 9),
            title: 'New Vendor Registration',
            message: `${newVendor.name} is waiting for approval.`,
            type: 'vendor',
            time: 'Just now'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
      supabase.removeChannel(vendorSubscription);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative rounded-full p-2 text-slate-500 hover:bg-blue-50 dark:text-zinc-400 dark:hover:bg-blue-900/20 transition-colors"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white border-2 border-white dark:border-zinc-950"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)' }}>
            {notifications.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 z-50">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Notifications</h3>
            <button onClick={() => setNotifications([])} className="text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors">Clear All</button>
          </div>
          
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-zinc-500">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="flex gap-3 rounded-xl border border-zinc-50 p-3 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    n.type === 'order' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" :
                    n.type === 'vendor' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" :
                    "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30"
                  )}>
                    {n.type === 'order' ? <Package size={14} /> : n.type === 'vendor' ? <Store size={14} /> : <UserPlus size={14} />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{n.title}</p>
                    <p className="mt-0.5 text-[10px] text-zinc-500 line-clamp-2">{n.message}</p>
                    <p className="mt-1 text-[9px] font-medium text-zinc-400 uppercase">{n.time}</p>
                  </div>
                  <button onClick={() => removeNotification(n.id)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
