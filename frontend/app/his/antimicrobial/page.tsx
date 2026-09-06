"use client";

import { useState } from "react";
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Pill, CheckCircle2, 
  ArrowRight, Search, Activity, RotateCcw, Copy, Check, Info, FileText,
  AlertOctagon, Sparkles, Building2, Stethoscope, ChevronRight
} from "lucide-react";
import Link from "next/link";
import TrustBanner from "@/components/TrustBanner";

interface AuditResult {
  antibioticName: string;
  prescribedDose: string;
  awareCategory: "Access" | "Watch" | "Reserve";
  awareColor: "emerald" | "amber" | "rose";
  stewardshipVerdict: string;
  isAppropriate: boolean;
  icmrGuidelineVerdict: string;
  narrowerAlternative?: {
    drugName: string;
    dosage: string;
    duration: string;
    rationale: string;
  };
  amrRiskScore: number;
  whoTargetCompliance: string;
  clinicalFlags: string[];
  icmrCitation: string;
}

const PRESET_SCENARIOS = [
  {
    title: "Viral Cold + Azithromycin",
    indication: "Acute upper respiratory viral rhinitis with low-grade fever and dry cough for 3 days",
    antibiotic: "Azithromycin 500mg once daily for 5 days",
    desc: "Common irrational Watch-group overprescription for viral URTI"
  },
  {
    title: "Uncomplicated UTI + Ciprofloxacin",
    indication: "Dysuria and increased urinary frequency in 28-year-old female with no systemic signs",
    antibiotic: "Ciprofloxacin 500mg BD for 5 days",
    desc: "Empirical fluoroquinolone overuse vs ICMR Nitrofurantoin first-line"
  },
  {
    title: "Pneumonia + Amoxicillin (Rational)",
    indication: "Mild community-acquired pneumonia in adult, hemodynamically stable, ambulatory",
    antibiotic: "Amoxicillin 500mg thrice daily for 5 days",
    desc: "Optimal WHO Access-group empirical prescription"
  },
  {
    title: "Skin Abscess + Meropenem (Alert)",
    indication: "Simple localized cutaneous furuncle / abscess on forearm without cellulitis",
    antibiotic: "Meropenem 1g IV TDS for 7 days",
    desc: "Critical Reserve-group misuse for uncomplicated skin lesion"
  }
];

