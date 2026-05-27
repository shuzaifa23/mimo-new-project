"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Loader2, 
  Package, 
  Clock, 
  CheckCircle2, 
  Printer, 
  Download, 
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  LogOut,
  Eye,
  X
} from "lucide-react";
import { Button } from "@/components/ui/core";

import type { Order, OrderStatus } from "@/types/supabase";

const statusConfig: Record<string, { color: string; icon: any }> = {
  Pending:   { color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: Clock },
  Accepted:  { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Package },
  Printing:  { color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: Printer },
  Completed: { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
  Delivered: { color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400", icon: ChevronRight },
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>("");

  const fetchOrders = async () => {
    setLoading(true);
    
    // Get current user to filter by vendor_id
    const { data: { user } } = await supabase.auth.getUser();

    // Try to find the vendor record by authenticated user_id first
    let vendorData: { id: string; shop_name?: string } | null = null;

    if (user) {
      const { data } = await supabase
        .from("vendors")
        .select("id, shop_name")
        .eq("user_id", user.id)
        .maybeSingle();
      vendorData = data;
    }

    // Fallback: search by vendor-email stored during login (covers hardcoded logins)
    if (!vendorData) {
      const email = localStorage.getItem("vendor-email");
      if (email) {
        const { data: fallbackVendor } = await supabase
          .from("vendors")
          .select("id, shop_name")
          .eq("email", email)
          .maybeSingle();
        if (fallbackVendor) {
          vendorData = fallbackVendor;
        }
      }
    }

    // If no vendor record found, show empty list
    if (!vendorData) {
      console.warn("No active vendor profile found for this user");
      setOrders([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .in("vendor_id", [vendorData.id, "mimo-vendor"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const router = useRouter();

  useEffect(() => {
    // Auth Check
    const auth = localStorage.getItem("vendor-auth");
    if (!auth) {
      router.push("/vendor-login");
      return;
    }

    fetchOrders();

    // Real-time listener for orders assigned to this vendor
    const channel = supabase
      .channel('vendor-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    
    // Find the order for notification details
    const order = orders.find(o => o.id === orderId);
    
    try {
      const res = await fetch("/api/admin/update-order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      
      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to update status");
      }

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      // Auto-trigger WhatsApp notification
      if (order?.phone) {
        const cleanPhone = order.phone.replace(/\D/g, '');
        const formattedPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
        const message = newStatus === 'Completed'
          ? `Hi! Your MIMO Print order #${orderId.slice(0, 8)} status has been updated to: *${newStatus}*. \n\ncollect your document from printshop\nThank you for choosing MIMO!`
          : `Hi! Your MIMO Print order #${orderId.slice(0, 8)} status has been updated to: *${newStatus}*. \n\nTrack your order here: https://mimo-print.vercel.app/student \n\nThank you for choosing MIMO!`;
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === "All" || order.status === filter;
    const matchesSearch = 
      (order.customer_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (order.phone || "").includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    accepted: orders.filter(o => o.status === 'Accepted').length,
    printing: orders.filter(o => o.status === 'Printing').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">Vendor Dashboard</h1>
            <p className="mt-1 text-zinc-500">Manage incoming print orders and update their status.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchOrders}
              disabled={loading}
              className="rounded-xl h-10 px-4 gap-2 flex-1 sm:flex-none"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl h-10 px-4 gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-900/20 flex-1 sm:flex-none"
              onClick={async () => {
                await supabase.auth.signOut();
                localStorage.removeItem("vendor-auth");
                window.location.href = '/vendor-login';
              }}
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
            <div className="flex h-10 items-center gap-2 rounded-xl bg-white px-3 shadow-sm dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <Search size={18} className="text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search name or phone..." 
                className="bg-transparent text-sm outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>


        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
                      { label: "Total Orders", value: stats.total, color: "bg-zinc-900 text-white" },
            { label: "Pending", value: stats.pending, color: "bg-orange-500 text-white" },
            { label: "In Print", value: stats.printing, color: "bg-purple-500 text-white" },
            { label: "Delivered", value: stats.delivered, color: "bg-teal-500 text-white" }
          ].map((stat, i) => (
            <div key={i} className={`rounded-2xl p-6 shadow-sm ${stat.color}`}>
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">{stat.label}</p>
              <p className="mt-2 text-3xl font-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {["All", "Pending", "Accepted", "Printing", "Completed", "Delivered"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
                filter === s 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                  : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Orders Table/List */}
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          {loading && orders.length === 0 ? (
            <div className="flex h-96 flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
              <p className="text-zinc-500 font-medium">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex h-[450px] flex-col items-center justify-center text-center px-6">
              <div className="mb-6 rounded-[2.5rem] bg-zinc-50 p-10 dark:bg-zinc-900/50 relative">
                <Package size={60} className="text-zinc-200 dark:text-zinc-800" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package size={32} className="text-zinc-400 dark:text-zinc-500 animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">No orders yet</h3>
              <p className="mt-2 max-w-[280px] text-zinc-500 font-medium">
                When customers place print orders, they will appear here for you to manage.
              </p>
              {searchQuery || filter !== 'All' ? (
                <Button 
                  variant="outline" 
                  className="mt-6 rounded-2xl"
                  onClick={() => {
                    setSearchQuery('');
                    setFilter('All');
                  }}
                >
                  Clear all filters
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Customer</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Details</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredOrders.map((order) => {
                    const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock;
                    return (
                      <tr key={order.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <td className="px-6 py-6">
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-white">{order.customer_name || 'Anonymous'}</p>
                            <p className="text-xs text-zinc-500">{order.phone || 'No phone'}</p>
                            <p className="mt-1 text-[10px] text-zinc-400">
                              {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 uppercase">
                                {order.print_type === 'bw' ? 'B&W' : 'Color'}
                              </span>
                              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                {order.pages} pgs × {order.copies} copies
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500">
                              Binding: <span className="capitalize">{order.binding}</span>
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">₹{order.amount}</p>
                          <p className="text-[10px] font-bold text-green-600 uppercase">{order.payment_status}</p>
                        </td>
                        <td className="px-6 py-6">
                          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusConfig[order.status as keyof typeof statusConfig]?.color}`}>
                            <StatusIcon size={14} />
                            {order.status}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center justify-end gap-2">
                            {order.file_url && (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    setPreviewUrl(order.file_url);
                                    setPreviewName(order.file_name || 'document.pdf');
                                  }}
                                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors"
                                  title="Preview File"
                                >
                                  <Eye size={18} />
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
                                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
                                  title="Download File"
                                >
                                  <Download size={18} />
                                </button>
                                {order.phone && (
                                  <a 
                                    href={`https://wa.me/${order.phone.replace(/\D/g, '').length === 10 ? '91' + order.phone.replace(/\D/g, '') : order.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                      order.status === 'Completed'
                                        ? `Hi! Your MIMO Print order #${order.id.slice(0, 8)} status has been updated to: *${order.status}*. \n\ncollect your document from printshop\nThank you for choosing MIMO!`
                                        : `Hi! Your MIMO Print order #${order.id.slice(0, 8)} status has been updated to: *${order.status}*. \n\nTrack your order here: https://mimo-print.vercel.app/student \n\nThank you for choosing MIMO!`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 transition-colors"
                                    title="Notify via WhatsApp"
                                  >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                  </a>
                                )}
                              </div>
                            )}
                            
                            <select 
                              className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                              value={order.status}
                              disabled={updatingId === order.id}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            >
                              {["Pending", "Accepted", "Printing", "Completed", "Delivered"].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
