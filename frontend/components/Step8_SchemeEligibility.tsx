"use client";

import { useState } from "react";
import { Shield, CheckCircle2, ArrowRight, MessageCircle, Info } from "lucide-react";

interface Step8Props {
  onSchemeConfirmed: (scheme: string) => void;
  onNext: () => void;
  patientState?: string;
}

const SCHEME_DATA = [
  {
    name: "Ayushman Bharat PM-JAY",
    state: "National",
    coverage: "₹5,00,000 / Family",
    type: "income_based",
    statusText: "Subject to SECC-2011 / BPL Status",
    documents: ["Aadhaar Card", "PM-JAY Letter"]
  },
  {
    name: "Mukhyamantri Chiranjeevi Yojana",
    state: "Rajasthan",
    coverage: "₹25,00,000 / Family",
    type: "universal",
    statusText: "Eligible (Universal Coverage)",
    documents: ["Jan Aadhaar Card", "Resident ID"]
  },
  {
    name: "YSR Aarogyasri",
    state: "Andhra Pradesh",
    coverage: "₹25,00,000 / Family",
    type: "income_based",
    statusText: "Eligible if Income < ₹5L PA",
    documents: ["Rice Ration Card", "Income Certificate"]
  },
  {
    name: "Swasthya Sathi",
    state: "West Bengal",
    coverage: "₹5,00,000 / Family",
    type: "universal",
    statusText: "Eligible (Universal - Woman Head)",
    documents: ["Swasthya Sathi Smart Card"]
  }
];

const RATION_CARD_COLORS: Record<string, string[]> = {
  "Andhra Pradesh": ["White (BPL)", "Pink (APL)"],
  "Rajasthan": ["Blue", "Green", "Yellow"],
  "National": ["Yellow (BPL)", "Antyodaya (AAY)", "White (APL)"]
};

export default function Step8_SchemeEligibility({ onSchemeConfirmed, onNext, patientState = "Rajasthan" }: Step8Props) {
  const [selectedState, setSelectedState] = useState(patientState);
  const [selectedScheme, setSelectedScheme] = useState("Ayushman Bharat PM-JAY");
  
  // Conditional form states
  const [rationColor, setRationColor] = useState("");
  const [incomeBracket, setIncomeBracket] = useState("");

  const activeScheme = SCHEME_DATA.find(s => s.name === selectedScheme) || SCHEME_DATA[0];
  const requiresDetails = activeScheme.type === "income_based";
  const stateRationColors = RATION_CARD_COLORS[selectedState] || RATION_CARD_COLORS["National"];

  const handleSendWhatsapp = (schemeName: string) => {
    const message = encodeURIComponent(
      `🏥 Project Samanvaya Health Scheme Alert:\nYou are eligible for ${schemeName}!\n\n📋 Required Documents for Hospital Desk:\n- Aadhaar Card\n- Ration Card / Family ID\n\nPlease present this at the Hospital Welfare Counter for instant pre-authorization.`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleProceed = () => {
    onSchemeConfirmed(selectedScheme);
    onNext();
  };

  return (
    <div className="w-full space-y-6">
      
      {/* 1. State Filter Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0f2942]">
          <Info className="w-4 h-4 text-[#0f4c81]" />
          <span>Select Patient Home State / Region:</span>
        </div>
        <select
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            // Reset conditional fields on state change
            setRationColor("");
            setIncomeBracket("");
            // Auto-select a scheme for the new state if it exists, otherwise default to National
            const stateScheme = SCHEME_DATA.find(s => s.state === e.target.value);
            setSelectedScheme(stateScheme ? stateScheme.name : "Ayushman Bharat PM-JAY");
          }}
          className="bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-[#0f2942] font-semibold outline-none focus:ring-2 focus:ring-[#0f4c81]"
        >
          <option value="Rajasthan">Rajasthan</option>
          <option value="Andhra Pradesh">Andhra Pradesh</option>
          <option value="West Bengal">West Bengal</option>
          <option value="National">Other (National Schemes)</option>
        </select>
      </div>

      {/* 2. Conditional Fields (Only shown for Income/Ration Card based schemes) */}
      {requiresDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
           <div>
             <label className="block text-[11px] font-bold text-orange-900 mb-1">Ration Card Color (State Specific)</label>
             <select 
                value={rationColor} 
                onChange={e => setRationColor(e.target.value)}
                className="w-full bg-white border border-orange-200 rounded-md px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">-- Select Color --</option>
                {stateRationColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
             </select>
           </div>
           <div>
             <label className="block text-[11px] font-bold text-orange-900 mb-1">Annual Family Income</label>
             <select 
                value={incomeBracket} 
                onChange={e => setIncomeBracket(e.target.value)}
                className="w-full bg-white border border-orange-200 rounded-md px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">-- Select Bracket --</option>
                <option value="< 1L">Below ₹1,00,000</option>
                <option value="1L - 5L">₹1,00,000 - ₹5,00,000</option>
                <option value="> 5L">Above ₹5,00,000</option>
             </select>
           </div>
        </div>
      )}

      {/* 3. Scheme Cards Grid (Filtered) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {SCHEME_DATA.filter(s => s.state === selectedState || s.state === "National").map((scheme, idx) => {
          const isSelected = selectedScheme === scheme.name;
          const isActuallyEligible = scheme.type === "universal" || (scheme.type === "income_based" && incomeBracket === "< 1L");

          return (
            <div
              key={idx}
              onClick={() => setSelectedScheme(scheme.name)}
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
                      <h4 className="text-sm font-bold text-[#0f2942]">{scheme.name}</h4>
                      <span className="text-[10px] text-gray-500 font-medium">{scheme.state} Welfare</span>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-[#0f4c81]" />
                  )}
                </div>

                <div className="space-y-1.5 mb-4 text-xs bg-white p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between text-gray-500">
                    <span>Coverage:</span>
                    <span className="text-emerald-700 font-bold">{scheme.coverage}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Rule Category:</span>
                    <span className="text-gray-700 font-medium">{scheme.type === 'universal' ? 'Universal State Scheme' : 'Income & Ration Card'}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Status:</span>
                    <span className={isActuallyEligible || scheme.type === 'universal' ? "text-emerald-600 font-semibold" : "text-orange-600 font-semibold"}>
                      {scheme.type === 'universal' ? 'Eligible (Universal)' : (rationColor ? (isActuallyEligible ? 'Eligible' : 'Check Pending') : 'Input Required')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendWhatsapp(scheme.name);
                }}
                className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 py-2 rounded-lg text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                Send Document Checklist to WhatsApp
              </button>
            </div>
          );
        })}
      </div>

      <div className="w-full bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-emerald-900">Estimated Out-of-Pocket Hospital Cost:</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold text-emerald-800">₹0 (100% Fully Covered)</span>
            <span className="text-xs text-gray-400 line-through">Standard: ₹3,500 - ₹12,000</span>
          </div>
        </div>
        <span className="text-[11px] text-emerald-700 max-w-xs text-center sm:text-right font-medium">
          Instant pre-authorization code attached to queue token.
        </span>
      </div>

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
