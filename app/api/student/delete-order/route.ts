import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This route uses the service role key to bypass client-side RLS limits for student deletions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    console.log(`[API] Delete order request received: orderId=${orderId}`);

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('[API] deleteOrder error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[API] Order ${orderId} successfully deleted`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
