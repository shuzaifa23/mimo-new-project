import { Cashfree } from "cashfree-pg";
import { NextResponse } from "next/server";

// Configure Cashfree
Cashfree.XConfig.XClientId = process.env.CASHFREE_APP_ID!;
Cashfree.XConfig.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
Cashfree.XConfig.XEnvironment = process.env.NEXT_PUBLIC_CASHFREE_MODE === "production" 
  ? Cashfree.Environment.PRODUCTION 
  : Cashfree.Environment.SANDBOX;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, orderId, customerName, customerPhone } = body;

    const request = {
      order_amount: Number(amount),
      order_currency: "INR",
      order_id: orderId || `order_${Date.now()}`,
      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_name: customerName || "Customer",
        customer_email: "customer@example.com",
        customer_phone: customerPhone || "9999999999",
      },
      order_meta: {
        return_url: `${req.headers.get("origin")}/student/payment/status?order_id={order_id}`,
      }
    };

    const response = await Cashfree.PGCreateOrder("2023-08-01", request);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Cashfree API Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || error.message },
      { status: 500 }
    );
  }
}
