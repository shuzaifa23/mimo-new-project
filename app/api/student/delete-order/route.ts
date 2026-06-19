import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://printmimo.page',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key',
    { auth: { persistSession: false } }
  );
  try {
    const { orderId } = await req.json();
    console.log(`[API] Delete order request received: orderId=${orderId}`);

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('[API] deleteOrder error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.warn(`[API] Order ${orderId} was not deleted. This is likely due to a missing SUPABASE_SERVICE_ROLE_KEY in .env.local, which triggers Supabase RLS policies to silently block deletions.`);
      return NextResponse.json({ 
        error: 'Deletion blocked. Please define SUPABASE_SERVICE_ROLE_KEY in your local .env.local file to bypass Supabase Row Level Security (RLS).' 
      }, { status: 403 });
    }

    console.log(`[API] Order ${orderId} successfully deleted`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
