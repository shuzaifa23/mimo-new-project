import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://printmimo.page',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key',
    { auth: { persistSession: false } }
  );
  try {
    const { orderId, status, vendor_id, vendor_name } = await req.json();
    console.log(`[API] Received update request: orderId=${orderId}, status=${status}, vendor_id=${vendor_id}`);

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const updateFields: any = {};
    if (status) {
      const validStatuses = ['Pending', 'Accepted', 'Printing', 'Completed', 'Delivered', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
      updateFields.status = status;
    }

    if (vendor_id !== undefined) updateFields.vendor_id = vendor_id;
    if (vendor_name !== undefined) updateFields.vendor_name = vendor_name;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updateFields)
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('[API] updateOrder error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API] Update result:', data?.length, 'rows updated');
    return NextResponse.json({ success: true, rowsUpdated: data?.length ?? 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
