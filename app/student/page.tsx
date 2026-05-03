"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Button } from "@/components/ui/core";
import { 
  Clock, 
  CheckCircle2, 
  Loader2, 
  FileText, 
  CreditCard,
  Printer,
  ChevronRight,
  ArrowRight,
  Smartphone
} from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  fileName: string;
  amount: number;
  paymentStatus: string;
  status: 'Pending' | 'Printing' | 'Ready' | 'Completed';
  createdAt: { toDate: () => Date };
}

function StudentDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const phone = searchParams.get("phone");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!phone) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "orders"), 
      where("phone", "==", phone),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [phone]);

  if (!phone) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
          <Smartphone size={40} />
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Track Your Orders</h1>
        <p className="mt-4 max-w-md text-zinc-600 dark:text-zinc-400">
          Enter your phone number used during ordering to see your live order status.
        </p>
        <div className="mt-8 flex w-full max-w-sm gap-2">
           <input 
             type="tel" 
             id="phone-input"
             placeholder="Enter phone number" 
             className="flex h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
           />
           <Button onClick={() => {
             const val = (document.getElementById('phone-input') as HTMLInputElement).value;
             if (val) router.push(`/student?phone=${val}`);
           }}>Track</Button>
        </div>
        <Link href="/student/order" className="mt-6 text-sm font-medium text-indigo-600 hover:underline">
          Or place a new order →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Your Orders</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">Tracking for {phone}</p>
        </div>
        <Link href="/student/order">
          <Button className="gap-2">
            <Printer size={18} />
            New Order
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-20 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-zinc-500">No orders found for this number.</p>
          <Link href="/student/order">
            <Button variant="outline" className="mt-4">Place your first order</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div key={order.id} className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white">{order.fileName}</h3>
                    <p className="text-sm text-zinc-500">
                      {order.createdAt?.toDate().toLocaleDateString()} at {order.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-zinc-900 dark:text-white">₹{order.amount}</div>
                  <div className={`mt-1 text-[10px] font-black uppercase tracking-widest ${
                    order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {order.paymentStatus}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-zinc-50 pt-6 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${
                    order.status === 'Ready' ? 'bg-green-500 animate-pulse' : 
                    order.status === 'Printing' ? 'bg-blue-500 animate-pulse' : 
                    order.status === 'Completed' ? 'bg-zinc-400' : 'bg-amber-500'
                  }`} />
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Status: {order.status}
                  </span>
                </div>
                {order.paymentStatus === 'Pending' && (
                  <Link href={`/student/payment?orderId=${order.id}&amount=${order.amount}&phone=${phone}`}>
                    <Button size="sm" variant="outline" className="gap-2 text-xs">
                      <CreditCard size={14} />
                      Pay Now
                    </Button>
                  </Link>
                )}
                {order.status === 'Ready' && (
                   <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                     <CheckCircle2 size={14} />
                     Ready for Pickup
                   </div>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-1000" 
                  style={{ width: 
                    order.status === 'Pending' ? '25%' : 
                    order.status === 'Printing' ? '50%' : 
                    order.status === 'Ready' ? '75%' : '100%' 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default function StudentDashboard() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>}>
      <StudentDashboardContent />
    </Suspense>
  );
}
