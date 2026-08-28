"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Sparkles, Volume2, ArrowRight, HeartPulse, Clock, HelpCircle } from "lucide-react";
import VoiceChip from "./VoiceChip";

interface Step5Props {
  onHistorySubmit: (historyData: {
    chiefComplaint: string;
    timeline: string;
    selectedChips: string[];
    isRedFlag: boolean;
  }) => void;
  onNext: () => void;
  onTriggerRedFlag: () => void;
}

export default function Step5_ConversationalHistory({ onHistorySubmit, onNext, onTriggerRedFlag }: Step5Props) {
  const [complaintText, setComplaintText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timeline, setTimeline] = useState("Few Days");
  const [dynamicChips, setDynamicChips] = useState<string[]>([
    "Since yesterday morning",
    "High fever with chills",
    "Dry continuous cough",
    "Shortness of breath (Dyspnea)"
  ]);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [isGeneratingChips, setIsGeneratingChips] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<"patient" | "caregiver">("patient");

  // Timeline Scale Options
  const timelineOptions = ["Today", "Few Days", "Weeks", "Months"];

  const handleMicToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate real-time browser speech capture with noise suppression
      setTimeout(() => {
        const spoken = "Mujhe do din se bukhar aur tez khansi hai";
        setComplaintText(spoken);
        setIsRecording(false);
        generateFollowupChips(spoken);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const generateFollowupChips = async (complaint: string) => {
    setIsGeneratingChips(true);
    // Check for red flags
    if (complaint.toLowerCase().includes("chest pain") || complaint.toLowerCase().includes("chhati")) {
      onTriggerRedFlag();
      return;
    }
    
    // Simulate dynamic follow-up generation (4-6 generated chips)
    setTimeout(() => {
      setDynamicChips([
        "Severe body ache & chills",
        "Loss of taste / smell",
        "Worse at night",
        "No chest pain"
      ]);
      setIsGeneratingChips(false);
    }, 1200);
  };

  const toggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter(c => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const handleProceed = () => {
    onHistorySubmit({
      chiefComplaint: complaintText || "Fever & Persistent Cough",
      timeline,
      selectedChips,
      isRedFlag: false
    });
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center w-full max-w-3xl"
    >
      <div className="text-center mb-4">
        <h2 className="text-3xl font-light mb-2">What brings you in today?</h2>
        <p className="text-gray-400 text-xs sm:text-sm max-w-md">
          Speak in your native dialect or tap the symptoms below. AI will structure your clinical history.
        </p>
      </div>

      {/* Joint-Family Speaker Switch */}
      <div className="w-full flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-4 py-2 mb-4 text-xs">
        <span className="text-gray-400">Currently Answering This Section:</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => setCurrentSpeaker("patient")}
            className={`px-3 py-1 rounded-lg transition-all font-medium ${
              currentSpeaker === "patient" ? "bg-[#C2CD93] text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            Patient (Self)
          </button>
          <button
            onClick={() => setCurrentSpeaker("caregiver")}
            className={`px-3 py-1 rounded-lg transition-all font-medium ${
              currentSpeaker === "caregiver" ? "bg-[#C891AA] text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            Accompanying Family Member / Escort
          </button>
        </div>
      </div>

      {/* Voice Input Card */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md mb-6 relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[#C2CD93] flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Live Conversational Dictation (Noise-Suppressed Web Audio)
          </span>
          {isRecording && (
            <span className="text-xs text-red-400 animate-pulse flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Recording...
            </span>
          )}
        </div>

        <textarea
          value={complaintText}
          onChange={(e) => setComplaintText(e.target.value)}
          placeholder="Describe how you are feeling (e.g. 'Mera gale me dard hai aur bukhar hai')..."
          className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#C2CD93] outline-none resize-none mb-4"
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Tap mic to speak in Hindi, Telugu, Tamil, or Bengali
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMicToggle}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all ${
              isRecording
                ? "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                : "bg-[#C2CD93] text-black border-[#C2CD93] hover:bg-[#b0bd82]"
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording ? "Listening..." : "Tap to Speak"}
          </motion.button>
        </div>
      </div>

      {/* Visual Symptom-Timeline Builder */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C891AA]" />
            <span className="text-xs font-medium text-white">Since when have you had these symptoms? (Visual Scale)</span>
          </div>
          <span className="text-xs text-[#C891AA] font-bold">{timeline}</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {timelineOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setTimeline(opt)}
              className={`py-3 rounded-xl border text-xs font-medium transition-all ${
                timeline === opt
                  ? "bg-[#C891AA]/20 border-[#C891AA] text-white shadow-[0_0_15px_rgba(200,145,170,0.3)]"
                  : "bg-black/30 border-white/10 text-gray-400 hover:bg-white/5"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Per-Complaint Follow-up Chips */}
      <div className="w-full mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-300">
            Suggested Follow-up Parameters {isGeneratingChips && "(Generating...)"}
          </span>
          <span className="text-[11px] text-gray-500">Tap to select all that apply</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dynamicChips.map((chip) => {
            const isSelected = selectedChips.includes(chip);
            return (
              <button
                key={chip}
                onClick={() => toggleChip(chip)}
                className={`p-3.5 rounded-xl border text-xs text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? "bg-[#C2CD93]/20 border-[#C2CD93] text-white shadow-[0_0_15px_rgba(194,205,147,0.2)]"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                <span>{chip}</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                  isSelected ? "bg-[#C2CD93] border-[#C2CD93] text-black font-bold" : "border-gray-600"
                }`}>
                  {isSelected ? "✓" : "+"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleProceed}
        className="w-full bg-[#C2CD93] hover:bg-[#b0bd82] text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(194,205,147,0.3)] transition-all"
      >
        Proceed to AYUSH Examination <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}
