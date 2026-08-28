"use client";

import { Search, ShieldCheck, Phone, Globe, Eye, Volume2, Accessibility } from "lucide-react";
import { useState } from "react";

interface TrustBannerProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLanguageChange?: (lang: string) => void;
}

export default function TrustBanner({ currentTab, onTabChange, onLanguageChange }: TrustBannerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="w-full flex flex-col bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      {/* 1. Top Accessibility Strip (Official UIDAI Style Navy Bar) */}
      <div className="w-full bg-[#1d2d44] text-white text-[11px] py-1 px-4 sm:px-8 flex items-center justify-between font-sans">
        <div className="flex items-center gap-3">
          <span className="text-gray-300 hover:text-white cursor-pointer">मुख्य सामग्री पर जाएं | Skip to Main Content</span>
          <span className="text-gray-500 hidden sm:inline">•</span>
          <span className="text-gray-300 hover:text-white cursor-pointer hidden sm:flex items-center gap-1">
            <Accessibility className="w-3 h-3" /> Screen Reader Access
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-gray-300">
            <Globe className="w-3 h-3 text-[#f37021]" />
            <select 
              onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
              className="bg-transparent text-white text-[11px] outline-none cursor-pointer"
            >
              <option value="hi" className="bg-[#1d2d44] text-white">हिन्दी (Hindi)</option>
              <option value="en" className="bg-[#1d2d44] text-white">English</option>
              <option value="te" className="bg-[#1d2d44] text-white">తెలుగు (Telugu)</option>
              <option value="ta" className="bg-[#1d2d44] text-white">தமிழ் (Tamil)</option>
              <option value="bn" className="bg-[#1d2d44] text-white">বাংলা (Bengali)</option>
              <option value="mr" className="bg-[#1d2d44] text-white">मराठी (Marathi)</option>
              <option value="kn" className="bg-[#1d2d44] text-white">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-gray-300 border-l border-gray-600 pl-3">
            <button className="px-1 hover:text-white">A-</button>
            <button className="px-1 hover:text-white font-bold">A</button>
            <button className="px-1 hover:text-white">A+</button>
          </div>
        </div>
      </div>

      {/* 2. Main Government Header (Crisp White with National Emblem & Saffron-Green Accent) */}
      <div className="w-full bg-white py-3 px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100">
        {/* Emblem & Logo */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#f37021]/10 via-white to-[#138808]/10 border border-orange-200 text-2xl shadow-sm">
            🇮🇳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#f37021] tracking-wide">मेरा स्वास्थ्य, मेरी पहचान</span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-[#138808] font-semibold">My Health, My Identity</span>
            </div>
            <h1 className="text-base sm:text-xl font-bold text-[#0f2942] tracking-tight flex items-center gap-2">
              समन्वय • PROJECT SAMANVAYA
              <span className="bg-blue-100 text-[#0f4c81] text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                SIH 26047
              </span>
            </h1>
            <p className="text-[11px] text-gray-500 font-medium">
              National Smart Case-Taking & AYUSH-Allopathic Bridge • MoHFW & Ministry of AYUSH
            </p>
          </div>
        </div>

        {/* Live Search Bar & Help (UIDAI Style) */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services, schemes, tokens..."
              className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c81] focus:bg-white transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          {/* National Health Helpline Badge */}
          <div className="hidden lg:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs text-emerald-800 font-medium shadow-sm">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Helpline: <strong>104 / 108</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Primary Navigation Tabs (Official UIDAI Navigation Menu) */}
      <nav className="w-full bg-white px-4 sm:px-8 flex items-center gap-1 overflow-x-auto py-1 border-t border-gray-100 text-xs font-medium text-gray-700">
        <button
          onClick={() => onTabChange("home")}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
            currentTab === "home"
              ? "bg-[#0f4c81] text-white font-semibold shadow-sm"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          🏛️ Home / मुख्य पृष्ठ
        </button>

        <button
          onClick={() => onTabChange("kiosk")}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
            currentTab === "kiosk"
              ? "bg-[#0f4c81] text-white font-semibold shadow-sm"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          🏥 Patient Kiosk / स्मार्ट पर्ची
        </button>

        <button
          onClick={() => onTabChange("doctor")}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
            currentTab === "doctor"
              ? "bg-[#0f4c81] text-white font-semibold shadow-sm"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          🩺 Physician Desk / चिकित्सक पटल
        </button>

        <button
          onClick={() => onTabChange("ayush")}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
            currentTab === "ayush"
              ? "bg-[#0f4c81] text-white font-semibold shadow-sm"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          🌿 AYUSH Pariksha / आयुष परीक्षा
        </button>

        <button
          onClick={() => onTabChange("schemes")}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
            currentTab === "schemes"
              ? "bg-[#0f4c81] text-white font-semibold shadow-sm"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          🛡️ Govt Schemes / सरकारी योजनाएं
        </button>
      </nav>
    </header>
  );
}
