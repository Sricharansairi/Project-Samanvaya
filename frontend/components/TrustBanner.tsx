"use client";

import { ShieldCheck, EarOff, UserRound } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function TrustBanner() {
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [preferFemaleStaff, setPreferFemaleStaff] = useState(false);

  return (
    <div className="w-full flex flex-col items-center sticky top-0 z-50">
      {/* Top Banner */}
      <div className="w-full bg-[#C2CD93]/20 border-b border-[#C2CD93]/30 backdrop-blur-md text-[#C2CD93] text-sm py-2 px-4 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#C2CD93]" />
        <span className="font-medium">A nurse reviews everything you tell this screen.</span>
      </div>

      {/* Modesty / Privacy Controls (Floating just below banner) */}
      <div className="mt-2 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPrivateMode(!isPrivateMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-colors ${
            isPrivateMode 
              ? "bg-[#C891AA]/20 border-[#C891AA] text-[#C891AA]" 
              : "bg-white/5 border-white/10 text-gray-400"
          }`}
        >
          <EarOff className="w-3 h-3" />
          {isPrivateMode ? "Private Mode Active (Text Only)" : "Enable Private Mode"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPreferFemaleStaff(!preferFemaleStaff)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-colors ${
            preferFemaleStaff 
              ? "bg-[#C891AA]/20 border-[#C891AA] text-[#C891AA]" 
              : "bg-white/5 border-white/10 text-gray-400"
          }`}
        >
          <UserRound className="w-3 h-3" />
          Prefer Female Staff
        </motion.button>
      </div>
    </div>
  );
}
