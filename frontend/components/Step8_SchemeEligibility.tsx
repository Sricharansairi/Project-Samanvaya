"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, ArrowRight, MessageCircle, Info } from "lucide-react";

interface Step8Props {
  onSchemeConfirmed: (scheme: string) => void;
  onNext: () => void;
  patientState?: string;
}

export default function Step8_SchemeEligibility({ onSchemeConfirmed, onNext, patientState = "Rajasthan" }: Step8Props) {
  const [selectedState, setSelectedState] = useState(patientState);
  const [selectedScheme, setSelectedScheme] = useState("Ayushman Bharat PM-JAY");

  const schemes = [
    {
      name: "Ayushman Bharat PM-JAY",
      state: "National",
      coverage: "₹5,00,000 / Family",
      type: "SECC-2011 / BPL Eligible",
      status: "Eligible (100% Free Treatment)",
      documents: ["Aadhaar Card", "Ration Card / PM-JAY Letter"]
    },
    {
      name: "Mukhyamantri Chiranjeevi Yojana",
      state: "Rajasthan",
      coverage: "₹25,00,000 / Family",
      type: "Universal State Scheme",
      status: "Eligible (Universal Coverage)",
      documents: ["Jan Aadhaar Card", "Resident ID"]
    },
    {
      name: "YSR Aarogyasri",
      state: "Andhra Pradesh",
      coverage: "₹25,00,000 / Family",
      type: "Income-Threshold (< ₹5L PA)",
      status: "Eligible",
      documents: ["Rice Ration Card", "Income Certificate"]
    },
    {
      name: "Swasthya Sathi",
      state: "West Bengal",
      coverage: "₹5,00,000 / Family",
      type: "Universal (Woman Head)",
      status: "Eligible",
      documents: ["Swasthya Sathi Smart Card"]
    }
  ];

  const handleSendWhatsapp = (schemeName: string) => {
    const message = encodeURIComponent(
      `🏥 Project Samanvaya Health Scheme Alert:\nYou are eligible for ${schemeName}!\n\n📋 Required Documents for Hospital Desk:\n1. Aadhaar Card\n2. Ration Card / Family Card\n\nPlease present this at the Hospital Welfare Counter for instant pre-authorization.`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleProceed = () => {
    onSchemeConfirmed(selectedScheme);
    onNext();
  };

  return (
    <div className="w-full space-y-6">
      
      {/* State Filter Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0f2942]">
          <Info className="w-4 h-4 text-[#0f4c81]" />
          <span>Select Patient Home State / Region:</span>
        </div>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-[#0f2942] font-semibold outline-none focus:ring-2 focus:ring-[#0f4c81]"
        >
          <option value="Rajasthan">Rajasthan (Chiranjeevi)</option>
          <option value="Andhra Pradesh">Andhra Pradesh (Aarogyasri)</option>
          <option value="West Bengal">West Bengal (Swasthya Sathi)</option>
          <option value="Maharashtra">Maharashtra (MJPJAY)</option>
          <option value="Tamil Nadu">Tamil Nadu (CMCHIS)</option>
          <option value="Karnataka">Karnataka (Arogya Bhagya)</option>
          <option value="National">National (PM-JAY / CGHS)</option>
        </select>
      </div>

      {/* Scheme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {schemes.map((scheme, idx) => {
          const isSelected = selectedScheme === scheme.name;
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
                    <span className="text-gray-700 font-medium">{scheme.type}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Eligibility Status:</span>
                    <span className="text-emerald-600 font-semibold">{scheme.status}</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Checklist Button */}
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

      {/* Rough Cost Estimator Card */}
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

      {/* Action Navigation Bar */}
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
