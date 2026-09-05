"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sparkles, HeartPulse, Leaf, Flame, Wind, Droplets, 
  CheckCircle2, Printer, Share2, AlertCircle, ShieldCheck, RefreshCw, ChevronRight, ChevronLeft
} from "lucide-react";
import TrustBanner from "@/components/TrustBanner";
import { PRAKRITI_QUESTIONNAIRE, evaluatePrakriti, PrakritiResult } from "@/services/ayush_engine";

export default function AyushAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "Vata" | "Pitta" | "Kapha">>({
    q1_frame: "Vata",
    q2_skin: "Pitta",
    q3_digestion: "Pitta",
    q4_bowel: "Kapha",
    q5_thermal: "Vata",
    q6_sleep: "Pitta",
    q7_mind: "Vata"
  });
  const [patientName, setPatientName] = useState("Rameshwar Rao");
  const [patientAbha, setPatientAbha] = useState("91-4829-1039-4820");
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<PrakritiResult | null>(null);
  const [activeTab, setActiveTab] = useState<"diet" | "lifestyle" | "yoga" | "formulations" | "dashavidha">("diet");

  const totalQuestions = PRAKRITI_QUESTIONNAIRE.length;
  const currentQ = PRAKRITI_QUESTIONNAIRE[currentStep];

  const handleSelectOption = (dosha: "Vata" | "Pitta" | "Kapha") => {
    const updated = { ...answers, [currentQ.id]: dosha };
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      const evaluation = evaluatePrakriti(answers);
      setResult(evaluation);
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setIsCompleted(false);
    setCurrentStep(0);
  };

  const handlePrint = () => {
    window.print();
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
          <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 font-medium flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5" /> AYUSH Integrative Health Portal
          </span>
        </div>

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0d5c3a] via-[#116b44] to-[#15803d] rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ministry of AYUSH • Dashavidha & Prakriti Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Holistic AYUSH Pariksha & Prakriti Profiler
            </h1>
            <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
              Scientific constitutional profiling based on Tridosha theory (Vata, Pitta, Kapha) and classical Dashavidha Pariksha. Generates personalized Pathya-Apathya dietary charts, Dinacharya lifestyle routines, and herb-drug safety alerts.
            </p>
          </div>
          <div className="absolute right-6 -bottom-8 opacity-15 pointer-events-none hidden md:block">
            <span className="text-[160px]">🌿</span>
          </div>
        </div>

        {!isCompleted ? (
          /* Assessment Flow */
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8">
            
            {/* Patient Context Strip */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Patient Name</label>
                <input 
                  type="text" 
                  value={patientName} 
                  onChange={(e) => setPatientName(e.target.value)}
                  className="font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-emerald-600 focus:outline-none text-base"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">ABHA ID</label>
                <input 
                  type="text" 
                  value={patientAbha} 
                  onChange={(e) => setPatientAbha(e.target.value)}
                  className="font-mono text-sm text-gray-700 bg-transparent border-b border-gray-300 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Step {currentStep + 1} of {totalQuestions}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-8">
              <motion.div 
                className="bg-emerald-600 h-full"
                animate={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Current Question */}
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                {currentQ.category.toUpperCase()} PARAMETER
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3">
                {currentQ.question}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {currentQ.description}
              </p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.dosha;
                const doshaColors = {
                  Vata: { border: "border-sky-500", bg: "bg-sky-50", badge: "bg-sky-100 text-sky-800", icon: <Wind className="w-4 h-4 text-sky-600" /> },
                  Pitta: { border: "border-amber-500", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-800", icon: <Flame className="w-4 h-4 text-amber-600" /> },
                  Kapha: { border: "border-emerald-500", bg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-800", icon: <Droplets className="w-4 h-4 text-emerald-600" /> }
                }[opt.dosha];

                return (
                  <button
                    key={opt.dosha}
                    type="button"
                    onClick={() => handleSelectOption(opt.dosha)}
                    className={`flex flex-col text-left p-5 rounded-xl border-2 transition-all cursor-pointer relative ${
                      isSelected 
                        ? `${doshaColors.border} ${doshaColors.bg} shadow-md scale-[1.01]` 
                        : "border-gray-200 bg-white hover:bg-slate-50 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${doshaColors.badge}`}>
                        {doshaColors.icon} {opt.dosha} Type
                      </span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    </div>
                    <h3 className="font-bold text-base text-gray-900 mb-1 leading-snug">
                      {opt.label}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed mt-auto pt-2">
                      {opt.detail}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
              <button
                type="button"
                disabled={currentStep === 0}
                onClick={handlePrevious}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  currentStep === 0 
                    ? "text-gray-300 cursor-not-allowed" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer"
              >
                {currentStep === totalQuestions - 1 ? "Generate AYUSH Health Profile" : "Next Question"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : result ? (
          /* Results View */
          <div className="space-y-8">
            
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  AY
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{patientName} • {result.dominantPrakriti}</h2>
                  <p className="text-xs text-gray-500 font-mono">ABHA: {patientAbha}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-Assess
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Health Card
                </button>
              </div>
            </div>

            {/* Tridosha Radar Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Vata Card */}
              <div className="bg-white border-2 border-sky-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
                      <Wind className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-gray-900">Vata Dosha</h3>
                  </div>
                  <span className="text-2xl font-extrabold text-sky-700">{result.percentages.Vata}%</span>
                </div>
                <div className="w-full bg-sky-100 h-2 rounded-full overflow-hidden mb-3">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: `${result.percentages.Vata}%` }} />
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Controls motion, nervous impulses, circulation, and respiration. Governed by Ether and Air elements.
                </p>
              </div>

              {/* Pitta Card */}
              <div className="bg-white border-2 border-amber-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                      <Flame className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-gray-900">Pitta Dosha</h3>
                  </div>
                  <span className="text-2xl font-extrabold text-amber-700">{result.percentages.Pitta}%</span>
                </div>
                <div className="w-full bg-amber-100 h-2 rounded-full overflow-hidden mb-3">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${result.percentages.Pitta}%` }} />
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Controls digestion, metabolism, body temperature, and intelligence. Governed by Fire and Water elements.
                </p>
              </div>

              {/* Kapha Card */}
              <div className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-gray-900">Kapha Dosha</h3>
                  </div>
                  <span className="text-2xl font-extrabold text-emerald-700">{result.percentages.Kapha}%</span>
                </div>
                <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden mb-3">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${result.percentages.Kapha}%` }} />
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Controls structure, lubrication, immunity, stability, and tissue growth. Governed by Earth and Water elements.
                </p>
              </div>
            </div>

            {/* Detailed Clinical Tabs */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-200 overflow-x-auto bg-slate-50">
                {[
                  { key: "diet", label: "🍲 Pathya-Apathya Diet" },
                  { key: "lifestyle", label: "🧘 Dinacharya & Routine" },
                  { key: "yoga", label: "🕉️ Yoga & Pranayama" },
                  { key: "formulations", label: "🌿 Classical Formulations" },
                  { key: "dashavidha", label: "📋 Dashavidha Examination" }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-5 py-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === tab.key
                        ? "border-emerald-600 text-emerald-800 bg-white shadow-xs"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 sm:p-8">
                {activeTab === "diet" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-5">
                      <h4 className="font-bold text-emerald-900 text-base mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        Pathya Ahara (Beneficial & Recommended Foods)
                      </h4>
                      <ul className="space-y-2.5 text-sm text-emerald-950">
                        {result.pathyaAhara.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-5">
                      <h4 className="font-bold text-rose-900 text-base mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                        Apathya Ahara (Foods to Strictly Minimize)
                      </h4>
                      <ul className="space-y-2.5 text-sm text-rose-950">
                        {result.apathyaAhara.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "lifestyle" && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 text-base">Dinacharya & Seasonal Regimen (Ritucharya)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {result.viharaAdvice.map((advice, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-slate-50 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-gray-800 leading-relaxed">{advice}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "yoga" && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 text-base">Personalized Yogic Asanas & Pranayama</h4>
                    <div className="space-y-3">
                      {result.yogaPranayama.map((yp, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex items-center gap-3">
                          <span className="text-xl">🧘</span>
                          <span className="text-sm font-medium text-gray-800">{yp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "formulations" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base mb-3">Classical Ayurvedic Formulations</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {result.ayushFormulations.map((form, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs">
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Classical Pharmacopeia</span>
                            <p className="text-sm font-semibold text-gray-900 mt-2">{form}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                      <h5 className="font-bold text-amber-900 text-sm flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4 h-4 text-amber-700" /> Herb-Drug Allopathic Safety Alert
                      </h5>
                      <ul className="text-xs text-amber-950 space-y-1.5 list-disc pl-5">
                        {result.herbDrugSafetyWarnings.map((warn, idx) => (
                          <li key={idx}>{warn}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "dashavidha" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 rounded-xl border border-gray-200">
                      <span className="text-xs text-gray-500 font-bold uppercase">1. Prakriti (Constitution)</span>
                      <p className="font-bold text-gray-900 mt-1">{result.dominantPrakriti} ({result.prakritiType})</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200">
                      <span className="text-xs text-gray-500 font-bold uppercase">2. Agni (Digestive Fire)</span>
                      <p className="font-bold text-gray-900 mt-1">{result.agniType}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200">
                      <span className="text-xs text-gray-500 font-bold uppercase">3. Koshtha (Bowel Habit)</span>
                      <p className="font-bold text-gray-900 mt-1">{result.koshthaType}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200">
                      <span className="text-xs text-gray-500 font-bold uppercase">4. Sattva (Mental Temperament)</span>
                      <p className="font-bold text-gray-900 mt-1">Madhyama Sattva (Balanced Cognitive Resilience)</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        ) : null}

      </div>
    </main>
  );
}
