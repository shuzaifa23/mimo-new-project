import { Cashfree, CFEnvironment } from "cashfree-pg";
import { NextResponse } from "next/server";

// Initialize Cashfree instance
const cashfree = new Cashfree(
  process.env.NEXT_PUBLIC_CASHFREE_MODE === "production" 
    ? CFEnvironment.PRODUCTION 
    : CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID!,
  process.env.CASHFREE_SECRET_KEY!
);

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

    // Use the instance method
    const response = await cashfree.PGCreateOrder(request);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Cashfree API Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || error.message },
      { status: 500 }
    );
  }
}
