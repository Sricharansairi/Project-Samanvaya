"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center w-full max-w-2xl"
    >
      <div className="w-16 h-16 rounded-full bg-[#C2CD93]/20 border border-[#C2CD93]/40 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(194,205,147,0.3)]">
        <ShieldCheck className="w-8 h-8 text-[#C2CD93]" />
      </div>

      <div className="text-center mb-6">
        <h2 className="text-3xl font-light mb-2">Digital Consent & DPDP Privacy</h2>
        <p className="text-gray-400 text-xs sm:text-sm max-w-md">
          Compliant with India's Digital Personal Data Protection (DPDP) Act 2023. You have full control over your health information.
        </p>
      </div>

      {/* Audio Narrator Bar */}
      <button
        onClick={narrateConsent}
        className="w-full bg-[#C2CD93]/10 border border-[#C2CD93]/30 rounded-xl p-3 mb-6 flex items-center justify-center gap-3 text-xs text-[#C2CD93] hover:bg-[#C2CD93]/20 transition-colors"
      >
        <Volume2 className="w-4 h-4 animate-bounce" />
        <span>{isPlayingAudio ? "Speaking consent in your language..." : "Tap to listen to consent in your language (Audio Narration)"}</span>
      </button>

      {/* Granular Toggles */}
      <div className="w-full space-y-3 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#C2CD93] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Voice & Audio Recording Consent</p>
              <p className="text-xs text-gray-400">Used strictly to transcribe symptoms; raw audio is immediately deleted.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={audioConsent}
            onChange={(e) => setAudioConsent(e.target.checked)}
            className="accent-[#C2CD93] w-5 h-5 cursor-pointer"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-[#C891AA] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Document & Prescription OCR Scan</p>
              <p className="text-xs text-gray-400">Allow AI to extract previous medications to check for drug allergies & interactions.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={docScanConsent}
            onChange={(e) => setDocScanConsent(e.target.checked)}
            className="accent-[#C891AA] w-5 h-5 cursor-pointer"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#C2CD93] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Govt Scheme Eligibility Screening</p>
              <p className="text-xs text-gray-400">Pre-screen for Ayushman Bharat PM-JAY and state welfare subsidies.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={schemeConsent}
            onChange={(e) => setSchemeConsent(e.target.checked)}
            className="accent-[#C2CD93] w-5 h-5 cursor-pointer"
          />
        </div>
      </div>

      {/* Explicit Tap Requirement (Legally Defensible) */}
      <div 
        onClick={() => setExplicitTapGiven(!explicitTapGiven)}
        className={`w-full p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all mb-6 ${
          explicitTapGiven 
            ? "bg-[#C2CD93]/20 border-[#C2CD93] shadow-[0_0_20px_rgba(194,205,147,0.25)]" 
            : "bg-white/5 border-red-500/40 hover:bg-white/10"
        }`}
      >
        <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${explicitTapGiven ? "bg-[#C2CD93] border-[#C2CD93]" : "border-gray-500"}`}>
          {explicitTapGiven && <CheckCircle2 className="w-4 h-4 text-black" />}
        </div>
        <p className="text-xs text-gray-200">
          <span className="font-semibold text-white">MANDATORY PHYSICAL TAP:</span> I hereby give informed consent for AI-assisted anamnesis and clinical data processing.
        </p>
      </div>

      <motion.button
        whileHover={{ scale: explicitTapGiven ? 1.03 : 1 }}
        whileTap={{ scale: explicitTapGiven ? 0.97 : 1 }}
        disabled={!explicitTapGiven}
        onClick={handleProceed}
        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
          explicitTapGiven
            ? "bg-[#C2CD93] text-black shadow-[0_0_25px_rgba(194,205,147,0.4)] cursor-pointer"
            : "bg-white/10 text-gray-500 cursor-not-allowed border border-white/10"
        }`}
      >
        Confirm Consent & Enter Triage <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}
