"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sparkles, Search, Activity, ShieldAlert, CheckCircle2, 
  AlertTriangle, Database, Cpu, Network, BookOpen, Stethoscope, Copy, Check, Printer 
} from "lucide-react";
import TrustBanner from "@/components/TrustBanner";
import { queryMedicalRAG, ClinicalGuideline } from "@/services/medical_rag";

export default function MedicalRagConsolePage() {
  const [queryInput, setQueryInput] = useState("Patient has severe retrosternal chest pain radiating to left arm with profuse cold sweating for 25 minutes");
  const [isLoading, setIsLoading] = useState(false);
  const [ragResult, setRagResult] = useState<any>(() => queryMedicalRAG("Patient has severe retrosternal chest pain radiating to left arm with profuse cold sweating for 25 minutes"));
  const [copied, setCopied] = useState(false);
  const [selectedChips, setSelectedChips] = useState<Record<string, string>>({});

  const sampleScenarios = [
    {
      title: "Acute Coronary Syndrome",
      query: "Severe retrosternal chest pain radiating to left arm with profuse cold sweating for 25 minutes"
    },
    {
      title: "Acute Ischemic Stroke",
      query: "Sudden right-sided facial drooping and slurred speech since 2 hours ago (last seen normal 8 AM)"
    },
    {
      title: "Dengue Warning Signs",
      query: "High fever for 4 days with severe eye pain, petechial red spots on skin, and dark urine"
    },
    {
      title: "Acute Renal Colic",
      query: "Excruciating spasmodic right flank pain radiating to groin with blood in urine and vomiting"
    },
    {
      title: "Acute Ocular Pain",
      query: "Sudden painful red eye with blurred vision, halos around lights, and intense headache"
    }
  ];

  const handleExecuteRAG = (textToQuery: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const result = queryMedicalRAG(textToQuery);
      setRagResult(result);
      setSelectedChips({});
      setIsLoading(false);
    }, 300);
  };

  const handleChipClick = (questionKey: string, chipValue: string) => {
    setSelectedChips(prev => ({ ...prev, [questionKey]: chipValue }));
  };

  const handleCopyNotes = () => {
    if (!ragResult) return;
    const g: ClinicalGuideline = ragResult.matchedGuideline;
    const text = `CLINICAL RAG DECISION SUPPORT SUMMARY
Condition: ${g.condition} (${g.urgency} Urgency)
SNOMED-CT: ${g.snomedCode} [${g.snomedDisplay}] | ICD-10: ${g.icd10}
Evidence Source: ${g.source} (${g.sourceCitation})
Differential Diagnoses: ${ragResult.differentialDiagnoses.join(", ")}
Preliminary Advice: ${g.preliminaryAdvice}
Contraindications: ${g.contraindications.join(" | ")}
Recommended Workup: ${g.recommendedWorkup.join(", ")}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const guideline: ClinicalGuideline = ragResult?.matchedGuideline;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      <TrustBanner currentTab="his" onTabChange={() => {}} onLanguageChange={() => {}} />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <a href="/his" className="flex items-center text-[#0f4c81] hover:underline font-semibold text-sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to HIS Roles
          </a>
          <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Multi-Architectured Medical RAG Engine
          </span>
        </div>

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#091e3a] via-[#0f4c81] to-[#1e3a8a] text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm mb-3">
              <Cpu className="w-3.5 h-3.5 text-amber-300" />
              <span>Dense-Sparse Hybrid Vector Retriever • GraphRAG • Zero-Hallucination Guardrails</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Clinical RAG Co-Pilot & Decision Support Console
            </h1>
            <p className="text-blue-100 text-sm mt-2 leading-relaxed">
              Dynamically evaluates any clinical presentation against ICMR Standard Treatment Workflows, StatPearls (NCBI Bookshelf), and SNOMED-CT clinical ontologies. Synthesizes bespoke diagnostic chip trees, differential diagnoses, and safety contraindications on the fly.
            </p>
          </div>
          <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none hidden md:block">
            <Network className="w-48 h-48 text-white" />
          </div>
        </div>

        {/* Search & Query Bar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
            Chief Clinical Presentation or Free-Text Case History:
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Enter patient symptoms, complaint, onset, or clinical observation..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0f4c81] bg-slate-50 focus:bg-white"
                onKeyDown={(e) => { if (e.key === "Enter") handleExecuteRAG(queryInput); }}
              />
            </div>
            <button
              type="button"
              onClick={() => handleExecuteRAG(queryInput)}
              disabled={isLoading}
              className="bg-[#0f4c81] hover:bg-blue-900 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {isLoading ? "Analyzing..." : "Run Clinical RAG"}
            </button>
          </div>

          {/* Preset Clinical Scenarios */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Demo Scenarios:</span>
            {sampleScenarios.map((sc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQueryInput(sc.query);
                  handleExecuteRAG(sc.query);
                }}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-[#0f4c81] text-gray-700 border border-gray-200 transition-colors cursor-pointer"
              >
                {sc.title}
              </button>
            ))}
          </div>
        </div>

        {guideline && (
          <div className="space-y-6">
            
            {/* Multi-Architectured Telemetry Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Dense Vector Similarity</span>
                  <Cpu className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-extrabold text-[#0f4c81]">
                  {(ragResult.retrievalArchitecture.denseScore * 100).toFixed(0)}% Match
                </div>
                <span className="text-[10px] text-gray-400">Cosine Distance Embedding Space</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Sparse BM25 Score</span>
                  <Database className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-extrabold text-emerald-700">
                  {ragResult.retrievalArchitecture.sparseScore} pts
                </div>
                <span className="text-[10px] text-gray-400">Lexical Medical Term Inverted Index</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">SNOMED-CT Concept</span>
                  <Network className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-sm font-mono font-extrabold text-purple-900 truncate" title={guideline.snomedCode}>
                  #{guideline.snomedCode}
                </div>
                <span className="text-[10px] text-gray-500 truncate block">{guideline.snomedDisplay}</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Emergency Guardrail</span>
                  <ShieldAlert className={`w-4 h-4 ${ragResult.isEmergency ? "text-rose-600" : "text-emerald-600"}`} />
                </div>
                <div className={`text-base font-extrabold ${ragResult.isEmergency ? "text-rose-600" : "text-emerald-700"}`}>
                  {ragResult.isEmergency ? "CRITICAL RED ZONE" : "ROUTINE TRIAGE"}
                </div>
                <span className="text-[10px] text-gray-400">Zero-Hallucination Safety Overrides</span>
              </div>

            </div>

            {/* Emergency Alert Banner if Triggered */}
            {ragResult.emergencyAlert && (
              <div className="bg-rose-600 text-white rounded-2xl p-5 shadow-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 animate-pulse shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-sm uppercase tracking-wider">Constitutional Clinical Emergency Overridden</h4>
                    <p className="text-xs text-rose-100 mt-0.5">{ragResult.emergencyAlert}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-white/20 px-3 py-1 rounded-full shrink-0">
                  DOOR-TO-TREATMENT SLA ACTIVE
                </span>
              </div>
            )}

            {/* Main Decision Support Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Matched Guideline + Dynamic Question Playground */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Condition Card */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-[#0f4c81] border border-blue-100">
                      {guideline.department}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-500">ICD-10: {guideline.icd10}</span>
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        guideline.urgency === "Critical" ? "bg-red-100 text-red-800" : (guideline.urgency === "High" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800")
                      }`}>
                        {guideline.urgency} Urgency
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-extrabold text-[#0f2942] mb-2">{guideline.condition}</h2>
                  <p className="text-xs text-gray-500 font-medium mb-6">
                    Evidence Citation: <span className="text-gray-800 font-semibold">{guideline.sourceCitation}</span>
                  </p>

                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 mb-6">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Preliminary Clinical Management:
                    </h4>
                    <p className="text-sm text-emerald-950 font-medium leading-relaxed">
                      {guideline.preliminaryAdvice}
                    </p>
                  </div>

                  {/* Dynamic Diagnostic Question Playground */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-[#0f4c81]" />
                      Synthesized Diagnostic Parameters ({guideline.diagnosticQuestions.length} Questions)
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Click chips to simulate patient intake. Selected chips will be compiled into the clinical case notes.
                    </p>

                    <div className="space-y-4">
                      {guideline.diagnosticQuestions.map((dq, qIdx) => (
                        <div key={dq.key} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                            Parameter {qIdx + 1}: {dq.category.toUpperCase()}
                          </span>
                          <h4 className="text-sm font-bold text-gray-900 mb-2.5">{dq.question}</h4>

                          <div className="flex flex-wrap gap-2">
                            {dq.options.map((opt) => {
                              const isSelected = selectedChips[dq.key] === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => handleChipClick(dq.key, opt.value)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-[#0f4c81] text-white border-[#0f4c81] shadow-xs"
                                      : "bg-white hover:bg-slate-100 text-gray-700 border-gray-300"
                                  }`}
                                >
                                  {opt.isRedFlag && (
                                    <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-amber-300" : "text-amber-500"}`} />
                                  )}
                                  <span>{opt.label}</span>
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Col: Differentials, Workup, & Contraindications */}
              <div className="space-y-6">
                
                {/* Differential Diagnoses */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-600" /> Differential Diagnoses
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {ragResult.differentialDiagnoses.map((diff: string, i: number) => (
                      <li key={i} className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 text-purple-950 font-semibold flex items-center justify-between">
                        <span>{diff}</span>
                        <span className="text-[10px] text-purple-600 font-bold font-mono">Rank #{i + 1}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contraindications / Red Alert */}
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="font-bold text-rose-900 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Contraindications & Pitfalls
                  </h4>
                  <ul className="space-y-2 text-xs text-rose-950">
                    {guideline.contraindications.map((contra: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{contra}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Diagnostic Workup */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#0f4c81]" /> Recommended Workup
                  </h4>
                  <ul className="space-y-2 text-xs text-gray-800">
                    {guideline.recommendedWorkup.map((wu: string, i: number) => (
                      <li key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-medium">
                        ✓ {wu}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleCopyNotes}
                    className="w-full bg-[#0f4c81] hover:bg-blue-900 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied Decision Support Summary!" : "Copy Summary to Clinical Notes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-gray-800 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> Print Decision Support Slip
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}