export default function AntimicrobialStewardshipPage() {
  const [indication, setIndication] = useState(PRESET_SCENARIOS[0].indication);
  const [antibiotic, setAntibiotic] = useState(PRESET_SCENARIOS[0].antibiotic);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAudit = async (customIndication?: string, customAntibiotic?: string) => {
    const indToUse = customIndication ?? indication;
    const abxToUse = customAntibiotic ?? antibiotic;
    
    if (!indToUse.trim() || !abxToUse.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/antimicrobial/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indication: indToUse,
          antibiotic: abxToUse,
          patientAge: 35,
          setting: "OPD"
        })
      });

      if (res.ok) {
        const data: AuditResult = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error("Audit error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyNote = () => {
    if (!result) return;
    const note = `ICMR & WHO AWARE ANTIMICROBIAL STEWARDSHIP AUDIT
Indication: ${indication}
Prescribed Agent: ${result.antibioticName} (${result.prescribedDose})
WHO Classification: ${result.awareCategory} Group
Verdict: ${result.stewardshipVerdict}
Appropriateness: ${result.isAppropriate ? "Appropriate" : "Irrational Overprescription"}
AMR Resistance Score: ${result.amrRiskScore} / 100
ICMR Guideline: ${result.icmrGuidelineVerdict}
${result.narrowerAlternative ? `Recommended Narrower Alternative: ${result.narrowerAlternative.drugName} (${result.narrowerAlternative.dosage}) - ${result.narrowerAlternative.rationale}` : ""}
Reference: ${result.icmrCitation}`;

    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans selection:bg-[#0f4c81] selection:text-white" id="main-content">
      {/* Official Top Navigation Bar */}
      <TrustBanner currentTab="doctor" />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Breadcrumb & Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0f4c81] mb-2 uppercase tracking-wider">
            <Link href="/" className="hover:underline">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/his" className="hover:underline">HIS Desk</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500">Antimicrobial Stewardship (AMSP)</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold mb-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Phase 2 Civic Safety • WHO AWaRe & ICMR Treatment Guidelines</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f2942] tracking-tight">
                WHO AWaRe Antimicrobial Stewardship Audit
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-3xl font-medium">
                Preventing Antimicrobial Resistance (AMR) in Indian hospitals. Automatically audits prescriptions into <strong>Access</strong>, <strong>Watch</strong>, and <strong>Reserve</strong> tiers, curbing broad-spectrum overprescription with narrow ICMR alternatives.
              </p>
            </div>

            {/* Quick Link to Doctor Consultation */}
            <Link
              href="/his/doctor"
              className="self-start md:self-auto px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-[#0f4c81] text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor OPD Desk</span>
            </Link>
          </div>
        </div>

        {/* National AMR Surveillance Gauge Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Hospital Antibiotic Consumption Telemetry
              </span>
              <h3 className="font-extrabold text-base text-[#0f2942]">
                WHO Target: &ge; 60% Access Group Antibiotics
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Current Hospital Ratio: 64% Access (Compliant)
              </span>
            </div>
          </div>

          {/* Tricolor Consumption Bar */}
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200 shadow-inner">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: "64%" }} title="Access Group (64%)" />
            <div className="bg-amber-400 h-full transition-all" style={{ width: "26%" }} title="Watch Group (26%)" />
            <div className="bg-rose-500 h-full transition-all" style={{ width: "10%" }} title="Reserve Group (10%)" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-3 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Access (64%) - Amoxicillin, Cefalexin, Doxycycline</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span>Watch (26%) - Azithromycin, Ceftriaxone, Cipro</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Reserve (10%) - Meropenem, Colistin, Linezolid</span>
            </div>
          </div>
        </div>

        {/* Preset Clinical Scenarios */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
            Rapid Diagnostic Scenarios:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_SCENARIOS.map((sc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIndication(sc.indication);
                  setAntibiotic(sc.antibiotic);
                  handleAudit(sc.indication, sc.antibiotic);
                }}
                className="p-3.5 bg-white border border-gray-200 hover:border-[#0f4c81] rounded-2xl text-left shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="font-bold text-xs text-[#0f2942] group-hover:text-[#0f4c81] transition-colors mb-1">
                  {sc.title}
                </div>
                <div className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed font-medium">
                  {sc.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Audit Input Form & Real-Time Engine */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-xs">
          <h2 className="text-lg font-bold text-[#0f2942] mb-4 flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#0f4c81]" />
            <span>Prescription Antimicrobial Auditor</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                1. Clinical Indication / Presentation
              </label>
              <textarea
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
                placeholder="e.g. Acute sore throat with fever for 3 days or Uncomplicated lower UTI..."
                rows={3}
                className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-gray-300 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c81] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                2. Prescribed Antibiotic & Regimen
              </label>
              <textarea
                value={antibiotic}
                onChange={(e) => setAntibiotic(e.target.value)}
                placeholder="e.g. Azithromycin 500mg OD for 5 days or Ceftriaxone 1g IV..."
                rows={3}
                className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-gray-300 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c81] font-medium"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleAudit()}
              disabled={isLoading || !indication.trim() || !antibiotic.trim()}
              className="px-6 py-3 bg-[#0f2942] hover:bg-[#0f4c81] disabled:opacity-50 text-white text-xs font-extrabold rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Auditing with ICMR AMSP Engine...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Audit Prescription (ICMR AWaRe)</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-gray-500 font-medium">
              Powered by Groq LLM (LLaMA 3.3 70B) &bull; Zero Hardcoded Lookups
            </span>
          </div>
        </div>

        {/* Audit Results Dashboard */}
        {result && (
          <div className="space-y-6">
            
            {/* Primary AWaRe Verdict Banner */}
            <div className={`p-6 rounded-3xl border-2 shadow-sm transition-all ${
              result.awareCategory === "Reserve"
                ? "bg-rose-50 border-rose-300 text-rose-950"
                : result.awareCategory === "Watch"
                ? "bg-amber-50 border-amber-300 text-amber-950"
                : "bg-emerald-50 border-emerald-300 text-emerald-950"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
                    result.awareCategory === "Reserve"
                      ? "bg-rose-600"
                      : result.awareCategory === "Watch"
                      ? "bg-amber-500"
                      : "bg-emerald-600"
                  }`}>
                    {result.awareCategory === "Reserve" ? (
                      <AlertOctagon className="w-6 h-6" />
                    ) : result.awareCategory === "Watch" ? (
                      <AlertTriangle className="w-6 h-6" />
                    ) : (
                      <ShieldCheck className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white ${
                        result.awareCategory === "Reserve"
                          ? "bg-rose-700"
                          : result.awareCategory === "Watch"
                          ? "bg-amber-600"
                          : "bg-emerald-700"
                      }`}>
                        WHO {result.awareCategory} Category
                      </span>
                      <span className="text-xs font-bold opacity-75 font-mono">
                        Score: {result.amrRiskScore}/100 Risk
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold tracking-tight mt-1">
                      {result.stewardshipVerdict}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyNote}
                    className="px-4 py-2 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy Note"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Detailed Clinical Findings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left: ICMR Guidelines & Narrower Alternative (7 Span) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* ICMR Assessment */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0f4c81]" />
                      <h4 className="font-bold text-sm text-[#0f2942]">
                        ICMR Guideline Evaluation
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-50 text-[#0f4c81] px-2 py-0.5 rounded font-bold border border-blue-200">
                      National Treatment STW
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {result.icmrGuidelineVerdict}
                  </p>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono">
                    <strong>Reference:</strong> {result.icmrCitation}
                  </div>
                </div>

                {/* Recommended Narrower Alternative */}
                {result.narrowerAlternative && (
                  <div className="bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/60 border-2 border-emerald-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-extrabold text-sm text-emerald-950">
                          Recommended Narrower First-Line ICMR Alternative
                        </h4>
                      </div>
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                        Protects AMR
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-white border border-emerald-200 rounded-2xl">
                        <span className="text-[10px] text-gray-500 font-bold uppercase block">Drug / Regimen</span>
                        <span className="text-sm font-extrabold text-[#0f2942]">{result.narrowerAlternative.drugName}</span>
                      </div>
                      <div className="p-3 bg-white border border-emerald-200 rounded-2xl">
                        <span className="text-[10px] text-gray-500 font-bold uppercase block">Dosage & Frequency</span>
                        <span className="text-xs font-bold text-slate-800">{result.narrowerAlternative.dosage}</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 leading-relaxed">
                      <strong>Pharmacological Rationale:</strong> {result.narrowerAlternative.rationale}
                    </div>
                  </div>
                )}

              </div>

              {/* Right: Resistance Pressure & Clinical Warnings (5 Span) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* AMR Pressure Score */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h4 className="font-bold text-sm text-[#0f2942]">AMR Selection Pressure</h4>
                    <span className="text-xs font-bold font-mono text-slate-500">{result.amrRiskScore} / 100</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 shadow-inner">
                    <div 
                      className={`h-full transition-all ${
                        result.amrRiskScore > 70 ? "bg-rose-500" : result.amrRiskScore > 40 ? "bg-amber-400" : "bg-emerald-500"
                      }`}
                      style={{ width: `${result.amrRiskScore}%` }}
                    />
                  </div>

                  <div className="text-xs text-slate-600 font-medium leading-relaxed">
                    {result.amrRiskScore > 70 
                      ? "High selection pressure for ESBL, MRSA, and carbapenem-resistant pathogens. Overuse in OPD settings drives hospital and community AMR."
                      : "Favorable resistance profile. Low collateral damage to commensal microbiome."}
                  </div>
                </div>

                {/* Safety & Pharmacological Flags */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-3">
                  <h4 className="font-bold text-sm text-[#0f2942] border-b border-gray-100 pb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Microbiological & Clinical Flags</span>
                  </h4>

                  <ul className="space-y-2">
                    {result.clinicalFlags.map((flag, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}
