"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  FileText, 
  QrCode, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Stethoscope, 
  Camera, 
  Clock, 
  ChevronRight,
  ChevronDown,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
  Lock
} from "lucide-react";

import TrustBanner from "@/components/TrustBanner";
import FloatingAssistant from "@/components/FloatingAssistant";

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
  const [view, setView] = useState<"portal" | "intake" | "doctor">("portal");
  const [step, setStep] = useState(1);
  const [showRedFlag, setShowRedFlag] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

  const startStep = (targetStep: number) => {
    setStep(targetStep);
    if (targetStep === 12) {
      setView("doctor");
    } else {
      setView("intake");
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === "home") {
      setView("portal");
    } else if (tab === "kiosk") {
      setStep(1);
      setView("intake");
    } else if (tab === "doctor") {
      setStep(12);
      setView("doctor");
    } else if (tab === "ayush") {
      setStep(6);
      setView("intake");
    } else if (tab === "schemes") {
      setStep(8);
      setView("intake");
    }
  };

  const FAQS = [
    {
      q: "What is Project Samanvaya (समन्वय)?",
      a: "Project Samanvaya is India's National Smart Case-Taking & AYUSH-Allopathic Bridge software (SIH 26047) providing fast, voice-driven patient intake, Prakriti analysis, and instant ABDM FHIR R4 generation."
    },
    {
      q: "Is my personal health data private and safe?",
      a: "Yes. In compliance with the DPDP Act 2023, raw voice recordings and images are immediately purged after text extraction. All health records are locked by mandatory per-member consent."
    },
    {
      q: "How does the Allopathic-AYUSH dual engine work?",
      a: "The system captures standard clinical symptoms (SOCRATES format) alongside Ayurvedic Dashavidha Pariksha (Prakriti, Agni, Nidra) and flags dangerous cross-system Herb-Drug contraindications (e.g. Metformin + Karela)."
    },
    {
      q: "What government schemes are verified?",
      a: "We automatically evaluate Ayushman Bharat PM-JAY (₹5L), Chiranjeevi Yojana (₹25L), Aarogyasri, Swasthya Sathi, and compute Jan Aushadhi generic medicine savings."
    }
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans selection:bg-[#0f4c81] selection:text-white">
      {/* 1. Official UIDAI Top Navigation Header */}
      <TrustBanner 
        currentTab={view === "portal" ? "home" : view === "doctor" ? "doctor" : "kiosk"} 
        onTabChange={handleTabChange}
        onLanguageChange={(lang) => setSelectedLanguage(lang)}
      />

      {/* 2. Breadcrumbs Bar (UIDAI Style) */}
      <div className="w-full bg-white border-b border-gray-200 py-2.5 px-4 sm:px-8 text-xs text-gray-500 font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <button onClick={() => setView("portal")} className="hover:text-[#0f4c81] hover:underline cursor-pointer">
            Home / मुख्य पृष्ठ
          </button>
          {view === "intake" && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[#0f2942] font-semibold">
                Patient Case-Taking & Triage (Step {step} of 11)
              </span>
            </>
          )}
          {view === "doctor" && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[#0f2942] font-semibold">
                Physician Consultation Desk / चिकित्सक पटल
              </span>
            </>
          )}
        </div>
      </div>

      {/* 3. MAIN BODY CONTAINER */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">

        {/* ========================================================================= */}
        {/* VIEW A: OFFICIAL UIDAI PORTAL LANDING PAGE                                */}
        {/* ========================================================================= */}
        {view === "portal" && (
          <div className="space-y-8">
            
            {/* Hero Services Section */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0f2942] tracking-tight">
                    Access Samanvaya Health Services • स्वास्थ्य सेवाओं तक पहुंच
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Fast automated patient intake, AYUSH constitutional analysis, and national health welfare integration.
                  </p>
                </div>
                <button
                  onClick={() => startStep(1)}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#0f4c81] hover:text-blue-900 transition-colors bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 shadow-sm"
                >
                  Start New Intake <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4 Hero UIDAI-Style Service Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Card 1: New Case-Taking */}
                <motion.div
                  whileHover={{ y: -3 }}
                  onClick={() => startStep(1)}
                  className="bg-white border border-gray-200 hover:border-[#0f4c81] rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#0f4c81] flex items-center justify-center mb-4 group-hover:bg-[#0f4c81] group-hover:text-white transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-[#0f2942] mb-0.5">
                      Smart OPD Intake
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mb-2">स्मार्ट ओपीडी पर्ची</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Voice and touch clinical history taking in 7 Indian languages with auto-transcription.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      Voice Enabled
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#0f4c81] group-hover:text-white flex items-center justify-center text-gray-600 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>

                {/* Card 2: ABHA & Auth */}
                <motion.div
                  whileHover={{ y: -3 }}
                  onClick={() => startStep(2)}
                  className="bg-white border border-gray-200 hover:border-[#0f4c81] rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-4 group-hover:bg-purple-700 group-hover:text-white transition-colors">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-[#0f2942] mb-0.5">
                      ABHA & Identity Auth
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mb-2">आभा कार्ड सत्यापन</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Scan ABHA QR code, Aadhaar OTP sandbox, or Single-OTP family batch login.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
                      ABDM Linked
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#0f4c81] group-hover:text-white flex items-center justify-center text-gray-600 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>

                {/* Card 3: AYUSH Pariksha */}
                <motion.div
                  whileHover={{ y: -3 }}
                  onClick={() => startStep(6)}
                  className="bg-white border border-gray-200 hover:border-[#0f4c81] rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-[#0f2942] mb-0.5">
                      AYUSH Pariksha
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mb-2">दशविध परीक्षा व प्रकृति</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Prakriti (V/P/K), Agni metabolic fire, Nidra sleep rhythm, and regional food habits.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      Ayurveda Bridge
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#0f4c81] group-hover:text-white flex items-center justify-center text-gray-600 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>

                {/* Card 4: Govt Schemes */}
                <motion.div
                  whileHover={{ y: -3 }}
                  onClick={() => startStep(8)}
                  className="bg-white border border-gray-200 hover:border-[#0f4c81] rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-11 h-11 rounded-lg bg-orange-50 text-[#f37021] flex items-center justify-center mb-4 group-hover:bg-[#f37021] group-hover:text-white transition-colors">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-[#0f2942] mb-0.5">
                      Government Schemes
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mb-2">सरकारी योजनाएं व बचत</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Evaluate PM-JAY (₹5L), Chiranjeevi (₹25L), and calculate Jan Aushadhi generic savings.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[11px] font-semibold text-orange-800 bg-orange-50 px-2 py-0.5 rounded">
                      Instant Match
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#0f4c81] group-hover:text-white flex items-center justify-center text-gray-600 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>

              </div>
            </section>

            {/* Secondary Section: 3 Bottom Action Cards (UIDAI Style) */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0f4c81] flex items-center justify-center mb-3">
                    <Camera className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-[#0f2942]">Prescription & Signs Scanner</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Camera OCR compares branded vs generic Jan Aushadhi drug prices and photographs visible skin lesions.
                  </p>
                </div>
                <button
                  onClick={() => startStep(7)}
                  className="mt-5 w-full bg-blue-50 hover:bg-blue-100 text-[#0f4c81] border border-blue-200 font-semibold text-xs py-2.5 rounded-lg transition-colors text-center"
                >
                  Scan Prescription / Document
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-[#0f2942]">Live OPD Queue & SMS Alert</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Register phone for live SMS alerts when 3 patients remain before your turn, clearing physical waiting rooms.
                  </p>
                </div>
                <button
                  onClick={() => startStep(11)}
                  className="mt-5 w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs py-2.5 rounded-lg transition-colors text-center"
                >
                  Track Queue Token (A-142)
                </button>
              </div>

              <div className="bg-[#1d2d44] text-white rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-white/10 text-emerald-400 flex items-center justify-center mb-3">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white">Physician Consultation Desk</h4>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    Clinician portal featuring line-by-line accept/reject diffs, Herb-Drug conflict alerts, and live pharmacy inventory.
                  </p>
                </div>
                <button
                  onClick={() => startStep(12)}
                  className="mt-5 w-full bg-[#f37021] hover:bg-orange-600 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors text-center shadow-sm"
                >
                  Open Clinician Review Screen
                </button>
              </div>

            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW B: CLEAN 2-COLUMN UIDAI FORM LAYOUT (EXACT REPLICA OF IMAGE 4)      */}
        {/* ========================================================================= */}
        {view === "intake" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT / CENTER COLUMN: Clean Pure White Form Card (68% width) */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              
              {/* Stepper Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#0f4c81] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                    Step {step} of 11
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-[#0f2942] mt-2">
                    {step === 1 && "Select Regional Language & Audio Accessibility"}
                    {step === 2 && "Patient Identification & Family Consent Guard"}
                    {step === 3 && "Digital Personal Data Protection (DPDP) Consent"}
                    {step === 4 && "Select Clinical Intake Mode"}
                    {step === 5 && "Conversational Clinical History & Timeline"}
                    {step === 6 && "AYUSH Dashavidha Pariksha & Diet Assessment"}
                    {step === 7 && "Prescription OCR & Visible Signs Capture"}
                    {step === 8 && "Government Health Scheme Eligibility"}
                    {step === 9 && "Emergency High-Acuity Red-Flag Override"}
                    {step === 10 && "Summary Confirmation (Green/Red/Back Loop)"}
                    {step === 11 && "OPD Queue Token & Live SMS Registration"}
                  </h2>
                </div>
                <button
                  onClick={() => setView("portal")}
                  className="text-xs text-gray-500 hover:text-gray-800 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel & Exit
                </button>
              </div>

              {/* Form Content Component */}
              <div className="min-h-[380px]">
                {step === 1 && (
                  <Step1_Language
                    selectedLanguage={selectedLanguage}
                    onSelectLanguage={(lang) => setSelectedLanguage(lang)}
                    onNext={() => setStep(2)}
                  />
                )}

                {step === 2 && (
                  <Step2_Identify
                    onIdentify={(data) => setPatientData(data)}
                    onNext={() => setStep(3)}
                  />
                )}

                {step === 3 && (
                  <Step3_Consent
                    onConsentGiven={() => console.log("Consent Confirmed")}
                    onNext={() => setStep(4)}
                  />
                )}

                {step === 4 && (
                  <Step4_ModeSelect
                    selectedMode={intakeMode}
                    onSelectMode={(m) => setIntakeMode(m)}
                    onNext={() => setStep(5)}
                  />
                )}

                {step === 5 && (
                  <Step5_ConversationalHistory
                    onHistorySubmit={(hist) => setHistoryData(hist)}
                    onNext={() => setStep(6)}
                    onTriggerRedFlag={() => setShowRedFlag(true)}
                  />
                )}

                {step === 6 && (
                  <Step6_AyushModule
                    selectedLanguage={selectedLanguage}
                    onAyushSubmit={(ayush) => setAyushData(ayush)}
                    onNext={() => setStep(7)}
                  />
                )}

                {step === 7 && (
                  <Step7_DocumentScan
                    onScanComplete={(data) => console.log("OCR Data:", data)}
                    onNext={() => setStep(8)}
                  />
                )}

                {step === 8 && (
                  <Step8_SchemeEligibility
                    patientState="Rajasthan"
                    onSchemeConfirmed={(sch) => setMatchedScheme(sch)}
                    onNext={() => setStep(10)}
                  />
                )}

                {step === 10 && (
                  <Step10_ConfirmSubmit
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

                {step === 11 && (
                  <Step11_TokenWait
                    tokenNumber="A-142"
                    department="General Medicine & AYUSH (Room 4, Floor 1)"
                    onOpenDoctorView={() => setView("doctor")}
                  />
                )}
              </div>

              {/* Red-Flag Override Overlay */}
              {showRedFlag && (
                <Step9_RedFlag onDismiss={() => setShowRedFlag(false)} />
              )}
            </div>

            {/* RIGHT COLUMN: "Have questions?" Accordion FAQ Card (32% width, exactly like Image 4) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-base font-bold text-[#0f2942] mb-4 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#0f4c81]" /> Have questions?
                </h3>

                <div className="space-y-2.5">
                  {FAQS.map((faq, idx) => (
                    <div 
                      key={idx}
                      className="border border-gray-200 rounded-lg overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full text-left p-3.5 bg-gray-50/50 hover:bg-gray-100 text-xs font-semibold text-[#0f2942] flex items-center justify-between transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                      </button>
                      {openFaq === idx && (
                        <div className="p-3.5 bg-white text-xs text-gray-600 leading-relaxed border-t border-gray-100">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Help & Certified Nurse Reassurance Box */}
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Certified Nurse Review
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Every entry you speak or select is reviewed by a hospital staff nurse before the doctor sees your file.
                </p>
              </div>

              {/* Privacy Lock Banner */}
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-xs text-blue-900">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Lock className="w-4 h-4 text-[#0f4c81]" /> DPDP Act 2023 Compliant
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Audio recordings and scanned photos are processed locally in real-time and never saved as raw files.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW C: PHYSICIAN CONSULTATION DESK (DOCTOR VIEW)                         */}
        {/* ========================================================================= */}
        {view === "doctor" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <Step12_PhysicianDashboard
              patientName={patientData.name}
              chiefComplaint={historyData.chiefComplaint}
              onBackToKiosk={() => {
                setStep(1);
                setView("portal");
              }}
            />
          </div>
        )}

      </div>

      {/* 4. Autonomous Floating Assistant Orb */}
      <FloatingAssistant 
        currentStep={step} 
        onLanguageChange={(lang) => setSelectedLanguage(lang)}
        onNavigate={(target) => {
          setStep(target);
          if (target === 12) setView("doctor");
          else setView("intake");
        }}
        onAction={(action) => {
          if (action === "open_scheme") { setStep(8); setView("intake"); }
          if (action === "doctor_view") { setStep(12); setView("doctor"); }
          if (action === "restart") { setStep(1); setView("intake"); }
        }}
      />

      {/* 5. Official UIDAI Footer */}
      <footer className="w-full bg-[#1d2d44] text-white py-6 border-t border-gray-800 text-xs font-sans mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-200">
              समन्वय • Project Samanvaya (Smart India Hackathon 2026 - Problem Statement 26047)
            </p>
            <p className="text-gray-400 text-[11px] mt-1">
              National Health Authority (NHA) • Ministry of Health & Family Welfare • Ministry of AYUSH
            </p>
          </div>
          <div className="flex items-center gap-4 text-gray-300 text-[11px]">
            <span>DPDP Act 2023 Compliant</span>
            <span>•</span>
            <span>ABDM Integrated</span>
            <span>•</span>
            <span>Zero Raw Data Persisted</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
