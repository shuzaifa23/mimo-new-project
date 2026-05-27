import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  console.log("Fetching vendors...");
  const { data: vendors, error: vErr } = await supabase.from('vendors').select('*');
  console.log("Vendors:", JSON.stringify(vendors, null, 2));
  if (vErr) console.error("Vendor Error:", vErr);

  console.log("\nFetching all orders (first 5)...");
  const { data: orders, error: oErr } = await supabase.from('orders').select('*').limit(5);
  console.log("Orders:", JSON.stringify(orders, null, 2));
  if (oErr) console.error("Order Error:", oErr);
  
  // Specifically for visionprintt@gmail.com
  console.log("\nLooking up visionprintt@gmail.com...");
  const { data: vendor, error: vErr2 } = await supabase.from('vendors').select('id').eq('email', 'visionprintt@gmail.com').maybeSingle();
  console.log("Visionprint vendor:", vendor);
  
  if (vendor) {
    console.log(`\nFetching orders for vendor_id: ${vendor.id}`);
    const { data: vOrders, error: voErr } = await supabase.from('orders').select('id, vendor_id, status').eq('vendor_id', vendor.id);
    console.log(`Orders found: ${vOrders?.length || 0}`);
    console.log("Vendor orders:", vOrders);
  }
}

checkDb();
