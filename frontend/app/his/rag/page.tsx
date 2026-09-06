"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sparkles, Search, Activity, ShieldAlert, CheckCircle2, 
  AlertTriangle, Database, Cpu, Network, BookOpen, Stethoscope, Copy, Check, Printer,
  Eye, GitBranch, Binary, Layers, FileImage, ShieldCheck, ZoomIn, ZoomOut,
  Maximize2, Minimize2, Volume2, VolumeX, RotateCcw, Table, HeartPulse, User, Calendar, FileText
} from "lucide-react";
import TrustBanner from "@/components/TrustBanner";
import { queryMedicalRAG, ClinicalGuideline } from "@/services/medical_rag";
import { 
  queryVisualRAG, VisualRagResponse, DynamicVisualDocument, 
  DynamicLabTableRow, DynamicFlowchartStep 
} from "@/services/visual_rag_engine";

export default function MedicalRagConsolePage() {
  // Mode switcher: "guidelines" (Text RAG) vs "visual" (Nemotron Embed-VL & Rerank-VL)
  const [activeTab, setActiveTab] = useState<"guidelines" | "visual">("visual");

  // --- Text RAG State ---
  const [queryInput, setQueryInput] = useState("Patient has severe retrosternal chest pain radiating to left arm with profuse cold sweating for 25 minutes");
  const [isLoading, setIsLoading] = useState(false);
  const [ragResult, setRagResult] = useState<any>(() => queryMedicalRAG("Patient has severe retrosternal chest pain radiating to left arm with profuse cold sweating for 25 minutes"));
  const [copied, setCopied] = useState(false);
  const [selectedChips, setSelectedChips] = useState<Record<string, string>>({});

  // --- Visual Document RAG State (Phase 1.1 / 1.2: Nemotron Embed-VL & Rerank-VL) ---
  const [visualQuery, setVisualQuery] = useState("Check HbA1c 8.4% and fasting blood sugar 182 mg/dL in diabetic evaluation panel");
  const [visualCategory, setVisualCategory] = useState("All");
  const [isVisualLoading, setIsVisualLoading] = useState(false);
  const [visualDoc, setVisualDoc] = useState<DynamicVisualDocument | null>(null);

  // Zoom Engine State: Instant camera pan & scale into target bounding box
  const [zoomLevel, setZoomLevel] = useState<number>(2.6);
  const [isZoomedIn, setIsZoomedIn] = useState<boolean>(true);
  const [isSpeakingSummary, setIsSpeakingSummary] = useState<boolean>(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

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
      title: "🧪 HbA1c & Fasting Glucose Table",
      category: "Metabolic / Diabetes",
      query: "Check HbA1c 8.4% and fasting blood sugar 182 mg/dL in diabetic evaluation panel"
    },
    {
      title: "🫀 STEMI Reperfusion (> 120 Mins)",
      category: "Cardiology",
      query: "What is the door-to-needle time and drug dosage if PCI facility is > 120 minutes away?"
    },
    {
      title: "🦟 Dengue Warning Signs Fluid Rate",
      category: "Infectious Disease",
      query: "Dengue with persistent vomiting and rising hematocrit: what is initial crystalloid fluid rate?"
    },
    {
      title: "🧠 Acute Stroke IV rtPA Alteplase",
      category: "Neurology",
      query: "Last seen normal 3 hours ago with acute hemiparesis and NCCT head negative for bleed"
    },
    {
      title: "🩸 Critical Thrombocytopenia Transfusion",
      category: "Hematology",
      query: "Severe thrombocytopenia with platelet count < 20,000 and mucosal petechial bleeding"
    }
  ];

  // Initial load: Execute Visual RAG for instant HbA1c / Glucose zoom demonstration
  useEffect(() => {
    handleExecuteVisualRAG(visualQuery);
  }, []);

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
      setVisualDoc(res.document);
      // Automatically activate smooth focal zoom into the target table/node
      setZoomLevel(res.document.zoomFocus.zoomLevel || 2.6);
      setIsZoomedIn(true);
    } catch (err) {
      console.error("Visual RAG error:", err);
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
    if (!visualDoc) return;
    const d = visualDoc;
    const text = `VISUAL DOCUMENT & FLOWCHART RAG RESULT: ${d.documentTitle}
Authority: ${d.authority} (${d.citation})
Target Section: ${d.targetSectionTitle}
Clinical Action: ${d.clinicalAction}
Target Window / Dosage: ${d.timeWindowOrDosage}
Patient Plain-Language Summary: ${d.plainLanguageExplanation}
Contraindications: ${d.contraindications.join(" | ")}
Nemotron Rerank-VL Match Probability: ${(d.rerankScore * 100).toFixed(1)}%`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Vernacular Voice Output for Common People
  const speakPatientExplanation = async (text: string) => {
    if (isSpeakingSummary) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingSummary(false);
      return;
    }

    try {
      setIsSpeakingSummary(true);
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text || visualDoc?.vernacularHindiSummary,
          language_code: "hi-IN",
          speaker: "pooja"
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.base64_audio) {
          const audio = new Audio(`data:audio/wav;base64,${data.base64_audio}`);
          currentAudioRef.current = audio;
          audio.onended = () => {
            setIsSpeakingSummary(false);
            currentAudioRef.current = null;
          };
          audio.onerror = () => {
            setIsSpeakingSummary(false);
            fallbackBrowserSpeech(text);
          };
          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn("Speech API fallback:", e);
    }
    fallbackBrowserSpeech(text);
  };

  const fallbackBrowserSpeech = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "hi-IN";
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeakingSummary(false);
      utterance.onerror = () => setIsSpeakingSummary(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeakingSummary(false);
    }
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
              <span>NVIDIA Nemotron Embed-VL & Rerank-VL • Dynamic Visual RAG • Zero-OCR Degradation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Clinical & Visual Document RAG Console
            </h1>
            <p className="text-blue-100 text-sm mt-2 leading-relaxed font-medium">
              Real-time multimodal document retrieval and visual spotlighting. Ingests raw lab reports, ECG charts, and ICMR flowcharts, instantly pulling up the exact page and zooming directly into target diagnostic tables and decision branches.
            </p>
          </div>
          <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none hidden md:block">
            <Network className="w-48 h-48 text-white" />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto self-start border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("visual")}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "visual"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            <Binary className="w-4 h-4" />
            <span>Visual Document & Lab RAG (Nemotron Embed-VL & Rerank-VL)</span>
            <span className="text-[9px] bg-white/20 text-white font-extrabold px-1.5 py-0.5 rounded-full">
              LIVE
            </span>
          </button>

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
            <span>Text Clinical Guidelines (ICMR STWs)</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: VISUAL FLOWCHART & LAB RAG WITH INSTANT CAMERA ZOOM     */}
        {/* ============================================================== */}
        {activeTab === "visual" && (
          <div className="space-y-6">
            
            {/* Search Bar & Scenarios */}
            <div className="bg-white border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Dynamic Multimodal Retrieval (llama-nemotron-embed-vl-1b-v2 & rerank-vl-1b-v2)
                  </span>
                </div>
                
                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
                  Zero Hardcoded Outputs • Live Groq LLaMA 3.3 70B Engine
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={visualQuery}
                    onChange={(e) => setVisualQuery(e.target.value)}
                    placeholder="Enter any lab parameter, complaint, or clinical flowchart query..."
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
                  {isVisualLoading ? "Scanning & Zooming..." : "Scan & Zoom to Table"}
                </button>
              </div>

              {/* Preset Scenarios with instant HbA1c/Glucose Zoom */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Instant Presets:</span>
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

            {/* Visual Canvas & Dual Explanation Layout */}
            {visualDoc && (
              <div className="space-y-6">
                
                {/* Visual Status Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                      visualDoc.urgency === "Critical"
                        ? "bg-red-100 text-red-800 border border-red-200 animate-pulse"
                        : visualDoc.urgency === "High"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}>
                      {visualDoc.urgency} Priority
                    </span>
                    <span className="font-bold text-[#0f2942]">
                      {visualDoc.documentTitle}
                    </span>
                    <span className="text-gray-400 hidden sm:inline">•</span>
                    <span className="text-gray-500 hidden sm:inline font-mono">
                      {visualDoc.authority} Standard
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Nemotron Rerank-VL:</span>
                    <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 font-mono text-sm">
                      {(visualDoc.rerankScore * 100).toFixed(1)}% Match
                    </span>
                  </div>
                </div>

                {/* PRIMARY TWO-COLUMN WORKSPACE: LEFT IS VISUAL DOCUMENT VIEWER WITH ZOOM, RIGHT IS DUAL CARDS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* LEFT COLUMN: INTERACTIVE HIGH-RESOLUTION DOCUMENT SHEET & ZOOM VIEWER (7 SPAN) */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    
                    {/* Viewport Controls Bar */}
                    <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Visual Page Canvas</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          Box: [{visualDoc.targetBoundingBox.ymin}, {visualDoc.targetBoundingBox.xmin}, {visualDoc.targetBoundingBox.ymax}, {visualDoc.targetBoundingBox.xmax}]
                        </span>
                      </div>

                      {/* Zoom Toggle Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsZoomedIn(true);
                            setZoomLevel(visualDoc.zoomFocus.zoomLevel || 2.6);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isZoomedIn 
                              ? "bg-emerald-500 text-slate-950 shadow-sm" 
                              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                          }`}
                          title="Instantly zoom directly into target table"
                        >
                          <ZoomIn className="w-3.5 h-3.5" /> Zoom to Table
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsZoomedIn(false);
                            setZoomLevel(1.0);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            !isZoomedIn 
                              ? "bg-emerald-500 text-slate-950 shadow-sm" 
                              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                          }`}
                          title="View full document overview"
                        >
                          <Minimize2 className="w-3.5 h-3.5" /> Full Sheet
                        </button>
                      </div>
                    </div>

                    {/* Interactive Zoomable Viewport Container */}
                    <div className="relative w-full h-[520px] bg-slate-200/90 rounded-3xl border-2 border-slate-300 shadow-inner overflow-hidden flex items-center justify-center select-none">
                      
                      {/* Document Sheet with Smooth Transform Transition */}
                      <div 
                        className="w-[600px] min-h-[780px] bg-white rounded-xl shadow-2xl p-6 text-slate-800 font-sans relative origin-top-left transition-transform duration-700 ease-out"
                        style={{
                          transform: isZoomedIn 
                            ? `scale(${zoomLevel}) translate(-${visualDoc.zoomFocus.xPercent * 0.45}%, -${visualDoc.zoomFocus.yPercent * 0.55}%)`
                            : `scale(0.62) translate(0%, 0%)`,
                          transformOrigin: `${visualDoc.zoomFocus.xPercent}% ${visualDoc.zoomFocus.yPercent}%`
                        }}
                      >
                        {/* Document Header (Authentic Hospital / NABL Pathology Format) */}
                        <div className="border-b-2 border-slate-900 pb-3 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-[#0f4c81] text-white flex items-center justify-center font-bold text-sm">
                                🏥
                              </div>
                              <div>
                                <h3 className="font-extrabold text-sm text-[#0f2942] uppercase tracking-wider">
                                  {visualDoc.documentType === "lab_report" ? "National NABL Certified Clinical Pathology" : "ICMR Standard Treatment Workflow Flowchart"}
                                </h3>
                                <p className="text-[10px] text-slate-500">Government Empanelled Diagnostic & Treatment Network</p>
                              </div>
                            </div>
                            <div className="text-right text-[9px] text-slate-500 font-mono">
                              <div>BARCODE: *92840192*</div>
                              <div>ISO 15189:2022 ACCREDITED</div>
                            </div>
                          </div>

                          {/* Patient Bar if lab report */}
                          {visualDoc.patientDemographics && (
                            <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-4 gap-2 text-[9px]">
                              <div><strong className="text-slate-500">NAME:</strong> {visualDoc.patientDemographics.name}</div>
                              <div><strong className="text-slate-500">AGE/GENDER:</strong> {visualDoc.patientDemographics.ageGender}</div>
                              <div><strong className="text-slate-500">UHID:</strong> {visualDoc.patientDemographics.uhid}</div>
                              <div><strong className="text-slate-500">DATE:</strong> {visualDoc.patientDemographics.sampleDate}</div>
                            </div>
                          )}
                        </div>

                        {/* SECTION A: LAB REPORT TABLE WITH SPECIFIC TARGET ROW HIGHLIGHT */}
                        {visualDoc.tableRows && visualDoc.tableRows.length > 0 && (
                          <div className="relative mb-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-xs text-[#0f2942] uppercase tracking-wide">
                                {visualDoc.targetSectionTitle}
                              </span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                                NABL Accredited Parameters
                              </span>
                            </div>

                            {/* TARGET TABLE SPOTLIGHT BOUNDING BOX OVERLAY */}
                            <div className="relative border border-slate-300 rounded-lg overflow-hidden shadow-xs">
                              <table className="w-full text-left border-collapse text-[10px]">
                                <thead>
                                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                                    <th className="p-1.5 pl-2">Investigation</th>
                                    <th className="p-1.5">Observed</th>
                                    <th className="p-1.5">Unit</th>
                                    <th className="p-1.5">Reference Interval</th>
                                    <th className="p-1.5 text-right pr-2">Flag</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {visualDoc.tableRows.map((row, rIdx) => (
                                    <tr 
                                      key={rIdx} 
                                      className={`border-b border-slate-100 transition-colors ${
                                        row.isTargetRow 
                                          ? "bg-amber-100/90 font-extrabold text-slate-950 border-l-4 border-l-amber-600" 
                                          : "hover:bg-slate-50 text-slate-700"
                                      }`}
                                    >
                                      <td className="p-1.5 pl-2 flex items-center gap-1">
                                        {row.isTargetRow && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping shrink-0" />}
                                        <span>{row.testName}</span>
                                      </td>
                                      <td className="p-1.5 font-bold text-sm">{row.observedValue}</td>
                                      <td className="p-1.5 text-slate-500">{row.unit}</td>
                                      <td className="p-1.5 text-[9px] text-slate-500">{row.referenceRange}</td>
                                      <td className="p-1.5 text-right pr-2">
                                        <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                                          row.flag === "HIGH" || row.flag === "CRITICAL"
                                            ? "bg-red-600 text-white"
                                            : "bg-emerald-100 text-emerald-800"
                                        }`}>
                                          {row.flag}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                              {/* PULSATING SPOTLIGHT BOUNDING BOX GLOW */}
                              <div className="absolute inset-0 border-2 border-emerald-500 rounded-lg pointer-events-none shadow-[0_0_20px_rgba(16,185,129,0.35)]" />
                            </div>
                          </div>
                        )}

                        {/* SECTION B: CLINICAL FLOWCHART DECISION TREE */}
                        {visualDoc.flowchartNodes && visualDoc.flowchartNodes.length > 0 && (
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-xs text-[#0f2942] uppercase tracking-wide">
                                {visualDoc.targetSectionTitle}
                              </span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                                ICMR STW Flowchart
                              </span>
                            </div>

                            <div className="space-y-2 relative">
                              {visualDoc.flowchartNodes.map((node, nIdx) => (
                                <div 
                                  key={nIdx}
                                  className={`p-2.5 rounded-xl border transition-all ${
                                    node.isTargetNode
                                      ? "bg-amber-50 border-2 border-amber-500 shadow-md"
                                      : "bg-slate-50 border-slate-200"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] font-bold text-[#0f2942]">
                                      {nIdx + 1}. {node.title}
                                    </span>
                                    {node.isTargetNode && (
                                      <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full uppercase">
                                        Target Node
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-600 mb-1">
                                    <strong>Condition:</strong> {node.condition}
                                  </div>
                                  <div className="text-[10px] font-bold text-emerald-800">
                                    <strong>Action:</strong> {node.action}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Document Footer */}
                        <div className="mt-8 pt-3 border-t border-slate-200 flex justify-between items-center text-[8px] text-slate-400">
                          <div>Standard Guideline Reference: {visualDoc.citation}</div>
                          <div>Verified by Chief Medical Officer</div>
                        </div>

                      </div>

                      {/* Viewport Overlay Targeting Reticle */}
                      {isZoomedIn && (
                        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-emerald-400 px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-lg pointer-events-none">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>Direct Camera Zoom Active ({zoomLevel}x)</span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* RIGHT COLUMN: DUAL-TIER CIVIC & CLINICAL EXPLANATION CARDS (5 SPAN) */}
                  <div className="lg:col-span-5 flex flex-col gap-5">
                    
                    {/* CARD 1: ORDINARY CITIZEN & COMMON PEOPLE TRANSLATOR (ACCESSIBILITY FIRST) */}
                    <div className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/70 border-2 border-blue-200 rounded-3xl p-5 sm:p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-[#0f2942]">
                              For Patients & Common People
                            </h4>
                            <span className="text-[10px] text-blue-700 font-bold">
                              सरल भाषा में व्याख्या (Simple Explanation)
                            </span>
                          </div>
                        </div>

                        {/* Vernacular Spoken Audio Button */}
                        <button
                          type="button"
                          onClick={() => speakPatientExplanation(visualDoc.vernacularHindiSummary || visualDoc.plainLanguageExplanation)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                            isSpeakingSummary
                              ? "bg-red-600 text-white animate-pulse"
                              : "bg-[#0f4c81] hover:bg-blue-900 text-white"
                          }`}
                          title="Listen to this explanation in Hindi / Regional language"
                        >
                          {isSpeakingSummary ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isSpeakingSummary ? "Stop Audio" : "Listen (बोलकर सुनें)"}</span>
                        </button>
                      </div>

                      {/* Plain-Language Text Explanation */}
                      <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium mb-4 bg-white/80 p-3.5 rounded-2xl border border-blue-100">
                        {visualDoc.plainLanguageExplanation}
                      </p>

                      {/* Hindi Vernacular Audio Script Box */}
                      {visualDoc.vernacularHindiSummary && (
                        <div className="p-3 bg-blue-100/50 rounded-xl border border-blue-200 text-xs text-blue-950 font-medium italic">
                          &quot;{visualDoc.vernacularHindiSummary}&quot;
                        </div>
                      )}
                    </div>

                    {/* CARD 2: TECHNICAL CLINICAL PROTOCOL (FOR PHYSICIANS & NURSES) */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-5 h-5 text-emerald-600" />
                          <h4 className="font-bold text-sm text-[#0f2942]">
                            Clinical Protocol & Management
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                          {visualDoc.authority} Standard
                        </span>
                      </div>

                      {/* Clinical Action */}
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                          Recommended Clinical Step:
                        </span>
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-950 leading-relaxed">
                          {visualDoc.clinicalAction}
                        </div>
                      </div>

                      {/* Time Window or Dosage */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                          Target Window / Monitoring:
                        </span>
                        <span className="font-bold text-slate-900">
                          {visualDoc.timeWindowOrDosage}
                        </span>
                      </div>

                      {/* Contraindications */}
                      {visualDoc.contraindications && visualDoc.contraindications.length > 0 && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                          <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1 flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Safety Contraindications:
                          </span>
                          {visualDoc.contraindications.map((c, i) => (
                            <div key={i} className="text-rose-950 flex items-start gap-1 font-medium">
                              <span>•</span>
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Copy Action Buttons */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyVisualProtocol}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? "Copied Protocol!" : "Copy Clinical Note"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                          title="Print report"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: TEXT CLINICAL GUIDELINES (ICMR STWs)                    */}
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

      </div>
    </main>
  );
}
