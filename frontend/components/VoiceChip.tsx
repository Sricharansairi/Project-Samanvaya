"use client";

import { Mic } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface VoiceChipProps {
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick: () => void;
  onVoiceInput?: () => void; // Triggered if user taps the mic on the chip
}

export default function VoiceChip({ label, icon, selected = false, onClick, onVoiceInput }: VoiceChipProps) {
  const [isRecording, setIsRecording] = useState(false);

  const handleVoice = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger the click on the whole chip
    setIsRecording(true);
    if (onVoiceInput) onVoiceInput();
    
    // Simulate recording stop after 2s for UI purposes
    setTimeout(() => setIsRecording(false), 2000);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
        selected
          ? "bg-[#C891AA]/20 border-[#C891AA] shadow-[0_0_15px_rgba(200,145,170,0.2)]"
          : "bg-white/5 border-white/10 hover:border-white/30"
      }`}
    >
      {/* Icon if provided */}
      {icon && (
        <span className={selected ? "text-[#C891AA]" : "text-gray-400"}>
          {icon}
        </span>
      )}
      
      {/* Label */}
      <span className={`font-medium ${selected ? "text-[#C891AA]" : "text-gray-300"}`}>
        {label}
      </span>

      {/* Voice Dictation Orb inside the chip */}
      {onVoiceInput && (
        <div 
          onClick={handleVoice}
          className={`ml-auto p-1.5 rounded-full transition-colors ${
            isRecording 
              ? "bg-red-500/20 text-red-400 animate-pulse" 
              : "bg-white/5 text-gray-500 hover:text-white"
          }`}
        >
          <Mic className="w-4 h-4" />
        </div>
      )}
    </motion.button>
  );
}
