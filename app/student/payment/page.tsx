"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/core";
import {
  CheckCircle2,
  Loader2,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  QrCode,
  Printer
} from "lucide-react";
import { load } from "@cashfreepayments/cashfree-js";
import { supabase } from "@/lib/supabase";

// Firebase imports removed

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"Pending" | "Paid" | "Completed">("Pending");

  const orderId = searchParams.get("orderId") || searchParams.get("order_id");
  const amount = searchParams.get("amount");
  const phone = searchParams.get("phone") || "98765 43210";
  const name = searchParams.get("name") || "User";

  useEffect(() => {
    if (!orderId || typeof orderId !== "string" || orderId.startsWith('demo_')) return;

    // Real-time listener removed; relying on polling and direct verify checks

    // Verification Logic: Check Cashfree API directly for 'PAID' status
    const verifyPayment = async () => {
      try {
        const orderDataStr = localStorage.getItem('mimo_order_data');
        const orderData = orderDataStr ? JSON.parse(orderDataStr) : null;

        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, orderData }),
        });
        const data = await res.json();

        if (data.status === "success" && paymentStatus !== "Paid") {
          if (orderData?.phone) {
            localStorage.setItem("student_phone", orderData.phone);
          }

          setPaymentStatus("Paid");
          localStorage.removeItem('mimo_order_data'); // Clean up
        }
      } catch (err) {
        console.error("Verification failed:", err);
      }
    };

    // Initial check
    verifyPayment();

    // Polling every 5 seconds while on this page and status is Pending
    const interval = setInterval(() => {
      if (paymentStatus === "Pending") {
        verifyPayment();
      }
    }, 5000);

    // Real-time listener for order status updates
    const channel = supabase
      .channel(`payment-order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.new.status === 'Completed' || payload.new.status === 'Delivered') {
            setPaymentStatus('Completed');
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [orderId, paymentStatus]);

  const handleCashfree = async () => {
    if (!orderId || !amount) {
      alert("Missing order information. Please try again.");
      return;
    }
    setLoading(true);



    try {
      // 1. Create order on backend
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          orderId: orderId,
          customerName: name,
          customerPhone: phone,
        }),
      });

      const data = await response.json();

      if (!data.payment_session_id) {
        throw new Error(data.error || "Failed to create payment session");
      }

      // 2. Initialize Cashfree
      const cashfree = await load({
        mode: "production",
      });

      // 3. Start Checkout
      const result = await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        returnUrl: `${window.location.origin}/student/payment-success?order_id=${orderId}`,
        redirectTarget: "_self",
      });

      if (result.error) {
        console.error("Cashfree Error:", result.error);
        alert(result.error.message);
      } else if (result.redirect) {
        // Redirect target handles redirect automatically
      } else {
        // Overlay checkout completed - we'll let the polling/listener handle the update
      }
    } catch (err) {
      const error = err as Error;
      console.error("Cashfree Integration Error:", error);
      
      // Fallback for demo testing (when Cashfree keys are missing)
      const isDemo = confirm("Cashfree is not configured. Do you want to use Demo Mode to simulate a successful payment and save the order?");
      if (isDemo) {
        try {
          const orderDataStr = localStorage.getItem('mimo_order_data');
          const orderData = orderDataStr ? JSON.parse(orderDataStr) : null;
          
          if (orderData) {
            const { error: dbError } = await supabase.from('orders').insert({
              id: orderId,
              customer_name: name,
              phone: phone,
              amount: Number(amount),
              payment_status: "PAID",
              status: "Pending",
              vendor_id: orderData.vendorId || "mimo-vendor",
              vendor_name: orderData.vendorName || "MIMO print",
              payment_method: "demo",
              payment_order_id: orderId,
              cashfree_order_id: "demo_" + Date.now(),
              paid_at: new Date().toISOString(),
              file_url: orderData.fileUrl || '',
              file_name: orderData.fileName || '',
              print_type: orderData.printType || 'bw',
              copies: Number(orderData.copies) || 1,
              binding: orderData.binding || 'none',
              pages: Number(orderData.pages) || 1,
            });

            if (dbError) throw dbError;
            
            localStorage.setItem("student_phone", phone);
            setPaymentStatus("Paid");
            localStorage.removeItem('mimo_order_data');
          } else {
            alert("No order data found to save. Try creating the order again.");
          }
        } catch (demoErr) {
          console.error("Demo insert failed:", demoErr);
          alert("Demo save failed: " + (demoErr as any).message);
        }
      }
      setLoading(false);
    }

  if (paymentStatus === "Paid" || paymentStatus === "Completed") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20">
          <CheckCircle2 size={56} className="relative z-10" />
          <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20"></div>
        </div>
        <h1 className="text-4xl font-black text-zinc-900 dark:text-white">
          {paymentStatus === "Completed" ? "Order is Ready!" : "Payment Successful!"}
        </h1>
        <p className="mt-4 max-w-md text-lg text-zinc-600 dark:text-zinc-400 font-bold">
          {paymentStatus === "Completed"
            ? "Your prints are ready for pickup. Visit the shop now!"
            : "Your order is being processed by the shop..."}
        </p>

        {paymentStatus === "Completed" && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow-xl shadow-blue-500/30 animate-bounce">
            <Printer size={16} />
            <span>Printed & Verified</span>
          </div>
        )}

        {/* Order Details Card */}
        <div className="mt-10 w-full max-w-sm rounded-3xl border border-zinc-100 bg-zinc-50 p-6 text-left dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Order Details</h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Order ID</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white">#{orderId?.toUpperCase() || "PENDING"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Customer</span>
              <span className="font-bold text-zinc-900 dark:text-white">{name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Total Paid</span>
              <span className="text-lg font-black text-green-600 font-mono">₹{amount}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Button size="lg" className="h-14 px-10 rounded-2xl shadow-xl shadow-indigo-500/20" onClick={() => router.push(`/student?phone=${phone}`)}>
            Track Live Order
            <ChevronRight className="ml-2" size={18} />
          </Button>
          <Button variant="outline" size="lg" className="h-14 px-10 rounded-2xl" onClick={() => window.print()}>
            Print Receipt
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="flex flex-col bg-blue-600 p-8 text-white lg:w-80">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 font-bold text-lg">M</div>
            <span className="text-xl font-extrabold tracking-tight">MIMO Printing</span>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-medium opacity-80">Price Summary</p>
              <p className="mt-1 text-2xl font-black">₹{amount}</p>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/20 p-3 text-xs">
              <div className="flex items-center gap-2">
                <Smartphone size={14} />
                <span>Using as +91 {phone}</span>
              </div>
              <ChevronRight size={14} />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/20 p-3 text-xs">
              <div className="flex items-center gap-2">
                <QrCode size={14} />
                <span>Offers on UPI</span>
              </div>
              <ChevronRight size={14} />
            </div>
          </div>

          <div className="mt-auto pt-20">
            <p className="text-[10px] opacity-60">Secured by <span className="font-bold italic">Cashfree</span></p>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 bg-white dark:bg-zinc-950 p-8 flex flex-col items-center justify-center min-h-[400px]">
          <div className="max-w-sm w-full text-center space-y-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 p-4 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800/30">
              Click the button below to safely pay with Cashfree. You can use UPI, Cards, or Netbanking.
            </div>

            <Button
              onClick={handleCashfree}
              className="w-full h-14 bg-zinc-900 text-white hover:bg-black text-sm font-bold rounded-xl shadow-lg shadow-zinc-200 dark:shadow-none"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : `Pay ₹${amount} Securely`}
            </Button>

            <p className="text-[10px] text-zinc-400 flex items-center justify-center gap-1">
              <ShieldCheck size={10} />
              Secure payment powered by Cashfree
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <PaymentContent />
    </Suspense>
  );
}
