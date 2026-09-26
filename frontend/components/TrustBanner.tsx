"use client";

import { 
  Search, ShieldCheck, Phone, Globe, Eye, Volume2, Accessibility, 
  User, Stethoscope, Sparkles, Command, ArrowRight, X, ChevronRight,
  FileText, Activity, Database, Pill, HeartPulse, ShieldAlert, Leaf, Lock,
  Building2, LogOut, KeyRound
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { INDIAN_LANGUAGES, Language } from "@/i18n/translations";
import HISAuthModal, { StaffUser } from "./HISAuthModal";

interface TrustBannerProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  onLanguageChange?: (lang: string) => void;
}

export type UserRole = "patient" | "staff" | "all";

export default function TrustBanner({ currentTab, onTabChange, onLanguageChange }: TrustBannerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  
  // Search & Command Palette state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Determine active tab automatically from route if not provided or fallback
  const resolvedTab = currentTab || (() => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/patient")) return "patient";
    if (pathname.startsWith("/his/registration")) return "kiosk";
    if (pathname.startsWith("/his/doctor")) return "doctor";
    if (pathname.startsWith("/his/ayush")) return "ayush";
    if (pathname.startsWith("/his/schemes")) return "schemes";
    if (pathname.startsWith("/his/ocr")) return "ocr";
    if (pathname.startsWith("/his/queue")) return "queue";
    if (pathname.startsWith("/his/rag")) return "rag";
    if (pathname.startsWith("/his/antimicrobial")) return "antimicrobial";
    if (pathname.startsWith("/his/tele-manas")) return "telemanas";
    if (pathname.startsWith("/his/dpdp")) return "dpdp";
    return "home";
  })();

  // HIS Staff Authentication state
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [hisModalOpen, setHisModalOpen] = useState(false);

  // Check stored staff authentication on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("samanvaya_staff_auth");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.isAuthenticated) {
            setStaffUser(parsed);
          }
        } catch (e) {}
      }

      const handleOpenHis = () => setHisModalOpen(true);
      const handleAuthChanged = (e: any) => {
        setStaffUser(e.detail || null);
      };
      window.addEventListener("samanvaya:open-his-modal", handleOpenHis);
      window.addEventListener("samanvaya:staff-auth-changed", handleAuthChanged);
      return () => {
        window.removeEventListener("samanvaya:open-his-modal", handleOpenHis);
        window.removeEventListener("samanvaya:staff-auth-changed", handleAuthChanged);
      };
    }
  }, []);

  // Role segregation state: "patient" vs "staff" vs "all"
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("samanvaya_role_view");
      if (saved === "patient" || saved === "staff" || saved === "all") return saved;
    }
    return "patient";
  });

  // Keep role in sync when route fundamentally changes
  useEffect(() => {
    if (pathname.startsWith("/his/doctor") || 
        pathname.startsWith("/his/registration") || 
        pathname.startsWith("/his/rag") || 
        pathname.startsWith("/his/antimicrobial") || 
        pathname.startsWith("/his/dpdp")) {
      if (staffUser) {
        setActiveRole("staff");
      }
    } else if (pathname.startsWith("/patient") || 
               pathname.startsWith("/his/schemes") || 
               pathname.startsWith("/his/tele-manas")) {
      setActiveRole("patient");
    }
  }, [pathname, staffUser]);

  const handleRoleChange = (role: UserRole) => {
    if (role === "staff" && !staffUser) {
      setHisModalOpen(true);
      return;
    }
    setActiveRole(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("samanvaya_role_view", role);
      window.dispatchEvent(new CustomEvent("samanvaya:role-changed", { detail: { role } }));
    }
  };

  const handleStaffLogout = () => {
    setStaffUser(null);
    setActiveRole("patient");
    if (typeof window !== "undefined") {
      localStorage.removeItem("samanvaya_staff_auth");
      localStorage.setItem("samanvaya_role_view", "patient");
      window.dispatchEvent(new CustomEvent("samanvaya:staff-auth-changed", { detail: null }));
      window.dispatchEvent(new CustomEvent("samanvaya:role-changed", { detail: { role: "patient" } }));
    }
    if (pathname.startsWith("/his/doctor") || 
        pathname.startsWith("/his/registration") || 
        pathname.startsWith("/his/rag") || 
        pathname.startsWith("/his/antimicrobial") || 
        pathname.startsWith("/his/dpdp")) {
      router.push("/");
    }
  };

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const input = searchContainerRef.current?.querySelector("input");
        input?.focus();
        setIsSearchFocused(true);
      } else if (e.key === "Escape") {
        setIsSearchFocused(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Command palette item navigation
  const navigateToFeature = (path: string) => {
    setIsSearchFocused(false);
    setSearchQuery("");
    router.push(path);
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      setIsSearchFocused(false);
      if (q.includes("doctor") || q.includes("physician") || q.includes("consult")) {
        router.push("/his/doctor");
      } else if (q.includes("ocr") || q.includes("prescription") || q.includes("scan") || q.includes("parchi") || q.includes("jan aushadhi") || q.includes("generic") || q.includes("kendra") || q.includes("savings")) {
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
      } else if (q.includes("amr") || q.includes("antibiotic") || q.includes("aware") || q.includes("stewardship")) {
        router.push("/his/antimicrobial");
      } else if (q.includes("tele") || q.includes("manas") || q.includes("mental") || q.includes("stress") || q.includes("14416") || q.includes("counsel")) {
        router.push("/his/tele-manas");
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

  // Search feature catalog for instant dropdown filter
  const SEARCH_FEATURES = [
    { title: "My ABHA & 3D Smart Card", path: "/patient", role: "patient", icon: "🪪", desc: "Digital Health Locker & PVC card" },
    { title: "All-India Scheme Navigator (PM-JAY)", path: "/his/schemes", role: "patient", icon: "🛡️", desc: "Cashless coverage in 36 States" },
    { title: "Prescription OCR & Jan Aushadhi Savings", path: "/his/ocr", role: "patient", icon: "📄", desc: "85% cheaper generic alternatives" },
    { title: "Tele-MANAS Mental Wellness (14416)", path: "/his/tele-manas", role: "patient", icon: "🧠", desc: "Confidential 24x7 helpline & pacer" },
    { title: "AYUSH Prakriti Pariksha Profiler", path: "/his/ayush", role: "patient", icon: "🌿", desc: "Tridosha & dietary recommendations" },
    { title: "Live OPD Token & Queue Status", path: "/his/queue", role: "patient", icon: "📱", desc: "Track waiting times & SMS pass" },
    { title: "Physician OPD Consultation Desk", path: "/his/doctor", role: "staff", icon: "🩺", desc: "Clinical notes & CDSS e-Prescription" },
    { title: "Smart Parchi Registration Kiosk", path: "/his/registration", role: "staff", icon: "🏥", desc: "Vitals intake, triage & token issue" },
    { title: "Live OPD Queue Management Board", path: "/his/queue", role: "staff", icon: "📱", desc: "Voice chime token callout & room ops" },
    { title: "Clinical RAG Co-Pilot & Flowcharts", path: "/his/rag", role: "staff", icon: "🧠", desc: "ICMR & AIIMS clinical decision trees" },
    { title: "WHO AWaRe Antimicrobial Stewardship", path: "/his/antimicrobial", role: "staff", icon: "💊", desc: "Antibiotic misuse audit & alerts" },
    { title: "DPDP 2023 Consent Manager & Audit", path: "/his/dpdp", role: "staff", icon: "🔒", desc: "Statutory purpose binding & SHA-256 logs" },
  ];

  const filteredFeatures = searchQuery.trim() 
    ? SEARCH_FEATURES.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase()) || f.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    : SEARCH_FEATURES;

  return (
    <header className="w-full flex flex-col bg-white border-b border-gray-200 shadow-xs sticky top-0 z-50">
      
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

      {/* 2. Main Government Header (National Emblem & Search Bar) */}
      <div className="w-full bg-white py-2.5 px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-3 border-b border-gray-100">
        
        {/* Emblem & Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3.5 w-full md:w-auto group cursor-pointer hover:opacity-95 transition-opacity"
          title="Return to Project Samanvaya Home"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-gray-200 p-1 shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <img 
              src="/logo.png" 
              alt="Project Samanvaya Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#f37021] tracking-wide">{t("nav.motto")}</span>
              <span className="text-gray-300">|</span>
              <span className="text-[11px] text-[#138808] font-semibold">MoHFW & AYUSH</span>
            </div>
            <h1 className="text-sm sm:text-lg font-bold text-[#0f2942] tracking-tight">
              समन्वय • PROJECT SAMANVAYA
            </h1>
            <p className="text-[10px] text-gray-500 font-medium">
              National Smart Case-Taking & AYUSH-Allopathic Bridge System
            </p>
          </div>
        </Link>

        {/* Live Search Bar with Cmd+K and Command Palette Dropdown */}
        <div ref={searchContainerRef} className="relative flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchSubmit}
              placeholder={t("nav.search_placeholder") || "Search features, schemes, desks..."}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-14 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c81] focus:bg-white transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            
            {/* Keyboard shortcut badge */}
            <div className="absolute right-2.5 top-2 flex items-center gap-0.5 bg-gray-200/80 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-mono pointer-events-none">
              <span>⌘</span><span>K</span>
            </div>
          </div>

          {/* Hospital & Staff Login (HIS) Button or Profile Badge */}
          {staffUser ? (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 pl-3 pr-1.5 py-1 rounded-xl text-xs text-[#0f4c81] font-bold shadow-2xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Stethoscope className="w-3.5 h-3.5 text-[#0f4c81]" />
              <span className="max-w-[140px] truncate">{staffUser.name}</span>
              <span className="text-[9px] bg-blue-100 text-[#0f4c81] px-1.5 py-0.5 rounded-md uppercase font-extrabold">
                {staffUser.role === "doctor" ? "Doctor" : "Staff"}
              </span>
              <button
                type="button"
                onClick={handleStaffLogout}
                className="ml-1 px-2 py-1 bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg border border-gray-200 transition-colors flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                title="Logout from Hospital Information System"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setHisModalOpen(true)}
              className="flex items-center gap-2 bg-[#0f4c81] hover:bg-[#0b3860] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer border border-[#0f4c81]"
              title="Hospital & Staff (HIS) Login"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-200" />
              <span>Hospital & Staff (HIS)</span>
              <Lock className="w-3 h-3 text-blue-300 opacity-75" />
            </button>
          )}

          {/* Quick Command Palette Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 mt-2 z-50 overflow-hidden text-xs max-h-96 flex flex-col">
              <div className="p-2.5 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-[#0f2942] text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0f4c81]" /> Quick Navigation
                </span>
                <span className="text-[10px] text-gray-400">Esc to close</span>
              </div>

              <div className="overflow-y-auto p-1.5 space-y-1">
                {filteredFeatures.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => navigateToFeature(item.path)}
                    className="w-full text-left p-2 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{item.icon}</span>
                      <div>
                        <span className="font-bold text-[#0f2942] group-hover:text-[#0f4c81] block">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {item.role === "patient" ? "Citizen" : "Doctor"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. CITIZEN HEALTH SERVICES NAVIGATION BAR */}
      <div className="w-full bg-[#f8fafc] border-t border-b border-gray-200 px-4 sm:px-8 py-1.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        
        {/* Left Badge: Citizen Services */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#0f4c81] rounded-lg border border-blue-200 text-xs font-bold">
            <User className="w-3.5 h-3.5" />
            <span>Citizen Health Services</span>
          </div>
        </div>

        {/* Primary Citizen Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto text-xs font-medium text-gray-700 py-0.5 flex-1 md:justify-end md:pl-3 md:border-l md:border-gray-200">
          
          {/* Home */}
          <button
            type="button"
            onClick={() => handleTabClick("home", "/")}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              resolvedTab === "home"
                ? "bg-[#0f4c81] text-white font-bold shadow-xs"
                : "hover:bg-slate-200/60 text-gray-700"
            }`}
          >
            🏛️ {t("nav.home")}
          </button>

          {/* My ABHA Portal */}
          <button
            type="button"
            onClick={() => handleTabClick("patient", "/patient")}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              resolvedTab === "patient"
                ? "bg-[#0f4c81] text-white font-bold shadow-xs"
                : "hover:bg-slate-200/60 text-gray-700"
            }`}
          >
            🪪 My ABHA
          </button>

          {/* Govt Schemes */}
          <button
            type="button"
            onClick={() => handleTabClick("schemes", "/his/schemes")}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              resolvedTab === "schemes"
                ? "bg-[#0f4c81] text-white font-bold shadow-xs"
                : "hover:bg-slate-200/60 text-gray-700"
            }`}
          >
            🛡️ {t("nav.schemes")}
          </button>

          {/* Prescription OCR & Jan Aushadhi Savings */}
          <button
            type="button"
            onClick={() => handleTabClick("ocr", "/his/ocr")}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              resolvedTab === "ocr"
                ? "bg-[#0f4c81] text-white font-bold shadow-xs"
                : "hover:bg-slate-200/60 text-gray-700"
            }`}
          >
            📄 Jan Aushadhi Savings
            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-full border border-emerald-300">
              85% Off
            </span>
          </button>

          {/* Tele-MANAS (14416) */}
          <button
            type="button"
            onClick={() => handleTabClick("telemanas", "/his/tele-manas")}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              resolvedTab === "telemanas"
                ? "bg-[#0f4c81] text-white font-bold shadow-xs"
                : "hover:bg-slate-200/60 text-gray-700"
            }`}
          >
            🧠 Tele-MANAS
            <span className="text-[9px] bg-teal-100 text-teal-800 font-extrabold px-1.5 py-0.5 rounded-full border border-teal-300">
              14416
            </span>
          </button>

          {/* AYUSH Health Profile */}
          <button
            type="button"
            onClick={() => handleTabClick("ayush", "/his/ayush")}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              resolvedTab === "ayush"
                ? "bg-[#0f4c81] text-white font-bold shadow-xs"
                : "hover:bg-slate-200/60 text-gray-700"
            }`}
          >
            🌿 AYUSH Health
          </button>

          {/* Live OPD Token Status */}
          <button
            type="button"
            onClick={() => handleTabClick("queue", "/his/queue")}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              resolvedTab === "queue"
                ? "bg-[#0f4c81] text-white font-bold shadow-xs"
                : "hover:bg-slate-200/60 text-gray-700"
            }`}
          >
            📱 My OPD Token
          </button>
        </nav>
      </div>

      {/* HIS Doctor & Staff Login Modal */}
      <HISAuthModal 
        isOpen={hisModalOpen}
        onClose={() => setHisModalOpen(false)}
        onSuccess={(user) => {
          setStaffUser(user);
          setActiveRole("staff");
          handleRoleChange("staff");
        }}
      />
    </header>
  );
}
