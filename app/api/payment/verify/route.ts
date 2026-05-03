import { Cashfree, CFEnvironment } from "cashfree-pg";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

// Debug Logs for Vercel
console.log("CASHFREE VERIFY INIT -> APP_ID:", process.env.CASHFREE_APP_ID ? "PRESENT" : "MISSING");
console.log("CASHFREE VERIFY INIT -> SECRET:", process.env.CASHFREE_SECRET_KEY ? "PRESENT" : "MISSING");

if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
  throw new Error("Cashfree is not configured");
}

const cashfree = new Cashfree(
  process.env.NEXT_PUBLIC_CASHFREE_MODE === "production" 
    ? CFEnvironment.PRODUCTION 
    : CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID || "missing_app_id",
  process.env.CASHFREE_SECRET_KEY || "missing_secret_key"
);

export async function POST(req: Request) {
  try {
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      return NextResponse.json({ error: "Server Configuration Error: Cashfree keys are missing" }, { status: 500 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Fetch order details from Cashfree
    const response = await cashfree.PGFetchOrder(orderId);
    
    // Secure Server-side DB Update
    if (response.data.order_status === "PAID") {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { paymentStatus: "Paid" });
      return NextResponse.json({ status: "success", data: response.data });
    }

    return NextResponse.json({ status: "pending", data: response.data });
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message: string };
    console.error("Cashfree Verification Error:", err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data?.message || err.message },
      { status: 500 }
    );
  }
}
