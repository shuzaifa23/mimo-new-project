"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Ticket, 
  Search, 
  Edit2, 
  Trash2, 
  Copy, 
  Calendar,
  CheckCircle2,
  XCircle,
  Tag,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Input } from '@/components/ui/core';
import { fetchAllCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCoupon } from '@/lib/admin-api';
import type { Coupon } from '@/types/supabase';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    expiry_date: '',
    active: true,
    min_order_amount: 0
  });

  const loadCoupons = async () => {
    setLoading(true);
    const data = await fetchAllCoupons();
    setCoupons(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await createCoupon({
      ...formData,
      expiry_date: formData.expiry_date || null,
      min_order_amount: formData.min_order_amount || null
    });
    
    if (error) {
      alert('Error creating coupon: ' + error.message);
    } else {
      setShowModal(false);
      loadCoupons();
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: 0,
        expiry_date: '',
        active: true,
        min_order_amount: 0
      });
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const { error } = await toggleCoupon(id, !currentStatus);
    if (error) alert('Error updating coupon');
    else loadCoupons();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      const { error } = await deleteCoupon(id);
      if (error) alert('Error deleting coupon');
      else loadCoupons();
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Coupon Management</h1>
          <p className="text-slate-400">Create and manage discount codes for marketing campaigns.</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          className="text-white gap-2 shadow-md shadow-blue-400/30"
          style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}
        >
          <Plus size={18} />
          Create Coupon
        </Button>
      </div>

      <div className="rounded-2xl border border-blue-100/80 bg-white shadow-sm dark:border-blue-900/20 dark:bg-zinc-950">
        <div className="p-4 border-b border-blue-100/80 dark:border-blue-900/20">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
            <input 
              type="text" 
              placeholder="Search coupon code..." 
              className="w-full rounded-xl border border-blue-100 bg-blue-50/50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-blue-900/20 dark:bg-blue-900/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-blue-100/80 bg-blue-50/40 text-xs font-bold uppercase tracking-wider text-blue-500 dark:border-blue-900/20 dark:bg-blue-900/10">
                <th className="px-6 py-4">Coupon Details</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Expires On</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 dark:divide-blue-900/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <Loader2 className="animate-spin inline-block mr-2 text-blue-600" size={20} />
                    Loading coupons...
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">No coupons found.</td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg px-3 py-1 font-mono text-sm font-black text-blue-700 dark:text-blue-300"
                          style={{ backgroundColor: 'var(--blue-light)' }}>
                          {coupon.code}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">
                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                      </div>
                      <div className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">{coupon.discount_type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-300">
                        <Calendar size={14} className="text-blue-400" />
                        {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'No Expiry'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-zinc-300">
                      {coupon.usage_count} times
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggle(coupon.id, coupon.active)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                          coupon.active
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-900/20"
                        )}
                      >
                        {coupon.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="rounded-lg p-2 text-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(coupon.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-blue-500/20 dark:bg-zinc-950 border border-blue-100 dark:border-blue-900/30">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md shadow-blue-400/30"
                  style={{ background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)' }}>
                  <Tag size={18} />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Create New Coupon</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <X size={20} className="text-blue-400" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-zinc-300">Coupon Code</label>
                <Input 
                  placeholder="E.g. SUMMER50" 
                  className="mt-1 uppercase border-blue-200 focus:ring-blue-500/20 dark:border-blue-800/40"
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-zinc-300">Discount Type</label>
                  <select 
                    className="mt-1 h-11 w-full rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-blue-800/40 dark:bg-zinc-950"
                    value={formData.discount_type}
                    onChange={e => setFormData({...formData, discount_type: e.target.value as any})}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-zinc-300">Value</label>
                  <Input 
                    type="number" 
                    placeholder="Value" 
                    className="mt-1 border-blue-200 focus:ring-blue-500/20 dark:border-blue-800/40"
                    value={formData.discount_value}
                    onChange={e => setFormData({...formData, discount_value: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-zinc-300">Expiry Date (Optional)</label>
                <Input 
                  type="date" 
                  className="mt-1 border-blue-200 focus:ring-blue-500/20 dark:border-blue-800/40"
                  value={formData.expiry_date}
                  onChange={e => setFormData({...formData, expiry_date: e.target.value})}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 text-white font-bold shadow-md shadow-blue-400/30"
                style={{ background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)' }}
              >
                Create Coupon
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
