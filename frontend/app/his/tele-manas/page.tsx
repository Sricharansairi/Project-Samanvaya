"use client";

import { useState, useEffect } from "react";
import { 
  HeartPulse, Phone, Sparkles, Activity, ShieldCheck, 
  RotateCcw, CheckCircle2, ArrowRight, Wind, Volume2, 
  HelpCircle, User, ChevronRight, Play, Pause, AlertCircle
} from "lucide-react";
import Link from "next/link";
import TrustBanner from "@/components/TrustBanner";
import { useLanguage } from "@/contexts/LanguageContext";

interface TeleManasResponse {
  distressLevel: "Mild" | "Moderate" | "High" | "Urgent";
  distressScore: number;
  destigmatizedExplanation: string;
  vernacularMessage: string;
  somaticInsights: string[];
  copingActionPlan: Array<{
    title: string;
    instruction: string;
  }>;
  teleManasGuidance: {
    helplineNumber: string;
    alternativeNumber: string;
    recommendation: string;
    languageSupport: string;
  };
}

const SOMATIC_QUESTIONS = [
  {
    id: "fatigue",
    label: "Physical Energy & Fatigue",
    question: "Do you feel physically drained, exhausted, or low on vitality even after resting?",
    options: ["Rarely / Never", "Sometimes (1-2 days/week)", "Frequently (Most days)", "Nearly every day"]
  },
  {
    id: "sleep",
    label: "Sleep Restfulness & Rhythm",
    question: "Trouble falling asleep, waking up in the middle of the night, or unrefreshing sleep?",
    options: ["Sleeping well", "Mild disruption", "Frequent awakenings", "Severe insomnia / restless"]
  },
  {
    id: "tension",
    label: "Bodily Tension & Somatic Discomfort",
    question: "Tension in neck/shoulders, unexplained headaches, heaviness in chest, or nervous stomach?",
    options: ["No bodily tension", "Mild occasional tension", "Noticeable muscle tightness", "Persistent physical ache"]
  },
  {
    id: "worry",
    label: "Mental Overload & Racing Thoughts",
    question: "Difficulty quieting your mind, constant worrying about responsibilities or family?",
    options: ["Peace of mind", "Occasional worry", "Frequent worry loops", "Overwhelming mental load"]
  }
];

