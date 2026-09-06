"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sparkles, Search, Activity, ShieldAlert, CheckCircle2, 
  AlertTriangle, Database, Cpu, Network, BookOpen, Stethoscope, Copy, Check, Printer,
  Eye, GitBranch, Binary, Layers, FileImage, ShieldCheck
} from "lucide-react";
import TrustBanner from "@/components/TrustBanner";
import { queryMedicalRAG, ClinicalGuideline } from "@/services/medical_rag";
import { 
  queryVisualRAG, VisualRagResponse, VisualFlowchartNode, 
  CLINICAL_VISUAL_FLOWCHARTS 
} from "@/services/visual_rag_engine";

export default function MedicalRagConsolePage() {
  // Mode switcher: "guidelines" (Text RAG) vs "visual" (Nemotron Embed-VL & Rerank-VL)
  const [activeTab, setActiveTab] = useState<"guidelines" | "visual">("guidelines");

  // Text RAG State
  const [queryInput, setQueryInput] = useState("Patient has severe retrosternal chest pain radiating to left arm with profuse cold sweating for 25 minutes");
  const [isLoading, setIsLoading] = useState(false);
  const [ragResult, setRagResult] = useState<any>(() => queryMedicalRAG("Patient has severe retrosternal chest pain radiating to left arm with profuse cold sweating for 25 minutes"));
  const [copied, setCopied] = useState(false);
  const [selectedChips, setSelectedChips] = useState<Record<string, string>>({});

  // Visual Document RAG State (Phase 1.1 / 1.2)
  const [visualQuery, setVisualQuery] = useState("What is the door-to-needle time and drug dosage if PCI facility is > 120 minutes away?");
  const [visualCategory, setVisualCategory] = useState("All");
  const [isVisualLoading, setIsVisualLoading] = useState(false);
  const [visualResult, setVisualResult] = useState<VisualRagResponse | null>(null);
  const [selectedVisualNode, setSelectedVisualNode] = useState<VisualFlowchartNode>(CLINICAL_VISUAL_FLOWCHARTS[0]);

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

  const sampleVisualScenarios = [
    {
      title: "STEMI Lysis vs PCI (> 120 Mins)",
      category: "Cardiology",
      query: "What is the door-to-needle time and drug dosage if PCI facility is > 120 minutes away?"
    },
    {
      title: "Dengue Warning Signs Fluid Rate",
      category: "Infectious Disease",
      query: "Dengue with persistent vomiting and rising hematocrit: what is initial crystalloid fluid rate?"
    },
    {
      title: "Severe Dengue Shock Resuscitation",
      category: "Infectious Disease",
      query: "Profound dengue circulatory shock with systolic BP < 90 mmHg and pulse pressure <= 20"
    },
    {
      title: "Acute Stroke IV rtPA Alteplase",
      category: "Neurology",
      query: "Last seen normal 3 hours ago with acute hemiparesis and NCCT head negative for bleed"
    },
    {
      title: "Critical Thrombocytopenia Transfusion",
      category: "Hematology",
      query: "Severe thrombocytopenia with platelet count < 20,000 and mucosal petechial bleeding"
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

  const handleExecuteVisualRAG = async (queryToRun: string, catToUse?: string) => {
    setIsVisualLoading(true);
    try {
      const res = await queryVisualRAG(queryToRun, catToUse || visualCategory);
      setVisualResult(res);
      setSelectedVisualNode(res.topNode);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVisualLoading(false);
    }
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

  const handleCopyVisualProtocol = () => {
    if (!selectedVisualNode) return;
    const n = selectedVisualNode;
    const text = `VISUAL FLOWCHART DECISION SUPPORT: ${n.flowchartTitle}
Authority: ${n.authority} (${n.sourceCitation})
Decision Branch: ${n.nodeTitle}
Trigger Condition: ${n.decisionCondition}
Clinical Action: ${n.clinicalAction}
Target Dosage / Window: ${n.timeWindowOrDosage}
Contraindications: ${n.contraindications.join(" | ")}
Nemotron Rerank-VL Match Probability: ${(n.rerankScore * 100).toFixed(1)}%`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const guideline: ClinicalGuideline = ragResult?.matchedGuideline;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      <TrustBanner currentTab="rag" onTabChange={() => {}} onLanguageChange={() => {}} />

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
        <div className="bg-gradient-to-r from-[#091e3a] via-[#0f4c81] to-[#1e3a8a] text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-6 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm mb-3">
              <Cpu className="w-3.5 h-3.5 text-amber-300" />
              <span>Dense-Sparse Hybrid Vector Retriever • GraphRAG • NVIDIA Nemotron Embed-VL & Rerank-VL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Clinical RAG Co-Pilot & Decision Support Console
            </h1>
            <p className="text-blue-100 text-sm mt-2 leading-relaxed">
              Synthesizes ICMR Standard Treatment Workflows, AIIMS Clinical Protocols, and multi-branch visual flowcharts. Powered by hybrid embeddings and NVIDIA vision-language rerankers for zero-degradation multimodal reasoning.
            </p>
          </div>
          <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none hidden md:block">
            <Network className="w-48 h-48 text-white" />
          </div>
        </div>

        {/* Tab Switcher: Text Guidelines vs Visual Flowchart RAG */}
        <div className="flex items-center gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto self-start border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("guidelines")}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "guidelines"
                ? "bg-[#0f4c81] text-white shadow-sm"
                : "text-slate-600 hover:text-[#0f4c81]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Clinical Evidence Guidelines (ICMR / StatPearls)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("visual");
              if (!visualResult) {
                handleExecuteVisualRAG(visualQuery);
              }
            }}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "visual"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            <Binary className="w-4 h-4" />
            <span>Visual Flowchart & Lab RAG (Phase 1.1: Nemotron-VL)</span>
            <span className="text-[9px] bg-white/20 text-white font-extrabold px-1.5 py-0.5 rounded-full">
              NEW
            </span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: CLINICAL EVIDENCE GUIDELINES (TEXT RAG)                 */}
        {/* ============================================================== */}
        {activeTab === "guidelines" && (
          <div className="space-y-6">
            {/* Search & Query Bar */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">1. Vector Embeddings</span>
                    <span className="text-[#0f4c81] font-bold text-xs">{ragResult.retrievalTelemetry.denseRetriever}</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">2. Sparse Lexical Search</span>
                    <span className="text-emerald-700 font-bold text-xs">{ragResult.retrievalTelemetry.sparseRetriever}</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">3. GraphRAG Topology</span>
                    <span className="text-indigo-700 font-bold text-xs">{ragResult.retrievalTelemetry.graphTraversal}</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">4. Zero-Hallucination Gate</span>
                    <span className="text-amber-700 font-bold text-xs">{ragResult.retrievalTelemetry.hallucinationGuardrail}</span>
                  </div>
                </div>

                {/* Primary Two-Column Output Console */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Col (2-Span): Condition, Evidence, Preliminary Advice & Chips */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Primary Matched Guideline Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4 mb-4">
                        <div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            guideline.urgency === "Critical" 
                              ? "bg-red-100 text-red-800 border border-red-200 animate-pulse" 
                              : guideline.urgency === "High" 
                              ? "bg-amber-100 text-amber-800 border border-amber-200" 
                              : "bg-blue-100 text-[#0f4c81] border border-blue-200"
                          }`}>
                            {guideline.urgency} Action Required
                          </span>
                          <h2 className="text-xl font-bold text-[#0f2942] mt-2">
                            {guideline.condition}
                          </h2>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-mono font-bold">
                            ICD-10: {guideline.icd10}
                          </span>
                          <span className="text-xs bg-indigo-50 text-indigo-800 px-2 py-1 rounded font-mono font-bold ml-1.5">
                            SNOMED: {guideline.snomedCode}
                          </span>
                        </div>
                      </div>

                      {/* Evidence Grounding Box */}
                      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs mb-6">
                        <div className="flex items-center gap-2 text-[#0f4c81] font-bold mb-1.5">
                          <BookOpen className="w-4 h-4" />
                          <span>Official Evidence Grounding: {guideline.source}</span>
                        </div>
                        <p className="text-gray-700 italic">
                          &quot;{guideline.sourceCitation}&quot;
                        </p>
                      </div>

                      {/* Immediate Preliminary Advice */}
                      <div className="mb-6">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Evidence-Based First-Line Clinical Action:
                        </h4>
                        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 font-medium text-sm leading-relaxed">
                          {guideline.preliminaryAdvice}
                        </div>
                      </div>

                      {/* Dynamic Diagnostic Tree Exploration (Chips) */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Dynamic Triage Decision Tree (ICMR Workflows)
                          </h4>
                          <span className="text-[11px] text-gray-400">Click chips to branch inquiry</span>
                        </div>

                        <div className="space-y-3">
                          {guideline.diagnosticQuestions?.map((chipGroup, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                              <span className="text-xs font-semibold text-gray-700 block mb-2">
                                {chipGroup.question}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {chipGroup.options?.map((chip, cIdx) => {
                                  const isSelected = selectedChips[chipGroup.question] === chip.label;
                                  return (
                                    <button
                                      key={cIdx}
                                      type="button"
                                      onClick={() => handleChipClick(chipGroup.question, chip.label)}
                                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                                        isSelected
                                          ? "bg-[#0f4c81] text-white border-[#0f4c81] shadow-xs"
                                          : "bg-white hover:bg-slate-100 text-gray-700 border-gray-300"
                                      }`}
                                    >
                                      {chip.label}
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
        )}

        {/* ============================================================== */}
        {/* TAB 2: VISUAL FLOWCHART & LAB RAG (NEMOTRON EMBED & RERANK VL) */}
        {/* ============================================================== */}
        {activeTab === "visual" && (
          <div className="space-y-6">
            
            {/* Visual Search Box */}
            <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Multimodal Vision-Language Retrieval (llama-nemotron-embed-vl-1b-v2 & rerank-vl-1b-v2)
                  </span>
                </div>
                
                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 text-xs">
                  {["All", "Cardiology", "Infectious Disease", "Neurology", "Hematology"].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setVisualCategory(cat);
                        handleExecuteVisualRAG(visualQuery, cat);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer text-[11px] ${
                        visualCategory === cat
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={visualQuery}
                    onChange={(e) => setVisualQuery(e.target.value)}
                    placeholder="Ask clinical flowchart question (e.g., Door-to-needle time if PCI is > 120 mins away)..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50 focus:bg-white"
                    onKeyDown={(e) => { if (e.key === "Enter") handleExecuteVisualRAG(visualQuery); }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleExecuteVisualRAG(visualQuery)}
                  disabled={isVisualLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Eye className="w-4 h-4 text-emerald-200" />
                  {isVisualLoading ? "Scanning Flowchart..." : "Retrieve Visual Branch"}
                </button>
              </div>

              {/* Sample Visual Flowchart Queries */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Demo Queries:</span>
                {sampleVisualScenarios.map((sc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setVisualQuery(sc.query);
                      setVisualCategory(sc.category);
                      handleExecuteVisualRAG(sc.query, sc.category);
                    }}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 border border-gray-200 transition-colors cursor-pointer"
                  >
                    {sc.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Retrieval Architecture Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Query Representation</span>
                  <span className="text-emerald-700 font-bold text-xs">Text → Visual Latent Token</span>
                </div>
                <Binary className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Document Ingestion</span>
                  <span className="text-blue-700 font-bold text-xs">Raw Images (Zero OCR Loss)</span>
                </div>
                <FileImage className="w-5 h-5 text-blue-600" />
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Reranking Model</span>
                  <span className="text-purple-700 font-bold text-xs">Nemotron Rerank-VL (GPU Score)</span>
                </div>
                <Layers className="w-5 h-5 text-purple-600" />
              </div>
            </div>

            {/* Interactive Flowchart Decision Tree Viewer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (2-Span): Flowchart Canvas & Active Node */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Active Matched Node Card */}
                <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 shadow-md relative overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {selectedVisualNode.authority} Standard Guideline
                        </span>
                        <span className="text-[10px] font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md font-bold">
                          Bounding Box: [{selectedVisualNode.boundingBox.ymin}, {selectedVisualNode.boundingBox.xmin}, {selectedVisualNode.boundingBox.ymax}, {selectedVisualNode.boundingBox.xmax}]
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#0f2942]">
                        {selectedVisualNode.nodeTitle}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {selectedVisualNode.flowchartTitle}
                      </p>
                    </div>

                    <div className="text-right bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-2xl">
                      <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Nemotron Rerank-VL
                      </div>
                      <div className="text-xl font-black text-emerald-700">
                        {(selectedVisualNode.rerankScore * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Trigger Condition / Clinical Threshold */}
                  <div className="mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Decision Tree Trigger Criteria:
                    </span>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                      ⚡ {selectedVisualNode.decisionCondition}
                    </div>
                  </div>

                  {/* Immediate Protocol Action */}
                  <div className="mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Immediate Clinical Execution Action:
                    </span>
                    <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-950 leading-relaxed">
                      {selectedVisualNode.clinicalAction}
                    </div>
                  </div>

                  {/* Window or Dosage */}
                  <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                      <span className="text-[10px] font-bold text-blue-800 uppercase block mb-1">
                        Target Time Window / Dosage
                      </span>
                      <span className="font-bold text-blue-950">
                        {selectedVisualNode.timeWindowOrDosage}
                      </span>
                    </div>
                    <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl">
                      <span className="text-[10px] font-bold text-purple-800 uppercase block mb-1">
                        Node Classification
                      </span>
                      <span className="font-bold text-purple-950 capitalize">
                        {selectedVisualNode.matchedPassageType.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Evidence Citation */}
                  <div className="text-[11px] text-gray-500 italic bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                    Source: {selectedVisualNode.sourceCitation}
                  </div>
                </div>

                {/* Candidate Nodes Retrieved from Catalog */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                  <h4 className="font-bold text-sm text-[#0f2942] mb-3 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-[#0f4c81]" /> All Matched Visual Flowchart Branches
                  </h4>

                  <div className="space-y-3">
                    {CLINICAL_VISUAL_FLOWCHARTS
                      .filter(n => visualCategory === "All" || n.category === visualCategory)
                      .map(node => {
                        const isSelected = selectedVisualNode.id === node.id;
                        return (
                          <div
                            key={node.id}
                            onClick={() => setSelectedVisualNode(node)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-emerald-50/70 border-emerald-500 shadow-xs"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-[#0f2942]">
                                {node.nodeTitle}
                              </span>
                              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-white border border-slate-300">
                                Match: {(node.rerankScore * 100).toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-1">
                              {node.decisionCondition}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>

              {/* Right Column: Guardrails & Copy Summary */}
              <div className="space-y-6">
                
                {/* Contraindications & Guardrails */}
                <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-sm">
                  <h4 className="font-bold text-rose-950 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" /> Protocol Contraindications
                  </h4>
                  <ul className="space-y-2 text-xs text-rose-900">
                    {selectedVisualNode.contraindications.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 font-medium">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Multimodal Architecture Specs */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-3 text-xs">
                  <h4 className="font-bold text-sm text-[#0f2942] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Why Visual RAG in Indian Hospitals?
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    Unlike Western text-dense documentation, 80%+ of acute clinical guidelines published by ICMR, AIIMS, and National Health Programs are laid out as visual flowcharts and multi-column diagnostic tables.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    By querying document page images directly with <strong>llama-nemotron-embed-vl-1b-v2</strong> and reranking with <strong>llama-nemotron-rerank-vl-1b-v2</strong>, Project Samanvaya avoids OCR transcription errors on arrowheads, branch intersections, and dosage matrices.
                  </p>
                </div>

                {/* Copy Actions */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleCopyVisualProtocol}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied Visual Protocol!" : "Copy Flowchart Protocol to Notes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-gray-800 font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> Print Visual Flowchart Decision
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
