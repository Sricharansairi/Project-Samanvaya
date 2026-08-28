"use client";

import { useState } from "react";
import { Stethoscope, Check, X, AlertTriangle, Mic, MicOff, Save, FileText, ArrowLeft, History, Pill, Building } from "lucide-react";
import TestExplainer from "./TestExplainer";
import NextActionCard from "./NextActionCard";

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
      }, 2000);
    } else {
      setIsDictating(false);
    }
  };

  const handleFinalSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

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
                Token: A-142
              </span>
            </h3>
            <p className="text-xs text-gray-500 font-mono">ABHA ID: 91-4820-1934-8291 • General Medicine OPD</p>
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
            <span className="font-bold text-amber-900">Hospital Administration: Regional Festival & Climate Surge Forecast</span>
            <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded font-semibold text-amber-900">District PIN: 110001 (Monsoon Season)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-lg border border-amber-200">
              <p className="font-bold text-[#0f2942]">Upcoming: Post-Diwali Smog Surge (+45%)</p>
              <p className="text-gray-500 mt-1">High influx of acute asthma and pediatric wheezing expected.</p>
              <p className="text-emerald-800 mt-1 font-bold">Recommended Buffer: Inhalers & Nebulizers (+50%).</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-amber-200">
              <p className="font-bold text-[#0f2942]">Current: Monsoon Waterlogging Gastro (+30%)</p>
              <p className="text-gray-500 mt-1">Spike in acute gastroenteritis and waterborne infections.</p>
              <p className="text-emerald-800 mt-1 font-bold">Recommended Buffer: ORS & IV Fluids (+35%).</p>
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
            <p className="font-bold text-red-900">Herb-Drug Contraindication Alert</p>
            <p className="text-red-700 mt-0.5 leading-relaxed">
              Patient takes Metformin for T2DM and reports consuming Karela juice daily. Additive hypoglycemic risk detected.
            </p>
          </div>
        </div>

        {/* Visit-to-Visit Memory */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
          <History className="w-5 h-5 text-purple-700 mt-0.5 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-purple-900">Returning Patient History (Visit Memory)</p>
            <p className="text-purple-800 mt-0.5 leading-relaxed">
              Last visit (14 days ago): Treated for Upper Respiratory Tract Infection. Persistent cough flagged for sputum test.
            </p>
          </div>
        </div>
      </div>

      {/* TB Red-Flag Linkage to Nikshay Portal */}
      <div className="bg-red-50/70 border border-red-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-red-900 font-medium">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span><strong>National Program Alert:</strong> Symptom triad indicates potential Pulmonary TB (Cough &gt; 2 weeks + Fever).</span>
        </div>
        <button
          type="button"
          onClick={() => alert("📋 Nikshay Case Notification Pre-Filled:\nPatient: Ramesh Kumar\nRecommended Investigation: Sputum CBNAAT / GeneXpert\nNational TB Elimination Program (NTEP) ID: NIK-2026-8941")}
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

      {/* Post-Consultation Discharge UI */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-[#0f2942] border-b border-gray-100 pb-2">Discharge & Investigations Summary</h4>
        
        {/* Mocked Tests for the demo */}
        <TestExplainer 
            testName="Sputum CBNAAT / GeneXpert" 
            description="A highly sensitive test to detect Tuberculosis bacteria and check if it is resistant to Rifampicin."
            whyNeeded="Because your persistent cough and fever flag a risk for TB. We need to rule this out safely."
            preparation="Collect the sample early morning before eating or brushing."
        />
        <TestExplainer 
            testName="Random Blood Sugar (RBS)" 
            description="A quick blood test to check your current glucose levels."
            whyNeeded="You are a known diabetic, and we need to see how well your Metformin is working today."
        />

        {/* Final Discharge Card */}
        <NextActionCard 
            type="post-consultation"
            followUpTiming="7 days"
            symptomWatch="Chest tightness worsens, or fever crosses 101°F."
        />
      </div>

    </div>
  );
}