export default function TeleManasScreenerPage() {
  const { language } = useLanguage();

  const [ratings, setRatings] = useState<Record<string, number>>({
    fatigue: 1,
    sleep: 1,
    tension: 2,
    worry: 1
  });
  const [notes, setNotes] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<TeleManasResponse | null>(null);

  // Breathing Visual Pacer State (4-4-4-4 Box Breathing)
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Rest">("Inhale");
  const [timerSeconds, setTimerSeconds] = useState(4);

  useEffect(() => {
    let interval: any = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setBreathPhase((currentPhase) => {
              if (currentPhase === "Inhale") return "Hold";
              if (currentPhase === "Hold") return "Exhale";
              if (currentPhase === "Exhale") return "Rest";
              return "Inhale";
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathPhase("Inhale");
      setTimerSeconds(4);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive]);

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/tele-manas/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fatigue: ratings.fatigue,
          sleep: ratings.sleep,
          tension: ratings.tension,
          worry: ratings.worry,
          freeTextNotes: notes,
          language: language
        })
      });

      if (res.ok) {
        const data: TeleManasResponse = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error("Tele-MANAS evaluation error:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans selection:bg-[#0f4c81] selection:text-white" id="main-content">
      {/* Official Top Navigation Bar */}
      <TrustBanner currentTab="telemanas" />

      {/* Main Content Body */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Breadcrumb & Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0f4c81] mb-2 uppercase tracking-wider">
            <Link href="/" className="hover:underline">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/patient" className="hover:underline">Patient Services</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500">Tele-MANAS Mental Health (14416)</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Phase 2 Civic Wellness • National Tele Mental Health Programme (MoHFW)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f2942] tracking-tight">
                Tele-MANAS (14416) De-Stigmatized Mind-Body Screener
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-3xl font-medium">
                Physical tension, sleep trouble, and fatigue are common ways our bodies tell us we are carrying too much pressure. Assess your somatic wellness safely and connect to India&apos;s 24x7 toll-free confidential mental health network.
              </p>
            </div>

            {/* Direct 1-Click Helpline Banner */}
            <a
              href="tel:14416"
              className="self-start md:self-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-sm transition-all flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">National Helpline</span>
                <span className="text-base font-black tracking-wider">Call 14416</span>
              </div>
            </a>
          </div>
        </div>

        {/* Somatic Question Questionnaire Grid */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0f2942]">
                Somatic & Mind-Body Self-Check
              </h2>
              <p className="text-xs text-gray-500">
                Select the option that best reflects your bodily experience over the past 2 weeks
              </p>
            </div>
            <span className="text-xs font-bold bg-blue-50 text-[#0f4c81] px-3 py-1 rounded-full border border-blue-200">
              100% Confidential
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SOMATIC_QUESTIONS.map((q) => (
              <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f4c81] block">
                    {q.label}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-[#0f2942] mt-0.5">
                    {q.question}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => setRatings(prev => ({ ...prev, [q.id]: optIdx }))}
                      className={`p-2.5 text-xs rounded-xl font-medium text-left border transition-all cursor-pointer ${
                        ratings[q.id] === optIdx
                          ? "bg-[#0f4c81] text-white border-[#0f4c81] shadow-xs font-bold"
                          : "bg-white text-slate-700 border-gray-200 hover:border-slate-400"
                      }`}
                    >
                      <span className="block text-[10px] opacity-75 mb-0.5">Score {optIdx}</span>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Optional notes */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
              Any specific physical feelings, headaches, or stressors you wish to share? (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. I notice tightness in my chest and difficulty concentrating when working long shifts..."
              rows={2}
              className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-gray-300 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c81] font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="px-6 py-3 bg-[#0f2942] hover:bg-[#0f4c81] disabled:opacity-50 text-white text-xs font-extrabold rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Evaluating with Tele-MANAS Clinical AI...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Analyze Mind-Body Wellness (Tele-MANAS)</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-gray-500 font-medium">
              Evaluated by Groq LLM &bull; Grounded in NIMHANS Psychological First Aid
            </span>
          </div>
        </div>

        {/* Dynamic AI Results Dashboard */}
        {result && (
          <div className="space-y-6">
            
            {/* Status Card */}
            <div className={`p-6 rounded-3xl border-2 shadow-xs transition-all ${
              result.distressLevel === "High" || result.distressLevel === "Urgent"
                ? "bg-rose-50 border-rose-200 text-rose-950"
                : result.distressLevel === "Moderate"
                ? "bg-amber-50 border-amber-200 text-amber-950"
                : "bg-teal-50 border-teal-200 text-teal-950"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 border border-current">
                      Triage Level: {result.distressLevel}
                    </span>
                    <span className="text-xs font-bold opacity-80">
                      Somatic Burden: {result.distressScore} / 12
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                    {result.teleManasGuidance.recommendation}
                  </h3>
                  <p className="text-xs sm:text-sm mt-2 leading-relaxed opacity-90 max-w-3xl">
                    {result.destigmatizedExplanation}
                  </p>
                </div>

                <a
                  href="tel:14416"
                  className="shrink-0 px-5 py-3 bg-[#0f2942] hover:bg-[#0f4c81] text-white text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Call 14416 Now</span>
                </a>
              </div>
            </div>

            {/* Two-Column Action Plan & Mind-Body Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Action Plan (7 Span) */}
              <div className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold text-sm text-[#0f2942]">
                      Personalized 3-Step Coping Plan
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                    Evidence Based
                  </span>
                </div>

                <div className="space-y-3">
                  {result.copingActionPlan.map((action, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-[#0f4c81] text-white text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-xs text-[#0f2942]">
                          {action.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-7">
                        {action.instruction}
                      </p>
                    </div>
                  ))}
                </div>

                {result.vernacularMessage && (
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-950 font-medium italic">
                    &quot;{result.vernacularMessage}&quot;
                  </div>
                )}
              </div>

              {/* Somatic Insights & Tele-MANAS Info (5 Span) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Somatic Insights */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-3">
                  <h3 className="font-bold text-sm text-[#0f2942] border-b border-gray-100 pb-2">
                    Mind-Body Physiological Insights
                  </h3>
                  <ul className="space-y-2">
                    {result.somaticInsights.map((insight, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-teal-600 font-bold">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tele-MANAS Operational Details */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-sm text-emerald-400">
                      About Tele-MANAS (14416)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Operated by NIMHANS & IIT Bangalore with nodal cells in all 36 States/UTs. Free, 24x7, and completely confidential with certified clinical psychologists.
                  </p>
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                    <span>Toll-Free: <strong>14416</strong></span>
                    <span>20+ Indian Languages</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Interactive Pranayama Box Breathing Guide (4-4-4-4) */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="max-w-md">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 mb-2">
                <Wind className="w-3.5 h-3.5" /> Instant Vagus Nerve Calming
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f2942] tracking-tight mb-2">
                Sama Vritti (Box Breathing Pacer)
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium mb-4">
                Box breathing lowers cortisol and heart rate in under 2 minutes. Follow the animated rhythm: Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, and rest for 4 seconds.
              </p>
              
              <button
                type="button"
                onClick={() => setIsBreathingActive(!isBreathingActive)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                  isBreathingActive
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-[#0f4c81] hover:bg-blue-900 text-white"
                }`}
              >
                {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isBreathingActive ? "Stop Breathing Exercise" : "Start Guided Breathing"}</span>
              </button>
            </div>

            {/* Visual Animated Pacer Ring */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-3xl w-full max-w-xs">
              <div className="relative w-40 h-40 flex items-center justify-center">
                
                {/* Expanding / Contracting Glow Circle */}
                <div 
                  className={`w-36 h-36 rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${
                    !isBreathingActive
                      ? "border-slate-300 bg-white"
                      : breathPhase === "Inhale"
                      ? "scale-110 border-teal-500 bg-teal-50 shadow-[0_0_25px_rgba(20,184,166,0.35)]"
                      : breathPhase === "Hold"
                      ? "scale-110 border-amber-400 bg-amber-50 shadow-[0_0_25px_rgba(251,191,36,0.35)]"
                      : breathPhase === "Exhale"
                      ? "scale-90 border-blue-500 bg-blue-50 shadow-[0_0_25px_rgba(59,130,246,0.35)]"
                      : "scale-90 border-slate-400 bg-slate-100"
                  }`}
                >
                  <div className="text-center">
                    <span className="text-2xl font-black text-[#0f2942] block">
                      {timerSeconds}s
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      {isBreathingActive ? breathPhase : "Ready"}
                    </span>
                  </div>
                </div>

              </div>
              
              <span className="text-[11px] font-semibold text-gray-500 mt-4 text-center">
                {isBreathingActive 
                  ? `${breathPhase} gently through your nostrils...` 
                  : "Tap Start to begin 4-4-4-4 rhythm"}
              </span>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
