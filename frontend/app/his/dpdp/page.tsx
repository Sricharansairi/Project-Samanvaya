"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Shield, Volume2, VolumeX, CheckCircle2, Lock, FileText, 
  UserCheck, AlertTriangle, Download, RefreshCw, KeyRound, Check, X
} from "lucide-react";
import TrustBanner from "@/components/TrustBanner";

interface ConsentPurposes {
  clinicalCare: boolean;
  abhaLinking: boolean;
  schemeVerification: boolean;
  anonymizedResearch: boolean;
}

interface ConsentLogEntry {
  id: string;
  timestamp: string;
  patientName: string;
  abhaId: string;
  purposesGranted: string[];
  consentHash: string;
  status: "ACTIVE" | "REVOKED";
}

export default function DpdpConsentPage() {
  const [patientName, setPatientName] = useState("Lakshmi Narayana");
  const [abhaId, setAbhaId] = useState("91-5839-2910-3847");
  const [phone, setPhone] = useState("9876543210");
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  
  const [purposes, setPurposes] = useState<ConsentPurposes>({
    clinicalCare: true,
    abhaLinking: true,
    schemeVerification: true,
    anonymizedResearch: false
  });

  const [activeTab, setActiveTab] = useState<"notice" | "audit" | "rights">("notice");

  const [consentLogs, setConsentLogs] = useState<ConsentLogEntry[]>([
    {
      id: "CONS-2026-0901-A48",
      timestamp: "2026-09-05 10:14:22 IST",
      patientName: "Lakshmi Narayana",
      abhaId: "91-5839-2910-3847",
      purposesGranted: ["Clinical Care", "ABHA Linking", "Scheme Verification"],
      consentHash: "8f4b23c91e0a4f5d88c90382d7f8a9e012cb7f6a98d023e41b9a6745e128cb50",
      status: "ACTIVE"
    },
    {
      id: "CONS-2026-0828-B12",
      timestamp: "2026-09-04 16:42:08 IST",
      patientName: "Meena Devi",
      abhaId: "91-2309-8819-0941",
      purposesGranted: ["Clinical Care"],
      consentHash: "3a9f02b74c8d519e083a216b5e7d8c9012f45a89e023b67c89d012e34a56b789",
      status: "ACTIVE"
    }
  ]);

  const notices = {
    en: {
      title: "Digital Personal Data Protection (DPDP) Act 2023 Consent Notice",
      intro: "Under Section 5 of the Digital Personal Data Protection Act, 2023, Project Samanvaya (Data Fiduciary) is required to give you notice regarding the collection, use, and security of your personal and health data.",
      whatWeCollect: "We collect your Chief Medical Complaints, Vitals (BP, Pulse, SpO2), ABHA Number, Demographic Details, and Doctor Prescriptions.",
      rights: "You retain the statutory right to access your health data, request corrections, withdraw consent at any time, or nominate an authorized representative in case of emergency or death."
    },
    hi: {
      title: "डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023 सहमति सूचना",
      intro: "डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम 2023 की धारा 5 के तहत, प्रोजेक्ट समन्वय (डेटा फिड्यूशियरी) को आपके स्वास्थ्य डेटा के उपयोग और सुरक्षा के बारे में यह सूचना देना अनिवार्य है।",
      whatWeCollect: "हम आपकी मुख्य बीमारी के लक्षण, रक्तचाप, वजन, आभा (ABHA) आईडी और डॉक्टर द्वारा लिखी गई दवाइयों का विवरण एकत्र करते हैं।",
      rights: "आपके पास किसी भी समय अपनी सहमति वापस लेने, अपने रिकॉर्ड की प्रतिलिपि देखने या सुधार का अनुरोध करने का पूर्ण कानूनी अधिकार है।"
    },
    te: {
      title: "డిజిటల్ పర్సనల్ డేటా ప్రొటెక్షన్ (DPDP) చట్టం 2023 సమ్మతి నోటీసు",
      intro: "డిజిటల్ పర్సనల్ డేటా ప్రొటెక్షన్ యాక్ట్ 2023 లోని సెక్షన్ 5 ప్రకారం, ప్రాజెక్ట్ సమన్వయ మీ వ్యక్తిగత మరియు ఆరోగ్య డేటా భద్రత మరియు వినియోగంపై సమాచారం అందిస్తోంది.",
      whatWeCollect: "మేము మీ ఆరోగ్య సమస్యలు, బీపీ, పల్స్, ABHA నంబర్ మరియు వైద్యుల ప్రిస్క్రిప్షన్ వివరాలను నమోదు చేస్తాము.",
      rights: "మీ ఆరోగ్య రికార్డులను ఎప్పుడైనా తనిఖీ చేసుకునే, సవరించుకునే లేదా సమ్మతిని రద్దు చేసుకునే చట్టబద్ధమైన హక్కు మీకు ఉంది."
    }
  };

  const currentNotice = notices[language];

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      const textToRead = `${currentNotice.title}. ${currentNotice.intro}. ${currentNotice.whatWeCollect}. ${currentNotice.rights}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = language === "hi" ? "hi-IN" : (language === "te" ? "te-IN" : "en-IN");
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const handleGrantConsent = () => {
    if (!purposes.clinicalCare) {
      alert("Primary Clinical Care consent is required for outpatient treatment.");
      return;
    }

    const granted: string[] = [];
    if (purposes.clinicalCare) granted.push("Clinical Care");
    if (purposes.abhaLinking) granted.push("ABHA Linking");
    if (purposes.schemeVerification) granted.push("Scheme Verification");
    if (purposes.anonymizedResearch) granted.push("Anonymized Research");

    // Generate mock SHA-256 hash
    const fakeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    const newEntry: ConsentLogEntry = {
      id: `CONS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
      patientName,
      abhaId,
      purposesGranted: granted,
      consentHash: fakeHash,
      status: "ACTIVE"
    };

    setConsentLogs([newEntry, ...consentLogs]);
    setIsAgreed(true);
  };

  const handleRevoke = (id: string) => {
    setConsentLogs(consentLogs.map(l => l.id === id ? { ...l, status: "REVOKED" } : l));
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      <TrustBanner currentTab="his" onTabChange={() => {}} onLanguageChange={() => {}} />

      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <a href="/his" className="flex items-center text-[#0f4c81] hover:underline font-semibold text-sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to HIS Roles
          </a>
          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 font-medium flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> DPDP Act 2023 Compliant Fiduciary
          </span>
        </div>

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#092c4c] via-[#0f4c81] to-[#1e3a8a] rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm mb-3">
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>Section 5 & 6 Compliance • Data Principal Rights</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Patient Data Privacy & Consent Manager
            </h1>
            <p className="text-blue-100 text-sm mt-2 leading-relaxed">
              Transparent, purpose-bound, and revocable consent tracking in adherence to India's Digital Personal Data Protection Act 2023. Audio readouts in vernacular languages, granular purpose permissions, and immutable digital audit trails.
            </p>
          </div>
          <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none hidden md:block">
            <Shield className="w-48 h-48 text-white" />
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl px-4 pt-2 shadow-xs">
          {[
            { key: "notice", label: "📜 Consent Notice & Permissions" },
            { key: "audit", label: "🔒 Immutable Consent Log (SHA-256)" },
            { key: "rights", label: "⚖️ Data Principal Rights Portal" }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "border-[#0f4c81] text-[#0f4c81] font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "notice" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Notice and Language Controls */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Language:</span>
                    {(["en", "hi", "te"] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          setLanguage(lang);
                          if (isPlayingAudio) window.speechSynthesis.cancel();
                          setIsPlayingAudio(false);
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                          language === lang
                            ? "bg-[#0f4c81] text-white border-[#0f4c81]"
                            : "bg-slate-50 text-gray-700 border-gray-200 hover:bg-slate-100"
                        }`}
                      >
                        {lang === "en" ? "English" : (lang === "hi" ? "हिन्दी" : "తెలుగు")}
                      </button>
                    ))}
                  </div>

                  {/* Audio Readout Button */}
                  <button
                    type="button"
                    onClick={handleToggleAudio}
                    className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isPlayingAudio
                        ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                        : "bg-blue-50 text-[#0f4c81] border-blue-200 hover:bg-blue-100"
                    }`}
                  >
                    {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    {isPlayingAudio ? "Stop Audio Notice" : "🔊 Listen to Notice"}
                  </button>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{currentNotice.title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">{currentNotice.intro}</p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">What Health Data is Processed?</h4>
                  <p className="text-sm text-gray-800">{currentNotice.whatWeCollect}</p>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Your Legal Protections</h4>
                  <p className="text-sm text-emerald-950">{currentNotice.rights}</p>
                </div>
              </div>

              {/* Granular Purpose Checkboxes */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h4 className="text-base font-bold text-gray-900 mb-1">Granular Purpose Authorization</h4>
                <p className="text-xs text-gray-500 mb-4">Under DPDP Section 6, bundled consent is prohibited. Select individual purposes below.</p>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 bg-slate-50 hover:bg-white transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={purposes.clinicalCare}
                      onChange={(e) => setPurposes({ ...purposes, clinicalCare: e.target.checked })}
                      className="mt-1 w-4 h-4 text-[#0f4c81] rounded focus:ring-[#0f4c81]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">Purpose 1: Outpatient Care & Medical Diagnosis</span>
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">MANDATORY</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">Permits treating physicians and nursing staff to view vitals, log symptoms, and prescribe medications.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 bg-slate-50 hover:bg-white transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={purposes.abhaLinking}
                      onChange={(e) => setPurposes({ ...purposes, abhaLinking: e.target.checked })}
                      className="mt-1 w-4 h-4 text-[#0f4c81] rounded focus:ring-[#0f4c81]"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-900">Purpose 2: ABDM / ABHA Health Locker Synchronization</span>
                      <p className="text-xs text-gray-600 mt-0.5">Permits syncing e-prescriptions and diagnostic tokens to your national Ayushman Bharat Health Account.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 bg-slate-50 hover:bg-white transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={purposes.schemeVerification}
                      onChange={(e) => setPurposes({ ...purposes, schemeVerification: e.target.checked })}
                      className="mt-1 w-4 h-4 text-[#0f4c81] rounded focus:ring-[#0f4c81]"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-900">Purpose 3: PM-JAY & State Scheme Pre-Authorization</span>
                      <p className="text-xs text-gray-600 mt-0.5">Authorizes the Arogya Mitra desk to query state eligibility databases for cashless hospitalization claims.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 bg-slate-50 hover:bg-white transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={purposes.anonymizedResearch}
                      onChange={(e) => setPurposes({ ...purposes, anonymizedResearch: e.target.checked })}
                      className="mt-1 w-4 h-4 text-[#0f4c81] rounded focus:ring-[#0f4c81]"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-900">Purpose 4: De-identified Health Research & Epidemiological Audits</span>
                      <p className="text-xs text-gray-600 mt-0.5">Optional. Strips all personal identifiers (name, ABHA, phone) to contribute statistical disease trend insights to ICMR.</p>
                    </div>
                  </label>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">Recorded with SHA-256 digital signature</span>
                  <button
                    type="button"
                    onClick={handleGrantConsent}
                    className="flex items-center gap-2 bg-[#0f4c81] hover:bg-blue-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Record Informed Consent
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Patient Details & Status */}
            <div className="space-y-6">
              
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#0f4c81]" /> Data Principal (Patient)
                </h4>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block">Full Name</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full font-bold text-gray-900 border-b border-gray-200 py-1 focus:outline-none focus:border-[#0f4c81]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block">ABHA ID</label>
                    <input
                      type="text"
                      value={abhaId}
                      onChange={(e) => setAbhaId(e.target.value)}
                      className="w-full font-mono text-gray-800 border-b border-gray-200 py-1 focus:outline-none focus:border-[#0f4c81]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block">Mobile Number (Aadhaar Linked)</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full font-mono text-gray-800 border-b border-gray-200 py-1 focus:outline-none focus:border-[#0f4c81]"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-500">Consent State:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ACTIVE & VERIFIED
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 leading-relaxed">
                    Consent Artefact ID: <span className="font-mono text-gray-700">{consentLogs[0]?.id}</span>
                  </div>
                </div>
              </div>

              {/* Data Protection Officer Contact */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-gray-600 space-y-2">
                <div className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-700" /> Data Protection Officer (DPO)
                </div>
                <p>Officer: Dr. Anita Sengupta (Grievance Redressal)</p>
                <p>Email: dpo@samanvaya-health.gov.in</p>
                <p>SLA for Grievance Resolution: 7 Business Days</p>
              </div>

            </div>

          </div>
        )}

        {activeTab === "audit" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-gray-900">Cryptographic Consent Ledger</h3>
                <p className="text-xs text-gray-500">Immutable audit log of patient authorizations and revocations under DPDP regulations.</p>
              </div>
              <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-md text-gray-700">
                Total Records: {consentLogs.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                    <th className="p-4">Artefact ID</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Patient</th>
                    <th className="p-4">Purposes Authorized</th>
                    <th className="p-4">SHA-256 Consent Hash</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {consentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#0f4c81]">{log.id}</td>
                      <td className="p-4 text-gray-600">{log.timestamp}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{log.patientName}</div>
                        <div className="text-[11px] font-mono text-gray-500">{log.abhaId}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {log.purposesGranted.map((p, i) => (
                            <span key={i} className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[10px] text-gray-500 max-w-xs truncate" title={log.consentHash}>
                        {log.consentHash.slice(0, 20)}...
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === "ACTIVE" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : "bg-rose-100 text-rose-800"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {log.status === "ACTIVE" ? (
                          <button
                            type="button"
                            onClick={() => handleRevoke(log.id)}
                            className="text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
                          >
                            Revoke
                          </button>
                        ) : (
                          <span className="text-gray-400">Revoked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "rights" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 text-base mb-2">Right to Access Health Summary</h4>
              <p className="text-xs text-gray-600 mb-4">Export a complete cryptographic report of all personal data, vitals, and clinical interactions logged in the HIS.</p>
              <button
                type="button"
                onClick={() => alert("Downloading encrypted patient health dossier JSON...")}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Personal Data Dossier
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 text-base mb-2">Right to Correction & Erasure</h4>
              <p className="text-xs text-gray-600 mb-4">Request rectification of inaccurate demographic records or erasure of non-clinical administrative data.</p>
              <button
                type="button"
                onClick={() => alert("Grievance ticket #TKT-8492 created. DPO will respond within 48 hours.")}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> File Rectification Request
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
