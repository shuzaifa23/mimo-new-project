import { Cashfree, CFEnvironment } from "cashfree-pg";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xsfoszzgqtacapudsuba.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key'
  );

  const cashfree = new Cashfree(
    CFEnvironment.PRODUCTION,
    (process.env.CASHFREE_APP_ID || "").trim(),
    (process.env.CASHFREE_SECRET_KEY || "").trim()
  );

  try {
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      return NextResponse.json({ error: "Server Configuration Error: Cashfree keys are missing" }, { status: 500 });
    }

    const { orderId, orderData } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Fetch order details from Cashfree
    const response = await cashfree.PGFetchOrder(orderId);
    
    if (response.data.order_status === "PAID") {
      const cashfreeOrderId = response.data.cf_order_id ? String(response.data.cf_order_id) : "";

      try {
        // Check if the order already exists
        const { data: existingOrder } = await supabase
          .from("orders")
          .select("id")
          .or(`id.eq.${orderId},payment_order_id.eq.${orderId}`)
          .single();

        if (existingOrder) {
          // Update all payment columns
          const { error } = await supabase
            .from("orders")
            .update({
              payment_status: "PAID",
              payment_order_id: orderId,
              cashfree_order_id: cashfreeOrderId,
              paid_at: new Date().toISOString(),
              status: "Pending",
              vendor_id: "mimo-vendor",
              vendor_name: "MIMO print",
              payment_method: "online",
              updated_at: new Date().toISOString()
            })
            .eq("id", existingOrder.id);

          if (error) {
            console.error("Supabase Order Update Failed:", error);
          }
        } else if (orderData) {
          // Insert new order with EVERY column
          const { error } = await supabase
            .from("orders")
            .insert({
              id: orderId,
              customer_name: orderData.name,
              phone: orderData.phone,
              amount: Number(orderData.amount),
              payment_status: "PAID",
              status: "Pending",
              vendor_id: "mimo-vendor",
              vendor_name: "MIMO print",
              payment_method: "online",
              payment_order_id: orderId,
              cashfree_order_id: cashfreeOrderId,
              paid_at: new Date().toISOString(),
              file_url: orderData.fileUrl || '',
              file_name: orderData.fileName || '',
              print_type: orderData.printType || 'bw',
              copies: Number(orderData.copies) || 1,
              binding: orderData.binding || 'none',
              pages: Number(orderData.pages) || 1,
              created_at: new Date().toISOString()
            });

          if (error) {
            console.error("Supabase Order Insert Failed:", error);
          }
        } else {
          // Fallback insert if orderData is not passed but payment is PAID
          const { error } = await supabase
            .from("orders")
            .insert({
              id: orderId,
              customer_name: "Student",
              phone: "9876543210",
              amount: Number(response.data.order_amount),
              payment_status: "PAID",
              status: "Pending",
              vendor_id: "mimo-vendor",
              vendor_name: "MIMO print",
              payment_method: "online",
              payment_order_id: orderId,
              cashfree_order_id: cashfreeOrderId,
              paid_at: new Date().toISOString(),
              file_url: "",
              file_name: "Document",
              print_type: "bw",
              copies: 1,
              binding: "none",
              pages: 1,
              created_at: new Date().toISOString()
            });

          if (error) {
            console.error("Supabase Fallback Order Insert Failed:", error);
          }
        }
      } catch (err) {
        console.error("Supabase Transaction Operation Failed:", err);
      }
      
      return NextResponse.json({
        success: true,
        order_status: response.data.order_status,
        payment_method: (response.data as any).payment_method || "ONLINE",
        paid_at: new Date().toISOString(),
        data: response.data
      });
    }

    return NextResponse.json({
      success: false,
      order_status: response.data.order_status,
      data: response.data
    });
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error("Cashfree Verification Error:", err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data?.message || err.message },
      { status: 500 }
    );
  }
}
