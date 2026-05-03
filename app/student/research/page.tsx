"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui/core";
import { FileText, Loader2, CheckCircle2 } from "lucide-react";
import { generateResearchPaperFrontPages, ResearchPaperData } from "@/lib/pdf-utils";

export default function ResearchPaperPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<ResearchPaperData>({
    title: "",
    studentName: "",
    collegeName: "",
    guideName: "",
    abstract: "",
    keywords: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const pdfDoc = await generateResearchPaperFrontPages(formData);
      const pdfBytes = await pdfDoc.save();
      
      // Create blob and download
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Research_Front_Pages_${formData.studentName.replace(/\s+/g, '_')}.pdf`;
      link.click();
      
      setSuccess(true);
    } catch (error) {
      console.error("PDF Generation failed", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">PDF Generated Successfully!</h1>
        <p className="mt-4 max-w-md text-zinc-600 dark:text-zinc-400">
          Your research paper front pages have been downloaded. You can now merge them with your main document and place an order.
        </p>
        <div className="mt-10 flex gap-4">
          <Button onClick={() => setSuccess(false)} variant="outline">Create Another</Button>
          <Button onClick={() => window.location.href = '/student/order'}>Proceed to Order</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Research Paper Generator</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Fill in the details below to automatically generate the first 4 pages of your research paper.</p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Research Paper Title</label>
            <Input 
              name="title" 
              placeholder="e.g. AI in Sustainable Agriculture" 
              required 
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Student Name</label>
            <Input 
              name="studentName" 
              placeholder="Your full name" 
              required 
              value={formData.studentName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Guide Name</label>
            <Input 
              name="guideName" 
              placeholder="Professor's name" 
              required 
              value={formData.guideName}
              onChange={handleChange}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">College Name</label>
            <Input 
              name="collegeName" 
              placeholder="University or College name" 
              required 
              value={formData.collegeName}
              onChange={handleChange}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Abstract</label>
            <textarea 
              name="abstract"
              rows={5}
              className="flex w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="Brief summary of your paper..."
              required
              value={formData.abstract}
              onChange={handleChange}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Keywords</label>
            <Input 
              name="keywords" 
              placeholder="e.g. AI, Machine Learning, Agriculture (comma separated)" 
              required 
              value={formData.keywords}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="gap-2" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
            Generate PDF
          </Button>
        </div>
      </form>
    </div>
  );
}
