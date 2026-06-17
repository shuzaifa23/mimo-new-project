"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui/core";
import { Upload, CheckCircle2, Loader2, CreditCard, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PDFDocument } from "pdf-lib";
import { useGlobalFile } from "@/components/FileContext";

export default function OrderPage() {
  const router = useRouter();
  const { file: contextFile, setFile: setContextFile } = useGlobalFile();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [vendors, setVendors] = useState<{ id: string; shop_name: string }[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vendorId: "REVA UNIVERSITY",
    printType: "bw",
    copies: 1,
    binding: "none",
    pages: 1,
    gsm: "75",
    sides: "single",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      vendorId: "REVA UNIVERSITY",
      printType: "bw",
      copies: 1,
      binding: "none",
      pages: 1,
      gsm: "75",
      sides: "single",
    });
    setFile(null);
  };

  const amount = useMemo(() => {
    const pageRate = formData.printType === "bw" ? 1 : 5;
    const bindingPrice = { none: 0, spiral: 20, hard: 130, soft: 20 }[formData.binding] || 0;
    const basePrice = 0; 
    return (basePrice + (pageRate * formData.pages * formData.copies) + bindingPrice);
  }, [formData]);

  // Load vendors on mount
  useState(() => {
    // Only REVA UNIVERSITY is available as per request
  });

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);

    if (selectedFile.type === "application/pdf") {
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        setFormData(prev => ({ ...prev, pages: pageCount }));
      } catch (err) {
        console.error("Error reading PDF pages:", err);
        setFormData(prev => ({ ...prev, pages: 1 }));
      }
    } else {
      // For images and other docs, default to 1 page
      setFormData(prev => ({ ...prev, pages: 1 }));
    }
  };

  useEffect(() => {
    if (contextFile) {
      processFile(contextFile);
      setContextFile(null); // Clear it so it doesn't re-process on unmount/remount
    }
  }, [contextFile, setContextFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!file) return setMessage({ type: 'error', text: "Please upload your documents" });
    if (!formData.name.trim()) return setMessage({ type: 'error', text: "Name is required" });
    if (!formData.phone.trim()) return setMessage({ type: 'error', text: "Phone number is required" });
    if (!formData.vendorId) return setMessage({ type: 'error', text: "Please select your location" });
    
    // Validate phone number format for Cashfree (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      return setMessage({ type: 'error', text: "Please enter a valid 10-digit phone number." });
    }

    if (formData.copies < 1) return setMessage({ type: 'error', text: "Number of copies must be at least 1" });

    setLoading(true);

    try {
      // Generate a valid UUID for Supabase
      const orderId = crypto.randomUUID();
      const uniqueDigits = Math.floor(1000 + Math.random() * 9000);
      const shortMimoId = `MIMO${uniqueDigits}`;
      const fileName = `${Date.now()}_${file.name}`;
      
      // 1. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const fileUrl = urlData.publicUrl;

      const selectedVendor = vendors.find(v => v.id === formData.vendorId);
      
      // 2. Store metadata in localStorage (to be inserted after payment success)
      const orderData = {
        ...formData,
        vendorName: formData.vendorId === "REVA UNIVERSITY" ? "REVA UNIVERSITY" : (selectedVendor ? selectedVendor.shop_name : "MIMO Print"),
        amount,
        fileName: `${file.name} | GSM: ${formData.gsm} | Sides: ${formData.sides === 'double' ? 'Front & Back' : 'Single Side'}`,
        fileUrl,
        orderId,
      };
      
      localStorage.setItem('mimo_order_data', JSON.stringify(orderData));
      localStorage.setItem('student_phone', formData.phone);

      setMessage({ type: 'success', text: "Redirecting to payment..." });
      router.push(`/student/payment?orderId=${orderId}&amount=${amount}&name=${encodeURIComponent(formData.name)}&phone=${encodeURIComponent(formData.phone)}`);

    } catch (error: any) {
      console.error("Submission Error:", error);
      setMessage({ type: 'error', text: error.message || "Failed to process order. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Place Print Order</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Upload your documents and select your preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {file ? (
              <div className="relative rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                  <FileText size={32} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {file.name}
                </h3>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-sm font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle2 size={16} />
                    Smart Detect: {formData.pages} Pages
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  No file selected
                </h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Please go back to the home page to upload your documents.
                </p>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="mt-6 font-bold"
                >
                  Go to Home Page
                </Button>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="mb-6 text-lg font-bold text-zinc-900 dark:text-white">Print Settings</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Print Type</label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                    value={formData.printType}
                    onChange={(e) => setFormData({ ...formData, printType: e.target.value })}
                  >
                    <option value="bw">Black & White (₹1/pg)</option>
                    <option value="color">Color Print (₹5/pg)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">GSM</label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                    value={formData.gsm}
                    onChange={(e) => setFormData({ ...formData, gsm: e.target.value })}
                  >
                    <option value="75">GSM(75)</option>
                    <option value="90">GSM(90)</option>
                    <option value="100">GSM(100)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Sides</label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                    value={formData.sides}
                    onChange={(e) => setFormData({ ...formData, sides: e.target.value })}
                  >
                    <option value="single">Single Side</option>
                    <option value="double">Front & Back</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Number of Copies</label>
                  <div className="flex items-center h-11 w-full rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-indigo-500">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, copies: Math.max(1, formData.copies - 1) })}
                      className="flex h-full w-12 items-center justify-center border-r border-zinc-200 text-zinc-500 hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:active:bg-zinc-800/80 transition-colors text-lg font-bold select-none cursor-pointer"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      className="h-full flex-1 bg-transparent text-center text-sm font-bold text-zinc-900 focus:outline-none dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={formData.copies}
                      onChange={(e) => setFormData({ ...formData, copies: Math.max(1, parseInt(e.target.value) || 1) })}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, copies: formData.copies + 1 })}
                      className="flex h-full w-12 items-center justify-center border-l border-zinc-200 text-zinc-500 hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:active:bg-zinc-800/80 transition-colors text-lg font-bold select-none cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Binding</label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                    value={formData.binding}
                    onChange={(e) => setFormData({ ...formData, binding: e.target.value })}
                  >
                    <option value="none">None</option>
                    <option value="spiral">Spiral Binding (+₹20)</option>
                    <option value="hard">Hard Binding (+₹130)</option>
                    <option value="soft">Soft Binding (+₹20)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="mb-6 text-lg font-bold text-zinc-900 dark:text-white">Contact Info & Shop Selection</h3>
              <div className="space-y-4">
                <Input
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <div className="pt-2">
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Select Your Location</label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    required
                  >
                    <option value="REVA UNIVERSITY">REVA UNIVERSITY</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-500/20">
              <h3 className="text-lg font-bold opacity-90">Order Summary</h3>
              <div className="mt-4 space-y-2 border-b border-indigo-500/50 pb-4 text-sm">
                <div className="flex justify-between">
                  <span>Print Cost</span>
                  <span>₹{formData.printType === "bw" ? 1 : 5} × {formData.pages} × {formData.copies}</span>
                </div>
                <div className="flex justify-between">
                  <span>Binding</span>
                  <span>₹{{ none: 0, spiral: 20, hard: 130, soft: 20 }[formData.binding] || 0}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold">Total Amount</span>
                <span className="text-3xl font-black">₹{amount}</span>
              </div>
            </div>

            {message && (
              <div className={`rounded-xl p-4 text-sm font-bold ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                }`}>
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="h-16 w-full text-lg shadow-xl shadow-indigo-500/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={20} />
                  Placing Order...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2" size={20} />
                  Confirm and Pay ₹{amount}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
