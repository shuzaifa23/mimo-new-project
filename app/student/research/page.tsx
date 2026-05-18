"use client";

import { useState, useEffect } from "react";
import { Button, Input } from "@/components/ui/core";
import { FileText, Loader2, CheckCircle2, UserPlus, Trash2, Plus, Minus } from "lucide-react";
import { generateResearchPaperFrontPages, ResearchPaperData } from "@/lib/pdf-utils";

export default function ResearchPaperPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Dynamic state for candidates (initially one candidate)
  const [candidates, setCandidates] = useState<{ name: string; srn: string }[]>([
    { name: "", srn: "" }
  ]);

  const [formData, setFormData] = useState({
    title: "",
    schoolName: "School of Computer Science and Engineering",
    degree: "Bachelor of Technology",
    departmentName: "Computer Science and Engineering",
    guideName: "",
    coGuideName: "",
    directorName: "Dr. Sunilkumar S. Manvi",
    academicYear: "2026",
    abstract: "",
    keywords: "",
    acknowledgement: "",
  });

  // Automatically update dynamic acknowledgement when guide/candidates/department names change
  useEffect(() => {
    const names = candidates.filter(c => c.name.trim() !== "").map(c => c.name).join(", ");
    const defaultAck = `First and foremost, we express our profound gratitude to our esteemed guide, ${formData.guideName || "[Guide Name]"}, whose encouragement, continuous support, and invaluable guidance throughout this project played a pivotal role. We are highly indebted for the time and efforts invested in directing us.\n\nWe express our sincere thanks to ${formData.directorName || "[Director Name]"}, Director of the ${formData.schoolName || "[School Name]"}, REVA University, for providing us with the necessary campus resources and support structures to implement this project.\n\nLastly, we wish to express our heartfelt gratitude to our parents, family members, and friends for their constant emotional support and blessings, which motivated us during times of difficulty.`;
    setFormData(prev => ({ ...prev, acknowledgement: defaultAck }));
  }, [formData.guideName, formData.directorName, formData.schoolName, candidates]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCandidateChange = (index: number, field: 'name' | 'srn', value: string) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };

  const addCandidate = () => {
    if (candidates.length < 4) {
      setCandidates([...candidates, { name: "", srn: "" }]);
    }
  };

  const removeCandidate = (index: number) => {
    if (candidates.length > 1) {
      setCandidates(candidates.filter((_, i) => i !== index));
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const filledCandidates = candidates.filter(c => c.name.trim() !== "" && c.srn.trim() !== "");
    if (filledCandidates.length === 0) {
      alert("Please enter at least one candidate name and SRN.");
      return;
    }

    setLoading(true);
    try {
      const payload: ResearchPaperData = {
        ...formData,
        candidates: filledCandidates,
      };

      const pdfDoc = await generateResearchPaperFrontPages(payload);
      const pdfBytes = await pdfDoc.save();
      
      // Create blob and download
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `REVA_Front_Pages_${formData.title.trim().replace(/\s+/g, '_')}.pdf`;
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
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Front Pages Generated Successfully!</h1>
        <p className="mt-4 max-w-md text-zinc-600 dark:text-zinc-400">
          Your project report front pages (Cover Page, Declaration, Certificate, Certificate of Revision, Acknowledgement, Abstract) have been downloaded. You can now merge them with your main report!
        </p>
        <div className="mt-10 flex gap-4">
          <Button onClick={() => setSuccess(false)} variant="outline">Create Another</Button>
          <Button onClick={() => window.location.href = '/student/order'}>Proceed to Print Order</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">REVA University Project Report Generator</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Dynamically fill out your details to auto-generate all required standard front pages matching the REVA University specimen layout.</p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-8">
        {/* SECTION 1: REPORT & BRANCH DETAILS */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-3">1. Academic & Report Details</h2>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Project / Dissertation Title</label>
              <Input 
                name="title" 
                placeholder="e.g. DEEP LEARNING MODEL FOR MEDICAL DIAGNOSIS" 
                required 
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Degree</label>
              <select
                name="degree"
                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                value={formData.degree}
                onChange={handleChange as any}
              >
                <option value="Bachelor of Technology">Bachelor of Technology (B.Tech)</option>
                <option value="Master of Technology">Master of Technology (M.Tech)</option>
                <option value="Bachelor of Architecture">Bachelor of Architecture (B.Arch)</option>
                <option value="Master of Business Administration">Master of Business Administration (MBA)</option>
                <option value="Master of Computer Applications">Master of Computer Applications (MCA)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Department / Branch</label>
              <Input 
                name="departmentName" 
                placeholder="e.g. Computer Science and Engineering" 
                required 
                value={formData.departmentName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">University School Name</label>
              <Input 
                name="schoolName" 
                placeholder="e.g. School of Computer Science and Engineering" 
                required 
                value={formData.schoolName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Academic Year</label>
              <Input 
                name="academicYear" 
                placeholder="e.g. 2025-2026" 
                required 
                value={formData.academicYear}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: CANDIDATE DETAILS (UP TO 4) */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">2. Student Candidates</h2>
            {candidates.length < 4 && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addCandidate}
                className="rounded-xl flex items-center gap-1 h-9 px-3"
              >
                <UserPlus size={14} /> Add Student
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            {candidates.map((cand, idx) => (
              <div key={idx} className="flex gap-4 items-end bg-zinc-50/50 p-4 rounded-xl dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-800">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-bold text-zinc-500">Student {idx + 1} Name</label>
                  <Input 
                    placeholder="e.g. RAMESH KUMAR"
                    value={cand.name}
                    onChange={(e) => handleCandidateChange(idx, 'name', e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-bold text-zinc-500">SRN (Student Register Number)</label>
                  <Input 
                    placeholder="e.g. R21CS001"
                    value={cand.srn}
                    onChange={(e) => handleCandidateChange(idx, 'srn', e.target.value)}
                    required
                  />
                </div>
                {candidates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCandidate(idx)}
                    className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl dark:hover:bg-rose-950/20 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: GUIDES & AUTHORITIES */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-3">3. Guides & Approval Authorities</h2>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Project Guide Name</label>
              <Input 
                name="guideName" 
                placeholder="e.g. Prof. Aruna Kumar" 
                required 
                value={formData.guideName}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Co-Guide Name (Optional)</label>
              <Input 
                name="coGuideName" 
                placeholder="e.g. Dr. Ramesh Babu (if any)" 
                value={formData.coGuideName}
                onChange={handleChange}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">School Director Name</label>
              <Input 
                name="directorName" 
                placeholder="e.g. Dr. Sunilkumar S. Manvi" 
                value={formData.directorName}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: ABSTRACT, KEYWORDS & ACKNOWLEDGEMENT */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-3">4. Summary, Abstract & Acknowledgement</h2>
          
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Abstract</label>
              <textarea 
                name="abstract"
                rows={6}
                className="flex w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                placeholder="Enter your project summary / abstract here (up to 500 words)..."
                required
                value={formData.abstract}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Keywords</label>
              <Input 
                name="keywords" 
                placeholder="e.g. Deep Learning, Medical Imaging, CNN, Healthcare (comma separated)" 
                required 
                value={formData.keywords}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Acknowledgement Text (Pre-generated - Feel free to customize)</label>
              <textarea 
                name="acknowledgement"
                rows={8}
                className="flex w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                placeholder="Customize acknowledgement message..."
                value={formData.acknowledgement}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="submit" size="lg" className="h-14 px-8 gap-2 font-bold shadow-xl shadow-indigo-500/20" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
            Generate Front Pages PDF
          </Button>
        </div>
      </form>
    </div>
  );
}
