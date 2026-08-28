"use client";

import { useState } from "react";
import { Flame, Moon, Utensils, HelpCircle, Volume2, ArrowRight, CheckCircle2 } from "lucide-react";

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
  const [dietHabits, setDietHabits] = useState("Wheat Roti & Dal");
  const [fastingObserved, setFastingObserved] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

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
    <div className="w-full space-y-5">
      
      {/* Audio Explanation Tooltip */}
      {activeTooltip && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start justify-between gap-3 text-xs text-[#0f4c81]">
          <div className="flex items-start gap-2">
            <Volume2 className="w-4 h-4 mt-0.5 text-[#0f4c81]" />
            <p className="font-semibold">{activeTooltip}</p>
          </div>
          <button onClick={() => setActiveTooltip(null)} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>
      )}

      {/* 1. Agni (Metabolic Fire) */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-bold text-[#0f2942]">How is your appetite and digestion? (Agni / अग्नि)</span>
          </div>
          <button
            type="button"
            onClick={() => handleWhyTooltip("Agni", "Ayurveda evaluates digestive fire because improper digestion creates Ama (metabolic toxins), which triggers fever and inflammation.")}
            className="text-[11px] text-[#0f4c81] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Why ask this?
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: "Sama (Normal & Balanced)", label: "Balanced / Normal", desc: "Hungry at regular intervals" },
            { id: "Tikshna (Hyperactive/Acidity)", label: "Sharp / Acidic", desc: "Burning sensation, intense hunger" },
            { id: "Manda (Sluggish/Bloated)", label: "Sluggish / Heavy", desc: "Bloating, poor digestion" }
          ].map((item) => {
            const isSelected = agni === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setAgni(item.id)}
                className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-50 border-[#0f4c81] ring-1 ring-[#0f4c81]"
                    : "bg-slate-50 border-gray-200 hover:bg-slate-100 text-gray-700"
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-bold text-[#0f2942]">{item.label}</p>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#0f4c81]" />}
                </div>
                <p className="text-[11px] text-gray-500">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Nidra (Sleep Quality) */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-purple-700" />
            <span className="text-xs font-bold text-[#0f2942]">How is your sleep quality? (Nidra / निद्रा)</span>
          </div>
          <button
            type="button"
            onClick={() => handleWhyTooltip("Nidra", "Sleep disturbances indicate Vata imbalances and neurological fatigue affecting overall immunity.")}
            className="text-[11px] text-[#0f4c81] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Why ask this?
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: "Sound Sleep (6-8 hrs)", label: "Sound & Deep" },
            { id: "Disturbed / Insomnia", label: "Disturbed / Broken" },
            { id: "Excessive Sleepiness", label: "Excessive / Lethargic" }
          ].map((item) => {
            const isSelected = nidra === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setNidra(item.id)}
                className={`py-2.5 px-2 rounded-lg border text-center text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-purple-50 border-purple-700 text-purple-900 ring-1 ring-purple-700"
                    : "bg-slate-50 border-gray-200 hover:bg-slate-100 text-gray-700"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Diet & Fasting (Ahara-Vihara) */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Utensils className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-bold text-[#0f2942]">Daily Dietary Habit (Region-Adapted)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {dietOptions.map((opt) => {
            const isSelected = dietHabits === opt.label;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => setDietHabits(opt.label)}
                className={`p-2.5 rounded-lg border text-center text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-50 border-emerald-700 text-emerald-900 ring-1 ring-emerald-700"
                    : "bg-slate-50 border-gray-200 hover:bg-slate-100 text-gray-700"
                }`}
              >
                <span className="text-lg">{opt.icon}</span>
                <span className="text-[11px] font-semibold">{opt.label}</span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <span className="text-xs text-gray-700 font-medium">
            Do you observe regular religious fasting? (Ramzan / Navratri / Ekadashi)
          </span>
          <input
            type="checkbox"
            checked={fastingObserved}
            onChange={(e) => setFastingObserved(e.target.checked)}
            className="accent-[#0f4c81] w-4 h-4 cursor-pointer"
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={handleProceed}
          className="bg-[#1d2d44] hover:bg-[#0f2942] text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 text-sm shadow-sm transition-colors cursor-pointer"
        >
          Proceed to Prescription Scan <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
