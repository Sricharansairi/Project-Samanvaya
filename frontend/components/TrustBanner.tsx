"use client";

import { Search, ShieldCheck, Phone, Globe, Eye, Volume2, Accessibility } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { INDIAN_LANGUAGES, Language } from "@/i18n/translations";

interface TrustBannerProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  onLanguageChange?: (lang: string) => void;
}

export default function TrustBanner({ currentTab = "home", onTabChange, onLanguageChange }: TrustBannerProps) {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const handleTabClick = (tabKey: string, path: string) => {
    if (onTabChange) {
      onTabChange(tabKey);
    }
    router.push(path);
  };

  const handleLanguageSelect = (newLang: string) => {
    const lang = newLang as Language;
    setLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      if (q.includes("doctor") || q.includes("physician") || q.includes("consult")) {
        router.push("/his/doctor");
      } else if (q.includes("ocr") || q.includes("prescription") || q.includes("scan") || q.includes("parchi")) {
        router.push("/his/ocr");
      } else if (q.includes("scheme") || q.includes("pmjay") || q.includes("yojana") || q.includes("claim") || q.includes("insurance")) {
        router.push(`/his/schemes?search=${encodeURIComponent(searchQuery)}`);
      } else if (q.includes("ayush") || q.includes("prakriti") || q.includes("ayurveda") || q.includes("pariksha")) {
        router.push("/his/ayush");
      } else if (q.includes("queue") || q.includes("token") || q.includes("opd") || q.includes("wait")) {
        router.push("/his/queue");
      } else if (q.includes("kiosk") || q.includes("reg") || q.includes("admission") || q.includes("triage")) {
        router.push("/his/registration");
      } else if (q.includes("rag") || q.includes("ai") || q.includes("decision") || q.includes("guidelines")) {
        router.push("/his/rag");
      } else if (q.includes("dpdp") || q.includes("consent") || q.includes("privacy")) {
        router.push("/his/dpdp");
      } else if (q.includes("patient") || q.includes("card") || q.includes("abha") || q.includes("portal")) {
        router.push("/patient");
      } else {
        router.push(`/his/schemes?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const adjustFontSize = (scale: "small" | "normal" | "large") => {
    if (typeof document !== "undefined") {
      if (scale === "small") document.documentElement.style.fontSize = "14px";
      else if (scale === "normal") document.documentElement.style.fontSize = "16px";
      else if (scale === "large") document.documentElement.style.fontSize = "18px";
    }
  };

  return (
    <header className="w-full flex flex-col bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      {/* 1. Top Accessibility Strip (Official UIDAI Style Navy Bar) */}
      <div className="w-full bg-[#1d2d44] text-white text-[11px] py-1 px-4 sm:px-8 flex items-center justify-between font-sans">
        <div className="flex items-center gap-3">
          <a href="#main-content" className="text-gray-300 hover:text-white cursor-pointer transition-colors">
            {t("nav.skip_to_content")}
          </a>
          <span className="text-gray-500 hidden sm:inline">•</span>
          <button 
            type="button"
            onClick={() => {
              const el = document.body;
              el.classList.toggle("contrast-125");
            }}
            className="text-gray-300 hover:text-white cursor-pointer hidden sm:flex items-center gap-1 bg-transparent border-0"
          >
            <Accessibility className="w-3 h-3" /> {t("nav.screen_reader")}
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Multi-Lingual Indian Language Selector */}
          <div className="flex items-center gap-1.5 text-gray-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/20">
            <Globe className="w-3.5 h-3.5 text-[#f37021]" />
            <select 
              value={language}
              onChange={(e) => handleLanguageSelect(e.target.value)}
              className="bg-transparent text-white text-[11px] font-semibold outline-none cursor-pointer pr-1"
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#1d2d44] text-white">
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Text Size Accessibility Scaling */}
          <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-gray-300 border-l border-gray-600 pl-3">
            <button type="button" onClick={() => adjustFontSize("small")} className="px-1 hover:text-white cursor-pointer" title="Small text">A-</button>
            <button type="button" onClick={() => adjustFontSize("normal")} className="px-1 hover:text-white font-bold cursor-pointer" title="Normal text">A</button>
            <button type="button" onClick={() => adjustFontSize("large")} className="px-1 hover:text-white font-bold cursor-pointer text-[11px]" title="Large text">A+</button>
          </div>
        </div>
      </div>

      {/* 2. Main Government Header (National Emblem & Clickable Branding) */}
      <div className="w-full bg-white py-3 px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100">
        
        {/* Emblem & Logo wrapped in Link to Home */}
        <Link 
          href="/" 
          className="flex items-center gap-4 w-full md:w-auto group cursor-pointer hover:opacity-95 transition-opacity"
          title="Return to Project Samanvaya Home"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#f37021]/10 via-white to-[#138808]/10 border border-orange-200 text-2xl shadow-sm group-hover:scale-105 transition-transform">
            🇮🇳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#f37021] tracking-wide">{t("nav.motto")}</span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-[#138808] font-semibold">MoHFW & AYUSH</span>
            </div>
            <h1 className="text-base sm:text-xl font-bold text-[#0f2942] tracking-tight flex items-center gap-2">
              समन्वय • PROJECT SAMANVAYA
              <span className="bg-blue-100 text-[#0f4c81] text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                SIH 26047
              </span>
            </h1>
            <p className="text-[11px] text-gray-500 font-medium">
              National Smart Case-Taking & AYUSH-Allopathic Bridge System
            </p>
          </div>
        </Link>

        {/* Live Search Bar & Help */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder={t("nav.search_placeholder")}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c81] focus:bg-white transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          {/* National Health Helpline Badge */}
          <div className="hidden lg:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs text-emerald-800 font-medium shadow-sm">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t("nav.helpline")}</span>
          </div>
        </div>
      </div>

      {/* 3. Primary Navigation Tabs with Live Next.js Routing */}
      <nav className="w-full bg-white px-4 sm:px-8 flex items-center gap-1 overflow-x-auto py-1 border-t border-gray-100 text-xs font-medium text-gray-700">
        <button
          type="button"
          onClick={() => handleTabClick("home", "/")}
          className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            currentTab === "home"
              ? "bg-[#0f4c81] text-white font-semibold shadow-sm"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          🏛️ {t("nav.home")}
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("kiosk", "/his/registration")}
          className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            currentTab === "kiosk"
              ? "bg-[#0f4c81] text-white font-semibold shadow-sm"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          🏥 {t("nav.kiosk")}
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("doctor", "/his/doctor")}
          className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            currentTab === "doctor"
              ? "bg-[#0f4c81] text-white font-semibold shadow-sm"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          🩺 {t("nav.doctor")}
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("ayush", "/his/ayush")}
          className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            currentTab === "ayush"
              ? "bg-[#0f4c81] text-white font-semibold shadow-sm"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          🌿 {t("nav.ayush")}
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("schemes", "/his/schemes")}
          className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            currentTab === "schemes"
              ? "bg-[#0f4c81] text-white font-semibold shadow-sm"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          🛡️ {t("nav.schemes")}
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("ocr", "/his/ocr")}
          className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            currentTab === "ocr"
              ? "bg-[#0f4c81] text-white font-semibold shadow-sm"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          📄 {t("nav.ocr")}
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("queue", "/his/queue")}
          className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            currentTab === "queue"
              ? "bg-[#0f4c81] text-white font-semibold shadow-sm"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          📱 {t("nav.queue")}
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("rag", "/his/rag")}
          className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            currentTab === "rag"
              ? "bg-[#0f4c81] text-white font-semibold shadow-sm"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          🧠 {t("nav.rag")}
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("patient", "/patient")}
          className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            currentTab === "patient"
              ? "bg-[#0f4c81] text-white font-semibold shadow-sm"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          🪪 My ABHA
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("dpdp", "/his/dpdp")}
          className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            currentTab === "dpdp"
              ? "bg-[#0f4c81] text-white font-semibold shadow-sm"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          🔒 {t("nav.dpdp")}
        </button>
      </nav>
    </header>
  );
}
