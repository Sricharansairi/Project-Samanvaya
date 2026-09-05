"use client";

import { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, User, FileText, HeartPulse, Stethoscope, ShieldCheck, 
  QrCode, FileCheck, UploadCloud, Loader2, Check, Lock, Download, 
  RotateCw, KeyRound, Smartphone, CheckCircle2, Shield, AlertCircle
} from "lucide-react";
import TrustBanner from "@/components/TrustBanner";
import { useLanguage } from "@/contexts/LanguageContext";
import { AbhaSmartCard, AbhaPatientProfile } from "@/components/AbhaSmartCard";
import { AbhaCreationModal } from "@/components/AbhaCreationModal";

export default function PatientPortal() {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [abhaIdInput, setAbhaIdInput] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "history" | "schemes" | "documents" | "consents">("profile");
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAbhaModalOpen, setIsAbhaModalOpen] = useState(false);

  // Default patient profile
  const [patientProfile, setPatientProfile] = useState<AbhaPatientProfile>({
    name: "Ramesh Kumar",
    abhaId: "91-4820-1934-8291",
    abhaAddress: "ramesh.kumar@abdm",
    gender: "Male",
    dob: "15 May 1978",
    yearOfBirth: "1978",
    bloodGroup: "O+",
    phone: "+91 9876543210",
    address: "Plot 82, Sector 4, R.K. Puram",
    district: "South Delhi",
    state: "Delhi",
    organDonorPledge: true,
    allergies: ["Penicillin", "Sulfa drugs"],
    chronicConditions: ["Type 2 Diabetes Mellitus", "Mild Hypertension"],
    emergencyContactName: "Sunita Kumar (Wife)",
    emergencyContactPhone: "+91 9876500000",
    phcCenter: "Safdarjung Hospital & CHC"
  });

  // Auto-fill from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mockAbhaId");
    if (saved) {
      setAbhaIdInput(saved);
      setPatientProfile(prev => ({ ...prev, abhaId: saved }));
    }
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

  const handleQuickDemoLogin = () => {
    setAbhaIdInput(patientProfile.abhaId);
    setIsAuthenticated(true);
  };

  const handleAbhaCreated = (profile: AbhaPatientProfile) => {
    setPatientProfile(profile);
    setAbhaIdInput(profile.abhaId);
    setIsAuthenticated(true);
  };

  // Real file upload simulation
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
      }, 1500);
    }
  };

  // Mock Consent Requests
  const [consents, setConsents] = useState([
    {
      id: "REQ-2026-9041",
      requester: "AIIMS Delhi (Outpatient Clinic 3)",
      purpose: "Consultation & Prescription Review",
      date: "05 Sep 2026",
      status: "GRANTED"
    },
    {
      id: "REQ-2026-8812",
      requester: "National Health Authority (Scheme Desk)",
      purpose: "PM-JAY Cashless Pre-Authorization",
      date: "04 Sep 2026",
      status: "PENDING"
    }
  ]);

  const handleApproveConsent = (id: string) => {
    setConsents(consents.map(c => c.id === id ? { ...c, status: "GRANTED" } : c));
  };

  const handleRevokeConsent = (id: string) => {
    setConsents(consents.map(c => c.id === id ? { ...c, status: "REVOKED" } : c));
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      <TrustBanner currentTab="home" onTabChange={() => {}} onLanguageChange={() => {}} />

      {!isAuthenticated ? (
        /* Login Screen */
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full border border-gray-100">
            
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-50 text-[#0f4c81] rounded-2xl flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-9 h-9 text-[#0f4c81]" />
              </div>
            </div>

            <div className="text-center mb-8">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Ayushman Bharat Digital Mission
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0f2942] mt-3">Patient Health Portal</h1>
              <p className="text-gray-500 text-xs mt-1">Access your 3D Ayushman PVC Card, prescriptions, and digital locker records.</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Enter 14-Digit ABHA ID or PHR Handle</label>
                <input 
                  type="text" 
                  value={abhaIdInput}
                  onChange={(e) => setAbhaIdInput(e.target.value)}
                  placeholder="e.g. 91-4820-1934-8291 or ramesh.kumar@abdm"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c81]"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0f4c81] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login via ABDM Sandbox"}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200" />
                <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold">OR</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsAbhaModalOpen(true)}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" /> Aadhaar e-KYC
                </button>

                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-gray-800 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  ⚡ One-Click Demo
                </button>
              </div>
            </form>

          </div>
        </div>
      ) : (
        /* Authenticated Patient Dashboard */
        <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col md:flex-row gap-6 relative">
          
          {/* Left Sidebar Menu */}
          <div className="w-full md:w-64 flex flex-col gap-2">
            <div className="mb-4">
              <a href="/" className="flex items-center text-[#0f4c81] hover:underline font-semibold text-sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> {t("generic.back") || "Back to Home"}
              </a>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 space-y-1.5">
              <button 
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                  activeTab === 'profile' ? 'bg-[#0f4c81] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4" /> Ayushman Smart Card
              </button>

              <button 
                onClick={() => setActiveTab("history")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                  activeTab === 'history' ? 'bg-[#0f4c81] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-4 h-4" /> Prescriptions & Care
              </button>

              <button 
                onClick={() => setActiveTab("schemes")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                  activeTab === 'schemes' ? 'bg-[#0f4c81] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Schemes & PM-JAY
              </button>

              <button 
                onClick={() => setActiveTab("documents")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                  activeTab === 'documents' ? 'bg-[#0f4c81] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FileCheck className="w-4 h-4" /> Health Locker Vault
              </button>

              <button 
                onClick={() => setActiveTab("consents")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                  activeTab === 'consents' ? 'bg-[#0f4c81] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Lock className="w-4 h-4" /> ABDM Consents
              </button>
            </div>
            
            <button 
              onClick={() => setIsAuthenticated(false)} 
              className="mt-auto px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors text-left text-sm cursor-pointer"
            >
              Log Out
            </button>
          </div>

          {/* Right Main Content */}
          <div className="flex-1">
            
            {/* PROFILE TAB: 3D AYUSHMAN CARD */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#0f2942]">Official ABHA Smart Card</h2>
                    <p className="text-xs text-gray-500">Government of India Ayushman Bharat Digital Mission (NHA)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAbhaModalOpen(true)}
                    className="text-xs font-bold text-[#0f4c81] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3" /> Re-link with Aadhaar
                  </button>
                </div>

                {/* Photorealistic 3D Ayushman Bharat PVC Card */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 flex flex-col items-center">
                  <AbhaSmartCard patient={patientProfile} />
                </div>

                {/* Extended Details Grid */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-gray-500 font-semibold block uppercase text-[10px]">Registered Address</span>
                    <p className="font-bold text-gray-900 mt-1">{patientProfile.address}, {patientProfile.district}, {patientProfile.state}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-gray-500 font-semibold block uppercase text-[10px]">Linked Phone</span>
                    <p className="font-bold text-gray-900 mt-1">{patientProfile.phone}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-gray-500 font-semibold block uppercase text-[10px]">Organ Donation</span>
                    <p className="font-bold text-emerald-700 mt-1">Pledged with NOTTO (National Registry)</p>
                  </div>
                </div>
              </div>
            )}

            {/* CLINICAL HISTORY TAB */}
            {activeTab === "history" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0f2942]">Clinical History & Prescriptions</h2>
                
                {history.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="font-bold text-gray-700">No past hospital encounters found</p>
                    <p className="text-xs text-gray-500">Once your treating doctor writes an e-prescription, it will sync here automatically.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((visit, idx) => (
                      <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-[#0f2942]">{visit.chief_concern}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                              <Stethoscope className="w-3.5 h-3.5 text-[#0f4c81]" /> {visit.prescriptions?.[0]?.doctor_name || "Dr. Anita Sengupta"} • {visit.department}
                            </p>
                          </div>
                          <span className="text-xs font-bold bg-blue-50 text-[#0f4c81] px-3 py-1 rounded-full border border-blue-100">
                            {new Date(visit.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {visit.prescriptions?.[0]?.medications && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Prescribed Medications</p>
                            <ul className="space-y-2">
                              {visit.prescriptions[0].medications.map((m: any, i: number) => (
                                <li key={i} className="p-3 bg-slate-50 rounded-xl text-xs font-medium text-gray-800 flex justify-between">
                                  <span><strong>{m.med}</strong> — {m.freq} ({m.days})</span>
                                  <span className="text-gray-500 italic">{m.notes}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SCHEMES & INSURANCE TAB */}
            {activeTab === "schemes" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0f2942]">Government Health Protection</h2>
                
                <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 rounded-3xl border border-emerald-200 shadow-sm p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <ShieldCheck className="w-12 h-12 text-emerald-600 shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-emerald-950">Ayushman Bharat (AB PM-JAY)</h3>
                      <p className="text-emerald-700 text-xs font-bold">Active Cashless Protection</p>
                    </div>
                  </div>
                  <p className="text-emerald-900 text-sm mb-6 leading-relaxed">
                    You have active annual cashless inpatient cover of up to <strong>₹5,00,000</strong> per family across all 28,000+ empaneled hospitals in India.
                  </p>
                  
                  <div className="bg-white rounded-2xl p-4 border border-emerald-200 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Linked PM-JAY ID</p>
                      <p className="font-mono font-extrabold text-sm text-gray-800">PMJ-9988-7766-IND</p>
                    </div>
                    <a 
                      href="/his/schemes"
                      className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-700 transition-colors"
                    >
                      Check All Schemes & Claim Process
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* HEALTH LOCKER VAULT TAB */}
            {activeTab === "documents" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0f2942]">ABDM Health Locker Vault</h2>
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
                  <p className="text-gray-600 text-sm mb-6">
                    Upload and secure your diagnostic reports, radiological scans, and past prescriptions with end-to-end encryption.
                  </p>
                  
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
                      className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-[#0f4c81] cursor-pointer transition-colors"
                    >
                      <UploadCloud className="w-12 h-12 text-[#0f4c81] mb-3" />
                      <p className="font-bold text-gray-800 text-sm mb-1">Click to upload health record</p>
                      <p className="text-xs text-gray-500">PDF, JPEG, or DICOM scans (Max 15MB)</p>
                    </div>
                  )}

                  {uploadState === "uploading" && (
                    <div className="border border-blue-100 rounded-2xl p-10 flex flex-col items-center justify-center bg-blue-50">
                      <Loader2 className="w-10 h-10 text-[#0f4c81] animate-spin mb-3" />
                      <p className="font-bold text-[#0f4c81] text-sm">Encrypting & Storing in ABDM Health Locker...</p>
                      <p className="text-xs text-blue-600">{uploadedFileName}</p>
                    </div>
                  )}

                  {uploadState === "success" && (
                    <div className="border border-green-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-green-50">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                        <Check className="w-6 h-6 text-green-700" />
                      </div>
                      <p className="font-bold text-green-900 text-sm mb-1">Upload Successful & Signed</p>
                      <p className="text-xs text-green-700 text-center mb-4">"{uploadedFileName}" is now linked to ABHA #{patientProfile.abhaId}.</p>
                      <button onClick={() => setUploadState("idle")} className="text-xs font-bold text-[#0f4c81] hover:underline cursor-pointer">
                        Upload another record
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ABDM CONSENTS TAB */}
            {activeTab === "consents" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[#0f2942]">Active ABDM Consent Requests</h2>
                    <p className="text-xs text-gray-500">Grant or revoke healthcare providers' access to your health history.</p>
                  </div>
                  <span className="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                    DPDP Act 2023 Compliant
                  </span>
                </div>

                <div className="space-y-3">
                  {consents.map((c) => (
                    <div key={c.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{c.requester}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            c.status === "GRANTED" ? "bg-emerald-100 text-emerald-800" : (c.status === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600")
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{c.purpose}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">Requested on {c.date} • Artefact #{c.id}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {c.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleApproveConsent(c.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Grant Access
                          </button>
                        )}
                        {c.status === "GRANTED" && (
                          <button
                            type="button"
                            onClick={() => handleRevokeConsent(c.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ABDM Verification / Creation Modal */}
      <AbhaCreationModal
        isOpen={isAbhaModalOpen}
        onClose={() => setIsAbhaModalOpen(false)}
        onSuccess={handleAbhaCreated}
      />

    </main>
  );
}
