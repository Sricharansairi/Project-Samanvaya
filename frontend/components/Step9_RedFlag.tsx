"use client";

import { motion } from "framer-motion";
import { AlertOctagon, PhoneCall, ArrowRight, ShieldAlert } from "lucide-react";

interface Step9Props {
  onDismiss: () => void;
}

export default function Step9_RedFlag({ onDismiss }: Step9Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center text-white"
    >
      <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(239,68,68,0.6)] animate-pulse">
        <AlertOctagon className="w-14 h-14 text-red-500" />
      </div>

      <span className="text-xs uppercase font-bold tracking-widest px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 mb-4">
        Emergency Red-Flag Triggered
      </span>

      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 max-w-xl">
        Immediate Nursing Attention Required
      </h1>

      <p className="text-gray-300 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
        Your reported symptoms indicate a potential high-acuity emergency (such as severe chest tightness or acute respiratory distress). 
        <br /><br />
        <strong className="text-red-400">Please do not wait in line.</strong> Walk immediately to the Nursing Triage Counter at Room #1.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button
          onClick={() => alert("Emergency Nurse Alert Broadcasted to Counter #1.")}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all"
        >
          <PhoneCall className="w-5 h-5" />
          Alert Floor Nurse Now
        </button>

        <button
          onClick={onDismiss}
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 px-6 py-4 rounded-xl text-xs transition-colors"
        >
          Return to Standard Intake
        </button>
      </div>
    </motion.div>
  );
}
