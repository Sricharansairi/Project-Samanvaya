"use client";

import { motion } from "framer-motion";
import { Stethoscope, Leaf, Sparkles, ArrowRight, Activity } from "lucide-react";

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
      icon: <Sparkles className="w-6 h-6 text-[#C2CD93]" />,
      badge: "Recommended for Indian OPDs",
      desc: "Captures presenting complaint via SOCRATES and runs non-invasive Prakriti/Agni lifestyle profiling."
    },
    {
      id: "allopathic",
      title: "Allopathic Emergency & Specialist",
      subtitle: "Modern Evidence-Based Clinical History",
      icon: <Stethoscope className="w-6 h-6 text-blue-400" />,
      badge: "Fast-Track Specialist",
      desc: "Focuses on acute symptoms, vital red flags, surgical history, and ICD-10/SNOMED mapping."
    },
    {
      id: "ayurvedic",
      title: "Ayurvedic Nidana & Pariksha",
      subtitle: "Traditional Holistic Examination",
      icon: <Leaf className="w-6 h-6 text-[#C891AA]" />,
      badge: "AYUSH OPDs",
      desc: "Detailed Rogi-Roga Pariksha, Ahara-Vihara habits, digestion, sleep, and seasonal dosha assessment."
    }
  ];

  const handleChoose = (modeId: "allopathic" | "ayurvedic" | "integrated") => {
    onSelectMode(modeId);
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center w-full max-w-3xl text-center"
    >
      <div className="mb-6">
        <h2 className="text-3xl font-light mb-2">Select Clinical Intake Mode</h2>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Project Samanvaya seamlessly bridges modern Allopathic emergency care with traditional AYUSH diagnostic frameworks.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full mb-8 text-left">
        {modes.map((m) => {
          const isSelected = selectedMode === m.id;
          return (
            <motion.div
              key={m.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleChoose(m.id as any)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all backdrop-blur-md relative overflow-hidden ${
                isSelected
                  ? "bg-white/10 border-[#C2CD93] shadow-[0_0_30px_rgba(194,205,147,0.2)]"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {m.badge && (
                <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#C2CD93]/20 text-[#C2CD93] border border-[#C2CD93]/40">
                  {m.badge}
                </span>
              )}

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
                  {m.icon}
                </div>
                <div className="flex-1 pr-20">
                  <h3 className="text-lg font-medium text-white mb-1">{m.title}</h3>
                  <p className="text-xs text-[#C2CD93] mb-2">{m.subtitle}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
