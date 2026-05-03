import { Cashfree, CFEnvironment } from "cashfree-pg";
import { NextResponse } from "next/server";

// Debug Logs for Vercel
console.log("CASHFREE INIT -> APP_ID:", process.env.CASHFREE_APP_ID ? "PRESENT" : "MISSING");
console.log("CASHFREE INIT -> SECRET:", process.env.CASHFREE_SECRET_KEY ? "PRESENT" : "MISSING");
console.log("CASHFREE INIT -> MODE:", process.env.NEXT_PUBLIC_CASHFREE_MODE);

if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
  throw new Error("Cashfree is not configured");
}

// Initialize Cashfree instance
const cashfree = new Cashfree(
  process.env.NEXT_PUBLIC_CASHFREE_MODE === "production" 
    ? CFEnvironment.PRODUCTION 
    : CFEnvironment.SANDBOX,
  (process.env.CASHFREE_APP_ID || "missing_app_id").trim(),
  (process.env.CASHFREE_SECRET_KEY || "missing_secret_key").trim()
);

export async function POST(req: Request) {
  try {
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      return NextResponse.json({ error: "Server Configuration Error: Cashfree keys are missing" }, { status: 500 });
    }

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
        return_url: `${req.headers.get("origin")}/student/payment?order_id={order_id}`,
      }
    };

    // Use the instance method
    const response = await cashfree.PGCreateOrder(request);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error("Cashfree API Error:", err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data?.message || err.message },
      { status: 500 }
    );
  }
}
