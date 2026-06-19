import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://printmimo.page',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key'
  );
  const body = await req.json();

  const { orderId, status } = body;

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    return NextResponse.json({ error });
  }

  return NextResponse.json({ success: true, data });
}
