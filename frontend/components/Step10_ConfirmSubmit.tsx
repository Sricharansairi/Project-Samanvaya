"use client";

import { useState } from "react";
import { Check, RotateCcw, Volume2, ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";

interface Step10Props {
  summaryData: {
    name: string;
    complaint: string;
    timeline: string;
    agni: string;
    nidra: string;
    scheme: string;
  };
  confidence?: number;
  onConfirm: () => void;
  onRetry: () => void;
  onBack: () => void;
}

export default function Step10_ConfirmSubmit({ summaryData, confidence, onConfirm, onRetry, onBack }: Step10Props) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Simulate fetching a real confidence score if one isn't passed for the demo
  const isLowConfidence = confidence !== undefined ? confidence < 0.7 : true; // Set to true for the demo to show it off

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
    <div className="w-full space-y-5">
      
      {/* Audio Readback Trigger */}
      <button
        type="button"
        onClick={playFullSummaryAudio}
        className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-[#0f4c81] font-semibold transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#0f4c81]" />
          <span>{isPlayingAudio ? "Reading case summary aloud..." : "Listen to full summary in your language (Audio Readback)"}</span>
        </div>
        <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-blue-200">
          Audio Verification
        </span>
      </button>

      {/* Structured Summary Table (Clean White UIDAI Card) */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-[#0f2942] uppercase tracking-wider border-b border-gray-100 pb-2">
          Structured Patient History Summary
        </h4>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500 font-medium">Patient Name & Profile:</span>
            <span className="text-[#0f2942] font-bold">{summaryData.name}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500 font-medium">Presenting Complaint (HPI):</span>
            <span className="text-[#0f2942] font-bold">{summaryData.complaint} ({summaryData.timeline})</span>
          </div>

          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500 font-medium">AYUSH Agni & Nidra:</span>
            <span className="text-emerald-800 font-bold">{summaryData.agni} | {summaryData.nidra}</span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-gray-500 font-medium">Verified Welfare Scheme:</span>
            <span className="text-[#0f4c81] font-bold">{summaryData.scheme}</span>
          </div>
        </div>
      </div>

      {/* 3-Button Confirm Loop (Green / Red / Back) */}
      <div className="space-y-2 pt-2">
        {isLowConfidence && (
          <div className="bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold px-3 py-2 rounded mb-2 flex items-center gap-2 shadow-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Low Confidence Semantic Match: Please verify carefully before confirming.</span>
          </div>
        )}
        <p className="text-xs font-bold text-[#0f2942]">Select Action:</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Green (Confirm) */}
          <button
            type="button"
            onClick={onConfirm}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Confirm & Get Token
          </button>

          {/* 2. Red (Retry / Edit) */}
          <button
            type="button"
            onClick={onRetry}
            className="bg-slate-100 hover:bg-slate-200 border border-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Re-speak / Edit
          </button>

          {/* 3. Back */}
          <button
            type="button"
            onClick={onBack}
            className="bg-white hover:bg-slate-50 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous Screen
          </button>
        </div>
      </div>

    </div>
  );
}
