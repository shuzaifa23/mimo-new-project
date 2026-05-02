"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/core";
import {
  CheckCircle2,
  Loader2,
  Smartphone,
  ShieldCheck,
  QrCode,
  ChevronRight,
  Clock,
  Printer
} from "lucide-react";
import Image from "next/image";
import { load } from "@cashfreepayments/cashfree-js";

import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
    if (!orderId || orderId.startsWith('demo_')) return;

    // Real-time listener for payment status updates
    const orderRef = doc(db, "orders", orderId);
    const unsubscribe = onSnapshot(orderRef, (docSnap) => {
      if (docSnap.exists()) {
        const status = docSnap.data().paymentStatus as "Pending" | "Paid" | "Completed";
        setPaymentStatus(status || "Pending");
      }
    });

    // Verification Logic: Check Cashfree API directly for 'PAID' status
    const verifyPayment = async () => {
      try {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();

        if (data.order_status === "PAID" && paymentStatus !== "Paid") {
          await updateDoc(orderRef, { paymentStatus: "Paid" });
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

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [orderId]);

  const handleCashfree = async () => {
    setLoading(true);

    if (!process.env.NEXT_PUBLIC_CASHFREE_MODE) {
      // Simulation for demo if keys are placeholders
      setTimeout(() => {
        setLoading(false);
        setPaymentStatus("Paid");
      }, 1500);
      return;
    }

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
        mode: (process.env.NEXT_PUBLIC_CASHFREE_MODE as "sandbox" | "production") || "sandbox",
      });

      // 3. Start Checkout
      const result = await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        returnUrl: `${window.location.origin}/student/payment?orderId=${orderId}&amount=${amount}`,
      });

      if (result.error) {
        console.error("Cashfree Error:", result.error);
        alert(result.error.message);
      } else if (result.redirect) {
        console.log("Redirecting to Cashfree...");
      } else {
        // Overlay checkout completed - we'll let the polling/listener handle the update
        console.log("Checkout overlay closed");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Cashfree Integration Error:", error);
      // Fallback for demo
      alert("Payment Error: " + error.message);
    }
    setLoading(false);
  };

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
              <span className="font-mono font-bold text-zinc-900 dark:text-white">#{orderId?.slice(-6)?.toUpperCase() || "PENDING"}</span>
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
        <div className="flex-1 bg-white dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Payment Options</h2>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* List - Horizontal on mobile, Vertical on desktop */}
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible border-b lg:border-b-0 lg:border-r border-zinc-100 dark:border-zinc-800 lg:w-48 scrollbar-hide">
              {['UPI', 'Cards', 'Netbanking', 'Wallet'].map((m, i) => (
                <div key={m} className={`flex shrink-0 items-center gap-3 p-4 lg:p-6 text-sm font-bold transition-colors cursor-pointer ${i === 0 ? 'bg-zinc-50 dark:bg-zinc-900 border-b-2 lg:border-b-0 lg:border-l-4 border-blue-600' : 'text-zinc-500'}`}>
                  <span>{m}</span>
                </div>
              ))}
            </div>

            {/* Detail */}
            <div className="flex-1 p-6 lg:p-8">
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">UPI QR Scanner</h3>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400">
                    <Clock size={12} />
                    <span>Live Detection Active</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-6 rounded-2xl bg-zinc-50 p-8 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <div className="relative h-64 w-64 overflow-hidden rounded-2xl bg-white p-3 shadow-2xl ring-4 ring-blue-500/10 animate-pulse">
                    <Image
                      src="/upi-qr.jpg"
                      alt="UPI QR Code"
                      fill
                      sizes="(max-width: 768px) 100vw, 256px"
                      className="object-contain p-2"
                      priority
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.parentElement) {
                          target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-zinc-300 font-bold">QR Code Not Found</div>';
                        }
                      }}
                    />
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">Scan & Pay ₹{amount}</p>
                    <p className="mt-1 text-xs text-zinc-500">Waiting for payment confirmation...</p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-blue-600" size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Secure Live Link</span>
                    </div>
                  </div>

                  <div className="w-full rounded-xl bg-blue-50 p-3 text-center dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                    <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-tight">Step 1: Scan QR | Step 2: Pay | Step 3: Click Below</p>
                  </div>

                  <Button
                    onClick={() => setPaymentStatus("Paid")}
                    className="w-full h-12 bg-green-600 text-white hover:bg-green-700 text-xs font-bold rounded-xl shadow-lg shadow-green-200 dark:shadow-none"
                  >
                    I Have Paid via Scanner
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleCashfree}
                className="w-full h-14 bg-zinc-900 text-white hover:bg-black text-sm font-bold rounded-xl shadow-lg shadow-zinc-200 dark:shadow-none"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : `Pay ₹${amount} with Cashfree`}
              </Button>

              <p className="mt-4 text-center text-[10px] text-zinc-400 flex items-center justify-center gap-1">
                <ShieldCheck size={10} />
                Secure payment powered by Cashfree
              </p>
            </div>
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
