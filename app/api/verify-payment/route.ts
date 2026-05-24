import { Cashfree, CFEnvironment } from "cashfree-pg";

export async function POST(req: Request) {
  const cashfree = new Cashfree(
    CFEnvironment.PRODUCTION,
    (process.env.CASHFREE_APP_ID || "").trim(),
    (process.env.CASHFREE_SECRET_KEY || "").trim()
  );

  try {
    const body = await req.json();
    const orderId = body.orderId;

    if (!orderId) {
      return Response.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Call the method on the initialized cashfree instance
    const response = await cashfree.PGFetchOrder(orderId);

    return Response.json(response.data);
  } catch (error: any) {
    console.error("[VERIFY-API] Error verifying payment:", error.response?.data || error.message || error);
    return Response.json(
      { error: "Verification failed", details: error.response?.data || error.message },
      { status: 500 }
    );
  }
}
