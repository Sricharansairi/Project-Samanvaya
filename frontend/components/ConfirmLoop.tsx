"use client";

import { Check, X, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface ConfirmLoopProps {
  statement: string;
  confidence?: number;
  onConfirm: () => void;
  onRetry: () => void;
  onBack: () => void;
}

export default function ConfirmLoop({ statement, confidence, onConfirm, onRetry, onBack }: ConfirmLoopProps) {
  const isLowConfidence = confidence !== undefined && confidence < 0.7;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border p-6 rounded-xl flex flex-col gap-4 max-w-sm w-full mx-auto shadow-xl ${isLowConfidence ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`}
    >
      {isLowConfidence && (
        <div className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full w-max mx-auto mb-2 uppercase tracking-wide">
          Low Confidence Match - Please Verify
        </div>
      )}
      
      <div className="text-center">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">You said:</p>
        <p className="text-xl text-gray-900 font-bold">"{statement}"</p>
      </div>
      
      <div className="flex items-center justify-center gap-6 mt-4">
        {/* Retry Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRetry}
          className="w-14 h-14 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-red-600 shadow-sm hover:bg-red-200 transition-colors"
        >
          <X className="w-8 h-8" />
        </motion.button>

        {/* Confirm Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onConfirm}
          className="w-20 h-20 rounded-full bg-green-100 border border-green-300 flex items-center justify-center text-green-600 shadow-md hover:bg-green-200 transition-colors"
        >
          <Check className="w-10 h-10" />
        </motion.button>

        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-14 h-14 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-600 shadow-sm hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
      </div>
      
      <p className="text-center text-gray-500 text-sm font-medium mt-2">Is this correct?</p>
    </motion.div>
  );
}
