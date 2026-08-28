"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Send, CheckCircle2, DollarSign, ArrowRight, ExternalLink, MessageCircle } from "lucide-react";

interface Step8Props {
  onSchemeConfirmed: (scheme: string) => void;
  onNext: () => void;
  patientState?: string;
}

export default function Step8_SchemeEligibility({ onSchemeConfirmed, onNext, patientState = "Rajasthan" }: Step8Props) {
  const [selectedState, setSelectedState] = useState(patientState);
  const [selectedScheme, setSelectedScheme] = useState("Ayushman Bharat PM-JAY (₹5L Coverage)");
  const [whatsappSent, setWhatsappSent] = useState(false);

  const schemes = [
    {
      name: "Ayushman Bharat PM-JAY",
      state: "National",
      coverage: "₹5,00,000 / Family",
      type: "SECC-2011 / BPL Eligible",
      status: "Eligible (100% Free Treatment)",
      documents: ["Aadhaar Card", "Ration Card / PM-JAY Card"]
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
    setWhatsappSent(true);
    // Instant WhatsApp Click-to-Chat / wa.me Deep Link
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center w-full max-w-3xl"
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-light mb-2">Government Scheme Eligibility</h2>
        <p className="text-gray-400 text-xs sm:text-sm max-w-md">
          Deterministic rules engine matching state and national welfare programs. Zero guesswork.
        </p>
      </div>

      {/* State Filter Selector */}
      <div className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 backdrop-blur-md">
        <span className="text-xs font-medium text-gray-300">Select State / Region:</span>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="bg-black/50 border border-[#C2CD93]/40 rounded-xl px-3 py-1.5 text-xs text-[#C2CD93] font-medium outline-none"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
        {schemes.map((scheme, idx) => {
          const isSelected = selectedScheme === scheme.name;
          return (
            <div
              key={idx}
              onClick={() => setSelectedScheme(scheme.name)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all backdrop-blur-md relative ${
                isSelected
                  ? "bg-white/10 border-[#C2CD93] shadow-[0_0_25px_rgba(194,205,147,0.25)]"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#C2CD93]" />
                  <span className="text-sm font-semibold text-white">{scheme.name}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C2CD93]/20 text-[#C2CD93] border border-[#C2CD93]/40">
                  {scheme.state}
                </span>
              </div>

              <div className="space-y-1 mb-4 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Coverage:</span>
                  <span className="text-white font-medium">{scheme.coverage}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Category:</span>
                  <span className="text-gray-300">{scheme.type}</span>
                </div>
                <div className="flex justify-between text-gray-400 pt-1">
                  <span>Status:</span>
                  <span className="text-[#C2CD93] font-bold">{scheme.status}</span>
                </div>
              </div>

              {/* WhatsApp Checklist Trigger Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendWhatsapp(scheme.name);
                }}
                className="w-full bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/50 py-2 rounded-xl text-xs font-semibold text-[#25D366] flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Send Checklist to WhatsApp (wa.me)
              </button>
            </div>
          );
        })}
      </div>

      {/* Rough Cost Estimator Card */}
      <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 mb-8 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400">Estimated Out-of-Pocket Hospital Cost:</p>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-2xl font-light text-[#C2CD93]">₹0 (Fully Covered)</span>
            <span className="text-xs text-gray-500 line-through">Without Scheme: ₹3,500 - ₹12,000</span>
          </div>
        </div>
        <span className="text-[11px] text-gray-400 max-w-xs text-center sm:text-right">
          Final coverage verified at hospital welfare desk.
        </span>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleProceed}
        className="w-full bg-[#C2CD93] hover:bg-[#b0bd82] text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(194,205,147,0.3)] transition-all"
      >
        Review & Confirm Triage Summary <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}
