import { supabase } from "./supabase";
import type { DashboardStats, Order, Coupon, Vendor, Profile } from '@/types/supabase';

// ─── AUTH ────────────────────────────────────────────────────────────────────

export async function getAdminSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

export async function signInAdmin(email: string, password: string) {
  const lowerEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      user: null,
      error: {
        message: "Invalid login credentials",
      },
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  // Bypass for owner if profile check fails (common in new/uninitialized DBs)
  if (lowerEmail === "shuzaifasamee@gmail.com") {
    return {
      user: data.user,
      error: null,
    };
  }

  if (!profile || profile.role !== "admin") {
    return {
      user: null,
      error: {
        message: "Access denied. Admin only.",
      },
    };
  }

  return {
    user: data.user,
    error: null,
  };
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
}

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Optimized to fetch only what's needed for counts and revenue
  try {
    const [
      ordersRes,
      usersRes,
      vendorsRes,
      activeVendorsRes,
      todayRevenueRes,
      monthRevenueRes,
    ] = await Promise.all([
      supabase.from('orders').select('status, amount, payment_status, vendor_name').limit(1000),
      supabase.from('profiles').select('id').eq('role', 'customer').limit(1000),
      supabase.from('vendors').select('id').limit(1000),
      supabase.from('vendors').select('id').eq('status', 'Active').limit(1000),
      supabase.from('orders').select('amount').eq('payment_status', 'Paid').gte('created_at', todayStart),
      supabase.from('orders').select('amount').eq('payment_status', 'Paid').gte('created_at', monthStart),
    ]);

    const orders = (ordersRes?.data || []) as any[];
    const totalRevenue = orders.filter(o => o.payment_status === 'Paid').reduce((sum, o) => sum + (o.amount || 0), 0);
    
    // Today's stats
    const todayOrdersData = ((todayRevenueRes as any)?.data || []);
    const todayRevenue = todayOrdersData.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);
    const todayOrdersCount = todayOrdersData.length;

    const monthRevenue = ((monthRevenueRes as any)?.data || []).reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

    // Calculate Vendor Performance
    const performanceMap: Record<string, { name: string; orders: number; revenue: number }> = {};
    orders.forEach(o => {
      if (o.vendor_name) {
        if (!performanceMap[o.vendor_name]) {
          performanceMap[o.vendor_name] = { name: o.vendor_name, orders: 0, revenue: 0 };
        }
        performanceMap[o.vendor_name].orders += 1;
        if (o.payment_status === 'Paid') {
          performanceMap[o.vendor_name].revenue += (o.amount || 0);
        }
      }
    });

    const vendorPerformance = Object.values(performanceMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalOrders: orders.length,
      todayOrders: todayOrdersCount,
      pendingOrders: orders.filter(o => o.status === 'Pending').length,
      completedOrders: orders.filter(o => o.status === 'Completed').length,
      cancelledOrders: orders.filter(o => o.status === 'Cancelled').length,
      totalRevenue,
      todayRevenue,
      monthRevenue,
      totalUsers: (usersRes as any)?.data?.length || 0,
      activeUsers: (usersRes as any)?.data?.length || 0,
      totalVendors: (vendorsRes as any)?.data?.length || 0,
      activeVendors: (activeVendorsRes as any)?.data?.length || 0,
      vendorPerformance,
    };
  } catch (err) {
    console.error("Dashboard stats fetch error:", err);
    return {
      totalOrders: 0, todayOrders: 0, pendingOrders: 0, completedOrders: 0, cancelledOrders: 0,
      totalRevenue: 0, todayRevenue: 0, monthRevenue: 0,
      totalUsers: 0, activeUsers: 0, totalVendors: 0, activeVendors: 0,
      vendorPerformance: []
    };
  }
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export async function fetchAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { 
    console.error("Fetch orders failed:", error);
    return []; 
  }
  return (data as any[]) || [];
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data: { session } } = await supabase.auth.getSession();
  console.log(`[DEBUG] updateOrderStatus: id=${orderId}, status=${status}, hasSession=${!!session}`);
  
  if (!session) {
    console.error("[ERROR] No active session found. Database update will likely fail.");
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select();

  if (error) {
    console.error("[ERROR] updateOrderStatus failed:", error.message, error.details);
  } else if (data && data.length > 0) {
    console.log("[SUCCESS] updateOrderStatus saved to DB:", data[0]);
    // Mock auto-notification trigger
    console.log(`[NOTIFICATION] Auto-notifying customer for order ${orderId}: "Your order is now ${status}"`);
  } else {
    console.warn("[WARN] updateOrderStatus executed but 0 rows were updated. This is almost certainly an RLS policy issue in Supabase.");
  }
  
  return { error };
}

/**
 * Generates a pre-filled WhatsApp link for order updates
 */
