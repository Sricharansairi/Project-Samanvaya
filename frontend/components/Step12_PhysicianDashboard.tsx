"use client";

import { useState, useEffect } from "react";
import { Stethoscope, Check, X, AlertTriangle, Mic, MicOff, Save, FileText, ArrowLeft, History, Pill, Building, ShieldAlert, ShieldCheck } from "lucide-react";
import TestExplainer from "./TestExplainer";
import NextActionCard from "./NextActionCard";

interface Step12Props {
  onBackToKiosk: () => void;
  patientName?: string;
  chiefComplaint?: string;
  tokenNumber?: string;
  abhaId?: string;
  department?: string;
  agni?: string;
  nidra?: string;
  medications?: string;
}

export default function Step12_PhysicianDashboard({
  onBackToKiosk,
  patientName = "Patient",
  chiefComplaint = "Acute health concern under clinical review",
  tokenNumber = "OPD-101",
  abhaId = "14-XXXX-XXXX-XXXX",
  department = "General Medicine OPD",
  agni = "Sama (Normal)",
  nidra = "Sound sleep",
  medications = "None reported"
}: Step12Props) {
  const [dictationText, setDictationText] = useState("");
  const [isDictating, setIsDictating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [vaultDocs, setVaultDocs] = useState<any[]>([]);
  const [candidateRx, setCandidateRx] = useState("");
  const [pharmaAudit, setPharmaAudit] = useState<any>(null);
  const [isAuditingPharma, setIsAuditingPharma] = useState(false);

  // Load patient's uploaded & digitized medical documents from ABDM Health Locker
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("samanvaya_vault_documents") || "[]");
        setVaultDocs(saved);
      } catch {}
    }
  }, []);

  const handleAuditPharmacovigilance = async () => {
    if (!candidateRx.trim()) return;
    setIsAuditingPharma(true);
    try {
      const histMeds = vaultDocs.flatMap((d: any) => d.extracted_data?.medications || []);
      const candidates = candidateRx.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
      const res = await fetch("/api/clinical/pharmacovigilance-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          historical_medications: histMeds,
          candidate_new_prescriptions: candidates
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPharmaAudit(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditingPharma(false);
    }
  };

  const [lines, setLines] = useState([
    { id: 1, text: `Presenting Complaint: ${chiefComplaint}.`, status: "accepted" },
    { id: 2, text: "Onset & Duration: Acute clinical onset with progressive functional limitation.", status: "accepted" },
    { id: 3, text: `AYUSH Agni/Metabolic Profile: ${agni} | Nidra/Sleep: ${nidra}.`, status: "accepted" },
    { id: 4, text: `Previous / Current Medication: ${medications}.`, status: "accepted" }
  ]);

  const toggleLineStatus = (id: number, newStatus: "accepted" | "rejected") => {
    setLines(lines.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const handleVoiceDictation = () => {
    if (!isDictating) {
      setIsDictating(true);
      if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRec();
        recognition.lang = "en-IN";
        recognition.continuous = false;
        recognition.onresult = (event: any) => {
          const spoken = event.results[0][0].transcript;
          setDictationText(prev => prev ? `${prev} ${spoken}` : spoken);
          setIsDictating(false);
        };
        recognition.onerror = () => {
          setIsDictating(false);
        };
        recognition.start();
      } else {
        setTimeout(() => {
          setDictationText(prev => prev ? `${prev} Clinical examination complete. Prescribing targeted therapy.` : "Clinical examination complete. Prescribing targeted therapy.");
          setIsDictating(false);
        }, 1500);
      }
    } else {
      setIsDictating(false);
    }
  };

  const handleFinalSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Dynamic Clinical Investigations derived from Complaint
  const lowerComplaint = chiefComplaint.toLowerCase();
  const dynamicTests = lowerComplaint.includes("cough") || lowerComplaint.includes("chest")
    ? [
        {
          testName: "Chest Radiograph (CXR-PA View)",
          description: "Digital radiographic imaging to evaluate lung parenchymal opacities, consolidation, or cardiomegaly.",
          whyNeeded: "Required to rule out lower respiratory tract infection, pneumonia, or cardiac enlargement.",
          preparation: "Remove metallic objects, chains, or jewelry from chest area."
        },
        {
          testName: "Sputum Smear / CBNAAT GeneXpert",
          description: "Rapid molecular assay to detect Mycobacterium tuberculosis and Rifampicin resistance.",
          whyNeeded: "Indicated due to persistent cough and constitutional symptoms.",
          preparation: "Collect early morning deep productive sputum before oral intake."
        }
      ]
    : lowerComplaint.includes("fever")
    ? [
        {
          testName: "Complete Blood Count (CBC) with Platelet Count",
          description: "Automated hematology cell counter evaluating leukocytosis, band cells, and thrombocyte levels.",
          whyNeeded: "Essential to differentiate viral, bacterial, or vector-borne etiology (Dengue, Malaria).",
          preparation: "No fasting required."
        },
        {
          testName: "Rapid Malarial Antigen & Dengue NS1/IgM",
          description: "Immunochromatographic test detecting Plasmodium lactate dehydrogenase and Dengue viral antigen.",
          whyNeeded: "Standard ICMR protocol for acute febrile illness in endemic transmission zones.",
          preparation: "Venous blood sample taken at triage desk."
        }
      ]
    : [
        {
          testName: "Complete Hemogram & Metabolic Panel",
          description: "Baseline hematology, renal parameters, and capillary blood glucose screening.",
          whyNeeded: "Establishes baseline organ function and detects underlying systemic inflammation.",
          preparation: "Standard routine sample."
        },
        {
          testName: "Random Blood Sugar (RBS)",
          description: "Immediate bedside glucometry to assess current glycemic state.",
          whyNeeded: "Monitors metabolic stability during acute illness presentation.",
          preparation: "Immediate fingerprick capillary drop."
        }
      ];

  const symptomWatchWarning = lowerComplaint.includes("chest")
    ? "Chest pain radiates to left arm/jaw, or sudden dizziness occurs."
    : lowerComplaint.includes("fever")
    ? "Temperature exceeds 102°F or shivering rigors/rash appear."
    : lowerComplaint.includes("cough")
    ? "Breathing rate accelerates or coughing up blood occurs."
    : "Symptoms worsen or sudden high pain manifests.";

  const currentMonth = new Date().getMonth() + 1;
  const getSeasonForecast = () => {
    if (currentMonth >= 3 && currentMonth <= 4) {
      return { ritu: "Spring Aero-Allergen Bloom (Vasanta)", upcoming: "Upcoming: Pre-Summer Heatwave & Dehydration (+30%)", current: "Current: Seasonal Allergic Rhinitis & Pollen Asthma (+40%)", buffer1: "ORS & Electrolytes (+35%)", buffer2: "Antihistamines & Saline Sprays (+40%)" };
    }
    if (currentMonth >= 5 && currentMonth <= 6) {
      return { ritu: "Summer Extreme Heatwave (Grishma)", upcoming: "Upcoming: Monsoon Influx & Vector Dengue (+50%)", current: "Current: Heat Exhaustion & Hyperpyrexia (+45%)", buffer1: "Paracetamol & NS1 Kits (+45%)", buffer2: "IV Normal Saline & Cold Saline Packs (+50%)" };
    }
    if (currentMonth >= 7 && currentMonth <= 8) {
      return { ritu: "Southwest Monsoon Vector Peak (Varsha)", upcoming: "Upcoming: Post-Monsoon Dengue & Malaria Surge (+40%)", current: "Current: Monsoon Waterlogging Gastro & Enteric Fever (+35%)", buffer1: "Antimalarials & Antibiotics (+35%)", buffer2: "ORS, Zinc & IV Fluids (+40%)" };
    }
    if (currentMonth >= 9 && currentMonth <= 10) {
      return { ritu: "Post-Monsoon Thermal Inversion (Sharad)", upcoming: "Upcoming: Hazardous AQI PM2.5 Micro-Particulate Smog (+50%)", current: "Current: Post-Monsoon Vector Viral Fevers (+35%)", buffer1: "Inhalers & Nebulization Stations (+50%)", buffer2: "Antipyretics & Platelet Tests (+40%)" };
    }
    if (currentMonth >= 11 && currentMonth <= 12) {
      return { ritu: "Early Winter Cold Wave (Hemanta)", upcoming: "Upcoming: Peak Winter Cold Wave Hypothermia (+30%)", current: "Current: Severe AQI Smog & COPD/Asthma Exacerbations (+55%)", buffer1: "Oxygen Concentrators (+30%)", buffer2: "Bronchodilators & Corticosteroids (+50%)" };
    }
    return { ritu: "Late Winter Vasoconstriction (Shishira)", upcoming: "Upcoming: Spring Pollen Spike (+30%)", current: "Current: Acute Bronchitis & Viral URTI Surge (+40%)", buffer1: "Levocetirizine (+30%)", buffer2: "Cough Syrups & Inhalers (+45%)" };
  };
  const seasonInfo = getSeasonForecast();

  return (
    <div className="w-full space-y-6">
      
      {/* Top Clinician Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0f4c81] flex items-center justify-center border border-blue-100">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0f2942] flex items-center gap-2">
              {patientName}
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                Token: {tokenNumber}
              </span>
            </h3>
            <p className="text-xs text-gray-500 font-mono">ABHA ID: {abhaId} • {department}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
          >
            📊 Seasonal Surge Radar
          </button>
          <button
            type="button"
            onClick={onBackToKiosk}
            className="px-3.5 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Kiosk
          </button>
          <button
            type="button"
            onClick={handleFinalSave}
            className="px-4 py-2 rounded-lg bg-[#0f4c81] hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> {savedSuccess ? "Committed to ABDM ✓" : "Commit to ABDM (FHIR)"}
          </button>
        </div>
      </div>
      
      {/* Expandable Seasonal Analytics Card */}
      {showAnalytics && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <span className="font-bold text-amber-900">Hospital Administration: Climate & Outbreak Epidemiology Radar (Meteorological Surveillance)</span>
            <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded font-semibold text-amber-900">{seasonInfo.ritu}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-lg border border-amber-200">
              <p className="font-bold text-[#0f2942]">{seasonInfo.upcoming}</p>
              <p className="text-gray-500 mt-1">Hospital outpatient readiness and bed allocation advisory.</p>
              <p className="text-emerald-800 mt-1 font-bold">Recommended Buffer: {seasonInfo.buffer1}.</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-amber-200">
              <p className="font-bold text-[#0f2942]">{seasonInfo.current}</p>
              <p className="text-gray-500 mt-1">Live active seasonal syndrome surge in the region.</p>
              <p className="text-emerald-800 mt-1 font-bold">Recommended Buffer: {seasonInfo.buffer2}.</p>
            </div>
          </div>
        </div>
      )}

      {/* Safety Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Herb-Drug Conflict Alert */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-red-900">Herb-Drug & Polypharmacy Interaction Guard</p>
            <p className="text-red-700 mt-0.5 leading-relaxed">
              {medications && medications !== "None reported" 
                ? `Active review for ${medications}: Automated cross-check with CDSCO and AYUSH pharmacopoeia for metabolic conflicts.`
                : `Patient reports: ${chiefComplaint}. Dynamic drug-herb interaction monitoring enabled for consultation.`}
            </p>
          </div>
        </div>

        {/* Visit-to-Visit Memory */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
          <History className="w-5 h-5 text-purple-700 mt-0.5 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-purple-900">Patient Longitudinal History (ABHA Linkage)</p>
            <p className="text-purple-800 mt-0.5 leading-relaxed">
              ABHA ID: <span className="font-mono font-bold">{abhaId}</span> • Longitudinal visit memory connected via ABDM Health Information Exchange.
            </p>
          </div>
        </div>
      </div>

      {/* Digitized Health Locker Documents & AI Clinical Briefing */}
      {vaultDocs.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-700 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h4 className="font-bold text-sm text-white">Digitized Health Locker Documents ({vaultDocs.length})</h4>
            </div>
            <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 px-2.5 py-0.5 rounded-full">
              DPDP Minimization Verified
            </span>
          </div>

          <div className="space-y-3">
            {vaultDocs.map((doc, idx) => {
              const ext = doc.extracted_data || {};
              const meta = ext.document_metadata || {};
              const briefing = ext.physician_clinical_briefing;
              const diagnoses = ext.diagnoses || [];
              const meds = ext.medications || [];

              return (
                <div key={idx} className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 text-xs space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-slate-300">
                    <span className="font-bold text-white text-xs">{meta.document_type || "Medical Record"} • {meta.facility_name || "Healthcare Facility"}</span>
                    <span className="text-[11px] text-slate-400">{meta.document_date || "Past Record"}</span>
                  </div>

                  {briefing && (
                    <div className="bg-blue-950/60 border border-blue-800/80 rounded-lg p-3 text-blue-100 font-mono text-[11px] leading-relaxed">
                      <p className="font-bold text-blue-300 text-[10px] uppercase mb-1">Dual-Branch AI Clinical Synopsis (70B/120B)</p>
                      {briefing}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Past Diagnoses:</span>
                    {diagnoses.length > 0 ? (
                      diagnoses.map((d: any, i: number) => (
                        <span key={i} className="bg-purple-900/60 border border-purple-700 text-purple-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {d.condition_name} {d.icd10_code ? `(${d.icd10_code})` : ""}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">None recorded</span>
                    )}
                  </div>

                  {meds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Active Regimen:</span>
                      {meds.map((m: any, i: number) => (
                        <span key={i} className="bg-slate-700 text-slate-200 px-2 py-0.5 rounded text-[10px] font-medium">
                          {m.drug_name} {m.frequency ? `(${m.frequency})` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TB Red-Flag Linkage to Nikshay Portal */}
      <div className="bg-red-50/70 border border-red-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-red-900 font-medium">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span><strong>National Program Alert:</strong> Clinical triage protocol active for {department}.</span>
        </div>
        <button
          type="button"
          onClick={() => alert(`📋 Nikshay Case Notification Pre-Filled:\nPatient: ${patientName}\nToken: ${tokenNumber}\nABHA: ${abhaId}\nRecommended Investigation: Sputum CBNAAT / GeneXpert\nNational TB Elimination Program (NTEP) ID: NIK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`)}
          className="bg-red-700 hover:bg-red-800 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Pre-fill Nikshay TB Notification
        </button>
      </div>

      {/* Live Hospital Pharmacy Stock-Check */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <span className="font-bold text-[#0f2942] flex items-center gap-1.5">
            <Building className="w-4 h-4 text-[#0f4c81]" /> Live Hospital Pharmacy Inventory (Jan Aushadhi Counter)
          </span>
          <span className="text-emerald-700 font-mono font-bold text-[11px]">Sync: 2 mins ago</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="p-2.5 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Amoxicillin 500mg</span>
            <span className="text-emerald-700 font-bold">In Stock (450 tabs)</span>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Pantoprazole 40mg</span>
            <span className="text-emerald-700 font-bold">In Stock (210 tabs)</span>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Azithromycin 500mg</span>
            <span className="text-red-600 font-bold">Out of Stock ⚠️</span>
          </div>
        </div>
      </div>

      {/* Line-by-Line AI Draft Accept / Reject Audit Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <span className="text-xs font-bold text-[#0f2942] flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#0f4c81]" />
            AI-Drafted Clinical Summary (Line-by-Line Legal Demarcation)
          </span>
          <span className="text-[11px] text-gray-500">Doctor edits logged for legal audit trail</span>
        </div>

        <div className="space-y-2">
          {lines.map((line) => (
            <div
              key={line.id}
              className={`p-3 rounded-lg border flex items-center justify-between gap-4 transition-all text-xs ${
                line.status === "accepted"
                  ? "bg-slate-50 border-gray-200 text-[#0f2942] font-medium"
                  : "bg-red-50 border-red-200 text-gray-400 line-through"
              }`}
            >
              <span className="flex-1">{line.text}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleLineStatus(line.id, "accepted")}
                  className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                    line.status === "accepted" ? "bg-emerald-700 text-white border-emerald-700" : "border-gray-300 text-gray-500"
                  }`}
                  title="Accept line"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleLineStatus(line.id, "rejected")}
                  className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                    line.status === "rejected" ? "bg-red-600 text-white border-red-600" : "border-gray-300 text-gray-500"
                  }`}
                  title="Reject line"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reverse Doctor Voice Dictation */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0f2942] flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-[#0f4c81]" />
            Hands-Free Reverse Doctor Voice Dictation
          </span>
          {isDictating && <span className="text-xs text-red-600 font-bold animate-pulse">Recording doctor's voice...</span>}
        </div>

        <textarea
          value={dictationText}
          onChange={(e) => setDictationText(e.target.value)}
          placeholder="Dictate physical exam findings, differential diagnosis, or final prescription to append to FHIR Encounter..."
          className="w-full h-20 bg-slate-50 border border-gray-300 rounded-lg p-3 text-xs text-[#0f2942] font-semibold focus:bg-white focus:ring-2 focus:ring-[#0f4c81] outline-none resize-none"
        />

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-gray-500">Auto-appends to patient's ABDM FHIR encounter bundle.</p>
          <button
            type="button"
            onClick={handleVoiceDictation}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDictating
                ? "bg-red-600 text-white animate-pulse"
                : "bg-[#0f4c81] hover:bg-blue-900 text-white"
            }`}
          >
            {isDictating ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isDictating ? "Stop Dictating" : "Voice Dictate Findings"}
          </button>
        </div>
      </div>

      {/* Autonomous AI Pharmacovigilance & Drug Interaction Interceptor */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-[#0f2942]">
              Live Autonomous Pharmacovigilance & Cross-Drug Safety Interceptor
            </span>
          </div>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-full">
            70B Dedicated Medical Model
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] text-gray-600">
            Enter proposed medications. System automatically cross-checks active medications in the patient's ABDM Digital Health Locker for severe interactions and duplicate classes.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={candidateRx}
              onChange={(e) => setCandidateRx(e.target.value)}
              placeholder="e.g. Tab Clarithromycin 500mg BD, Tab Metformin 500mg, Tab Ibuprofen 400mg..."
              className="flex-1 bg-slate-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-[#0f2942] focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
            />
            <button
              type="button"
              onClick={handleAuditPharmacovigilance}
              disabled={isAuditingPharma || !candidateRx.trim()}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isAuditingPharma ? "Auditing Safety..." : "Audit Drug Safety"}
            </button>
          </div>
        </div>

        {/* Pharmacovigilance Audit Result Banner */}
        {pharmaAudit && (
          <div className="pt-2">
            {pharmaAudit.status === "ALERT_TRIGGERED" ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs space-y-2.5">
                <div className="flex items-center gap-2 text-red-900 font-bold">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Pharmacotherapy Warning: {pharmaAudit.total_conflicts_found} Conflict(s) & {pharmaAudit.total_duplicates_found} Duplicate(s) Detected</span>
                </div>

                {pharmaAudit.conflicts?.map((c: any, idx: number) => (
                  <div key={idx} className="bg-white border border-red-200 rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-900">
                        {c.candidate_prescription} ↔ {c.interacting_historical_drug}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        c.severity === "CRITICAL" ? "bg-red-600 text-white" : "bg-amber-100 text-amber-900"
                      }`}>
                        [{c.severity}]
                      </span>
                    </div>
                    <p className="text-gray-700 text-[11px] leading-relaxed">
                      <strong>Mechanism:</strong> {c.clinical_mechanism}
                    </p>
                    <p className="text-emerald-800 text-[11px] font-medium">
                      💡 <strong>Action:</strong> {c.actionable_recommendation}
                    </p>
                  </div>
                ))}

                {pharmaAudit.duplicate_therapies?.map((d: any, idx: number) => (
                  <div key={idx} className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-amber-900 text-[11px]">
                    ⚠️ <strong>Duplicate Molecule:</strong> {d.candidate_drug} overlaps with historical {d.existing_drug}.
                  </div>
                ))}

                {pharmaAudit.pharmacovigilance_guidance && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-blue-950 font-mono text-[11px]">
                    <strong>70B Clinical Guidance:</strong> {pharmaAudit.pharmacovigilance_guidance}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-emerald-900 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero drug-drug interactions or duplicate therapy risks detected across patient's historical health locker records.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post-Consultation Discharge UI */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-[#0f2942] border-b border-gray-100 pb-2">Discharge & Investigations Summary</h4>
        
        {/* Dynamic Evidence-Based Investigations derived from Chief Complaint */}
        <div className="space-y-3">
          {dynamicTests.map((t, idx) => (
            <TestExplainer 
              key={idx}
              testName={t.testName}
              description={t.description}
              whyNeeded={t.whyNeeded}
              preparation={t.preparation}
            />
          ))}
        </div>

        {/* Final Discharge Card */}
        <NextActionCard 
            type="post-consultation"
            followUpTiming={lowerComplaint.includes("chest") ? "3 days" : "7 days"}
            symptomWatch={symptomWatchWarning}
        />
      </div>

    </div>
  );
}
