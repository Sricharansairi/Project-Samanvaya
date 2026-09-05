"use client";

import { motion } from "framer-motion";
import { 
  ClipboardList, Stethoscope, ArrowLeft, Camera, Leaf, Shield, Users, Building2, Sparkles 
} from "lucide-react";
import TrustBanner from "@/components/TrustBanner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HisSelectionPage() {
  const { t } = useLanguage();

  const hisModules = [
    {
      href: "/his/registration",
      title: t("his.roles.staff") || "Registration Staff Desk",
      desc: "Register patients, record vitals, and clarify chief concerns with AI Clinical RAG Chips.",
      icon: <ClipboardList className="w-8 h-8" />,
      color: "purple",
      badge: "Triage & Vitals"
    },
    {
      href: "/his/doctor",
      title: t("his.roles.doctor") || "Physician & Doctor Clinic",
      desc: "Access OPD queue, scan ICQR tokens, review triaged records, and issue digital prescriptions.",
      icon: <Stethoscope className="w-8 h-8" />,
      color: "orange",
      badge: "Clinical Care"
    },
    {
      href: "/his/schemes",
      title: "Arogya Mitra & Scheme Desk",
      desc: "Evaluate 36 States/UTs + Central schemes (PM-JAY, Aarogyasri, MJPJAY) for cashless pre-auth.",
      icon: <span className="text-2xl">🏛️</span>,
      color: "emerald",
      badge: "Cashless Health"
    },
    {
      href: "/his/ocr",
      title: "AI Prescription & Report OCR",
      desc: "Live camera photo capture or file upload with multi-modal AI for medicine & vitals extraction.",
      icon: <Camera className="w-8 h-8" />,
      color: "blue",
      badge: "Vision AI"
    },
    {
      href: "/his/ayush",
      title: "AYUSH Pariksha & Prakriti",
      desc: "Dashavidha constitutional assessment, Tridosha radar, and Pathya-Apathya dietary charts.",
      icon: <Leaf className="w-8 h-8" />,
      color: "green",
      badge: "Integrative Health"
    },
    {
      href: "/his/dpdp",
      title: "DPDP 2023 Consent Manager",
      desc: "Digital Personal Data Protection Act compliance, audio readouts, and SHA-256 consent logs.",
      icon: <Shield className="w-8 h-8" />,
      color: "indigo",
      badge: "Privacy & Legal"
    },
    {
      href: "/his/queue",
      title: "Live OPD Queue & SMS Board",
      desc: "Real-time token display board, voice call chimes, estimated wait times, and SMS dispatch.",
      icon: <Users className="w-8 h-8" />,
      color: "amber",
      badge: "Queue Ops"
    },
    {
      href: "/his/rag",
      title: "Clinical RAG Co-Pilot",
      desc: "Multi-architectured medical knowledge retrieval, telemetry inspector, and dynamic chip synthesizer.",
      icon: <Sparkles className="w-8 h-8" />,
      color: "indigo",
      badge: "Clinical AI"
    }
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      <TrustBanner currentTab="his" onTabChange={() => {}} onLanguageChange={() => {}} />

      <div className="flex-1 flex flex-col items-center p-4 sm:p-8 max-w-6xl mx-auto w-full">
        
        <div className="w-full mb-6 flex justify-start">
          <a href="/" className="flex items-center text-[#0f4c81] hover:underline font-semibold text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> {t("generic.back") || "Back to Home"}
          </a>
        </div>

        <div className="text-center mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#0f4c81] px-3 py-1 rounded-full text-xs font-bold mb-3 border border-blue-100">
            <Building2 className="w-3.5 h-3.5" />
            <span>Hospital Information System (HIS) Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f2942] tracking-tight mb-2">
            Hospital Operations & Clinical Modules
          </h1>
          <p className="text-gray-500 text-sm">
            Select a specialized terminal to begin operations. All modules are seamlessly synchronized with ABDM and ABHA standards.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {hisModules.map((mod, idx) => (
            <motion.a
              key={idx}
              href={mod.href}
              whileHover={{ y: -4, scale: 1.01 }}
              className="group flex flex-col bg-white border-2 border-gray-100 hover:border-[#0f4c81] rounded-2xl p-6 shadow-xs hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0f4c81] group-hover:bg-[#0f4c81] group-hover:text-white transition-colors">
                  {mod.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-gray-700">
                  {mod.badge}
                </span>
              </div>

              <h2 className="text-lg font-bold text-[#0f2942] mb-1.5 group-hover:text-[#0f4c81] transition-colors">
                {mod.title}
              </h2>
              <p className="text-gray-500 text-xs leading-relaxed mt-auto">
                {mod.desc}
              </p>
            </motion.a>
          ))}
        </div>

      </div>
    </main>
  );
}
