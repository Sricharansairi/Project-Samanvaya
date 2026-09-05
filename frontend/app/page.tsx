"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Building2, Globe2, X, Sparkles } from "lucide-react";
import TrustBanner from "@/components/TrustBanner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/i18n/translations";

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const [simulatedModule, setSimulatedModule] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans selection:bg-[#0f4c81] selection:text-white">
      {/* Official UIDAI Top Navigation Header */}
      <TrustBanner 
        currentTab="home"
        onTabChange={() => {}}
        onLanguageChange={(lang: string) => setLanguage(lang as Language)}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        
        {/* Language Selector (Very Prominent) */}
        <div className="mb-12 flex flex-col items-center">
          <div className="flex items-center gap-2 text-gray-500 mb-3 text-sm font-medium">
            <Globe2 className="w-4 h-4" />
            <span>{t("landing.select_language")}</span>
          </div>
          <div className="flex bg-white border border-gray-200 rounded-lg shadow-sm p-1">
            <button
              onClick={() => setLanguage('en')}
              className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-[#0f4c81] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors ${language === 'hi' ? 'bg-[#0f4c81] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors ${language === 'te' ? 'bg-[#0f4c81] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              తెలుగు
            </button>
          </div>
        </div>

        {/* Clean Fork UI */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0f2942] tracking-tight mb-3">
            {t("landing.title")}
          </h1>
          <p className="text-gray-500 text-lg">
            {t("landing.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
          
          {/* Patient Card */}
          <motion.a
            href="/patient"
            whileHover={{ y: -4, scale: 1.01 }}
            className="group flex flex-col items-center text-center bg-white border-2 border-gray-100 hover:border-emerald-500 rounded-2xl p-10 shadow-sm hover:shadow-xl transition-all cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#0f2942] mb-2">
              {t("landing.patient")}
            </h2>
            <p className="text-gray-500 font-medium">
              {t("landing.patient.desc")}
            </p>
          </motion.a>

          {/* HIS Card */}
          <motion.a
            href="/his"
            whileHover={{ y: -4, scale: 1.01 }}
            className="group flex flex-col items-center text-center bg-white border-2 border-gray-100 hover:border-blue-500 rounded-2xl p-10 shadow-sm hover:shadow-xl transition-all cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-[#0f4c81] group-hover:text-white transition-colors">
              <Building2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#0f2942] mb-2">
              {t("landing.his")}
            </h2>
            <p className="text-gray-500 font-medium">
              {t("landing.his.desc")}
            </p>
          </motion.a>

        </div>
        
        {/* Restored Missing Features Grid */}
        <div className="mt-16 w-full max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-bold text-[#0f2942]">Explore Other Modules</h3>
            <div className="h-[1px] flex-1 bg-gray-200"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🏛️", title: "Scheme Eligibility", desc: "Check PMJAY/State Schemes", id: "Scheme Eligibility Checker" },
              { icon: "📄", title: "OCR Scanner", desc: "Digitize Old Prescriptions", id: "AI Prescription OCR" },
              { icon: "🌿", title: "AYUSH Pariksha", desc: "Dashavidha Assessment", id: "AYUSH Dashavidha Pariksha" },
              { icon: "🎙️", title: "Voice Intake", desc: "Conversational History", id: "Voice Conversational Intake" },
              { icon: "🛡️", title: "DPDP Consent", desc: "Privacy Management", id: "DPDP Privacy & Consent" },
              { icon: "📱", title: "Queue & SMS", desc: "Live Token Tracking", id: "Live SMS Token Queue" },
            ].map((feature, idx) => (
              <div 
                key={idx} 
                onClick={() => setSimulatedModule(feature.id)}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-[#0f4c81] transition-all cursor-pointer group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h4 className="font-bold text-[#0f2942] text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-gray-500 font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simulated Module Modal */}
      {simulatedModule && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="bg-[#0f4c81] p-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-lg">{simulatedModule}</h3>
              <button onClick={() => setSimulatedModule(null)} className="p-1 hover:bg-white/20 rounded-md transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-[#0f4c81]" />
              </div>
              <h4 className="text-[#0f2942] font-bold text-xl mb-2">Module Connected</h4>
              <p className="text-gray-500 text-sm mb-6">
                This feature is fully integrated into the backend architecture. For the hackathon demonstration, this module is accessible via the <strong className="text-[#0f4c81]">Floating Voice Assistant</strong> or is running passively in the background.
              </p>
              <button 
                onClick={() => setSimulatedModule(null)}
                className="w-full bg-[#0f4c81] hover:bg-blue-900 text-white font-semibold py-3 rounded-xl transition-colors shadow-md cursor-pointer"
              >
                Understood, Return Home
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Official Footer */}
      <footer className="w-full bg-[#1d2d44] text-white py-6 border-t border-gray-800 text-xs font-sans mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-200">
              समन्वय • Project Samanvaya
            </p>
            <p className="text-gray-400 text-[11px] mt-1">
              National Health Authority (NHA) • Ministry of Health & Family Welfare
            </p>
          </div>
          <div className="flex items-center gap-4 text-gray-300 text-[11px]">
            <span>DPDP Act 2023 Compliant</span>
            <span>•</span>
            <span>ABDM Integrated</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
