"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui/core";
import { Store, ShieldCheck, MapPin, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

export default function PartnerPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center dark:bg-zinc-950">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20">
          <ShieldCheck size={40} />
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Application Received!</h1>
        <p className="mt-4 max-w-md text-zinc-600 dark:text-zinc-400">
          Thank you for joining MIMO Print. Our team will verify your shop details and get back to you within 24 hours.
        </p>
        <div className="mt-10">
          <Button onClick={() => window.location.href = '/'}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
              Grow your shop with <br />
              <span className="text-indigo-600">MIMO Print</span>
            </h1>
            <p className="mt-6 text-xl text-zinc-600 dark:text-zinc-400">
              Join our network of partner Xerox shops and start receiving digital orders from students directly.
            </p>

            <div className="mt-12 space-y-8">
              {[
                { title: "Increase Revenue", desc: "Get orders from students who prefer digital convenience over waiting in lines." },
                { title: "Smart Management", desc: "Use our dashboard to manage your print queue and organize daily workflow." },
                { title: "Verified Partner", desc: "Get a 'Verified' badge and featured placement on our platform." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-zinc-900">
                    <CheckCircle2 className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white">{item.title}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 sm:p-12">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Partner Application</h2>
            <p className="mt-2 text-zinc-500">Fill out the form to register your shop.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Shop Name</label>
                  <Input placeholder="e.g. Modern Xerox Solutions" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Owner Name</label>
                  <Input placeholder="Full Name" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Contact Number</label>
                  <Input placeholder="Phone Number" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Shop Address</label>
                  <textarea 
                    className="flex w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                    placeholder="Full address of your shop"
                    rows={3}
                    required
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="h-14 w-full text-lg" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={24} /> : "Submit Application"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
