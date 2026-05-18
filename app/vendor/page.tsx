"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/core';

export default function VendorPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    let { data: vendorData } = await supabase
      .from("vendors")
      .select("id, shop_name")
      .eq("user_id", user.id)
      .maybeSingle();

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

    if (!vendorData) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('vendor_id', vendorData.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    console.log("UPDATING ORDER:", orderId, newStatus);

    const { data, error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
      })
      .eq("id", orderId)
      .select();

    console.log("Update result:", data);
    console.log("Update error:", error);

    if (error) {
      alert("Failed to update: " + error.message);
    } else {
      fetchOrders();
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/vendor-login');
  };

  const router = useRouter();

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Vendor Dashboard</h1>
          <p className="text-zinc-500 mt-1">Manage and track your shop's print orders</p>
        </div>
        <Button variant="outline" onClick={handleSignOut} className="gap-2">
          Sign Out
        </Button>
      </div>

      <div className="border rounded-xl p-6">
        <h2 className="font-semibold text-xl mb-4">Assigned Orders</h2>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 flex justify-between items-center bg-white">
                <div>
                  <p className="font-semibold">{order.file_name || 'Document'}</p>
                  <p className="text-sm text-gray-500">Customer: {order.customer_name || 'Unknown'}</p>
                </div>

                <select
                  className="border rounded-lg px-3 py-2 cursor-pointer"
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Printing">Printing</option>
                  <option value="Completed">Completed</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
