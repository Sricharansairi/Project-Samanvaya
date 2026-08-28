"use client";

import { useState } from "react";
import { ShieldCheck, Volume2, Lock, FileText, CheckCircle2, ArrowRight } from "lucide-react";

interface Step3Props {
  onConsentGiven: () => void;
  onNext: () => void;
}

export default function Step3_Consent({ onConsentGiven, onNext }: Step3Props) {
  const [audioConsent, setAudioConsent] = useState(true);
  const [docScanConsent, setDocScanConsent] = useState(true);
  const [schemeConsent, setSchemeConsent] = useState(true);
  const [explicitTapGiven, setExplicitTapGiven] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const narrateConsent = () => {
    setIsPlayingAudio(true);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = "Your health data is protected under the Digital Personal Data Protection Act. We will record your symptoms and scan prescriptions only to assist your doctor. Raw recordings are deleted immediately.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleProceed = () => {
    if (!explicitTapGiven) return;
    onConsentGiven();
    onNext();
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Audio Narrator Bar */}
      <button
        type="button"
        onClick={narrateConsent}
        className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-[#0f4c81] font-semibold transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#0f4c81]" />
          <span>{isPlayingAudio ? "Speaking consent terms aloud..." : "Tap to listen to consent terms in your language (Audio Narration)"}</span>
        </div>
        <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-blue-200">
          Audio Support
        </span>
      </button>

      {/* Granular Toggles in Clean White Cards */}
      <div className="space-y-3">
        
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0f4c81] flex items-center justify-center mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0f2942]">Voice & Audio Recording Consent</p>
              <p className="text-[11px] text-gray-500">Used strictly to transcribe symptoms; raw audio waveforms are immediately purged.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={audioConsent}
            onChange={(e) => setAudioConsent(e.target.checked)}
            className="accent-[#0f4c81] w-4 h-4 cursor-pointer"
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0f2942]">Prescription & Document Scan</p>
              <p className="text-[11px] text-gray-500">Allow OCR to extract past medications for drug allergy & Jan Aushadhi generic savings.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={docScanConsent}
            onChange={(e) => setDocScanConsent(e.target.checked)}
            className="accent-[#0f4c81] w-4 h-4 cursor-pointer"
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0f2942]">Govt Welfare Scheme Screening</p>
              <p className="text-[11px] text-gray-500">Pre-screen for Ayushman Bharat PM-JAY (₹5L) and state government subsidies.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={schemeConsent}
            onChange={(e) => setSchemeConsent(e.target.checked)}
            className="accent-[#0f4c81] w-4 h-4 cursor-pointer"
          />
        </div>

      </div>

      {/* Mandatory Physical Tap (DPDP Act 2023 Compliance) */}
      <div 
        onClick={() => setExplicitTapGiven(!explicitTapGiven)}
        className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
          explicitTapGiven 
            ? "bg-emerald-50 border-emerald-400 text-emerald-900" 
            : "bg-slate-50 border-gray-300 hover:bg-slate-100 text-gray-700"
        }`}
      >
        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${explicitTapGiven ? "bg-emerald-700 border-emerald-700 text-white" : "border-gray-400 bg-white"}`}>
          {explicitTapGiven && <CheckCircle2 className="w-3.5 h-3.5" />}
        </div>
        <p className="text-xs font-semibold">
          <span>MANDATORY PHYSICAL TAP:</span> I hereby give informed consent for AI-assisted anamnesis and clinical case-taking.
        </p>
      </div>

      {/* Action Button */}
      <div className="pt-2 flex justify-end">
        <button
          disabled={!explicitTapGiven}
          onClick={handleProceed}
          className={`py-3 px-8 rounded-lg font-semibold flex items-center gap-2 text-sm shadow-sm transition-all ${
            explicitTapGiven
              ? "bg-[#1d2d44] hover:bg-[#0f2942] text-white cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Confirm Consent & Proceed <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
