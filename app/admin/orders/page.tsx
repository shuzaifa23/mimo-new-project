"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  UserPlus,
  RefreshCw,
  X,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/core';
import { fetchAllOrders, fetchAllVendors, updateOrderStatus, assignVendorToOrder } from '@/lib/admin-api';
import { supabase } from '@/lib/supabase';
import type { Order, Vendor, OrderStatus } from '@/types/supabase';

const STATUS_OPTIONS: OrderStatus[] = ['Pending', 'Accepted', 'Printing', 'Completed', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>("");
  const router = useRouter();

  const loadData = async () => {
    try {
      setLoading(true);
      const [o, v] = await Promise.all([fetchAllOrders(), fetchAllVendors()]);
      setOrders(o || []);
      setVendors((v || []).filter(vendor => vendor.status === 'Active'));
    } catch (err) {
      console.error("Error in loadData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const admin = localStorage.getItem("admin-auth");
    if (!admin) {
      router.push("/admin/login");
      return;
    }
    loadData();

    // Realtime subscription
    const channel = supabase
      .channel('admin_orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as OrderStatus } : o));
    
    try {
      const res = await fetch('/api/admin/update-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        alert('Failed to update status: ' + (result.error || 'Server error'));
        loadData(); // Revert on error
      } else {
        // Auto-trigger WhatsApp notification
        const order = orders.find(o => o.id === orderId);
        const rawPhone = order?.phone || order?.profiles?.phone || "";
        if (rawPhone) {
          const cleanPhone = rawPhone.replace(/\D/g, '');
          const formattedPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
          const message = `Hi! Your MIMO Print order #${orderId.slice(0, 8)} status has been updated to: *${newStatus}*. \n\nTrack your order here: https://mimo-print.vercel.app/student \n\nThank you for choosing MIMO!`;
          window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
        }
      }
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
      loadData(); // Revert on error
    }
  };

  const handleVendorAssign = async (orderId: string, vendorId: string | null, vendorName: string | null) => {
    try {
      const res = await fetch('/api/admin/update-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId, 
          vendor_id: vendorId, 
          vendor_name: vendorName,
          status: vendorId ? "Accepted" : "Pending"
        }),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        alert('Failed to assign vendor: ' + (result.error || 'Server error'));
      } else {
        loadData();
      }
    } catch (err: any) {
      alert('Failed to assign vendor: ' + err.message);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Status' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Accepted': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Printing': return 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Completed': return 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'Delivered': return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
      case 'Cancelled': return 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400';
      default: return 'bg-zinc-50 text-zinc-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Order Management</h1>
          <p className="text-zinc-500">Monitor and manage all print orders across the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID, customer or file..." 
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
          <Button variant="outline" size="sm" className="h-10 px-3">
            <Filter size={18} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <Clock className="animate-spin inline-block mr-2" size={20} />
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-zinc-500">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">{order.id.slice(0, 8)}...</span>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">{order.profiles?.name || order.customer_name || 'Anonymous'}</div>
                      <div className="text-[10px] text-zinc-500">{order.profiles?.phone || order.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                          <FileText size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-zinc-900 dark:text-white truncate max-w-[120px]">{order.file_name}</p>
                          <p className="text-[10px] text-zinc-500">{order.print_type === 'bw' ? 'B&W' : 'Color'} · {order.copies} copies</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="rounded-xl border border-zinc-200 bg-white px-2 py-1.5 text-xs font-semibold outline-none cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-indigo-500/20"
                        value={order.vendor_id || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            handleVendorAssign(order.id, null, null);
                          } else {
                            const selectedVendor = vendors.find(v => v.id === val);
                            if (selectedVendor) {
                              handleVendorAssign(order.id, selectedVendor.id, selectedVendor.shop_name || selectedVendor.name || "Vendor");
                            }
                          }
                        }}
                      >
                        <option value="">Unassigned</option>
                        {vendors.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.shop_name || v.name || "Vendor"}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer", getStatusStyle(order.status))}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(status => <option key={status} value={status} className="bg-white text-zinc-900">{status}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">₹{order.amount}</div>
                      <div className={cn(
                        "text-[9px] font-bold uppercase",
                        order.payment_status === 'Paid' ? "text-emerald-600" : "text-rose-600"
                      )}>{order.payment_status}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setPreviewUrl(order.file_url);
                            setPreviewName(order.file_name || 'document.pdf');
                          }}
                          title="View File" 
                          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = order.file_url;
                            a.download = order.file_name || "document.pdf";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          title="Download File" 
                          className="rounded-lg p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                          <Download size={16} />
                        </button>
                        {(order.phone || order.profiles?.phone) && (
                          <a 
                            href={`https://wa.me/${(order.phone || order.profiles?.phone || "").replace(/\D/g, '').length === 10 ? '91' + (order.phone || order.profiles?.phone || "").replace(/\D/g, '') : (order.phone || order.profiles?.phone || "").replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! Your MIMO Print order #${order.id.slice(0, 8)} status has been updated to: *${order.status}*. \n\nTrack your order here: https://mimo-print.vercel.app/student \n\nThank you for choosing MIMO!`)}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            title="Notify on WhatsApp"
                            className="rounded-lg p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-50 duration-200">
          <div className="relative w-full max-w-4xl h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white truncate max-w-md">{previewName || 'Document Preview'}</h3>
                <p className="text-xs text-zinc-400">Previewing document before printing</p>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl px-3 py-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink size={14} />
                  Open in New Tab
                </a>
                <button 
                  onClick={() => {
                    setPreviewUrl(null);
                    setPreviewName("");
                  }}
                  className="rounded-xl p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            {/* Content (iframe) */}
            <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 p-2">
              <iframe 
                src={previewUrl} 
                className="w-full h-full rounded-2xl border-0 bg-white dark:bg-zinc-900"
                title="Document Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
