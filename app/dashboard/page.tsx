"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/core";
import { 
  Printer, 
  Download, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  FileText, 
  MoreVertical,
  ChevronRight,
  PackageCheck
} from "lucide-react";

interface Order {
  id: string;
  name: string;
  phone: string;
  fileName: string;
  fileUrl: string;
  printType: string;
  copies: number;
  binding: string;
  amount: number;
  paymentStatus: string;
  status: 'Pending' | 'Printing' | 'Ready' | 'Completed';
  createdAt: any;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
      // For demo: populate with dummy data if firebase fails
      setOrders([
        {
          id: "1",
          name: "Mohamed Huzaifa",
          phone: "9876543210",
          fileName: "Resume.pdf",
          fileUrl: "#",
          printType: "bw",
          copies: 2,
          binding: "none",
          amount: 50,
          paymentStatus: "Paid",
          status: "Pending",
          createdAt: { toDate: () => new Date() }
        },
        {
          id: "2",
          name: "John Doe",
          phone: "9123456789",
          fileName: "Project_Report.pdf",
          fileUrl: "#",
          printType: "color",
          copies: 1,
          binding: "spiral",
          amount: 120,
          paymentStatus: "Pending",
          status: "Printing",
          createdAt: { toDate: () => new Date(Date.now() - 3600000) }
        }
      ]);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { paymentStatus: newStatus });
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Printing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Ready': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Completed': return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
      default: return 'bg-zinc-100 text-zinc-600';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar / Header */}
      <header className="border-b border-zinc-200 bg-white px-8 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <PackageCheck size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Partner Dashboard</h1>
              <p className="text-sm text-zinc-500">Modern Xerox & Prints — Manage your digital queue</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">Settings</Button>
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="mb-8 grid gap-6 sm:grid-cols-4">
          {[
            { label: 'Total Orders', count: orders.length, icon: <FileText className="text-zinc-500" /> },
            { label: 'Pending', count: orders.filter(o => o.status === 'Pending').length, icon: <Clock className="text-amber-500" /> },
            { label: 'In Progress', count: orders.filter(o => o.status === 'Printing').length, icon: <Loader2 className="animate-spin text-blue-500" /> },
            { label: 'Ready', count: orders.filter(o => o.status === 'Ready').length, icon: <CheckCircle2 className="text-green-500" /> },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-500">{stat.label}</span>
                {stat.icon}
              </div>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{stat.count}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-100 p-6 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Incoming Orders</h2>
          </div>
          
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500 dark:bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Document</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {orders.map((order) => (
                    <tr key={order.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-900 dark:text-white">{order.name}</div>
                        <div className="text-xs text-zinc-500">{order.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-indigo-600" />
                          <span className="text-sm font-medium truncate max-w-[150px]">{order.fileName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 mr-1">{order.printType === 'bw' ? 'B&W' : 'Color'}</span>
                          <span className="inline-block px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 mr-1">{order.copies} copies</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">₹{order.amount}</span>
                          <select 
                            className={`h-7 rounded-lg border-none px-2 text-[10px] font-bold uppercase ${
                              order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 
                              order.paymentStatus === 'Completed' ? 'bg-blue-100 text-blue-700' :
                              'bg-red-100 text-red-700'
                            }`}
                            value={order.paymentStatus}
                            onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a href={order.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Download size={14} />
                            </Button>
                          </a>
                          <select 
                            className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Printing">Printing</option>
                            <option value="Ready">Ready</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-zinc-500">No orders yet. They will appear here in real-time.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
