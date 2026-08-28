"use client";

import { Check, X, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface ConfirmLoopProps {
  statement: string;
  onConfirm: () => void;
  onRetry: () => void;
  onBack: () => void;
}

export default function ConfirmLoop({ statement, onConfirm, onRetry, onBack }: ConfirmLoopProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md flex flex-col gap-4 max-w-sm w-full mx-auto shadow-2xl"
    >
      <div className="text-center">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">You said:</p>
        <p className="text-lg text-white font-medium">"{statement}"</p>
      </div>
      
      <div className="flex items-center justify-center gap-4">
        {/* Retry Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRetry}
          className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          <X className="w-6 h-6" />
        </motion.button>

        {/* Confirm Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onConfirm}
          className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
        >
          <Check className="w-8 h-8" />
        </motion.button>

        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-12 h-12 rounded-full bg-gray-500/20 border border-gray-500/50 flex items-center justify-center text-gray-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      </div>
      
      <p className="text-center text-gray-500 text-xs">Is this correct?</p>
    </motion.div>
  );
}
