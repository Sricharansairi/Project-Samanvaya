"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import TrustBanner from "@/components/TrustBanner";
import FloatingAssistant from "@/components/FloatingAssistant";
import PrivateModeToggle from "@/components/PrivateModeToggle";

// The 12-Step Modular Components
import Step1_Language from "@/components/Step1_Language";
import Step2_Identify from "@/components/Step2_Identify";
import Step3_Consent from "@/components/Step3_Consent";
import Step4_ModeSelect from "@/components/Step4_ModeSelect";
import Step5_ConversationalHistory from "@/components/Step5_ConversationalHistory";
import Step6_AyushModule from "@/components/Step6_AyushModule";
import Step7_DocumentScan from "@/components/Step7_DocumentScan";
import Step8_SchemeEligibility from "@/components/Step8_SchemeEligibility";
import Step9_RedFlag from "@/components/Step9_RedFlag";
import Step10_ConfirmSubmit from "@/components/Step10_ConfirmSubmit";
import Step11_TokenWait from "@/components/Step11_TokenWait";
import Step12_PhysicianDashboard from "@/components/Step12_PhysicianDashboard";

export default function Home() {
  // Navigation Step: 1 through 12
  const [step, setStep] = useState(1);
  const [showRedFlag, setShowRedFlag] = useState(false);

  // Global Session State
  const [selectedLanguage, setSelectedLanguage] = useState("hi");
  const [patientData, setPatientData] = useState<{
    abhaId: string;
    name: string;
    isCaregiver: boolean;
    caregiverName?: string;
  }>({
    abhaId: "91-4820-1934-8291",
    name: "Ramesh Kumar (Self)",
    isCaregiver: false
  });
  const [intakeMode, setIntakeMode] = useState<"allopathic" | "ayurvedic" | "integrated">("integrated");
  const [historyData, setHistoryData] = useState({
    chiefComplaint: "Fever and persistent productive cough",
    timeline: "Few Days",
    selectedChips: ["Since yesterday morning", "High fever with chills"],
    isRedFlag: false
  });
  const [ayushData, setAyushData] = useState({
    agni: "Manda (Sluggish/Bloated)",
    nidra: "Disturbed / Insomnia",
    dietHabits: "Wheat Roti & Dal",
    fastingObserved: false
  });
  const [matchedScheme, setMatchedScheme] = useState("Ayushman Bharat PM-JAY (₹5L Coverage)");

  // Assistant Action Bridge
  const handleAssistantAction = (action: string, value?: any) => {
    if (action === "open_scheme") setStep(8);
    if (action === "doctor_view") setStep(12);
    if (action === "restart") setStep(1);
  };

  return (
    <main className="min-h-screen bg-[#08080a] text-white flex flex-col items-center justify-between relative overflow-x-hidden font-sans selection:bg-[#C2CD93] selection:text-black">
      {/* Ambient background glow aesthetics */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#C891AA]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-[#C2CD93]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Persistent Trust & Nurse Review Banner */}
      <TrustBanner />

      {/* Top Interface Role Switcher */}
      <div className="w-full max-w-5xl px-4 pt-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2 bg-black/60 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl">
          <button
            onClick={() => setStep(1)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              step <= 11
                ? "bg-[#C2CD93] text-black shadow-[0_0_15px_rgba(194,205,147,0.3)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🏥 Patient Kiosk / PWA
          </button>
          <button
            onClick={() => setStep(12)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              step === 12
                ? "bg-[#C891AA] text-black shadow-[0_0_15px_rgba(200,145,170,0.3)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🩺 Physician Desk (Doctor View)
          </button>
        </div>

        {/* Gender & Modesty Routing Toggle */}
        <div className="relative">
          <PrivateModeToggle 
            onTogglePrivateMode={(isPriv) => console.log("Private Mode:", isPriv)} 
            onFemaleStaffPreference={(pref) => console.log("Female Staff:", pref)} 
          />
        </div>
      </div>

      {/* Main Flow Container */}
      <div className="flex-1 w-full flex flex-col items-center justify-center px-4 py-8 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Welcome & Language */}
          {step === 1 && (
            <Step1_Language
              key="step1"
              selectedLanguage={selectedLanguage}
              onSelectLanguage={(lang) => setSelectedLanguage(lang)}
              onNext={() => setStep(2)}
            />
          )}

          {/* STEP 2: Identification & Auth */}
          {step === 2 && (
            <Step2_Identify
              key="step2"
              onIdentify={(data) => setPatientData(data)}
              onNext={() => setStep(3)}
            />
          )}

          {/* STEP 3: Audio-Verifiable Consent */}
          {step === 3 && (
            <Step3_Consent
              key="step3"
              onConsentGiven={() => console.log("Consent Confirmed")}
              onNext={() => setStep(4)}
            />
          )}

          {/* STEP 4: Mode Select */}
          {step === 4 && (
            <Step4_ModeSelect
              key="step4"
              selectedMode={intakeMode}
              onSelectMode={(m) => setIntakeMode(m)}
              onNext={() => setStep(5)}
            />
          )}

          {/* STEP 5: Conversational History */}
          {step === 5 && (
            <Step5_ConversationalHistory
              key="step5"
              onHistorySubmit={(hist) => setHistoryData(hist)}
              onNext={() => setStep(6)}
              onTriggerRedFlag={() => setShowRedFlag(true)}
            />
          )}

          {/* STEP 6: AYUSH Picture Module */}
          {step === 6 && (
            <Step6_AyushModule
              key="step6"
              selectedLanguage={selectedLanguage}
              onAyushSubmit={(ayush) => setAyushData(ayush)}
              onNext={() => setStep(7)}
            />
          )}

          {/* STEP 7: Document & Prescription Scan */}
          {step === 7 && (
            <Step7_DocumentScan
              key="step7"
              onScanComplete={(data) => console.log("OCR Data:", data)}
              onNext={() => setStep(8)}
            />
          )}

          {/* STEP 8: Scheme Eligibility */}
          {step === 8 && (
            <Step8_SchemeEligibility
              key="step8"
              patientState="Rajasthan"
              onSchemeConfirmed={(sch) => setMatchedScheme(sch)}
              onNext={() => setStep(10)} // Step 9 is interstitial red flag if triggered
            />
          )}

          {/* STEP 10: Confirm & Submit (Green/Red/Back Loop) */}
          {step === 10 && (
            <Step10_ConfirmSubmit
              key="step10"
              summaryData={{
                name: patientData.name,
                complaint: historyData.chiefComplaint,
                timeline: historyData.timeline,
                agni: ayushData.agni,
                nidra: ayushData.nidra,
                scheme: matchedScheme
              }}
              onConfirm={() => setStep(11)}
              onRetry={() => setStep(5)}
              onBack={() => setStep(step - 1 > 0 ? step - 1 : 1)}
            />
          )}

          {/* STEP 11: Token & Wait Screen */}
          {step === 11 && (
            <Step11_TokenWait
              key="step11"
              tokenNumber="A-142"
              department="General Medicine & AYUSH (Room 4, Floor 1)"
              onOpenDoctorView={() => setStep(12)}
            />
          )}

          {/* STEP 12: Physician Review Dashboard */}
          {step === 12 && (
            <Step12_PhysicianDashboard
              key="step12"
              patientName={patientData.name}
              chiefComplaint={historyData.chiefComplaint}
              onBackToKiosk={() => setStep(1)}
            />
          )}

        </AnimatePresence>
      </div>

      {/* Emergency Red-Flag Interstitial Overlay */}
      {showRedFlag && (
        <Step9_RedFlag onDismiss={() => setShowRedFlag(false)} />
      )}

      {/* Autonomous Floating Assistant Orb */}
      <FloatingAssistant 
        currentStep={step} 
        onNavigate={(target) => setStep(target)}
        onAction={handleAssistantAction}
      />

      {/* Minimal Footer */}
      <footer className="w-full text-center py-3 text-[11px] text-gray-500 border-t border-white/5 relative z-10">
        Project Samanvaya (SIH 26047) • National Patient Case-Taking & AYUSH-Allopathic Bridge • ABHA & DPDP Compliant
      </footer>
    </main>
  );
}
