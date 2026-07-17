export type OrderStatus = 'Pending' | 'Printing' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  created_at: string;
  user_id: string | null;
  vendor_id: string | null;
  customer_name: string | null;
  phone: string | null;
  file_url: string;
  file_name: string;
  print_type: 'bw' | 'color';
  copies: number;
  binding: 'none' | 'spiral' | 'hard' | 'soft';
  amount: number;
  payment_status: 'Unpaid' | 'Paid' | 'Refunded';
  status: OrderStatus | string;
  pages?: number;
  vendor_name?: string | null;
  // Joined
  profiles?: { name: string; email: string; phone: string | null } | null;
  vendors?: { name?: string; shop_name?: string; owner_name: string } | null;
  display_id?: string;
}

export interface Vendor {
  id: string;
  created_at: string;
  user_id: string;
  name?: string;
  shop_name?: string;
  owner_name: string;
  location: string;
  phone: string;
  status: 'Pending' | 'Active' | 'Disabled';
  rating: number;
  total_orders: number;
  total_revenue: number;
  email?: string | null;
}

export interface Profile {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'vendor' | 'customer';
  is_blocked: boolean;
}

export interface Coupon {
  id: string;
  created_at: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expiry_date: string | null;
  active: boolean;
  usage_count: number;
  min_order_amount: number | null;
}

export interface Transaction {
  id: string;
  created_at: string;
  order_id: string;
  user_id: string;
  amount: number;
  method: string;
  status: 'Success' | 'Failed' | 'Refunded';
  transaction_ref: string;
}

export interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  totalUsers: number;
  activeUsers: number;
  totalVendors: number;
  activeVendors: number;
  vendorPerformance: { name: string; orders: number; revenue: number }[];
}
