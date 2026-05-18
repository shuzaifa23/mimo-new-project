"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui/core";
import { Upload, CheckCircle2, Loader2, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PDFDocument } from "pdf-lib";

export default function OrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    printType: "bw",
    copies: 1,
    binding: "none",
    pages: 1,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      printType: "bw",
      copies: 1,
      binding: "none",
      pages: 1,
    });
    setFile(null);
  };

  const amount = useMemo(() => {
    const pageRate = formData.printType === "bw" ? 1 : 5;
    const bindingPrice = { none: 0, spiral: 20, hard: 130, soft: 20 }[formData.binding] || 0;
    const basePrice = 0; 
    return (basePrice + (pageRate * formData.pages * formData.copies) + bindingPrice);
  }, [formData]);

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
    
    // Validate phone number format for Cashfree (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      return setMessage({ type: 'error', text: "Please enter a valid 10-digit phone number." });
    }

    if (formData.copies < 1) return setMessage({ type: 'error', text: "Number of copies must be at least 1" });

    setLoading(true);

    try {
      const orderId = crypto.randomUUID();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const fileName = `${Date.now()}_${cleanFileName}`;
      
      // 1. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const fileUrl = urlData.publicUrl;

      // 2. Store metadata in localStorage (to be inserted after payment success)
      const orderData = {
        ...formData,
        amount,
        fileName: file.name,
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
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all ${dragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10 scale-[1.02]"
                  : "border-zinc-200 bg-white hover:border-indigo-400 dark:border-zinc-800 dark:bg-zinc-950"
                }`}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                  <Upload size={32} />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {file ? file.name : "Drag & drop or click to upload"}
                </h3>
                {file && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle2 size={12} />
                    Smart Detect: {formData.pages} Pages
                  </div>
                )}
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">PDF, DOC, or Images up to 20MB</p>
              </label>
            </div>

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
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Number of Pages</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Number of Copies</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.copies}
                    onChange={(e) => setFormData({ ...formData, copies: parseInt(e.target.value) || 1 })}
                  />
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
              <h3 className="mb-6 text-lg font-bold text-zinc-900 dark:text-white">Contact Info</h3>
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
