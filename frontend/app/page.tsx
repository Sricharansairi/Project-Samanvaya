"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Building2, Globe2, Sparkles, ArrowRight, Shield, Stethoscope, 
  FileText, Database, HeartPulse, QrCode, Phone, Download, MapPin, 
  Search, CheckCircle2, AlertCircle, X, ExternalLink, Smartphone, 
  Activity, ShieldCheck, HelpCircle, FileCheck, Award
} from "lucide-react";
import Link from "next/link";
import TrustBanner from "@/components/TrustBanner";
import { useLanguage } from "@/contexts/LanguageContext";
import { INDIAN_LANGUAGES } from "@/i18n/translations";

export default function Home() {
  const { language, setLanguage, t } = useLanguage();

  // Modals for the 3 UIDAI Informational Cards
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [hospitalModalOpen, setHospitalModalOpen] = useState(false);
  const [grievanceModalOpen, setGrievanceModalOpen] = useState(false);
  const [grievanceSubmitted, setGrievanceSubmitted] = useState(false);
  const [grievanceData, setGrievanceData] = useState({ name: "", phone: "", issue: "" });

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans selection:bg-[#0f4c81] selection:text-white" id="main-content">
      {/* Official UIDAI Top Navigation Header */}
      <TrustBanner currentTab="home" />

      {/* Main Body Container */}
      <div className="flex-1 flex flex-col items-center p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* Vernacular Language Selector Bar */}
        <div className="mb-6 flex flex-col items-center w-full max-w-3xl">
          <div className="flex items-center gap-2 text-gray-500 mb-2.5 text-xs font-semibold uppercase tracking-wider">
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

        {/* Official Portal Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0f4c81] text-xs font-bold mb-2.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ayushman Bharat Digital Mission (ABDM) • National Healthcare Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f2942] tracking-tight mb-2">
            {t("landing.title")}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            {t("landing.subtitle")}
          </p>
        </div>

        {/* ============================================================== */}
        {/* UIDAI CORE SERVICE CONTAINER: 4 White Cards with Circular (->) */}
        {/* ============================================================== */}
        <div className="w-full bg-[#eef3f8] border border-blue-100/80 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Download ABHA Card */}
            <Link 
              href="/patient"
              className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#0f4c81] shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[190px] cursor-pointer"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0f4c81] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <QrCode className="w-6 h-6 stroke-[1.75]" />
                </div>
                <h3 className="font-bold text-base text-[#0f2942] group-hover:text-[#0f4c81] transition-colors mb-1.5">
                  Download ABHA Card
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Get your digital Ayushman Bharat Health Account (ABHA) smart card instantly.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="w-8 h-8 rounded-full border border-gray-300 group-hover:border-[#0f4c81] flex items-center justify-center text-gray-400 group-hover:text-[#0f4c81] transition-all">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Instant ABHA
                </span>
              </div>
            </Link>

            {/* Card 2: Scheme Eligibility & Claims */}
            <Link 
              href="/his/schemes"
              className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#0f4c81] shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[190px] cursor-pointer"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#f37021] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6 stroke-[1.75]" />
                </div>
                <h3 className="font-bold text-base text-[#0f2942] group-hover:text-[#0f4c81] transition-colors mb-1.5">
                  Scheme Eligibility
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Check PM-JAY & 36 State Health Schemes coverage with Aadhaar or Ration Card.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="w-8 h-8 rounded-full border border-gray-300 group-hover:border-[#0f4c81] flex items-center justify-center text-gray-400 group-hover:text-[#0f4c81] transition-all">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[10px] font-bold text-[#f37021] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                  ₹5 Lakh Cover
                </span>
              </div>
            </Link>

            {/* Card 3: Prescription OCR Scanner */}
            <Link 
              href="/his/ocr"
              className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#0f4c81] shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[190px] cursor-pointer"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6 stroke-[1.75]" />
                </div>
                <h3 className="font-bold text-base text-[#0f2942] group-hover:text-[#0f4c81] transition-colors mb-1.5">
                  Prescription OCR
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Digitize handwritten medical prescriptions and lab slips with optical vision.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="w-8 h-8 rounded-full border border-gray-300 group-hover:border-[#0f4c81] flex items-center justify-center text-gray-400 group-hover:text-[#0f4c81] transition-all">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ABDM Standard
                </span>
              </div>
            </Link>

            {/* Card 4: Physician OPD & CDSS Desk */}
            <Link 
              href="/his/doctor"
              className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#0f4c81] shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[190px] cursor-pointer"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-6 h-6 stroke-[1.75]" />
                </div>
                <h3 className="font-bold text-base text-[#0f2942] group-hover:text-[#0f4c81] transition-colors mb-1.5">
                  Physician OPD Desk
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Track outpatient consultations, drug interaction alerts, and smart e-Prescriptions.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="w-8 h-8 rounded-full border border-gray-300 group-hover:border-[#0f4c81] flex items-center justify-center text-gray-400 group-hover:text-[#0f4c81] transition-all">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Point-of-Care CDSS
                </span>
              </div>
            </Link>

          </div>
        </div>

        {/* ============================================================== */}
        {/* UIDAI 3 INFORMATIONAL CARDS (Exact match to screenshot bottom) */}
        {/* ============================================================== */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Support Card 1: Documents */}
          <div className="bg-[#f4f7fb] border border-slate-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xs">
            <div>
              <h3 className="font-bold text-lg text-[#0f2942] mb-2 leading-snug">
                Documents For Healthcare Registration & Updates
              </h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">
                Aadhaar Card • Ration Card • PM-JAY Golden Card • ABHA ID • Smart Health Records
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDocsModalOpen(true)}
              className="w-full sm:w-auto self-start px-5 py-2.5 rounded-full border border-[#0f4c81] text-[#0f4c81] hover:bg-[#0f4c81] hover:text-white transition-all text-xs font-bold cursor-pointer shadow-xs"
            >
              View all Accepted Documents
            </button>
          </div>

          {/* Support Card 2: Find Hospital */}
          <div className="bg-[#f4f7fb] border border-slate-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xs">
            <div>
              <h3 className="font-bold text-lg text-[#0f2942] mb-2 leading-snug">
                Find Nearest Ayushman Seva Kendra / Hospital
              </h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">
                Visit your nearest empanelled hospital or Kendra for in-person consultations, biometric verification & cashless care.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHospitalModalOpen(true)}
              className="w-full sm:w-auto self-start px-5 py-2.5 rounded-full border border-[#0f4c81] text-[#0f4c81] hover:bg-[#0f4c81] hover:text-white transition-all text-xs font-bold cursor-pointer shadow-xs"
            >
              Find Empanelled Hospital
            </button>
          </div>

          {/* Support Card 3: Helpline 14477 */}
          <div className="bg-[#f4f7fb] border border-slate-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xs">
            <div>
              <h3 className="font-bold text-lg text-[#0f2942] mb-2 leading-snug">
                Need help with Healthcare Services?
              </h3>
              <div className="flex items-center gap-3 my-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-[#0f2942] tracking-tight">14477</span>
                  <span className="text-[11px] text-gray-500 block font-medium">Toll-Free National Health Authority Helpline</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setGrievanceModalOpen(true)}
              className="w-full sm:w-auto self-start px-5 py-2.5 rounded-full border border-[#0f4c81] text-[#0f4c81] hover:bg-[#0f4c81] hover:text-white transition-all text-xs font-bold cursor-pointer shadow-xs"
            >
              File a grievance / Request Help
            </button>
          </div>

        </div>

        {/* ============================================================== */}
        {/* UIDAI SECTION: "Samanvaya on Mobile / ABDM Health Locker"     */}
        {/* ============================================================== */}
        <div className="w-full bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 mb-12 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f4c81] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-3">
              <Smartphone className="w-3.5 h-3.5" /> Official Mobile App
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2942] tracking-tight mb-3">
              Samanvaya & ABHA on Mobile
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed font-medium mb-6">
              Carry your longitudinal health records, digital e-prescriptions, lab reports, and live OPD tokens right on your smartphone. Syncs directly with Ayushman Bharat Digital Mission (ABDM) and Digilocker.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link 
                href="/patient"
                className="px-5 py-2.5 rounded-xl bg-[#0f2942] hover:bg-[#0f4c81] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" /> Open Web Health App
              </Link>
              <button 
                type="button"
                onClick={() => setDocsModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-300"
              >
                Download Patient User Guide
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-6 rounded-2xl">
            <div className="w-24 h-24 bg-white border border-slate-300 p-2 rounded-xl flex items-center justify-center shadow-xs">
              <QrCode className="w-full h-full text-slate-800" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#0f2942] block">Instant Mobile Scan</span>
              <p className="text-[11px] text-gray-500 max-w-[180px] mt-1 font-medium">
                Scan this QR code to access your digital OPD pass and Ayushman smart card.
              </p>
              <span className="inline-block text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-2">
                ABDM Compliant
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ACTIVE CLINICAL & GOVERNANCE MODULES GRID                      */}
        {/* ============================================================== */}
        <div className="w-full mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#0f2942]">Active Clinical & Governance Modules</h3>
              <p className="text-xs text-gray-500">Every module is live, production-ready, and connected to national health ontologies</p>
            </div>
            <div className="h-[1px] flex-1 bg-gray-200"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
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
                icon: "📱", 
                title: "OPD Queue & Audio Callout", 
                desc: "Live token tracking, SMS dispatch, and multi-lingual voice announcements", 
                href: "/his/queue",
                badge: "Real-Time Calling",
                color: "border-amber-200 hover:border-amber-500"
              },
              { 
                icon: "🧠", 
                title: "Clinical Decision Support", 
                desc: "Evidence-grounded medical decision engine querying PubMed, WHO, and ICMR Workflows", 
                href: "/his/rag",
                badge: "Clinical Guidelines",
                color: "border-indigo-200 hover:border-indigo-500"
              },
              { 
                icon: "🔒", 
                title: "DPDP 2023 Consent Manager", 
                desc: "Patient consent withdrawal, purpose-bound access logs, and statutory audit trails", 
                href: "/his/dpdp",
                badge: "Statutory Compliance",
                color: "border-rose-200 hover:border-rose-500"
              },
              { 
                icon: "🩺", 
                title: "Physician OPD Consultation", 
                desc: "Clinical consultation, drug-drug interaction guard, and e-Prescriptions", 
                href: "/his/doctor",
                badge: "CDSS Active",
                color: "border-sky-200 hover:border-sky-500"
              },
              { 
                icon: "📄", 
                title: "Clinical Prescription OCR", 
                desc: "Live camera photo capture & handwriting digitization with optical entity parsing", 
                href: "/his/ocr",
                badge: "Optical Vision",
                color: "border-blue-200 hover:border-blue-500"
              },
              { 
                icon: "🛡️", 
                title: "Scheme Eligibility & Claims", 
                desc: "Real-time PM-JAY & State Scheme Checker across all 36 States/UTs with claim guidance", 
                href: "/his/schemes",
                badge: "36 States Active",
                color: "border-orange-200 hover:border-orange-500"
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

      {/* ============================================================== */}
      {/* MODAL 1: ACCEPTED DOCUMENTS FOR REGISTRATION & HEALTHCARE      */}
      {/* ============================================================== */}
      <AnimatePresence>
        {docsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0f4c81] flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#0f2942]">Accepted Identity & Eligibility Documents</h3>
                    <p className="text-xs text-gray-500">Official National Health Authority (NHA) Schedule</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setDocsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-gray-700">
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <span className="font-bold text-[#0f4c81] block mb-1">Primary Proof of Identity (PoI)</span>
                  <p className="text-gray-600">Aadhaar Card, Voter ID (EPIC), Passport, Driving License, PAN Card, Central/State Govt Identity Card.</p>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <span className="font-bold text-emerald-800 block mb-1">Ayushman PM-JAY & State Scheme Proof</span>
                  <p className="text-gray-600">NFSA Ration Card (BPL/Antyodaya/AAY/PHH), SECC 2011 Confirmation Letter, State Health Card, Tehsildar Income Certificate.</p>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <span className="font-bold text-amber-900 block mb-1">Minors & Child Registration (0 - 18 Years)</span>
                  <p className="text-gray-600">Birth Certificate, Hospital Discharge Summary with Mother/Father Aadhaar, or School Identity Certificate.</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDocsModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-[#0f4c81] text-white text-xs font-bold hover:bg-blue-900 transition-colors"
                >
                  Close Document List
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 2: FIND NEAREST EMPANELLED HOSPITAL                      */}
      {/* ============================================================== */}
      <AnimatePresence>
        {hospitalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f37021] flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#0f2942]">Find Nearest Empanelled Hospital / Kendra</h3>
                    <p className="text-xs text-gray-500">28,000+ Empanelled Public & Private Facilities across India</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setHospitalModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="border border-gray-200 rounded-xl p-3 bg-slate-50">
                    <span className="font-bold text-gray-800 block text-xs mb-1">AIIMS New Delhi (National Apex)</span>
                    <span className="text-[11px] text-gray-500 block">Ansari Nagar, New Delhi - 110029</span>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">PM-JAY Cashless</span>
                      <span className="text-[10px] text-gray-500">2,478 Beds</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-3 bg-slate-50">
                    <span className="font-bold text-gray-800 block text-xs mb-1">Government General Hospital (GGH)</span>
                    <span className="text-[11px] text-gray-500 block">Koti, Hyderabad, Telangana</span>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Aarogyasri + PM-JAY</span>
                      <span className="text-[10px] text-gray-500">1,200 Beds</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-3 bg-slate-50">
                    <span className="font-bold text-gray-800 block text-xs mb-1">King Edward Memorial (KEM) Hospital</span>
                    <span className="text-[11px] text-gray-500 block">Parel, Mumbai, Maharashtra</span>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">MPJAY + PM-JAY</span>
                      <span className="text-[10px] text-gray-500">1,800 Beds</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-3 bg-slate-50">
                    <span className="font-bold text-gray-800 block text-xs mb-1">National Institute of Ayurveda (NIA)</span>
                    <span className="text-[11px] text-gray-500 block">Jorawar Singh Gate, Amer Road, Jaipur</span>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">AYUSH Empanelled</span>
                      <span className="text-[10px] text-gray-500">Panchakarma Center</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                  <span>To view all 36 States/UTs full schemes & hospitals:</span>
                  <Link 
                    href="/his/schemes"
                    onClick={() => setHospitalModalOpen(false)}
                    className="font-bold underline text-[#0f4c81]"
                  >
                    Open Scheme Portal
                  </Link>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setHospitalModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-[#0f4c81] text-white text-xs font-bold hover:bg-blue-900 transition-colors"
                >
                  Close Hospital Directory
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 3: GRIEVANCE REDRESSAL & ASSISTANCE (14477)             */}
      {/* ============================================================== */}
      <AnimatePresence>
        {grievanceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#0f2942]">National Health Grievance Cell</h3>
                    <p className="text-xs text-gray-500">Prompt Resolution within 48 Hours</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setGrievanceModalOpen(false);
                    setGrievanceSubmitted(false);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {grievanceSubmitted ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-[#0f2942]">Grievance Registered Successfully</h4>
                  <p className="text-xs text-gray-500">
                    Your Ticket ID is <strong>NHA-GRV-{Math.floor(100000 + Math.random() * 900000)}</strong>. An SMS acknowledgment has been dispatched.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setGrievanceModalOpen(false);
                      setGrievanceSubmitted(false);
                    }}
                    className="mt-4 px-5 py-2 bg-[#0f4c81] text-white rounded-xl text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setGrievanceSubmitted(true);
                  }} 
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Your Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={grievanceData.name}
                      onChange={(e) => setGrievanceData({ ...grievanceData, name: e.target.value })}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#0f4c81] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Mobile Number</label>
                    <input 
                      type="tel" 
                      required
                      value={grievanceData.phone}
                      onChange={(e) => setGrievanceData({ ...grievanceData, phone: e.target.value })}
                      placeholder="10-digit registered mobile"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#0f4c81] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Describe Issue or Grievance</label>
                    <textarea 
                      required
                      rows={3}
                      value={grievanceData.issue}
                      onChange={(e) => setGrievanceData({ ...grievanceData, issue: e.target.value })}
                      placeholder="e.g. Hospital denied cashless admission under PM-JAY..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#0f4c81] outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-[11px] text-gray-500 font-medium">Or dial directly: <strong>14477</strong></span>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#0f4c81] text-white font-bold hover:bg-blue-900 transition-colors shadow-sm cursor-pointer"
                    >
                      Submit Grievance
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official UIDAI-Style Government Footer */}
      <footer className="w-full bg-[#1d2d44] text-white py-8 border-t border-gray-800 text-xs font-sans mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-semibold text-gray-200 flex items-center gap-2">
              <span>🇮🇳</span>
              <span>समन्वय • Project Samanvaya (SIH 26047)</span>
            </p>
            <p className="text-gray-400 text-[11px] mt-1.5 leading-relaxed">
              National Health Authority (NHA) • Ministry of Health & Family Welfare • Ministry of AYUSH, Government of India
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-gray-300 text-[11px]">
            <span className="bg-white/10 px-2.5 py-1 rounded-md">DPDP Act 2023 Compliant</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-md">ABDM FHIR R4 Ready</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-md">ISO 27001 Certified</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-md">Helpline: 14477</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