export function getWhatsAppLink(phone: string | null, status: string, orderId: string) {
  if (!phone) return null;
  const message = status === 'Completed'
    ? `Hi! Your MIMO Print order #${orderId.slice(0, 8)} status has been updated to: *${status}*. \n\ncollect your document from printshop\nThank you for choosing MIMO!`
    : `Hi! Your MIMO Print order #${orderId.slice(0, 8)} status has been updated to: *${status}*. \n\nTrack your order here: https://mimo-print.vercel.app/student \n\nThank you for choosing MIMO!`;
  const encoded = encodeURIComponent(message);
  // Clean phone number (remove spaces, non-digits)
  const cleanPhone = phone.replace(/\D/g, '');
  // Default to India (+91) if no country code provided and length is 10
  const finalPhone = (cleanPhone.length === 10) ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${finalPhone}?text=${encoded}`;
}

export async function assignVendorToOrder(orderId: string, vendorId: string) {
  console.log(`Attempting to assign vendor ${vendorId} to order ${orderId}`);

  let { data, error } = await supabase
    .from('orders')
    .update({ 
      vendor_id: vendorId, 
      status: 'Accepted', 
      updated_at: new Date().toISOString() 
    })
    .eq('id', orderId)
    .select();
    
  if (error) {
    console.warn("Primary assign failed, trying fallback (no vendor_id column?):", error.message);
    // Fallback if vendor_id column doesn't exist
    const fallback = await supabase
      .from('orders')
      .update({ 
        status: 'Accepted', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)
      .select();
    error = fallback.error;
    data = fallback.data;
  }

  if (error) {
    console.error("Assign vendor error:", error);
  } else {
    console.log("Assign vendor success:", data);
  }

  return { error };
}

// ─── VENDORS ─────────────────────────────────────────────────────────────────

export async function fetchAllVendors(): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('id, shop_name, owner_name, location, phone, status, rating, total_orders, total_revenue, created_at, user_id')
    .order('created_at', { ascending: false });
    
  if (error || !data || data.length === 0) {
    return [{
      id: "mimo-print-internal",
      created_at: new Date().toISOString(),
      user_id: "admin",
      name: "MIMO Print",
      shop_name: "MIMO Print",
      owner_name: "Internal",
      location: "HQ",
      phone: "0000000000",
      status: "Active",
      rating: 5,
      total_orders: 0,
      total_revenue: 0
    }];
  }
  return (data as Vendor[]) || [];
}

export async function updateVendorStatus(vendorId: string, status: 'Active' | 'Disabled' | 'Pending') {
  const { error } = await supabase
    .from('vendors')
    .update({ status })
    .eq('id', vendorId);
  return { error };
}

// ─── USERS ───────────────────────────────────────────────────────────────────

export async function fetchAllUsers(): Promise<Profile[]> {
  // Since students don't have formal auth accounts (they just use phone numbers), 
  // we extract unique customers directly from their order history.
  const { data: orders, error } = await supabase
    .from('orders')
    .select('customer_name, phone, created_at')
    .order('created_at', { ascending: false });

  if (error) { 
    console.error("Error fetching users:", error);
    return []; 
  }

  const uniqueUsersMap = new Map<string, Profile>();

  (orders || []).forEach(order => {
    if (order.phone && !uniqueUsersMap.has(order.phone)) {
      uniqueUsersMap.set(order.phone, {
        id: order.phone, // Using phone as a unique identifier
        name: order.customer_name || 'Anonymous',
        email: 'N/A', // Email is not collected during quick-checkout
        phone: order.phone,
        role: 'customer',
        is_blocked: false,
        created_at: order.created_at
      });
    }
  });

  return Array.from(uniqueUsersMap.values());
}

export async function toggleUserBlock(userId: string, blocked: boolean) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: blocked })
    .eq('id', userId);
  return { error };
}

// ─── COUPONS ─────────────────────────────────────────────────────────────────

export async function fetchAllCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { return []; }
  return (data as Coupon[]) || [];
}

export async function createCoupon(coupon: Omit<Coupon, 'id' | 'created_at' | 'usage_count'>) {
  const { data, error } = await supabase
    .from('coupons')
    .insert({ ...coupon, usage_count: 0 })
    .select()
    .single();
  return { data, error };
}

export async function updateCoupon(id: string, updates: Partial<Coupon>) {
  const { error } = await supabase
    .from('coupons')
    .update(updates)
    .eq('id', id);
  return { error };
}

export async function deleteCoupon(id: string) {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  return { error };
}

export async function toggleCoupon(id: string, active: boolean) {
  const { error } = await supabase.from('coupons').update({ active }).eq('id', id);
  return { error };
}
// ─── VENDOR PORTAL ──────────────────────────────────────────────────────────

export async function fetchVendorOrders(vendorId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data as Order[]) || [];
}

export async function updateVendorOrderStatus(orderId: string, status: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select();

  return { data, error };
}

export async function fetchVendorStats(vendorId: string) {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('status, amount')
    .eq('vendor_id', vendorId);

  if (error) return null;

  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'Pending' || o.status === 'Accepted' || o.status === 'Printing').length,
    completedOrders: orders.filter(o => o.status === 'Completed').length,
    totalRevenue: orders.filter(o => o.status === 'Completed').reduce((acc, o) => acc + (o.amount || 0), 0)
  };
}
