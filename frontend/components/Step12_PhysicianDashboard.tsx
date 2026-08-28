"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, Check, X, AlertTriangle, Mic, MicOff, Save, Clock, FileText, ArrowLeft, History } from "lucide-react";

interface Step12Props {
  onBackToKiosk: () => void;
  patientName?: string;
  chiefComplaint?: string;
}

export default function Step12_PhysicianDashboard({
  onBackToKiosk,
  patientName = "Ramesh Kumar (48M)",
  chiefComplaint = "Fever and persistent productive cough (3 days)"
}: Step12Props) {
  const [dictationText, setDictationText] = useState("");
  const [isDictating, setIsDictating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Line-by-Line Accept / Reject state (Doctor-Edit Audit Trail)
  const [lines, setLines] = useState([
    { id: 1, text: "Presenting Complaint: High grade fever with nocturnal chills and productive cough.", status: "accepted" },
    { id: 2, text: "Onset & Duration: Acute onset, 3 days duration (Gradual worsening).", status: "accepted" },
    { id: 3, text: "AYUSH Agni/Metabolic Profile: Manda Agni (Sluggish digestion with epigastric fullness).", status: "accepted" },
    { id: 4, text: "Previous Medication: Amoxicillin-Clav 625mg PO BD (2 days prior).", status: "accepted" }
  ]);

  const toggleLineStatus = (id: number, newStatus: "accepted" | "rejected") => {
    setLines(lines.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const handleVoiceDictation = () => {
    if (!isDictating) {
      setIsDictating(true);
      setTimeout(() => {
        setDictationText("Bilateral wheezing detected on auscultation. Prescribing Levosalbutamol + Budesonide nebulization.");
        setIsDictating(false);
      }, 2500);
    } else {
      setIsDictating(false);
    }
  };

  const handleFinalSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-5xl bg-black/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl text-white shadow-2xl space-y-6"
    >
      {/* Top Clinician Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#C2CD93]/20 text-[#C2CD93] border border-[#C2CD93]/40">
              <Stethoscope className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-medium text-white">{patientName}</h2>
              <p className="text-xs text-gray-400">Token: <span className="text-[#C2CD93] font-mono font-bold">A-142</span> | ABHA: <span className="font-mono">91-4820-1934-8291</span></p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium hover:bg-amber-500/30 transition-colors"
          >
            📊 Festival/Season OPD Analytics
          </button>
          <button
            onClick={onBackToKiosk}
            className="px-4 py-2 rounded-xl border border-white/20 text-gray-300 text-xs hover:bg-white/10 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Kiosk Mode
          </button>
          <button
            onClick={handleFinalSave}
            className="px-5 py-2 rounded-xl bg-[#C2CD93] hover:bg-[#b0bd82] text-black font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(194,205,147,0.3)] transition-all"
          >
            <Save className="w-4 h-4" /> {savedSuccess ? "Saved to ABDM ✓" : "Commit to ABDM (FHIR)"}
          </button>
        </div>
      </div>

      {/* Expandable Festival / Season OPD Analytics Card */}
      {showAnalytics && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <span className="font-bold text-amber-300">Hospital Administration: Regional Festival & Climate Surge Forecast</span>
            <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-200">District PIN: 110001 (Monsoon Season)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-200">
            <div className="p-3 bg-black/40 rounded-xl">
              <p className="font-semibold text-white">Upcoming: Post-Diwali Smog Surge (+45%)</p>
              <p className="text-gray-400 mt-1">High influx of acute asthma, COPD flare-ups, and pediatric wheezing expected.</p>
              <p className="text-[#C2CD93] mt-2 font-medium">Recommended Stock: Inhalers & Nebulization kits (+50%).</p>
            </div>
            <div className="p-3 bg-black/40 rounded-xl">
              <p className="font-semibold text-white">Current: Monsoon Waterlogging Gastro (+30%)</p>
              <p className="text-gray-400 mt-1">Spike in acute gastroenteritis and waterborne diarrheal infections.</p>
              <p className="text-[#C2CD93] mt-2 font-medium">Recommended Stock: ORS, IV Fluids & Ciprofloxacin.</p>
            </div>
          </div>
        </div>
      )}

      {/* Safety Alert Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Herb-Drug Conflict Alert */}
        <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-red-300">Herb-Drug Contraindication Alert</p>
            <p className="text-gray-300 mt-0.5 leading-relaxed">
              Patient takes Metformin for T2DM and reports consuming Karela juice daily. Severe additive hypoglycemic risk detected.
            </p>
          </div>
        </div>

        {/* Visit-to-Visit Memory */}
        <div className="bg-[#C891AA]/10 border border-[#C891AA]/40 rounded-2xl p-4 flex items-start gap-3">
          <History className="w-5 h-5 text-[#C891AA] mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-[#C891AA]">Returning Patient History (Visit Memory)</p>
            <p className="text-gray-300 mt-0.5 leading-relaxed">
              Last visit (14 days ago): Treated for Upper Respiratory Tract Infection. Persistent cough flagged for sputum cytology.
            </p>
          </div>
        </div>
      </div>

      {/* TB Red-Flag Linkage to National Nikshay Portal */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-red-300">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span><strong>National Health Program Alert:</strong> Symptom triad indicates potential Pulmonary TB (Cough &gt; 2 weeks + Fever).</span>
        </div>
        <button
          onClick={() => alert("📋 Nikshay Case Notification Pre-Filled:\nPatient: Ramesh Kumar\nRecommended Investigation: Sputum CBNAAT / GeneXpert\nNational TB Elimination Program (NTEP) ID: NIK-2026-8941")}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          Pre-fill Nikshay TB Notification
        </button>
      </div>

      {/* Live Hospital Pharmacy Stock-Check */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs space-y-2">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="font-semibold text-white">🏥 Live Hospital Pharmacy Inventory (Jan Aushadhi Counter)</span>
          <span className="text-[#C2CD93] font-mono text-[11px]">Sync: 2 mins ago</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="p-2.5 bg-black/40 rounded-xl flex justify-between items-center">
            <span>Amoxicillin 500mg</span>
            <span className="text-[#C2CD93] font-bold">In Stock (450 tabs)</span>
          </div>
          <div className="p-2.5 bg-black/40 rounded-xl flex justify-between items-center">
            <span>Pantoprazole 40mg</span>
            <span className="text-[#C2CD93] font-bold">In Stock (210 tabs)</span>
          </div>
          <div className="p-2.5 bg-black/40 rounded-xl flex justify-between items-center">
            <span>Azithromycin 500mg</span>
            <span className="text-red-400 font-bold">Out of Stock ⚠️</span>
          </div>
        </div>
      </div>

      {/* Line-by-Line AI Draft Accept / Reject Audit Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-xs font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#C2CD93]" />
            AI-Drafted Clinical Summary (Line-by-Line Legal Demarcation)
          </span>
          <span className="text-[11px] text-gray-400">Doctor edits logged for audit trail</span>
        </div>

        <div className="space-y-2">
          {lines.map((line) => (
            <div
              key={line.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-all text-xs ${
                line.status === "accepted"
                  ? "bg-black/40 border-white/10 text-gray-200"
                  : "bg-red-500/10 border-red-500/30 text-gray-400 line-through"
              }`}
            >
              <span className="flex-1">{line.text}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleLineStatus(line.id, "accepted")}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    line.status === "accepted" ? "bg-[#C2CD93]/20 border-[#C2CD93] text-[#C2CD93]" : "border-white/10 text-gray-500"
                  }`}
                  title="Accept line"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toggleLineStatus(line.id, "rejected")}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    line.status === "rejected" ? "bg-red-500/20 border-red-500 text-red-400" : "border-white/10 text-gray-500"
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
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-white flex items-center gap-2">
            <Mic className="w-4 h-4 text-[#C891AA]" />
            Reverse Doctor Dictation (Hands-Free Consultation Notes)
          </span>
          {isDictating && <span className="text-xs text-red-400 animate-pulse">Recording doctor's voice...</span>}
        </div>

        <textarea
          value={dictationText}
          onChange={(e) => setDictationText(e.target.value)}
          placeholder="Dictate clinical observations, physical exam findings, or final prescription..."
          className="w-full h-20 bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#C891AA] outline-none resize-none mb-3"
        />

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-gray-500">Auto-transcribes and appends to patient's FHIR Encounter bundle.</p>
          <button
            onClick={handleVoiceDictation}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              isDictating
                ? "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                : "bg-[#C891AA]/20 border-[#C891AA]/50 text-[#C891AA] hover:bg-[#C891AA]/30"
            }`}
          >
            {isDictating ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isDictating ? "Stop Dictating" : "Voice Dictate Findings"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
