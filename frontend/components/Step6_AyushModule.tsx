"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Moon, Utensils, HelpCircle, Volume2, ArrowRight, Check } from "lucide-react";

interface Step6Props {
  onAyushSubmit: (ayushData: {
    agni: string;
    nidra: string;
    dietHabits: string;
    fastingObserved: boolean;
  }) => void;
  onNext: () => void;
  selectedLanguage?: string;
}

export default function Step6_AyushModule({ onAyushSubmit, onNext, selectedLanguage = "hi" }: Step6Props) {
  const [agni, setAgni] = useState("Sama (Normal & Balanced)");
  const [nidra, setNidra] = useState("Disturbed / Insomnia");
  const [dietHabits, setDietHabits] = useState("Warm cooked grains (Roti/Rice)");
  const [fastingObserved, setFastingObserved] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Region-adapted diet options based on selected language (North vs South)
  const isSouthRegion = ["te", "ta", "kn"].includes(selectedLanguage);
  const dietOptions = isSouthRegion
    ? [
        { label: "Rice, Sambar & Rasam", icon: "🍚" },
        { label: "Idli / Dosa & Coconut", icon: "🥥" },
        { label: "Spicy Tamarind Curry", icon: "🌶️" },
        { label: "Curd Rice & Buttermilk", icon: "🥛" }
      ]
    : [
        { label: "Wheat Roti & Dal", icon: "🫓" },
        { label: "Khichdi & Ghee", icon: "🥣" },
        { label: "Spicy Fried Curry", icon: "🌶️" },
        { label: "Lassi / Milk & Tea", icon: "☕" }
      ];

  const handleWhyTooltip = (topic: string, explanation: string) => {
    setActiveTooltip(explanation);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(explanation);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleProceed = () => {
    onAyushSubmit({
      agni,
      nidra,
      dietHabits,
      fastingObserved
    });
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
        <h2 className="text-3xl font-light mb-2">AYUSH Dashavidha Pariksha</h2>
        <p className="text-gray-400 text-xs sm:text-sm max-w-md">
          Non-invasive visual assessment of your metabolic fire (Agni), sleep (Nidra), and lifestyle (Ahara-Vihara).
        </p>
      </div>

      {/* "Why am I being asked this" Active Banner */}
      {activeTooltip && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-[#C891AA]/15 border border-[#C891AA]/40 rounded-xl p-3 mb-6 flex items-start gap-3 text-xs text-gray-200"
        >
          <Volume2 className="w-4 h-4 text-[#C891AA] mt-0.5 animate-pulse" />
          <p className="flex-1">{activeTooltip}</p>
          <button onClick={() => setActiveTooltip(null)} className="text-gray-400 hover:text-white">✕</button>
        </motion.div>
      )}

      {/* 1. Agni (Digestive Fire) */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#C2CD93]" />
            <span className="text-sm font-medium text-white">How is your digestion & appetite? (Agni)</span>
          </div>
          <button
            onClick={() => handleWhyTooltip("Agni", "Ayurveda evaluates digestive fire because improper digestion creates Ama (metabolic toxins), which triggers fever and inflammation.")}
            className="text-[11px] text-[#C2CD93] flex items-center gap-1 hover:underline"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Why ask this?
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: "Sama (Normal & Balanced)", label: "Balanced", desc: "Hungry at regular intervals" },
            { id: "Tikshna (Hyperactive/Acidity)", label: "Sharp / Acidic", desc: "Burning sensation, frequent hunger" },
            { id: "Manda (Sluggish/Bloated)", label: "Sluggish / Heavy", desc: "Bloating, lack of appetite" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setAgni(item.id)}
              className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
                agni === item.id
                  ? "bg-[#C2CD93]/20 border-[#C2CD93] text-white shadow-[0_0_15px_rgba(194,205,147,0.2)]"
                  : "bg-black/30 border-white/10 text-gray-400 hover:bg-white/5"
              }`}
            >
              <p className="font-medium text-white mb-0.5">{item.label}</p>
              <p className="text-[10px] text-gray-400">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Nidra (Sleep Pattern) */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-[#C891AA]" />
            <span className="text-sm font-medium text-white">How is your sleep quality? (Nidra)</span>
          </div>
          <button
            onClick={() => handleWhyTooltip("Nidra", "Sleep disturbances point to Vata imbalances and neurological fatigue affecting immunity.")}
            className="text-[11px] text-[#C891AA] flex items-center gap-1 hover:underline"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Why ask this?
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: "Sound Sleep (6-8 hrs)", label: "Sound & Deep" },
            { id: "Disturbed / Insomnia", label: "Disturbed / Broken" },
            { id: "Excessive Sleepiness", label: "Excessive / Lethargic" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setNidra(item.id)}
              className={`py-3 px-2 rounded-xl border text-center text-xs transition-all ${
                nidra === item.id
                  ? "bg-[#C891AA]/20 border-[#C891AA] text-white shadow-[0_0_15px_rgba(200,145,170,0.2)]"
                  : "bg-black/30 border-white/10 text-gray-400 hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Ahara-Vihara (Region-Adapted Diet & Fasting) */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#C2CD93]" />
            <span className="text-sm font-medium text-white">Primary Daily Diet Pattern (Region-Adapted)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {dietOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setDietHabits(opt.label)}
              className={`p-3 rounded-xl border text-center text-xs flex flex-col items-center gap-1.5 transition-all ${
                dietHabits === opt.label
                  ? "bg-[#C2CD93]/20 border-[#C2CD93] text-white"
                  : "bg-black/30 border-white/10 text-gray-400 hover:bg-white/5"
              }`}
            >
              <span className="text-xl">{opt.icon}</span>
              <span className="text-[11px] leading-tight">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Fasting & Religious Practice Toggle */}
        <div className="border-t border-white/10 pt-3 flex items-center justify-between">
          <span className="text-xs text-gray-300">
            Do you observe regular religious fasting? (Ramzan / Navratri / Ekadashi)
          </span>
          <input
            type="checkbox"
            checked={fastingObserved}
            onChange={(e) => setFastingObserved(e.target.checked)}
            className="accent-[#C2CD93] w-4 h-4 cursor-pointer"
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleProceed}
        className="w-full bg-[#C2CD93] hover:bg-[#b0bd82] text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(194,205,147,0.3)] transition-all"
      >
        Proceed to Prescription Scan <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}
