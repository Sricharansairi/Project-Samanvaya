"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, User, FileText, HeartPulse, Stethoscope, ShieldCheck, QrCode, FileCheck, UploadCloud, Loader2, Check } from "lucide-react";
import TrustBanner from "@/components/TrustBanner";
import { useLanguage } from "@/contexts/LanguageContext";


export default function PatientPortal() {
  const { t, setLanguage } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [abhaIdInput, setAbhaIdInput] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [assistantStep, setAssistantStep] = useState(1);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-fill from localStorage (Bug 1 fix continuity)
  useEffect(() => {
    const saved = localStorage.getItem("mockAbhaId");
    if (saved) setAbhaIdInput(saved);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (abhaIdInput.trim()) {
      setIsLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/db/history/${abhaIdInput}`);
        const data = await res.json();
        if (data.history) {
          setHistory(data.history);
        }
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
      setIsAuthenticated(true);
    }
  };

  const handleAssistantAction = (action: string, value?: any) => {
    if (action === "open_profile" || value === "profile") setActiveTab("profile");
    else if (action === "open_history" || value === "history") setActiveTab("history");
    else if (action === "open_schemes" || value === "schemes") setActiveTab("schemes");
    else if (action === "open_documents" || value === "documents") setActiveTab("documents");
  };

  // Mock Patient Data
  const patientData = {
    name: "Ramesh Kumar",
    abhaId: abhaIdInput || "91-4820-1934-8291",
    gender: "Male",
    dob: "15 May 1978",
    bloodGroup: "O+",
    phone: "+91 9876543210"
  };

  // BUG 4 FIX: Real file upload simulation
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success">("idle");
  const [uploadedFileName, setUploadedFileName] = useState("");

  const handleFileSelect = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFileName(file.name);
      setUploadState("uploading");
      setTimeout(() => {
        setUploadState("success");
      }, 2000);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      <TrustBanner currentTab="home" onTabChange={() => {}} onLanguageChange={() => {}} />

      {!isAuthenticated ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-100">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-50 text-[#0f4c81] rounded-full flex items-center justify-center">
                <QrCode className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-[#0f2942] mb-2">Patient Login</h1>
            <p className="text-center text-gray-500 mb-8 text-sm">Enter your ABHA ID to access your digital health locker.</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">ABHA Address / ID</label>
                <input 
                  type="text" 
                  value={abhaIdInput}
                  onChange={(e) => setAbhaIdInput(e.target.value)}
                  placeholder="e.g. 91-xxxx-xxxx-xxxx"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f4c81]"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0f4c81] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login via ABDM Sandbox"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col md:flex-row gap-6 relative">
          
          {/* Left Sidebar Menu */}
          <div className="w-full md:w-64 flex flex-col gap-2">
            <div className="mb-6">
              <a href="/" className="flex items-center text-[#0f4c81] hover:underline font-semibold text-sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> {t("generic.back")}
              </a>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-2">
              <button 
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'profile' ? 'bg-[#0f4c81] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <User className="w-5 h-5" /> Profile
              </button>
              <button 
                onClick={() => setActiveTab("history")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'history' ? 'bg-[#0f4c81] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FileText className="w-5 h-5" /> Clinical History
              </button>
              <button 
                onClick={() => setActiveTab("schemes")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'schemes' ? 'bg-[#0f4c81] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <ShieldCheck className="w-5 h-5" /> Schemes & Insurance
              </button>
              <button 
                onClick={() => setActiveTab("documents")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'documents' ? 'bg-[#0f4c81] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FileCheck className="w-5 h-5" /> Upload Records
              </button>
            </div>
            
            <button onClick={() => setIsAuthenticated(false)} className="mt-auto px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors text-left">
              Log Out
            </button>
          </div>

          {/* Right Main Content */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0f2942]">ABHA Health Profile</h2>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Full Name</p>
                      <p className="text-lg font-bold text-[#0f2942]">{patientData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">ABHA Address</p>
                      <p className="text-lg font-bold text-green-700">{patientData.abhaId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Date of Birth</p>
                      <p className="font-semibold text-gray-800">{patientData.dob}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Gender</p>
                      <p className="font-semibold text-gray-800">{patientData.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Blood Group</p>
                      <p className="font-semibold text-red-600">{patientData.bloodGroup}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Linked Phone</p>
                      <p className="font-semibold text-gray-800">{patientData.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0f2942]">Clinical History & Prescriptions</h2>
                
                {history.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center text-gray-500">
                    No clinical history found for this ABHA ID.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((visit, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-[#0f2942]">{visit.chief_concern}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                              <Stethoscope className="w-4 h-4" /> {visit.prescriptions?.[0]?.doctor_name || "Unknown Doctor"} • {visit.department}
                            </p>
                          </div>
                          <span className="text-sm font-bold bg-blue-50 text-[#0f4c81] px-3 py-1 rounded-full">
                            {new Date(visit.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {visit.prescriptions?.[0]?.medications && (
                          <div>
                            <p className="text-sm font-semibold text-gray-500 mb-2">Prescribed Medications</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {visit.prescriptions[0].medications.map((m: any, i: number) => (
                                <li key={i} className="font-medium text-gray-800">
                                  {m.med} - {m.freq} ({m.days}) <span className="text-gray-500 font-normal">[{m.notes}]</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="mt-6 flex justify-end">
                          <button className="text-sm font-bold text-[#0f4c81] hover:underline">Download PDF</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "schemes" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0f2942]">Schemes & Insurance</h2>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-emerald-200 shadow-sm p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <ShieldCheck className="w-12 h-12 text-emerald-600" />
                    <div>
                      <h3 className="text-xl font-bold text-emerald-900">Ayushman Bharat (PM-JAY)</h3>
                      <p className="text-emerald-700 font-semibold">Active & Eligible</p>
                    </div>
                  </div>
                  <p className="text-emerald-800 mb-6">You are eligible for cashless treatment up to ₹5,00,000 per family per year at empaneled hospitals.</p>
                  
                  <div className="bg-white rounded-xl p-4 border border-emerald-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 font-bold mb-1">PM-JAY ID</p>
                      <p className="font-mono font-bold text-gray-800">PMJ-9988-7766</p>
                    </div>
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors">
                      View E-Card
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0f2942]">Upload Medical Records</h2>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                  <p className="text-gray-600 mb-6">Upload past lab reports, prescriptions, or discharge summaries to link them to your ABHA profile securely.</p>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  
                  {uploadState === "idle" && (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-[#0f4c81] cursor-pointer transition-colors"
                    >
                      <UploadCloud className="w-12 h-12 text-[#0f4c81] mb-4" />
                      <p className="font-bold text-gray-700 mb-2">Click to select files</p>
                      <p className="text-sm text-gray-500">Supported formats: PDF, JPEG, PNG (Max 5MB)</p>
                    </div>
                  )}

                  {uploadState === "uploading" && (
                    <div className="border border-blue-100 rounded-xl p-10 flex flex-col items-center justify-center bg-blue-50">
                      <Loader2 className="w-10 h-10 text-[#0f4c81] animate-spin mb-4" />
                      <p className="font-bold text-[#0f4c81] mb-1">Uploading securely...</p>
                      <p className="text-sm text-blue-600/70">{uploadedFileName}</p>
                    </div>
                  )}

                  {uploadState === "success" && (
                    <div className="border border-green-200 rounded-xl p-10 flex flex-col items-center justify-center bg-green-50">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="font-bold text-green-800 mb-1">Upload Complete</p>
                      <p className="text-sm text-green-600 mb-6 text-center">"{uploadedFileName}" has been successfully linked to your ABHA digital locker.</p>
                      <button onClick={() => setUploadState("idle")} className="text-sm font-bold text-[#0f4c81] hover:underline">
                        Upload another file
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}


    </main>
  );
}
