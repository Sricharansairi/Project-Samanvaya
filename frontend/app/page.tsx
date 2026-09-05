"use client";

import { motion } from "framer-motion";
import { User, Building2, Globe2, Sparkles, ArrowRight, Shield, Stethoscope, FileText, Database, HeartPulse, QrCode } from "lucide-react";
import Link from "next/link";
import TrustBanner from "@/components/TrustBanner";
import { useLanguage } from "@/contexts/LanguageContext";
import { INDIAN_LANGUAGES, Language } from "@/i18n/translations";

export default function Home() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans selection:bg-[#0f4c81] selection:text-white" id="main-content">
      {/* Official UIDAI Top Navigation Header */}
      <TrustBanner currentTab="home" />

      {/* Main Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-7xl mx-auto w-full">
        
        {/* Language Selector (Indian Languages Grid) */}
        <div className="mb-10 flex flex-col items-center w-full max-w-3xl">
          <div className="flex items-center gap-2 text-gray-500 mb-3 text-xs font-semibold uppercase tracking-wider">
            <Globe2 className="w-4 h-4 text-[#0f4c81]" />
            <span>{t("landing.select_language")}</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white border border-gray-200 rounded-2xl shadow-xs p-2 w-full">
            {INDIAN_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  language === lang.code 
                    ? 'bg-[#0f4c81] text-white shadow-sm scale-105' 
                    : 'text-gray-600 hover:bg-slate-100 hover:text-gray-900'
                }`}
              >
                <span>{lang.nativeName}</span>
                <span className="text-[10px] font-normal opacity-70 ml-1">({lang.name})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Clean Hero Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0f4c81] text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>National Smart Case-Taking & Multilingual Clinical Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f2942] tracking-tight mb-3">
            {t("landing.title")}
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            {t("landing.subtitle")}
          </p>
        </div>

        {/* Primary Role Cards (Patient & Hospital) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mb-16">
          
          {/* Patient Card */}
          <Link
            href="/patient"
            className="group flex flex-col items-center text-center bg-white border-2 border-gray-100 hover:border-emerald-500 rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-100 transition-colors" />
            
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all group-hover:scale-110 shadow-inner">
              <User className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#0f2942] mb-2 flex items-center gap-2">
              {t("landing.patient")}
              <ArrowRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </h2>
            <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-xs">
              {t("landing.patient.desc")}
            </p>
            
            <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <QrCode className="w-3.5 h-3.5" /> 3D Ayushman ABHA Smart Card
            </div>
          </Link>

          {/* HIS Card */}
          <Link
            href="/his"
            className="group flex flex-col items-center text-center bg-white border-2 border-gray-100 hover:border-[#0f4c81] rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-100 transition-colors" />
            
            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0f4c81] mb-6 group-hover:bg-[#0f4c81] group-hover:text-white transition-all group-hover:scale-110 shadow-inner">
              <Building2 className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#0f2942] mb-2 flex items-center gap-2">
              {t("landing.his")}
              <ArrowRight className="w-5 h-5 text-[#0f4c81] group-hover:translate-x-1 transition-transform" />
            </h2>
            <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-xs">
              {t("landing.his.desc")}
            </p>

            <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#0f4c81] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <Stethoscope className="w-3.5 h-3.5" /> OPD Triage, Registration & Doctor Desk
            </div>
          </Link>

        </div>
        
        {/* Full Suite Live Features Grid - All Directly Functional */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#0f2942]">Active Clinical & Governance Modules</h3>
              <p className="text-xs text-gray-500">Every module is live, production-ready, and connected to national databases</p>
            </div>
            <div className="h-[1px] flex-1 bg-gray-200"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                icon: "🛡️", 
                title: "Scheme Eligibility & Claims", 
                desc: "Real-time PM-JAY & State Scheme Checker across all 36 States/UTs with claim guidance", 
                href: "/his/schemes",
                badge: "36 States Active",
                color: "border-orange-200 hover:border-orange-500"
              },
              { 
                icon: "📄", 
                title: "AI Prescription OCR", 
                desc: "Live camera photo capture & handwriting digitization powered by NVIDIA NIM", 
                href: "/his/ocr",
                badge: "Llama 3.2 Vision",
                color: "border-blue-200 hover:border-blue-500"
              },
              { 
                icon: "🌿", 
                title: "AYUSH Pariksha", 
                desc: "Prakriti assessment, Nadi, Jihva, and Dashavidha cross-system diagnosis", 
                href: "/his/ayush",
                badge: "Ayurveda + Allopathy",
                color: "border-emerald-200 hover:border-emerald-500"
              },
              { 
                icon: "🎙️", 
                title: "Patient Registration Desk", 
                desc: "Smart Parchi generation with vernacular voice intake and ABHA creation", 
                href: "/his/registration",
                badge: "Voice Enabled",
                color: "border-purple-200 hover:border-purple-500"
              },
              { 
                icon: "🩺", 
                title: "Physician OPD Desk", 
                desc: "Clinical consultation, drug-drug interaction guard, and e-Prescriptions", 
                href: "/his/doctor",
                badge: "CDSS Active",
                color: "border-sky-200 hover:border-sky-500"
              },
              { 
                icon: "🧠", 
                title: "Clinical RAG Co-Pilot", 
                desc: "Multi-layered medical decision support querying PubMed, WHO, and AYUSH Pharmacopoeia", 
                href: "/his/rag",
                badge: "Kimi-K3 RAG",
                color: "border-indigo-200 hover:border-indigo-500"
              },
              { 
                icon: "📱", 
                title: "OPD Queue & Voice Calls", 
                desc: "Live token tracking, SMS dispatch, and Sarvam AI autonomous patient callout", 
                href: "/his/queue",
                badge: "Sarvam AI Voice",
                color: "border-amber-200 hover:border-amber-500"
              },
              { 
                icon: "🔒", 
                title: "DPDP 2023 Consent Manager", 
                desc: "Patient consent withdrawal, purpose-bound access logs, and audit trails", 
                href: "/his/dpdp",
                badge: "Statutory Compliance",
                color: "border-rose-200 hover:border-rose-500"
              },
            ].map((feature, idx) => (
              <Link 
                key={idx} 
                href={feature.href}
                className={`bg-white border ${feature.color} rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl group-hover:scale-110 transition-transform block">{feature.icon}</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                      {feature.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#0f2942] text-sm mb-1.5 group-hover:text-[#0f4c81] transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0f4c81]">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Official Footer */}
      <footer className="w-full bg-[#1d2d44] text-white py-6 border-t border-gray-800 text-xs font-sans mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-200">
              समन्वय • Project Samanvaya (SIH 26047)
            </p>
            <p className="text-gray-400 text-[11px] mt-1">
              National Health Authority (NHA) • Ministry of Health & Family Welfare • Ministry of AYUSH
            </p>
          </div>
          <div className="flex items-center gap-4 text-gray-300 text-[11px]">
            <span>DPDP Act 2023 Compliant</span>
            <span>•</span>
            <span>ABDM FHIR R4 Ready</span>
            <span>•</span>
            <span>Sarvam AI Speech Integrated</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
