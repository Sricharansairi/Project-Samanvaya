"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ClipboardList, Stethoscope, ArrowLeft, Camera, Leaf, Shield, 
  Users, Building2, Sparkles, Lock, ArrowRight, Pill, ShieldAlert
} from "lucide-react";
import TrustBanner from "@/components/TrustBanner";
import { useLanguage } from "@/contexts/LanguageContext";
import DoctorLoginModal, { DoctorSession } from "@/components/DoctorLoginModal";

export default function HisSelectionPage() {
  const { t } = useLanguage();
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [doctorSession, setDoctorSession] = useState<DoctorSession | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("samanvaya_doctor_session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.isAuthenticated) setDoctorSession(parsed);
        } catch {}
      }
    }
  }, []);

  const hisStaffModules = [
    {
      href: "/his/registration",
      title: "Smart Parchi Registration Desk",
      desc: "Register new OPD patients, record biometric vitals, and generate Smart Tokens.",
      icon: <ClipboardList className="w-8 h-8" />,
      color: "purple",
      badge: "Triage & Vitals"
    },
    {
      href: "/his/queue",
      title: "Live OPD Queue Board",
      desc: "Real-time token display board, department counters, estimated wait times, and SMS alerts.",
      icon: <Users className="w-8 h-8" />,
      color: "amber",
      badge: "Queue Ops"
    },
    {
      href: "/his/ocr",
      title: "AI Prescription & Report OCR",
      desc: "Decipher handwritten doctor slips, extract medications, and compute Jan Aushadhi generic savings.",
      icon: <Camera className="w-8 h-8" />,
      color: "blue",
      badge: "Vision AI"
    },
    {
      href: "/his/schemes",
      title: "Arogya Mitra & Schemes Desk",
      desc: "Evaluate 36 States/UTs + Central schemes (PM-JAY, Aarogyasri, MJPJAY) for cashless pre-auth.",
      icon: <Building2 className="w-8 h-8" />,
      color: "emerald",
      badge: "Cashless Health"
    },
    {
      href: "/his/antimicrobial",
      title: "WHO AWaRe Antimicrobial Stewardship",
      desc: "Audit outpatient prescriptions against ICMR and WHO Access/Watch/Reserve antibiotic guidelines.",
      icon: <ShieldAlert className="w-8 h-8" />,
      color: "rose",
      badge: "AMR Safety"
    },
    {
      href: "/his/ayush",
      title: "AYUSH Pariksha & Prakriti Desk",
      desc: "Dashavidha constitutional assessment, Tridosha radar, and Pathya-Apathya dietary charts.",
      icon: <Leaf className="w-8 h-8" />,
      color: "green",
      badge: "Integrative Health"
    },
    {
      href: "/his/dpdp",
      title: "DPDP 2023 Consent Manager",
      desc: "Digital Personal Data Protection Act compliance, patient consent readouts, and cryptographic logs.",
      icon: <Shield className="w-8 h-8" />,
      color: "indigo",
      badge: "Privacy & Legal"
    }
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      <TrustBanner currentTab="his" onTabChange={() => {}} onLanguageChange={() => {}} />

      <div className="flex-1 flex flex-col items-center p-4 sm:p-8 max-w-6xl mx-auto w-full">
        
        {/* Navigation Breadcrumb */}
        <div className="w-full mb-6 flex items-center justify-between">
          <a href="/" className="flex items-center text-[#0f4c81] hover:underline font-semibold text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> {t("generic.back") || "Back to Patient Portal"}
          </a>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Hospital Operations Terminal
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PROMINENT DOCTOR CLINIC BANNER & DEDICATED SIGN-IN CTA */}
        {/* ============================================================== */}
        <div className="w-full bg-gradient-to-r from-[#0f2942] via-[#0f4c81] to-[#1e3a8a] text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-md border border-blue-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-emerald-400/30">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Physicians & Medical Specialists Only</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                Doctor Consultation Desk & Clinical Workspace
              </h2>
              <p className="text-blue-100/80 text-xs sm:text-sm leading-relaxed">
                Log in with your National Medical Commission (NMC / MCI) registration to review your assigned OPD queue, inspect comprehensive clinical histories, and issue fast digital prescriptions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {doctorSession ? (
                <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/20 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Logged In: {doctorSession.name}</span>
                  </div>
                  <span className="text-[11px] text-blue-200">{doctorSession.department} • {doctorSession.roomNumber}</span>
                  <a
                    href="/his/doctor"
                    className="mt-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>Open My Doctor Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setDoctorModalOpen(true)}
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border border-emerald-400/40"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Doctor Login (MCI / NUID)</span>
                  <Lock className="w-3.5 h-3.5 opacity-80" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section Header: Hospital Staff Modules */}
        <div className="w-full mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-gray-200 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f4c81] uppercase tracking-wider mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospital Staff & Triage Modules</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#0f2942]">
              Clinical Operations & Department Desks
            </h3>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Authorized hospital personnel terminal
          </span>
        </div>

        {/* Staff Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {hisStaffModules.map((mod, idx) => (
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

              <h4 className="text-base font-bold text-[#0f2942] mb-1.5 group-hover:text-[#0f4c81] transition-colors">
                {mod.title}
              </h4>
              <p className="text-gray-500 text-xs leading-relaxed mt-auto">
                {mod.desc}
              </p>
            </motion.a>
          ))}
        </div>

      </div>

      {/* Strict Doctor Login Modal */}
      <DoctorLoginModal
        isOpen={doctorModalOpen}
        onClose={() => setDoctorModalOpen(false)}
        onSuccess={(session) => {
          setDoctorSession(session);
        }}
      />
    </main>
  );
}
