"use client";

import { motion } from "framer-motion";
import { Globe2, ArrowRight, Volume2, CheckCircle2 } from "lucide-react";

interface Step1Props {
  onSelectLanguage: (lang: string) => void;
  selectedLanguage: string;
  onNext: () => void;
}

const LANGUAGES = [
  { code: "hi", name: "हिन्दी", english: "Hindi", welcome: "नमस्ते, समन्वय में आपका स्वागत है" },
  { code: "te", name: "తెలుగు", english: "Telugu", welcome: "నమస్కారం, సమన్వయకు స్వాగతం" },
  { code: "ta", name: "தமிழ்", english: "Tamil", welcome: "வணக்கம், சமன்வயாவிற்கு வரவேற்கிறோம்" },
  { code: "bn", name: "বাংলা", english: "Bengali", welcome: "নমস্কার, সমন্বয়ে আপনাকে স্বাগতম" },
  { code: "mr", name: "मराठी", english: "Marathi", welcome: "नमस्कार, समन्वयामध्ये आपले स्वागत आहे" },
  { code: "kn", name: "ಕನ್ನಡ", english: "Kannada", welcome: "ನಮಸ್ಕಾರ, ಸಮನ್ವಯಕ್ಕೆ ಸುಸ್ವಾಗತ" },
  { code: "en", name: "English", english: "English", welcome: "Welcome to Project Samanvaya" }
];

export default function Step1_Language({ onSelectLanguage, selectedLanguage, onNext }: Step1Props) {
  const playAudioGreeting = (welcomeText: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(welcomeText);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelect = (lang: typeof LANGUAGES[0]) => {
    onSelectLanguage(lang.code);
    playAudioGreeting(lang.welcome);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Informative Subheading */}
      <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#0f2942]">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-[#0f4c81]" />
          <span>Please choose your preferred regional language for voice-guided intake:</span>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1 rounded-md text-[11px] text-gray-600">
          <Volume2 className="w-3.5 h-3.5 text-[#0f4c81]" />
          <span>Tap any language to hear audio readback</span>
        </div>
      </div>

      {/* Language Tiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 w-full">
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang)}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? "bg-blue-50/50 border-[#0f4c81] shadow-sm ring-2 ring-[#0f4c81]"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:bg-slate-50/60"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-lg font-bold text-[#0f2942]">{lang.name}</span>
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-[#0f4c81]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <span className="text-xs text-gray-500 font-medium">{lang.english}</span>
            </button>
          );
        })}
      </div>

      {/* Action Button */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={onNext}
          className="bg-[#1d2d44] hover:bg-[#0f2942] text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 text-sm shadow-sm transition-colors cursor-pointer"
        >
          Proceed to Identification <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
