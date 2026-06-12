const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);

if (!urlMatch || !keyMatch) {
  console.error("Missing keys in .env.local");
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertDummyOrders() {
  const dummyOrders = [
    {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      customer_name: "Huzaifa",
      phone: "9876543210",
      amount: 150,
      payment_status: "PAID",
      status: "Pending",
      vendor_id: "mimo-vendor",
      vendor_name: "MIMO Print",
      payment_method: "demo",
      payment_order_id: "demo_order_1",
      cashfree_order_id: "cf_1",
      file_name: "Project Report.pdf",
      pages: 15,
      created_at: new Date().toISOString()
    },
    {
      id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      customer_name: "Vishal",
      phone: "8123456789",
      amount: 45,
      payment_status: "PAID",
      status: "Completed",
      vendor_id: "mimo-vendor",
      vendor_name: "MIMO Print",
      payment_method: "demo",
      payment_order_id: "demo_order_2",
      cashfree_order_id: "cf_2",
      file_name: "Resume.pdf",
      pages: 2,
      created_at: new Date().toISOString()
    }
  ];

  console.log("Inserting orders...");
  const { data, error } = await supabase.from('orders').insert(dummyOrders);
  
  if (error) {
    console.error("Error inserting:", error);
  } else {
    console.log("Successfully inserted 2 dummy orders!");
  }
}

insertDummyOrders();
