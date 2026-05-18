"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Store, 
  MapPin, 
  Star, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  ShieldCheck,
  Ban,
  ExternalLink,
  Clock,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/core';
import { supabase } from '@/lib/supabase';
import type { Vendor } from '@/types/supabase';

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vendors")
      .select("*");

    if (!error && data) {
      setVendors(data);
    } else {
      console.error("Error fetching vendors:", error);
    }
    setLoading(false);
  };

  const activeVendors = vendors.filter(v => v.status?.toLowerCase() === "active").length;
  const pendingVendors = vendors.filter(v => v.status?.toLowerCase() === "pending").length;

  const filteredVendors = vendors.filter(vendor => {
    const search = searchTerm.toLowerCase();
    return (
      (vendor.shop_name?.toLowerCase() || "").includes(search) ||
      (vendor.owner_name?.toLowerCase() || "").includes(search) ||
      (vendor.phone || "").includes(search) ||
      (vendor.email?.toLowerCase() || "").includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Vendor Management</h1>
          <p className="text-zinc-500">Manage printer shops, approve registrations, and monitor performance.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Store size={18} />
          Onboard New Vendor
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <ShieldCheck size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500">Active Vendors</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">{activeVendors}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <Clock size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500">Pending Approval</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">{pendingVendors}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by shop, owner, or phone..." 
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
                <th className="px-6 py-4">Shop Details</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-zinc-500">
                    Loading vendors...
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-zinc-500">
                    No vendors found.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold uppercase shrink-0">
                          {(vendor.shop_name || vendor.name || 'V').charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-zinc-900 dark:text-white">{vendor.shop_name || vendor.name || 'Unnamed Shop'}</div>
                          <div className="text-xs text-zinc-500">Owner: {vendor.owner_name || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm text-zinc-900 dark:text-zinc-300 font-medium">
                          {vendor.phone || 'No phone'}
                        </div>
                        <div className="text-xs text-zinc-500">{vendor.email || 'No email'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                        vendor.status?.toLowerCase() === 'active' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" :
                        vendor.status?.toLowerCase() === 'pending' ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20" :
                        "bg-rose-50 text-rose-600 dark:bg-rose-900/20"
                      )}>
                        {vendor.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {vendor.status?.toLowerCase() === 'pending' ? (
                          <>
                            <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] uppercase font-bold">Approve</Button>
                            <Button size="sm" variant="outline" className="h-8 text-rose-600 border-rose-200 hover:bg-rose-50 text-[10px] uppercase font-bold">Reject</Button>
                          </>
                        ) : (
                          <>
                            <button title="Disable Vendor" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white">
                              <Ban size={16} />
                            </button>
                            <button title="View Details" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white">
                              <ExternalLink size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
