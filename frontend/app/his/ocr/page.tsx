"use client";

import { useState, useRef } from "react";
import { ArrowLeft, UploadCloud, Camera, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function OCRScanner() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        // Strip the data:image/jpeg;base64, prefix for the backend
        const base64Data = base64.split(",")[1];
        setBase64Image(base64Data);
        setResults(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!base64Image) return;
    setIsScanning(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/api/vision/ocr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64_image: base64Image }),
      });
      
      if (!response.ok) throw new Error("Failed to scan document");
      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      console.error(err);
      setError("Vision API failed to parse this document. Ensure the backend has NVIDIA API keys configured.");
    }
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-[#0f4c81] p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#0f2942]">AI Prescription OCR</h1>
            <p className="text-sm text-gray-500">Powered by NVIDIA Llama-3.2-Vision</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Upload Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
            <h2 className="text-lg font-bold text-[#0f2942] mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#0f4c81]" />
              Capture Document
            </h2>
            
            {!imagePreview ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-10 flex-1 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-700 text-center">Click to upload prescription</h3>
                <p className="text-sm text-gray-500 text-center mt-2">Supports JPG, PNG, WEBP (Max 5MB)</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="relative rounded-xl overflow-hidden border border-gray-200 flex-1 min-h-[300px] bg-black/5">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain absolute inset-0" />
                </div>
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => { setImagePreview(null); setBase64Image(null); setResults(null); }}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-slate-100 transition-colors"
                  >
                    Retake
                  </button>
                  <button 
                    onClick={handleScan}
                    disabled={isScanning}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#0f4c81] text-white font-semibold hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isScanning ? <><Loader2 className="w-5 h-5 animate-spin" /> Scanning...</> : "Analyze Document"}
                  </button>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-700 flex gap-3 text-sm border border-red-100">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </section>

          {/* Results Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <h2 className="text-lg font-bold text-[#0f2942] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0f4c81]" />
              Analysis Results
            </h2>
            
            {isScanning ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                <Loader2 className="w-10 h-10 text-[#0f4c81] animate-spin mb-4" />
                <h3 className="font-bold text-[#0f2942] text-lg">AI is processing...</h3>
                <p className="text-sm">Reading handwriting, detecting medications and structured data via NVIDIA NIM.</p>
              </div>
            ) : results ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 flex-1 overflow-y-auto pr-2"
              >
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Document Type</span>
                  <div className="mt-1 flex items-center gap-2 text-[#0f2942] font-semibold bg-slate-100 px-3 py-2 rounded-lg w-fit">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {results.document_type || "Prescription / Medical Record"}
                  </div>
                </div>

                {results.diagnoses && results.diagnoses.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detected Diagnoses</span>
                    <ul className="mt-2 space-y-2">
                      {results.diagnoses.map((diag: string, i: number) => (
                        <li key={i} className="flex gap-2 items-start text-sm text-gray-800 bg-orange-50 border border-orange-100 px-3 py-2 rounded-lg">
                          <span className="text-orange-500 mt-0.5">•</span> {diag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.medications && results.medications.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Extracted Medications</span>
                    <div className="mt-2 grid gap-2">
                      {results.medications.map((med: string, i: number) => (
                        <div key={i} className="text-sm text-[#0f4c81] font-semibold bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg">
                          {med}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {results.abnormal_labs && results.abnormal_labs.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Abnormal Labs</span>
                    <ul className="mt-2 space-y-2">
                      {results.abnormal_labs.map((lab: string, i: number) => (
                        <li key={i} className="text-sm text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                          {lab}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                <FileText className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-sm">Upload a document and click scan to see extracted details here.</p>
              </div>
            )}
          </section>
          
        </div>
      </main>
    </div>
  );
}
