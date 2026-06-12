const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Using Anon Key:");
  const { data, error } = await supabase.from('orders').select('*').limit(2);
  console.log("Data length:", data ? data.length : null);
  console.log("Error:", error);
}

run();
