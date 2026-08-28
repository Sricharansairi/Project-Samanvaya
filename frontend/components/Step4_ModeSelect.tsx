"use client";

import { Stethoscope, Leaf, Sparkles, ArrowRight } from "lucide-react";

interface Step4Props {
  onSelectMode: (mode: "allopathic" | "ayurvedic" | "integrated") => void;
  selectedMode: "allopathic" | "ayurvedic" | "integrated";
  onNext: () => void;
}

export default function Step4_ModeSelect({ onSelectMode, selectedMode, onNext }: Step4Props) {
  const modes = [
    {
      id: "integrated",
      title: "Integrated Samanvaya (Dual Engine)",
      subtitle: "Comprehensive Modern Triage + Ayurvedic Dashavidha Pariksha",
      icon: <Sparkles className="w-5 h-5 text-[#0f4c81]" />,
      badge: "Recommended for Indian OPDs",
      desc: "Captures presenting complaint via SOCRATES and runs non-invasive Prakriti/Agni lifestyle profiling."
    },
    {
      id: "allopathic",
      title: "Allopathic Emergency & Specialist",
      subtitle: "Modern Evidence-Based Clinical History",
      icon: <Stethoscope className="w-5 h-5 text-blue-700" />,
      badge: "Fast-Track Specialist",
      desc: "Focuses on acute symptoms, vital red flags, surgical history, and ICD-10/SNOMED mapping."
    },
    {
      id: "ayurvedic",
      title: "Ayurvedic Nidana & Pariksha",
      subtitle: "Traditional Holistic Examination",
      icon: <Leaf className="w-5 h-5 text-emerald-700" />,
      badge: "AYUSH OPDs",
      desc: "Detailed Rogi-Roga Pariksha, Ahara-Vihara habits, digestion, sleep, and seasonal dosha assessment."
    }
  ];

  const handleChoose = (modeId: "allopathic" | "ayurvedic" | "integrated") => {
    onSelectMode(modeId);
    onNext();
  };

  return (
    <div className="w-full space-y-4">
      
      <div className="text-xs text-gray-600 bg-slate-50 border border-slate-200 p-3 rounded-lg mb-2">
        Select the clinical history framework best suited for today's OPD consultation:
      </div>

      <div className="space-y-3.5">
        {modes.map((m) => {
          const isSelected = selectedMode === m.id;
          return (
            <div
              key={m.id}
              onClick={() => handleChoose(m.id as any)}
              className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-blue-50/40 border-[#0f4c81] shadow-xs ring-1 ring-[#0f4c81]"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mt-0.5 border border-blue-100">
                    {m.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#0f2942]">{m.title}</h4>
                      <span className="text-[10px] font-semibold text-[#0f4c81] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#0f4c81] font-semibold mt-0.5">{m.subtitle}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
