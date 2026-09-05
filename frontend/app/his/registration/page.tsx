"use client";

import { useState } from "react";
import { ArrowLeft, UserPlus, FileHeart, QrCode, ClipboardCheck, Sparkles, Loader2 } from "lucide-react";
import TrustBanner from "@/components/TrustBanner";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChipParameterModal, ParamConfig } from "@/components/ChipParameterModal";


export default function RegistrationDashboard() {
  const { t, setLanguage } = useLanguage();
  const [step, setStep] = useState(1);
  const [patientData, setPatientData] = useState({
    name: "",
    phone: "",
    abhaId: "",
  });
  const [vitals, setVitals] = useState({
    weight: "",
    bp: "",
    temp: ""
  });
  const [chiefConcern, setChiefConcern] = useState("");
  const [isGeneratingAbha, setIsGeneratingAbha] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);

  // Dynamic Chip Parameter States
  const [isChipModalOpen, setIsChipModalOpen] = useState(false);
  const [chipConfigs, setChipConfigs] = useState<ParamConfig[]>([]);
  const [chipStep, setChipStep] = useState(1);
  const [chipConditionName, setChipConditionName] = useState("Diagnostic Questions");
  const [chipAnswers, setChipAnswers] = useState<Record<string, any>>({});
  const [isLoadingChips, setIsLoadingChips] = useState(false);

  const generateMockAbha = async () => {
    setIsGeneratingAbha(true);
    // Simulate ABDM Delay
    await new Promise(r => setTimeout(r, 1000));
    const p1 = Math.floor(1000 + Math.random() * 9000);
    const p2 = Math.floor(1000 + Math.random() * 9000);
    const p3 = Math.floor(1000 + Math.random() * 9000);
    const newAbha = `91-${p1}-${p2}-${p3}`;
    
    setPatientData({ ...patientData, abhaId: newAbha });
    
    // BUG 1 FIX: Store locally for easy access in the demo Patient Portal
    localStorage.setItem("mockAbhaId", newAbha);
    setIsGeneratingAbha(false);
  };

  const handleTriageSubmit = async () => {
    setStep(3); // Go to loading screen immediately
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      // 1. Register Patient in DB
      await fetch(`${baseUrl}/api/db/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          abha_id: patientData.abhaId,
          name: patientData.name,
          phone: patientData.phone || "9999999999"
        })
      });

      // 2. Generate Visit & Triage in DB (BUG 5 FIX: Token generation handled by backend)
      const dept = chiefConcern.toLowerCase().includes("heart") ? "Cardiology" : "General Medicine & AYUSH";
      const urgency = chiefConcern.toLowerCase().includes("pain") ? "High" : "Medium";

      const res = await fetch(`${baseUrl}/api/db/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          abha_id: patientData.abhaId,
          vitals: vitals,
          chief_concern: chiefConcern,
          urgency: urgency,
          department: dept
        })
      });
      
      const data = await res.json();
      
      if (data.status === "success") {
        setTokenData({
          tokenNumber: data.visit.token_number,
          department: data.visit.department,
          room: "Room 4, Floor 1"
        });
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error(err);
      // Fallback if backend is down during demo
      setTokenData({
        tokenNumber: `A-${Math.floor(100 + Math.random() * 900)}`,
        department: "General Medicine",
        room: "Room 4, Floor 1"
      });
    }
  };

  // Dynamic Chip Interrogator Handlers
  const handleOpenChipInterrogator = async () => {
    if (!chiefConcern.trim()) {
      alert("Please enter patient symptoms first to generate targeted questions.");
      return;
    }
    setIsLoadingChips(true);
    try {
      const res = await fetch("/api/rag/interrogate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint: chiefConcern })
      });
      const data = await res.json();
      if (data.success && data.parameterConfigs?.length > 0) {
        setChipConfigs(data.parameterConfigs);
        setChipConditionName(data.guideline?.condition || "Clinical Follow-up");
        setChipStep(1);
        setChipAnswers({});
        setIsChipModalOpen(true);
      }
    } catch (err) {
      console.error("Chip interrogator error:", err);
    } finally {
      setIsLoadingChips(false);
    }
  };

  const handleChipComplete = (allAnswers: Record<string, any>) => {
    setIsChipModalOpen(false);
    const formattedAnswers = Object.entries(allAnswers)
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join(" | ");
    setChiefConcern(prev => `${prev}\n[AI Clinical Notes: ${formattedAnswers}]`);
  };

  // Autonomous Form Filling Router
  const handleAssistantAction = (action: string, value?: any) => {
    if (action === "fill_name") setPatientData(prev => ({ ...prev, name: value }));
    else if (action === "fill_phone") setPatientData(prev => ({ ...prev, phone: value }));
    else if (action === "fill_weight") setVitals(prev => ({ ...prev, weight: value }));
    else if (action === "fill_bp") setVitals(prev => ({ ...prev, bp: value }));
    else if (action === "fill_temp") setVitals(prev => ({ ...prev, temp: value }));
    else if (action === "fill_concern") setChiefConcern(value);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      <TrustBanner currentTab="home" onTabChange={() => {}} onLanguageChange={() => {}} />

      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 relative">
        
        <div className="mb-6 flex justify-between items-center">
          <a href="/his" className="flex items-center text-[#0f4c81] hover:underline font-semibold text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> {t("generic.back")}
          </a>
          <h1 className="text-xl font-bold text-[#0f2942]">
            Registration & Intake Dashboard
          </h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Sidebar Steps */}
          <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-6 flex flex-col gap-6">
            <div className={`flex items-center gap-3 ${step === 1 ? 'text-[#0f4c81]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 1 ? 'bg-blue-100' : 'bg-gray-200'}`}>1</div>
              <span className="font-semibold text-sm">Patient & ABHA ID</span>
            </div>
            <div className={`flex items-center gap-3 ${step === 2 ? 'text-[#0f4c81]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 2 ? 'bg-blue-100' : 'bg-gray-200'}`}>2</div>
              <span className="font-semibold text-sm">Vitals & Chief Concern</span>
            </div>
            <div className={`flex items-center gap-3 ${step === 3 ? 'text-[#0f4c81]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 3 ? 'bg-blue-100' : 'bg-gray-200'}`}>3</div>
              <span className="font-semibold text-sm">Token & ICQR</span>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="flex-1 p-6 sm:p-10">
            
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0f2942] flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-purple-600" /> Patient Details
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={patientData.name}
                      onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#0f4c81]" 
                      placeholder="e.g. Ramesh Kumar"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={patientData.phone}
                      onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#0f4c81]" 
                      placeholder="+91"
                    />
                  </div>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6">
                  <h3 className="text-lg font-bold text-[#0f2942] mb-4">ABHA ID (Sandbox Mock)</h3>
                  
                  {patientData.abhaId ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-700 font-semibold mb-1">Generated ABHA Address</p>
                        <p className="text-xl font-bold text-green-900 tracking-wider">{patientData.abhaId}</p>
                      </div>
                      <ClipboardCheck className="w-8 h-8 text-green-600" />
                    </div>
                  ) : (
                    <button 
                      onClick={generateMockAbha}
                      disabled={isGeneratingAbha}
                      className="w-full py-4 border-2 border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingAbha ? "Simulating ABDM Sandbox..." : (
                        <><QrCode className="w-5 h-5" /> Generate Mock ABHA ID</>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex justify-end mt-8">
                  <button 
                    onClick={() => setStep(2)}
                    disabled={!patientData.name || !patientData.abhaId}
                    className="bg-[#0f4c81] text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50"
                  >
                    Next: Vitals Intake
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#0f2942] flex items-center gap-2">
                  <FileHeart className="w-6 h-6 text-red-500" /> Clinical Vitals & Intake
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Weight (kg)</label>
                    <input 
                      type="number" 
                      value={vitals.weight}
                      onChange={(e) => setVitals({...vitals, weight: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      placeholder="70" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">BP (mmHg)</label>
                    <input 
                      type="text" 
                      value={vitals.bp}
                      onChange={(e) => setVitals({...vitals, bp: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      placeholder="120/80" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Temp (°F)</label>
                    <input 
                      type="number" 
                      value={vitals.temp}
                      onChange={(e) => setVitals({...vitals, temp: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      placeholder="98.6" 
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-[#0f2942]">Chief Concern / Symptoms</label>
                    <button
                      type="button"
                      onClick={handleOpenChipInterrogator}
                      disabled={isLoadingChips}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#0f4c81] hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer shadow-xs"
                    >
                      {isLoadingChips ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      ✨ Clarify with AI Diagnostic Chips (RAG)
                    </button>
                  </div>
                  <textarea 
                    rows={4}
                    value={chiefConcern}
                    onChange={(e) => setChiefConcern(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:border-[#0f4c81]"
                    placeholder="Enter patient symptoms here (e.g. Chest pain radiating to arm, Severe fever with petechial spots, or Stomach pain)..."
                  />
                </div>

                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep(1)} className="px-6 py-3 font-semibold text-gray-500">Back</button>
                  <button 
                    onClick={handleTriageSubmit}
                    disabled={!chiefConcern}
                    className="bg-[#0f4c81] text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50"
                  >
                    Triage & Generate Token
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 flex flex-col items-center justify-center text-center py-10">
                {!tokenData ? (
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-[#0f4c81] rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-semibold">Running AI Triage & Generating ICQR Token...</p>
                  </div>
                ) : (
                  <div className="w-full max-w-sm">
                    <div className="bg-emerald-50 text-emerald-800 p-3 rounded-t-xl font-bold flex justify-between items-center border border-emerald-200 border-b-0">
                      <span>Live Token</span>
                      <span className="text-xs bg-emerald-200 px-2 py-1 rounded">Active</span>
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-b-xl p-8 shadow-lg relative overflow-hidden">
                      {/* Decorative corner */}
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-50 rounded-full"></div>
                      
                      <p className="text-sm text-gray-500 font-semibold mb-1">Queue Number</p>
                      <h2 className="text-5xl font-black text-[#0f2942] mb-6 tracking-tighter">{tokenData.tokenNumber}</h2>
                      
                      <div className="bg-gray-50 rounded-lg p-4 text-left border border-gray-100">
                        <p className="text-xs text-gray-500 font-semibold mb-1">Assigned Department</p>
                        <p className="text-sm font-bold text-[#0f4c81]">{tokenData.department}</p>
                        <p className="text-xs text-gray-600 mt-1">{tokenData.room}</p>
                      </div>

                      <div className="mt-6 flex justify-center">
                        {/* Mock ICQR Square */}
                        <div className="w-32 h-32 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center text-gray-400 text-xs text-center p-2 font-mono">
                          ICQR<br/>Tree QR<br/>Simulator
                        </div>
                      </div>
                    </div>

                    <button onClick={() => {
                      setStep(1);
                      setPatientData({name: "", phone: "", abhaId: ""});
                      setChiefConcern("");
                      setTokenData(null);
                    }} className="mt-8 text-[#0f4c81] font-bold hover:underline">
                      + Register Next Patient
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Dynamic AI Clinical Chip Parameter Modal */}
      <ChipParameterModal
        isOpen={isChipModalOpen}
        onClose={() => setIsChipModalOpen(false)}
        conditionName={chipConditionName}
        parameterConfigs={chipConfigs}
        currentStep={chipStep}
        totalSteps={chipConfigs.length}
        onNext={(stepAnswer) => {
          setChipStep(prev => Math.min(prev + 1, chipConfigs.length));
        }}
        onPrevious={() => {
          setChipStep(prev => Math.max(prev - 1, 1));
        }}
        onComplete={handleChipComplete}
        currentAnswers={chipAnswers}
      />
    </main>
  );
}
