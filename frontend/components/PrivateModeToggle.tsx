"use client";

import { useState } from "react";
import { Headphones, EyeOff, UserCheck, Shield } from "lucide-react";

interface PrivateModeProps {
  onTogglePrivateMode: (isPrivate: boolean) => void;
  onFemaleStaffPreference: (preferred: boolean) => void;
}

export default function PrivateModeToggle({ onTogglePrivateMode, onFemaleStaffPreference }: PrivateModeProps) {
  const [isPrivate, setIsPrivate] = useState(false);
  const [preferFemaleStaff, setPreferFemaleStaff] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const togglePrivate = () => {
    const next = !isPrivate;
    setIsPrivate(next);
    onTogglePrivateMode(next);
  };

  const toggleStaff = () => {
    const next = !preferFemaleStaff;
    setPreferFemaleStaff(next);
    onFemaleStaffPreference(next);
  };

  return (
    <div className="fixed top-5 right-6 z-40">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`px-3.5 py-2 rounded-full border text-xs font-medium flex items-center gap-2 backdrop-blur-xl transition-all shadow-lg ${
            isPrivate || preferFemaleStaff
              ? "bg-[#C891AA]/20 border-[#C891AA] text-[#C891AA]"
              : "bg-white/5 border-white/15 text-gray-300 hover:bg-white/10"
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>{isPrivate ? "Private Mode Active" : "Modesty & Privacy Mode"}</span>
        </button>
      </div>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-72 bg-black/90 border border-white/15 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl text-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Privacy & Modesty Routing</span>
            <button onClick={() => setShowMenu(false)} className="text-gray-400 hover:text-white text-xs">✕</button>
          </div>

          <p className="text-[11px] text-gray-400">
            For sensitive reproductive, menstrual, or personal concerns in shared hospital halls.
          </p>

          <div className="border-t border-white/10 pt-2 space-y-2">
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span className="flex items-center gap-2">
                <Headphones className="w-3.5 h-3.5 text-[#C891AA]" /> Headphones Audio Only
              </span>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={togglePrivate}
                className="accent-[#C891AA]"
              />
            </label>

            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-[#C2CD93]" /> Prefer Female Staff
              </span>
              <input
                type="checkbox"
                checked={preferFemaleStaff}
                onChange={toggleStaff}
                className="accent-[#C2CD93]"
              />
            </label>

            {/* Discreet Distress Channel */}
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => alert("🛡️ Discreet Alert: A staff member has been notified to assist you in a private room. Please proceed normally.")}
                className="w-full text-left text-[11px] text-gray-400 hover:text-amber-300 py-1 flex items-center gap-1.5 transition-colors"
              >
                <span>🛡️ Request private consultation with nurse</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
