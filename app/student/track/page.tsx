"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui/core";
import { supabase } from "@/lib/supabase";
import { Check, Clock, Package, Printer as PrinterIcon, ChevronRight, XCircle, Eye, Trash2 } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  status: string;
  payment_status: string;
  created_at: string;
  print_type: string;
  copies: number;
  pages: number;
  amount: number;
  file_url?: string;
  file_name?: string;
}

const ALL_STATUSES = ['Pending', 'Printing', 'Delivered'];

const getShortOrderId = (uuid: string) => {
  if (!uuid) return "MIMO0000";
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
  }
  const code = Math.abs(hash % 9000) + 1000; // 1000 to 9999
  return `MIMO${code}`;
};

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = ALL_STATUSES.indexOf(currentStatus);
  const isCancelled = currentStatus === 'Cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 p-4 bg-rose-50 rounded-xl border border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30">
        <XCircle className="text-rose-600" size={20} />
        <span className="text-sm font-bold text-rose-700 dark:text-rose-400">This order has been cancelled</span>
      </div>
    );
  }

  return (
    <div className="relative flex w-full justify-between px-2 py-6">
      {/* Background Line */}
      <div className="absolute top-[2.4rem] left-[10%] right-[10%] h-0.5 bg-zinc-100 dark:bg-zinc-800" />
      
      {/* Progress Line */}
      <div 
        className="absolute top-[2.4rem] left-[10%] h-0.5 bg-[#2DBDD5] transition-all duration-500 ease-in-out"
        style={{ width: currentIndex === -1 ? '0%' : `${(currentIndex / (ALL_STATUSES.length - 1)) * 80}%` }}
      />

      {ALL_STATUSES.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === ALL_STATUSES.length - 1;

        const icons = {
          Pending: Clock,
          Printing: PrinterIcon,
          Delivered: Check,
        };
        const Icon = icons[status as keyof typeof icons] || Clock;

        return (
          <div key={status} className="relative z-10 flex flex-col items-center gap-2 flex-1">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
              isCompleted ? 'bg-[#2DBDD5] border-[#2DBDD5] text-white shadow-lg shadow-[#2DBDD5]/30' :
              isCurrent ? 'bg-white border-[#2DBDD5] text-[#2DBDD5] shadow-xl ring-4 ring-[#2DBDD5]/10 dark:bg-zinc-950 dark:ring-[#2DBDD5]/20' :
              'bg-white border-zinc-200 text-zinc-400 dark:bg-zinc-950 dark:border-zinc-800'
            }`}>
              {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
              isCurrent ? 'text-[#2DBDD5]' : 
              isCompleted ? 'text-zinc-900 dark:text-zinc-100' : 
              'text-zinc-400'
            }`}>
              {status}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function StudentPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [phone, setPhone] = useState("");

  const fetchOrders = async (phoneNumber: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("phone", phoneNumber)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setOrders(data || []);
    }
  };

  useEffect(() => {
    const savedPhone = localStorage.getItem("student_phone");

    if (savedPhone) {
      setTimeout(() => {
        setPhone(savedPhone);
        fetchOrders(savedPhone);
      }, 0);

      // Subscribe to real-time order updates
      const channel = supabase
        .channel('student-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `phone=eq.${savedPhone}`,
          },
          () => {
            fetchOrders(savedPhone);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch("/api/student/delete-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const result = await response.json();
      if (result.success) {
        setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
        alert("Order successfully deleted.");
      } else {
        alert(result.error || "Failed to delete the order. Please try again.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An unexpected error occurred while deleting the order.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Main */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-6xl font-black tracking-tighter text-zinc-900 dark:text-white">
              Your Orders
            </h2>

            {phone && (
              <p className="mt-3 text-lg font-medium text-zinc-500">
                Live updates for <span className="text-zinc-900 dark:text-white font-bold">{phone}</span>
              </p>
            )}
          </div>

          <Link href="/student/order">
            <Button size="lg" className="h-16 rounded-3xl px-10 text-lg font-bold shadow-2xl shadow-[#2DBDD5]/20 bg-gradient-to-r from-[#2DBDD5] to-[#2553B5] hover:from-[#66DFC0] hover:to-[#2DBDD5] border-0 text-white">
              Place New Order
            </Button>
          </Link>
        </div>

        <div>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none">
              {!phone ? (
                <div className="w-full max-w-sm space-y-6 px-8">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#2DBDD5]/10 text-[#2DBDD5] dark:bg-[#2DBDD5]/20">
                    <Package size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white">Track Your Journey</h3>
                    <p className="text-zinc-500 mt-2 font-medium">Enter your phone number to see your orders in real-time.</p>
                  </div>
                  <div className="space-y-3">
                    <Input 
                      placeholder="98765 43210" 
                      id="track-phone"
                      type="tel"
                      className="h-14 text-center text-lg font-bold"
                    />
                    <Button 
                      size="lg"
                      className="w-full h-14 rounded-2xl font-bold shadow-md shadow-[#2DBDD5]/20 bg-gradient-to-r from-[#2DBDD5] to-[#2553B5] hover:from-[#66DFC0] hover:to-[#2DBDD5] border-0 text-white"
                      onClick={() => {
                        const input = document.getElementById('track-phone') as HTMLInputElement;
                        if (input && input.value) {
                          setPhone(input.value);
                          localStorage.setItem('student_phone', input.value);
                          fetchOrders(input.value);
                        }
                      }}
                    >
                      Find Orders
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="px-8">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-50 text-zinc-400 dark:bg-zinc-800">
                    <Clock size={40} />
                  </div>
                  <p className="mb-8 text-xl font-bold text-zinc-900 dark:text-white">
                    No orders found for this number.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/student/order">
                      <Button size="lg" className="h-14 px-8 rounded-2xl shadow-md shadow-[#2DBDD5]/20 bg-gradient-to-r from-[#2DBDD5] to-[#2553B5] hover:from-[#66DFC0] hover:to-[#2DBDD5] border-0 text-white">
                        Place your first order
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="h-14 px-8 rounded-2xl"
                      onClick={() => {
                        setPhone("");
                        localStorage.removeItem('student_phone');
                      }}
                    >
                      Use a different number
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-8">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50 transition-all hover:shadow-2xl hover:shadow-zinc-300/50 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none"
                >
                  {/* Top Header: Name and Status Badges */}
                  <div className="flex items-start justify-between border-b border-zinc-50 p-8 dark:border-zinc-800/50">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white">
                          {order.customer_name}
                        </h3>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                          order.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          {order.payment_status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-zinc-500">
                        #{getShortOrderId(order.id)} • {order.phone} • {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Total Amount</p>
                      <p className="mt-1 text-3xl font-black text-[#2DBDD5] dark:text-[#66DFC0]">₹{order.amount}</p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="px-8 bg-zinc-50/50 dark:bg-zinc-950/20 py-4 border-b border-zinc-50 dark:border-zinc-800/50">
                    <StatusTimeline currentStatus={order.status} />
                  </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between p-8 gap-6">
                      <div className="flex gap-12 flex-wrap sm:flex-nowrap">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Print Type</p>
                          <p className="mt-1.5 font-bold text-zinc-900 dark:text-white">{order.print_type === 'bw' ? 'Black & White' : 'Full Color'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Volume</p>
                          <p className="mt-1.5 font-bold text-zinc-900 dark:text-white">{order.pages} Pages × {order.copies} Copies</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Binding</p>
                          <p className="mt-1.5 font-bold text-zinc-900 dark:text-white capitalize">{(order as any).binding || 'None'}</p>
                        </div>
                        {order.file_name?.includes('GSM:') && (
                          <>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">GSM</p>
                              <p className="mt-1.5 font-bold text-zinc-900 dark:text-white">{order.file_name.split(' | ').find((p: string) => p.startsWith('GSM:'))?.replace('GSM: ', '') || '75'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Sides</p>
                              <p className="mt-1.5 font-bold text-zinc-900 dark:text-white">{order.file_name.split(' | ').find((p: string) => p.startsWith('Sides:'))?.replace('Sides: ', '') || 'Single'}</p>
                            </div>
                          </>
                        )}
                      </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {order.file_url && (
                        <a 
                          href={order.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-initial"
                        >
                          <Button variant="outline" size="sm" className="w-full rounded-xl font-bold h-10 px-4 gap-2">
                            <Eye size={16} />
                            Preview
                          </Button>
                        </a>
                      )}

                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="rounded-xl font-bold h-10 px-4 gap-2 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/30 dark:hover:bg-rose-900/10 flex-1 sm:flex-initial"
                      >
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
