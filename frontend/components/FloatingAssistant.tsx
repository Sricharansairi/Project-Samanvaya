"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Sparkles, Volume2, X } from "lucide-react";

interface FloatingAssistantProps {
  currentStep: number;
  onNavigate: (step: number) => void;
  onAction?: (action: string, value?: any) => void;
}

export default function FloatingAssistant({ currentStep, onNavigate, onAction }: FloatingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [assistantResponse, setAssistantResponse] = useState<string | null>(null);

  const startListening = () => {
    setIsListening(true);
    setTranscript("Listening... (Speak your command)");
    
    // Simulate speech recognition & fast Groq intent parsing
    setTimeout(() => {
      setTranscript("Checking government health scheme...");
      setAssistantResponse("Opening Scheme Eligibility checker now.");
      
      // Auto-trigger navigation if matching intent
      setTimeout(() => {
        setIsListening(false);
        if (onAction) onAction("open_scheme");
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-80 bg-black/80 backdrop-blur-xl border border-[#C2CD93]/40 rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] text-white"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C2CD93]" />
                <span className="text-sm font-medium tracking-wide">Samanvaya Voice AI</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300 mb-4 leading-relaxed">
              Say <span className="text-[#C2CD93]">"Open scheme check"</span>, <span className="text-[#C2CD93]">"Translate prescription"</span>, or <span className="text-[#C2CD93]">"Skip to doctor summary"</span>.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 min-h-[60px] flex items-center justify-center text-center">
              {isListening ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-4 bg-[#C2CD93] animate-pulse rounded-full" />
                    <span className="w-1.5 h-6 bg-[#C891AA] animate-pulse delay-75 rounded-full" />
                    <span className="w-1.5 h-3 bg-[#C2CD93] animate-pulse delay-150 rounded-full" />
                  </div>
                  <p className="text-xs text-gray-300">{transcript}</p>
                </div>
              ) : assistantResponse ? (
                <p className="text-xs text-[#C2CD93]">{assistantResponse}</p>
              ) : (
                <p className="text-xs text-gray-400">Tap mic below to speak</p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startListening}
                className={`p-3 rounded-full flex items-center justify-center border transition-all ${
                  isListening
                    ? "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                    : "bg-[#C2CD93]/20 border-[#C2CD93]/50 text-[#C2CD93] hover:bg-[#C2CD93]/30"
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Orb Trigger */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#1b2b1a] to-[#2d1b26] border border-[#C2CD93]/50 flex items-center justify-center text-white shadow-[0_0_30px_rgba(194,205,147,0.3)] backdrop-blur-md relative"
      >
        <Sparkles className="w-6 h-6 text-[#C2CD93]" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#C2CD93] rounded-full animate-ping" />
      </motion.button>
    </div>
  );
}
