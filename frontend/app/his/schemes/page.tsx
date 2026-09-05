"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, 
  HelpCircle, FileText, Printer, Share2, PhoneCall, ExternalLink, 
  Info, ChevronRight, X, Sparkles, Building2, UserCheck, HeartPulse
} from "lucide-react";
import Link from "next/link";
import TrustBanner from "@/components/TrustBanner";
import { ALL_INDIA_SCHEMES, STATES_AND_UTS, SchemeDefinition } from "@/services/schemes_repository";

export default function SchemeNavigatorPage() {
  // State variables for operator/patient criteria
  const [selectedState, setSelectedState] = useState<string>("CENTRAL");
  const [age, setAge] = useState<number>(38);
  const [gender, setGender] = useState<"Male" | "Female" | "Any">("Any");
  const [income, setIncome] = useState<number>(120000);
  const [rationCard, setRationCard] = useState<string>("WHITE");
  const [clinicalCondition, setClinicalCondition] = useState<string>("ANY");
  const [isMigrant, setIsMigrant] = useState<boolean>(false);
  const [selectedScheme, setSelectedScheme] = useState<SchemeDefinition | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"docs" | "apply" | "claim">("docs");
  const [tickedDocs, setTickedDocs] = useState<Record<string, boolean>>({});
  const [activeTabFilter, setActiveTabFilter] = useState<"all" | "direct" | "conditional" | "relief">("all");

  // Real-time evaluation calculation (sub-50ms reactive)
  const evaluatedResults = useMemo(() => {
    const matched: {
      scheme: SchemeDefinition;
      status: "Directly Eligible" | "Conditionally Eligible" | "Relief Fund";
      reason: string;
    }[] = [];

    for (const scheme of ALL_INDIA_SCHEMES) {
      const e = scheme.eligibility;
      let eligible = true;
      let status: "Directly Eligible" | "Conditionally Eligible" | "Relief Fund" = "Directly Eligible";
      let matchReason = `Qualified under ${scheme.authority} guidelines for ${scheme.category.replace('_', ' ')}.`;

      // 1. State Domicile Check
      if (scheme.stateCode !== "CENTRAL" && scheme.stateCode !== selectedState) {
        eligible = false;
        continue;
      }

      // 2. Senior Citizen 70+ Check
      if (e.requiresSenior70) {
        if (age < 70) {
          eligible = false;
          continue;
        } else {
          status = "Directly Eligible";
          matchReason = "Age >= 70 unlocks universal Ayushman Vay Vandana cashless care irrespective of income.";
        }
      }

      // 3. Gender Check
      if (e.gender && e.gender !== "Any") {
        if (e.gender.toLowerCase() !== gender.toLowerCase()) {
          eligible = false;
          continue;
        }
      }

      // 4. Clinical Condition Check
      if (e.allowedConditions && !e.allowedConditions.includes("ANY")) {
        if (!e.allowedConditions.includes(clinicalCondition) && clinicalCondition !== "ANY") {
          status = "Conditionally Eligible";
          matchReason = `Requires clinical diagnosis of ${e.allowedConditions.join(" or ")}.`;
        }
      }

      // 5. Income Check
      if (income !== null && e.maxFamilyIncome) {
        if (income > e.maxFamilyIncome) {
          eligible = false;
          continue;
        }
      }

      // 6. Ration Card Check
      const allowedCards = e.allowedRationCards || ["ANY"];
      if (!allowedCards.includes("ANY")) {
        if (!allowedCards.includes(rationCard)) {
          if (scheme.category === "bpl_ration") {
            status = "Conditionally Eligible";
            matchReason = `Requires ${allowedCards.join(" or ")} ration card. If unavailable, apply with Tehsildar income certificate.`;
          }
        }
      }

      // 7. Relief Funds (RAN)
      if (scheme.category === "disease_specific" && scheme.id.includes("ran")) {
        status = "Relief Fund";
      }

      if (eligible) {
        matched.push({ scheme, status, reason: matchReason });
      }
    }

    // Sort: Directly Eligible first, then Conditionally Eligible, then by coverage amount descending
    matched.sort((a, b) => {
      if (a.status === "Directly Eligible" && b.status !== "Directly Eligible") return -1;
      if (b.status === "Directly Eligible" && a.status !== "Directly Eligible") return 1;
      return b.scheme.coverageAmount - a.scheme.coverageAmount;
    });

    const directCoverage = matched
      .filter(m => m.status === "Directly Eligible")
      .reduce((sum, m) => sum + m.scheme.coverageAmount, 0);

    return {
      matched,
      directCoverage
    };
  }, [selectedState, age, gender, income, rationCard, clinicalCondition, isMigrant]);

  const filteredSchemes = useMemo(() => {
    if (activeTabFilter === "direct") return evaluatedResults.matched.filter(m => m.status === "Directly Eligible");
    if (activeTabFilter === "conditional") return evaluatedResults.matched.filter(m => m.status === "Conditionally Eligible");
    if (activeTabFilter === "relief") return evaluatedResults.matched.filter(m => m.status === "Relief Fund");
    return evaluatedResults.matched;
  }, [evaluatedResults, activeTabFilter]);

  const toggleDoc = (docId: string) => {
    setTickedDocs(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `Project Samanvaya - Verified Health Schemes for Patient (Age ${age}, State: ${selectedState}):\n` +
      evaluatedResults.matched.map(m => `• ${m.scheme.name} (${m.scheme.coverageDisplay}) - ${m.status}`).join('\n') +
      `\nHelpline: 14555`;
    if (navigator.share) {
      navigator.share({ title: "Samanvaya Scheme Dossier", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Eligibility summary copied to clipboard! You can paste and share via WhatsApp.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans selection:bg-[#0f4c81] selection:text-white">
      {/* Official Top Trust Banner */}
      <TrustBanner currentTab="schemes" onTabChange={() => {}} onLanguageChange={() => {}} />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        
        {/* Top Breadcrumb & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 text-gray-500 hover:text-[#0f4c81] hover:bg-slate-100 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0f2942]">
                  Government Scheme & Claim Navigator
                </h1>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> All-India NHA Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Real-time eligibility calculation, required document checklists, and cashless claim guides across 36 States/UTs.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrintSlip}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer border border-gray-300"
            >
              <Printer className="w-4 h-4 text-gray-600" /> Print Dossier Slip
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <Share2 className="w-4 h-4" /> Share WhatsApp / SMS
            </button>
          </div>
        </div>

        {/* Live Protection Summary Banner */}
        <div className="bg-gradient-to-r from-[#0f4c81] to-[#1d2d44] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 text-white shrink-0">
              <HeartPulse className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-blue-200">
                Live Coverage Unlocked
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                ₹{evaluatedResults.directCoverage.toLocaleString("en-IN")} <span className="text-lg font-medium text-blue-200">Cashless Protection</span>
              </h2>
              <p className="text-xs text-blue-100 mt-1 flex items-center gap-2">
                <span>{evaluatedResults.matched.filter(m => m.status === "Directly Eligible").length} Schemes Directly Eligible</span>
                <span>•</span>
                <span>{evaluatedResults.matched.filter(m => m.status === "Conditionally Eligible").length} Conditionally Eligible</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/20 text-xs flex items-center gap-2 w-full sm:w-auto">
              <Building2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                <strong>National Portability:</strong> Active across 28,000+ Empaneled Hospitals nationwide
              </span>
            </div>
          </div>
        </div>

        {/* Two-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Operator & Patient Profile Form (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-base font-bold text-[#0f2942] mb-4 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#0f4c81]" />
                Patient & Domicile Criteria
              </h3>

              <div className="space-y-4 text-sm">
                
                {/* State Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    State / Union Territory of Residence
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl font-medium text-gray-800 focus:ring-2 focus:ring-[#0f4c81] focus:outline-none"
                  >
                    {STATES_AND_UTS.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name} {st.code !== "CENTRAL" ? `(${st.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Migrant Portability Toggle */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div>
                    <span className="text-xs font-bold text-[#0f4c81] block">Treated Outside Home State?</span>
                    <span className="text-[11px] text-gray-500">Migrant worker or emergency travel</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isMigrant}
                    onChange={(e) => setIsMigrant(e.target.checked)}
                    className="w-4 h-4 text-[#0f4c81] rounded focus:ring-blue-500"
                  />
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Age (Years) {age >= 70 && <span className="text-amber-600 font-bold">★ 70+ Senior</span>}
                    </label>
                    <input
                      type="number"
                      value={age}
                      min={0}
                      max={120}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl font-medium text-gray-800 focus:ring-2 focus:ring-[#0f4c81] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl font-medium text-gray-800 focus:ring-2 focus:ring-[#0f4c81] focus:outline-none"
                    >
                      <option value="Any">Any / All</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Ration Card Type */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Ration Card / NFSA Category
                  </label>
                  <select
                    value={rationCard}
                    onChange={(e) => setRationCard(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl font-medium text-gray-800 focus:ring-2 focus:ring-[#0f4c81] focus:outline-none"
                  >
                    <option value="WHITE">BPL / White Card (Low Income / NFSA)</option>
                    <option value="AAY">Antyodaya Anna Yojana (AAY - Poorest)</option>
                    <option value="PHH">Priority Household (PHH)</option>
                    <option value="YELLOW">Yellow Card (BPL - Maharashtra/Kerala)</option>
                    <option value="ORANGE">Orange Card (APL Subsidized)</option>
                    <option value="ANY">No Ration Card / General APL</option>
                  </select>
                </div>

                {/* Annual Income Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">Annual Family Income</label>
                    <span className="text-xs font-extrabold text-[#0f4c81]">₹{income.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min={30000}
                    max={1000000}
                    step={10000}
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full accent-[#0f4c81] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>₹30k (BPL)</span>
                    <span>₹1.2L (TN)</span>
                    <span>₹3L (Delhi)</span>
                    <span>₹10L+</span>
                  </div>
                </div>

                {/* Clinical Specialty / Diagnosis */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Clinical Concern / Required Procedure
                  </label>
                  <select
                    value={clinicalCondition}
                    onChange={(e) => setClinicalCondition(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl font-medium text-gray-800 focus:ring-2 focus:ring-[#0f4c81] focus:outline-none"
                  >
                    <option value="ANY">General Inpatient / Surgical</option>
                    <option value="Cardiology">Cardiology (Angioplasty / Bypass)</option>
                    <option value="Oncology">Oncology (Cancer Surgery / Chemotherapy)</option>
                    <option value="Nephrology/Dialysis">Nephrology (Kidney Dialysis / Transplant)</option>
                    <option value="Orthopedics">Orthopedics (Joint Replacement / Trauma)</option>
                    <option value="Maternity">Maternity (Delivery / C-Section / Newborn)</option>
                    <option value="TB">Tuberculosis (DOTS & Nutrition)</option>
                    <option value="Rare_Disease">Rare Disease (Genetic / Enzyme Therapy)</option>
                    <option value="Critical_Care">Critical Care / ICU / Trauma</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Quick Emergency Assistance Box */}
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs">
              <div className="flex items-center gap-2 text-amber-800 font-bold mb-1">
                <AlertCircle className="w-4 h-4" />
                Emergency Admission Rule
              </div>
              <p className="text-amber-900 leading-relaxed">
                Under Supreme Court & NHA guidelines, no empaneled hospital can deny emergency life-saving treatment due to missing physical cards. Emergency Pre-Auth can be generated with biometric verification within 24 hours of admission.
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic Matched Schemes (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: `All Eligible (${evaluatedResults.matched.length})` },
                { id: "direct", label: `Direct Cashless (${evaluatedResults.matched.filter(m => m.status === "Directly Eligible").length})` },
                { id: "conditional", label: `Conditional (${evaluatedResults.matched.filter(m => m.status === "Conditionally Eligible").length})` },
                { id: "relief", label: `Relief Funds (${evaluatedResults.matched.filter(m => m.status === "Relief Fund").length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTabFilter === tab.id
                      ? "bg-[#0f4c81] text-white shadow-sm"
                      : "bg-white text-gray-600 hover:bg-slate-100 border border-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Schemes Cards List */}
            <div className="space-y-4">
              {filteredSchemes.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
                  <HelpCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-700">No matching schemes for this specific filter</h4>
                  <p className="text-xs text-gray-500 mt-1">Try selecting 'All Eligible' or adjusting the income / clinical concern criteria.</p>
                </div>
              ) : (
                filteredSchemes.map(({ scheme, status, reason }, idx) => (
                  <motion.div
                    key={scheme.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col gap-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            status === "Directly Eligible"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : status === "Relief Fund"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {status}
                          </span>
                          
                          <span className="text-[11px] font-bold text-gray-600 bg-slate-100 px-2 py-0.5 rounded-md border border-gray-200">
                            {scheme.authority === "Central" ? "Central Government" : `State (${scheme.stateName})`}
                          </span>

                          {scheme.benefits.specialPerks && (
                            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                              {scheme.benefits.specialPerks.split(":")[0]}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-[#0f2942]">
                          {scheme.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {reason}
                        </p>
                      </div>

                      {/* Coverage Amount Badge */}
                      <div className="sm:text-right shrink-0 bg-blue-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                        <span className="text-[11px] text-gray-500 font-semibold block">Maximum Coverage</span>
                        <span className="text-lg sm:text-xl font-extrabold text-[#0f4c81]">
                          {scheme.coverageDisplay}
                        </span>
                      </div>
                    </div>

                    {/* Quick Specs Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2 border-y border-gray-100 bg-slate-50/50 p-2.5 rounded-xl">
                      <div>
                        <span className="text-gray-400 text-[10px] block">Hospitalization</span>
                        <span className="font-semibold text-gray-700">{scheme.benefits.cashlessInpatient ? "100% Cashless" : "Subsidized"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">Pre/Post Coverage</span>
                        <span className="font-semibold text-gray-700">{scheme.benefits.preHospitalizationDays}d Pre / {scheme.benefits.postHospitalizationDays}d Post</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">Pre-Auth Approval</span>
                        <span className="font-semibold text-gray-700">{scheme.claimProcess.approvalSLA}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">Helpline</span>
                        <span className="font-semibold text-[#0f4c81]">{scheme.helpline}</span>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 w-full sm:w-auto">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span>{scheme.requiredDocuments.mandatory.length} Mandatory Docs Required</span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedScheme(scheme);
                          setActiveModalTab("docs");
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#0f4c81] hover:bg-blue-900 text-white px-4 py-2 text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
                      >
                        View Required Docs & Claim Process
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Comprehensive Scheme Detail & Claim Process Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh] font-sans"
          >
            {/* Modal Header */}
            <div className="bg-[#0f4c81] p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                  {selectedScheme.authority} Government Scheme
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold mt-1.5 leading-tight">
                  {selectedScheme.name}
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Coverage: {selectedScheme.coverageDisplay} • Network: {selectedScheme.benefits.empaneledNetwork}
                </p>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer text-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Selector */}
            <div className="flex border-b border-gray-200 bg-slate-50 px-5">
              {[
                { id: "docs", label: "1. Required Documents Checklist" },
                { id: "apply", label: "2. How to Apply & Get Card" },
                { id: "claim", label: "3. Cashless Claim & Discharge" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveModalTab(tab.id as any)}
                  className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                    activeModalTab === tab.id
                      ? "border-[#0f4c81] text-[#0f4c81] bg-white shadow-xs"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 text-sm text-gray-700 space-y-6">
              
              {/* TAB 1: DOCUMENTS CHECKLIST */}
              {activeModalTab === "docs" && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-[#0f2942] uppercase tracking-wide mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Mandatory Verification Documents
                    </h4>
                    <div className="space-y-2.5">
                      {selectedScheme.requiredDocuments.mandatory.map((doc) => {
                        const isTicked = tickedDocs[doc.id] || false;
                        return (
                          <div
                            key={doc.id}
                            onClick={() => toggleDoc(doc.id)}
                            className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors cursor-pointer ${
                              isTicked ? "bg-emerald-50/70 border-emerald-300 text-emerald-900" : "bg-slate-50 border-gray-200 hover:bg-slate-100"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isTicked}
                              onChange={() => {}}
                              className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <div>
                              <span className="font-bold text-xs sm:text-sm block">{doc.name}</span>
                              <span className="text-xs text-gray-500 mt-0.5 block">{doc.helpText}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedScheme.requiredDocuments.conditional.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                        Supporting / Conditional Proofs (If Applicable)
                      </h4>
                      <div className="space-y-2">
                        {selectedScheme.requiredDocuments.conditional.map((doc) => (
                          <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-xs">
                            <span className="font-bold text-gray-800">{doc.name}: </span>
                            <span className="text-gray-500">{doc.helpText}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alternative Waivers */}
                  {Object.keys(selectedScheme.requiredDocuments.alternatives).length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900">
                      <div className="font-bold flex items-center gap-1.5 mb-1.5 text-[#0f4c81]">
                        <Info className="w-4 h-4" /> Missing Document Alternatives & Waivers:
                      </div>
                      {Object.entries(selectedScheme.requiredDocuments.alternatives).map(([k, v]) => (
                        <p key={k} className="mt-1 leading-relaxed">• {v}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: HOW TO APPLY */}
              {activeModalTab === "apply" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-3.5 bg-slate-100 rounded-xl text-xs font-semibold">
                    <span>Application Channel: <strong>{selectedScheme.applicationProcess.channel}</strong></span>
                    <span>Approval Time: <strong>{selectedScheme.applicationProcess.timeline}</strong></span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#0f2942] uppercase tracking-wide mb-3">
                      Step-by-Step Enrollment & Card Generation:
                    </h4>
                    <ol className="relative border-l border-gray-200 ml-3 space-y-4">
                      {selectedScheme.applicationProcess.steps.map((step, idx) => (
                        <li key={idx} className="mb-4 ml-6">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-[#0f4c81] text-white rounded-full -left-3 ring-4 ring-white text-xs font-bold">
                            {idx + 1}
                          </span>
                          <p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed">
                            {step}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="pt-2">
                    <a
                      href={selectedScheme.applicationProcess.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0f4c81] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Open Official Portal <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* TAB 3: CASHLESS CLAIM PROCESS */}
              {activeModalTab === "claim" && (
                <div className="space-y-5">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between">
                    <span>Claim Mode: <strong>{selectedScheme.claimProcess.mode}</strong></span>
                    <span>SLA: <strong>{selectedScheme.claimProcess.approvalSLA}</strong></span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#0f2942] uppercase tracking-wide mb-3">
                      From Hospital Admission to Zero-Bill Discharge:
                    </h4>
                    <ol className="relative border-l border-emerald-200 ml-3 space-y-4">
                      {selectedScheme.claimProcess.steps.map((step, idx) => (
                        <li key={idx} className="mb-4 ml-6">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-emerald-600 text-white rounded-full -left-3 ring-4 ring-white text-xs font-bold">
                            {idx + 1}
                          </span>
                          <p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed">
                            {step}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 text-xs">
                    <span className="font-bold text-gray-800 block mb-1">Key Procedures Covered:</span>
                    <p className="text-gray-600">{selectedScheme.benefits.keyProcedures.join(", ")}</p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-gray-600">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>Nodal Helpline: <strong>{selectedScheme.helpline}</strong></span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePrintSlip}
                  className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-slate-100 transition-colors"
                >
                  Print Action Slip
                </button>
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="w-full sm:w-auto px-5 py-2 bg-[#0f4c81] text-white rounded-xl font-bold hover:bg-blue-900 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Official Footer */}
      <footer className="w-full bg-[#1d2d44] text-white py-6 border-t border-gray-800 text-xs font-sans mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-200">
              समन्वय • Project Samanvaya Scheme Engine
            </p>
            <p className="text-gray-400 text-[11px] mt-1">
              National Health Authority (NHA) • Ministry of Health & Family Welfare
            </p>
          </div>
          <div className="flex items-center gap-4 text-gray-300 text-[11px]">
            <span>National Portability Active</span>
            <span>•</span>
            <span>Ayushman Bharat Digital Mission</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
