"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, RotateCcw, Volume2, ArrowLeft, ShieldCheck, HeartPulse, FileText } from "lucide-react";

interface Step10Props {
  summaryData: {
    name: string;
    complaint: string;
    timeline: string;
    agni: string;
    nidra: string;
    scheme: string;
  };
  onConfirm: () => void;
  onRetry: () => void;
  onBack: () => void;
}

export default function Step10_ConfirmSubmit({ summaryData, onConfirm, onRetry, onBack }: Step10Props) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const playFullSummaryAudio = () => {
    setIsPlayingAudio(true);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = `Patient ${summaryData.name}. Chief complaint is ${summaryData.complaint}, lasting for ${summaryData.timeline}. Digestion is ${summaryData.agni}, sleep is ${summaryData.nidra}. Eligible for ${summaryData.scheme}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center w-full max-w-2xl text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[#C2CD93]/20 border border-[#C2CD93]/40 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(194,205,147,0.3)]">
        <ShieldCheck className="w-8 h-8 text-[#C2CD93]" />
      </div>

      <h2 className="text-3xl font-light mb-2">Confirm Your Case Summary</h2>
      <p className="text-gray-400 text-xs sm:text-sm max-w-md mb-6">
        Please review what AI structured from your interview before submitting to the doctor.
      </p>

      {/* Audio Readback Trigger */}
      <button
        onClick={playFullSummaryAudio}
        className="w-full bg-[#C2CD93]/10 border border-[#C2CD93]/30 rounded-xl p-3 mb-6 flex items-center justify-center gap-2 text-xs text-[#C2CD93] hover:bg-[#C2CD93]/20 transition-colors"
      >
        <Volume2 className="w-4 h-4 animate-pulse" />
        <span>{isPlayingAudio ? "Reading summary aloud..." : "Listen to full summary in your language (Audio Readback)"}</span>
      </button>

      {/* Structured Summary Card */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md mb-8 text-left space-y-4">
        <div className="flex justify-between border-b border-white/10 pb-3">
          <span className="text-xs text-gray-400">Patient Profile:</span>
          <span className="text-xs font-medium text-white">{summaryData.name}</span>
        </div>

        <div className="flex justify-between border-b border-white/10 pb-3">
          <span className="text-xs text-gray-400">Chief Complaint (HPI):</span>
          <span className="text-xs font-medium text-white">{summaryData.complaint} ({summaryData.timeline})</span>
        </div>

        <div className="flex justify-between border-b border-white/10 pb-3">
          <span className="text-xs text-gray-400">AYUSH Agni & Nidra:</span>
          <span className="text-xs font-medium text-[#C891AA]">{summaryData.agni} | {summaryData.nidra}</span>
        </div>

        <div className="flex justify-between pb-1">
          <span className="text-xs text-gray-400">Matched Health Scheme:</span>
          <span className="text-xs font-semibold text-[#C2CD93]">{summaryData.scheme}</span>
        </div>
      </div>

      {/* The Universal Green / Red / Back Confirm Loop */}
      <div className="w-full space-y-3">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
          Assistant Confirmation Action
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Green (Confirm) */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(34,197,94,0.4)] transition-all"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            Confirm & Generate Token
          </motion.button>

          {/* 2. Red (Retry / Re-listen without wiping) */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onRetry}
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Re-speak / Edit
          </motion.button>

          {/* 3. Back (Steps back without wiping answers) */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBack}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Screens
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
