"use client";

import { useState, useEffect } from "react";
import { Button, Input } from "@/components/ui/core";
import { FileText, Loader2, CheckCircle2, UserPlus, Trash2 } from "lucide-react";
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
    guideAffiliation: "Associate Professor, School of C&SE, REVA University",
    coGuideName: "",
    coGuideAffiliation: "Assistant Professor, School of C&SE, REVA University",
    hodName: "Dr. M. Devendra",
    directorName: "Dr. Sunilkumar S. Manvi",
    viceChancellorName: "Dr. M. Dhanamjaya",
    academicYear: "2025-2026",
    plagiarismScore: "less than 20%",
    projectType: "mini project",
    abstract: "",
    keywords: "",
    acknowledgement: "",
  });

  // Automatically update dynamic acknowledgement when guide/candidates/department names change
  useEffect(() => {
    const names = candidates.filter(c => c.name.trim() !== "").map(c => c.name).join(", ");
    const defaultAck = `Any given task achieved is never the result of the efforts of a single individual. There are always a bunch of people who play an instrumental role leading a task to its completion. Our joy at having successfully finished our ${formData.projectType || "mini project"} work would be incomplete without thanking everyone who helped us out along the way. We would like to express our sense of gratitude to our REVA University for providing us the means of attaining our most cherished goal.\n\nWe would like to thank our Hon'ble Chancellor, Dr. P. Shyama Raju and Hon'ble Vice-Chancellor, ${formData.viceChancellorName || "[Vice-Chancellor Name]"} for their immense support towards students to showcase innovative ideas.\n\nWe cannot express enough thanks to our respected Director, ${formData.directorName || "[Director Name]"} for providing us with a highly conducive environment and encouraging the growth and creativity of each and every student. We would also like to offer our sincere gratitude to our Project Coordinators for the numerous learning opportunities that have been provided.\n\nWe would like to take this opportunity to express our gratitude to our Project Guide, ${formData.guideName || "[Guide Name]"}, for continuously supporting and guiding us in our every endeavor as well as for taking a keen and active interest in the progress of every phase of our Project. Thank you for providing us with the necessary inputs and suggestions for advancing with our Project work. We deeply appreciate the wise guidance that sir/ma'am has provided.\n\nFinally, we would like to extend our sincere thanks to all the faculty members and staff from the ${formData.schoolName || "[School Name]"}.`;
    setFormData(prev => ({ ...prev, acknowledgement: defaultAck }));
  }, [formData.guideName, formData.directorName, formData.schoolName, formData.viceChancellorName, formData.projectType, candidates]);

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
          Your project report front pages (Cover Page, Declaration, Certificate, Acknowledgement, Table of Contents, Abstract) have been downloaded. You can now merge them with your main report!
        </p>
        <div className="mt-10 flex gap-4">
          <Button onClick={() => setSuccess(false)} variant="outline">Create Another</Button>
          <Button onClick={() => window.location.href = '/student/order'}>Proceed to Print Order</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl font-sans">
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
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Project Type</label>
              <select
                name="projectType"
                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-white"
                value={formData.projectType}
                onChange={handleChange as any}
              >
                <option value="mini project">Mini Project</option>
                <option value="major project">Major Project</option>
                <option value="project">Project / Dissertation</option>
              </select>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Degree</label>
              <select
                name="degree"
                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-white"
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

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Plagiarism similarity score limit</label>
              <Input 
                name="plagiarismScore" 
                placeholder="e.g. less than 20%" 
                required 
                value={formData.plagiarismScore}
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
                    placeholder="e.g. Mr. RAMESH KUMAR / Ms. PRIYA S"
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
                placeholder="e.g. Dr. Prof. Aruna Kumar" 
                required 
                value={formData.guideName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Project Guide Affiliation / Designation</label>
              <Input 
                name="guideAffiliation" 
                placeholder="e.g. Associate Professor, School of C&SE, REVA University" 
                required 
                value={formData.guideAffiliation}
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

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Co-Guide Affiliation / Designation (Optional)</label>
              <Input 
                name="coGuideAffiliation" 
                placeholder="e.g. Assistant Professor, School of C&SE, REVA University" 
                value={formData.coGuideAffiliation}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Head of Department (HoD) Name</label>
              <Input 
                name="hodName" 
                placeholder="e.g. Dr. M. Devendra" 
                required 
                value={formData.hodName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">School Director Name</label>
              <Input 
                name="directorName" 
                placeholder="e.g. Dr. Sunilkumar S. Manvi" 
                required 
                value={formData.directorName}
                onChange={handleChange}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Vice Chancellor Name</label>
              <Input 
                name="viceChancellorName" 
                placeholder="e.g. Dr. M. Dhanamjaya" 
                required 
                value={formData.viceChancellorName}
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
                className="flex w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-white"
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
                className="flex w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-white"
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
