"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  MoreVertical, 
  Ban, 
  History,
  ShieldAlert,
  UserCheck,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/core';
import { fetchAllUsers, toggleUserBlock } from '@/lib/admin-api';
import type { Profile } from '@/types/supabase';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    setTimeout(() => {
      loadUsers();
    }, 0);
  }, []);

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    const { error } = await toggleUserBlock(userId, !isBlocked);
    if (error) alert('Error updating user');
    else loadUsers();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    
    const matchesStatus = 
      statusFilter === 'All Status' || 
      (statusFilter === 'Blocked' && user.is_blocked) ||
      (statusFilter === 'Active' && !user.is_blocked);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">User Management</h1>
          <p className="text-slate-400">View and manage all registered customers on the platform.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-violet-100/80 bg-white p-4 shadow-sm dark:border-violet-900/20 dark:bg-zinc-950 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            className="w-full rounded-xl border border-violet-100 bg-violet-50/50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-violet-900/20 dark:bg-violet-900/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-2 text-sm outline-none dark:border-violet-900/20 dark:bg-violet-900/10"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Blocked</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-violet-600" size={40} />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-violet-200 dark:border-violet-800/30">
          <p className="text-slate-400">No users found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="group relative flex flex-col items-center rounded-3xl border border-violet-100/80 bg-white p-6 text-center shadow-sm hover:shadow-lg hover:shadow-violet-200/40 dark:border-violet-900/20 dark:bg-zinc-950 transition-all">
              <div className="relative mb-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-black text-white shadow-md shadow-violet-400/30"
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' }}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={cn(
                  "absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-white dark:border-zinc-950",
                  user.is_blocked ? "bg-rose-500" : "bg-emerald-500"
                )}></div>
              </div>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate w-full px-2">{user.name}</h3>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>

              <div className="mt-4 w-full space-y-2">
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 justify-center">
                  <Mail size={12} className="text-zinc-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 justify-center">
                    <Phone size={12} className="text-zinc-400" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex w-full gap-2 pt-4 border-t border-violet-100 dark:border-violet-900/20">
                <Button 
                  variant="outline" 
                  className={cn(
                    "flex-1 text-xs gap-1.5 h-10 rounded-xl",
                    user.is_blocked ? "text-emerald-600 border-emerald-100 hover:bg-emerald-50 dark:border-emerald-900/30 dark:hover:bg-emerald-900/10" : "text-rose-600 border-rose-100 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-900/10"
                  )}
                  onClick={() => handleToggleBlock(user.id, user.is_blocked)}
                >
                  {user.is_blocked ? <UserCheck size={14} /> : <Ban size={14} />}
                  {user.is_blocked ? 'Unblock' : 'Block User'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
