"use client";

import { useState } from "react";
import { Shield, CheckCircle2, ArrowRight, MessageCircle, Info, Filter, ExternalLink, HelpCircle } from "lucide-react";
import { SCHEME_DATABASE, STATES_AND_UTS, SchemeDefinition } from "@/services/schemes_repository";

interface Step8Props {
  onSchemeConfirmed: (scheme: string) => void;
  onNext: () => void;
  patientState?: string;
}

export default function Step8_SchemeEligibility({ onSchemeConfirmed, onNext, patientState = "National / Central Govt Schemes" }: Step8Props) {
  const [selectedStateName, setSelectedStateName] = useState(patientState);
  const [selectedSchemeName, setSelectedSchemeName] = useState("Ayushman Bharat PM-JAY (AB-PMJAY)");
  
  // Conditional form states
  const [rationCardType, setRationCardType] = useState("BPL");
  const [annualIncome, setAnnualIncome] = useState("< 2.5L");
  const [socialCategory, setSocialCategory] = useState("GENERAL");

  // Find schemes for selected state plus National/Central
  const relevantSchemes = SCHEME_DATABASE.filter((s: SchemeDefinition) => 
    s.stateName === selectedStateName || s.stateCode === "CENTRAL" || selectedStateName === "National / Central Govt Schemes"
  );

  const activeScheme: SchemeDefinition = relevantSchemes.find((s: SchemeDefinition) => s.name === selectedSchemeName) || relevantSchemes[0] || SCHEME_DATABASE[0];

  const handleSendWhatsapp = (scheme: SchemeDefinition) => {
    const docList = scheme.requiredDocuments.mandatory.map((d: any) => `- ${d.name}`).join("\n");
    const message = encodeURIComponent(
      `🏥 Project Samanvaya Health Scheme Alert:\nYou are eligible for ${scheme.name} (${scheme.coverageDisplay})!\n\n📋 Required Documents for Hospital Welfare Desk:\n${docList}\n\n🔗 Official Portal: ${scheme.officialPortal || scheme.applicationProcess.portalUrl}\n\nPlease present this at the Hospital Welfare Counter for instant pre-authorization.`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleProceed = () => {
    onSchemeConfirmed(activeScheme ? activeScheme.name : "Ayushman Bharat PM-JAY");
    onNext();
  };

  return (
    <div className="w-full space-y-6">
      
      {/* 1. State / UT Selection Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0f2942]">
          <Info className="w-4 h-4 text-[#0f4c81]" />
          <span>Patient Home State / Union Territory (36 States & UTs):</span>
        </div>
        <select
          value={selectedStateName}
          onChange={(e) => {
            const newSt = e.target.value;
            setSelectedStateName(newSt);
            const stateFirstScheme = SCHEME_DATABASE.find((s: SchemeDefinition) => s.stateName === newSt) || SCHEME_DATABASE[0];
            setSelectedSchemeName(stateFirstScheme.name);
          }}
          className="bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-[#0f2942] font-semibold outline-none focus:ring-2 focus:ring-[#0f4c81] max-w-xs cursor-pointer"
        >
          {STATES_AND_UTS.map((st) => (
            <option key={st.code} value={st.name}>
              {st.name}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Demographic / Income Filter Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-blue-50/50 border border-blue-200 rounded-xl p-4">
        <div>
          <label className="block text-[11px] font-bold text-[#0f2942] mb-1">Ration Card Category</label>
          <select 
            value={rationCardType} 
            onChange={e => setRationCardType(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#0f4c81]"
          >
            <option value="AAY">Antyodaya Anna Yojana (AAY / Yellow)</option>
            <option value="PHH">Priority Household (PHH / Pink)</option>
            <option value="BPL">Below Poverty Line (BPL / White)</option>
            <option value="APL">Above Poverty Line (APL / Green)</option>
            <option value="NONE">No Ration Card</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#0f2942] mb-1">Annual Family Income</label>
          <select 
            value={annualIncome} 
            onChange={e => setAnnualIncome(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#0f4c81]"
          >
            <option value="< 1L">Below ₹1,00,000</option>
            <option value="< 2.5L">₹1,00,000 - ₹2,50,000</option>
            <option value="2.5L - 5L">₹2,50,000 - ₹5,00,000</option>
            <option value="> 5L">Above ₹5,00,000</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#0f2942] mb-1">Social Category</label>
          <select 
            value={socialCategory} 
            onChange={e => setSocialCategory(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#0f4c81]"
          >
            <option value="GENERAL">General</option>
            <option value="OBC">Other Backward Class (OBC)</option>
            <option value="SC">Scheduled Caste (SC)</option>
            <option value="ST">Scheduled Tribe (ST)</option>
            <option value="EWS">Economically Weaker Section (EWS)</option>
          </select>
        </div>
      </div>

      {/* 3. Scheme Cards Grid (Dynamically filtered from SCHEME_DATABASE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {relevantSchemes.slice(0, 6).map((scheme: SchemeDefinition, idx: number) => {
          const isSelected = selectedSchemeName === scheme.name;
          const isUniversal = scheme.category === "universal";
          const isIncomeEligible = annualIncome === "< 1L" || annualIncome === "< 2.5L";
          const isEligible = isUniversal || isIncomeEligible || rationCardType === "AAY" || rationCardType === "BPL";

          return (
            <div
              key={scheme.id || idx}
              onClick={() => setSelectedSchemeName(scheme.name)}
              className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-blue-50/40 border-[#0f4c81] shadow-sm ring-1 ring-[#0f4c81]"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-[#0f4c81] text-white" : "bg-blue-50 text-[#0f4c81]"}`}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0f2942] leading-tight">{scheme.name}</h4>
                      <span className="text-[10px] text-gray-500 font-medium">{scheme.stateName} • {scheme.authority}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-[#0f4c81] shrink-0" />
                  )}
                </div>

                <div className="space-y-1.5 mb-4 text-xs bg-white p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between text-gray-500">
                    <span>Coverage:</span>
                    <span className="text-emerald-700 font-bold">{scheme.coverageDisplay}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Scheme Category:</span>
                    <span className="text-gray-700 font-medium capitalize">{scheme.category.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Eligibility Status:</span>
                    <span className={isEligible ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                      {isEligible ? "Eligible for Cashless Cover" : "Document Verification Needed"}
                    </span>
                  </div>
                  <div className="pt-1 text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-600">Key Documents: </span>
                    {scheme.requiredDocuments.mandatory.map((d: any) => d.name).join(", ")}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendWhatsapp(scheme);
                }}
                className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 py-2 rounded-lg text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                Send Document Checklist to WhatsApp
              </button>
            </div>
          );
        })}
      </div>

      {/* 4. Cashless Coverage Banner */}
      <div className="w-full bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-emerald-900">Estimated Out-of-Pocket Hospital Cost Under {activeScheme.shortCode || "Scheme"}:</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold text-emerald-800">₹0 (100% Cashless Coverage)</span>
            <span className="text-xs text-gray-400 line-through">Private Rate: ₹15,000 - ₹50,000</span>
          </div>
        </div>
        <span className="text-[11px] text-emerald-700 max-w-xs text-center sm:text-right font-medium">
          Instant pre-authorization code attached to ABDM queue token.
        </span>
      </div>

      {/* 5. Proceed Action */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={handleProceed}
          className="bg-[#1d2d44] hover:bg-[#0f2942] text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 text-sm shadow-sm transition-colors cursor-pointer"
        >
          Review & Confirm Intake Summary <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
