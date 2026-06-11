"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/core";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Printer, 
  Smartphone, 
  Calendar, 
  IndianRupee, 
  MapPin,
  FileText,
  ArrowRight,
  Sparkles
} from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [orderInfo, setOrderInfo] = useState<any>(null);

  const orderId = searchParams.get("order_id") || searchParams.get("orderId");

  const verifyAndInsert = async () => {
    try {
      // 1. Fetch order metadata from localStorage
      const orderDataStr = localStorage.getItem("mimo_order_data");
      const orderData = orderDataStr ? JSON.parse(orderDataStr) : null;

      // 2. Call backend verification API
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          orderData,
        }),
      });

      if (!res.ok) {
        throw new Error("Payment verification failed on the server.");
      }

      const paymentDetails = await res.json();

      // Support both direct response and nested data wrapper from backend API
      const cashfreeData = paymentDetails.data || paymentDetails;
      const isPaid = paymentDetails.order_status === "PAID" || cashfreeData.order_status === "PAID";

      if (isPaid) {
        // Since backend already inserted/updated the order, we fetch the order from the DB to display the receipt!
        const { data: dbOrder } = await supabase
          .from("orders")
          .select("id, customer_name, amount, file_name, phone, vendor_name, print_type, copies, binding")
          .or(`id.eq.${orderId},payment_order_id.eq.${orderId}`)
          .single();

        if (dbOrder) {
          const fileNameParts = (dbOrder.file_name || "").split(' | ');
          const parsedFileName = fileNameParts[0];
          const parsedGsm = fileNameParts.find((p: string) => p.startsWith('GSM:'))?.replace('GSM: ', '') || orderData?.gsm || "75";
          const parsedSidesStr = fileNameParts.find((p: string) => p.startsWith('Sides:'))?.replace('Sides: ', '');
          const parsedSides = parsedSidesStr ? (parsedSidesStr === 'Front & Back' ? 'double' : 'single') : (orderData?.sides || "single");

          setOrderInfo({
            ...dbOrder,
            file_name: parsedFileName,
            gsm: parsedGsm,
            sides: parsedSides,
            print_type: dbOrder.print_type || orderData?.printType || "bw",
            copies: dbOrder.copies || orderData?.copies || 1,
            binding: dbOrder.binding || orderData?.binding || "none"
          });
          if (dbOrder.phone) {
            localStorage.setItem("student_phone", dbOrder.phone);
          }
        } else if (orderData) {
          const fileNameParts = (orderData.fileName || "").split(' | ');
          localStorage.setItem("student_phone", orderData.phone);
          setOrderInfo({
            id: orderId,
            customer_name: orderData.name,
            amount: orderData.amount,
            file_name: fileNameParts[0],
            vendor_name: orderData.vendorName || "REVA UNIVERSITY",
            print_type: orderData.printType || "bw",
            copies: orderData.copies || 1,
            binding: orderData.binding || "none",
            gsm: fileNameParts.find((p: string) => p.startsWith('GSM:'))?.replace('GSM: ', '') || orderData.gsm || "75",
            sides: fileNameParts.find((p: string) => p.startsWith('Sides:'))?.replace('Sides: ', '') === 'Front & Back' ? 'double' : (orderData.sides || "single")
          });
        } else {
          setOrderInfo({
            id: orderId,
            customer_name: "Student",
            amount: cashfreeData.order_amount,
            file_name: "Document",
            vendor_name: "REVA UNIVERSITY",
            print_type: "bw",
            copies: 1,
            binding: "none",
            gsm: "75",
            sides: "single"
          });
        }

        // Clean up temporary order data from localStorage
        localStorage.removeItem("mimo_order_data");
        setStatus("success");
      } else {
        setStatus("failed");
        setErrorMessage(`Payment is not completed. Current status: ${cashfreeData.order_status}`);
      }
    } catch (err: any) {
      console.error("[PAYMENT-SUCCESS] Verification process error:", err);
      setStatus("failed");
      setErrorMessage(err.message || "An unexpected error occurred during verification.");
    }
  };

  useEffect(() => {
    if (!orderId) {
      setTimeout(() => {
        setStatus("failed");
        setErrorMessage("No Order ID provided in the URL.");
      }, 0);
      return;
    }

    setTimeout(() => {
      verifyAndInsert();
    }, 0);
  }, [orderId]);

  if (status === "verifying") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-full border-4 border-indigo-100 dark:border-indigo-950 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full p-1.5 text-white animate-pulse">
            <Sparkles size={12} />
          </div>
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Verifying Payment</h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
          Please wait while we secure your payment and generate your print order...
        </p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4 max-w-md mx-auto">
        <div className="h-20 w-20 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mb-6 text-rose-500 border border-rose-100 dark:border-rose-900/50">
          <XCircle size={44} />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Verification Failed</h2>
        <p className="text-rose-600 dark:text-rose-400 text-sm font-semibold mb-6 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 rounded-2xl border border-rose-100 dark:border-rose-900/30">
          {errorMessage || "We couldn't confirm your transaction."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button 
            className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            onClick={() => router.push("/student/order")}
          >
            Retry Order
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            onClick={verifyAndInsert}
          >
            Refresh Status
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-6 text-emerald-500 border border-emerald-100 dark:border-emerald-900/30 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 size={44} className="animate-bounce" />
        </div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Order Confirmed!</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Your payment was verified, and your order has been sent to our printing queue.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden mb-8">
        <div className="px-8 py-6 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider">Order ID</p>
            <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5 select-all">{orderId}</p>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 text-xs font-bold">
            Paid Successfully
          </span>
        </div>

        <div className="p-8 space-y-6">
          <h3 className="font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">Receipt Summary</h3>
          
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Smartphone size={16} />
              <span>Customer Name</span>
            </div>
            <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-right">
              {orderInfo?.customer_name}
            </div>

            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <FileText size={16} />
              <span>File Details</span>
            </div>
            <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-right truncate pl-4">
              {orderInfo?.file_name}
            </div>

            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Printer size={16} />
              <span>Print Type</span>
            </div>
            <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-right">
              {orderInfo?.print_type === "color" ? "Color Print" : "Black & White"}
            </div>

            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <FileText size={16} />
              <span>GSM</span>
            </div>
            <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-right">
              {orderInfo?.gsm} GSM
            </div>

            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <FileText size={16} />
              <span>Sides</span>
            </div>
            <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-right">
              {orderInfo?.sides === "double" ? "Front & Back" : "Single Side"}
            </div>

            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <FileText size={16} />
              <span>Copies</span>
            </div>
            <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-right">
              {orderInfo?.copies}
            </div>

            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <FileText size={16} />
              <span>Binding</span>
            </div>
            <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-right capitalize">
              {orderInfo?.binding}
            </div>

            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Calendar size={16} />
              <span>Date</span>
            </div>
            <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-right">
              {new Date().toLocaleDateString(undefined, { dateStyle: "medium" })}
            </div>

            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <MapPin size={16} />
              <span>Location</span>
            </div>
            <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-right truncate pl-4">
              {orderInfo?.vendor_name || "REVA UNIVERSITY"}
            </div>

            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <IndianRupee size={16} />
              <span>Amount Paid</span>
            </div>
            <div className="font-black text-emerald-600 dark:text-emerald-400 text-right text-base">
              ₹{orderInfo?.amount}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          className="flex-1 h-12 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-2xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2"
          onClick={() => router.push("/student/track")}
        >
          Track My Orders
          <ArrowRight size={16} />
        </Button>
        <Button 
          variant="outline"
          className="flex-1 h-12 font-bold rounded-2xl"
          onClick={() => window.print()}
        >
          <Printer size={16} className="mr-2" />
          Print Receipt
        </Button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
        <Loader2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
