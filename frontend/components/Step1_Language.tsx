"use client";

import { motion } from "framer-motion";
import { HeartPulse, Globe2, ArrowRight, Volume2 } from "lucide-react";

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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center text-center w-full max-w-3xl"
    >
      <div className="w-20 h-20 rounded-full bg-[#C2CD93]/20 flex items-center justify-center border border-[#C2CD93]/40 shadow-[0_0_40px_rgba(194,205,147,0.3)] mb-6">
        <HeartPulse className="w-10 h-10 text-[#C2CD93]" />
      </div>

      <h1 className="text-4xl md:text-5xl font-light mb-3 tracking-tight">
        Welcome to <span className="font-medium text-[#C2CD93]">Samanvaya</span>
      </h1>
      <p className="text-gray-400 text-sm md:text-base max-w-lg mb-4">
        National Smart Patient Case-Taking & AYUSH-Allopathic Bridge. Choose your preferred language.
      </p>

      {/* Text-Only Quiet Mode Toggle */}
      <div className="flex items-center gap-2 mb-6 bg-black/40 border border-white/10 px-4 py-2 rounded-full text-xs text-gray-300">
        <Volume2 className="w-3.5 h-3.5 text-[#C2CD93]" />
        <span>Audio Mode Active</span>
        <span className="text-gray-500">•</span>
        <button
          onClick={() => alert("🔇 Quiet Mode Activated: 100% Touch & Text only (Zero audio dependencies). Accessible for hard-of-hearing patients.")}
          className="text-[#C891AA] hover:underline font-medium"
        >
          Switch to Silent / Quiet Mode
        </button>
      </div>

      {/* Language Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-8">
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <motion.button
              key={lang.code}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(lang)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all backdrop-blur-md ${
                isSelected
                  ? "bg-[#C2CD93]/20 border-[#C2CD93] text-white shadow-[0_0_25px_rgba(194,205,147,0.3)]"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xl font-medium">{lang.name}</span>
                <Volume2 className={`w-4 h-4 ${isSelected ? "text-[#C2CD93]" : "text-gray-500"}`} />
              </div>
              <span className="text-xs text-gray-400">{lang.english}</span>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onNext}
        className="bg-gradient-to-r from-[#C2CD93] to-[#8FA87B] text-black font-semibold px-10 py-4 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(194,205,147,0.4)] transition-all"
      >
        Proceed to Check-in <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}
