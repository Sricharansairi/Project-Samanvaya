"use client";

import { useState } from "react";
import { Mic, MicOff, Sparkles, ArrowRight, Clock, User, Users, CheckCircle2 } from "lucide-react";

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

  const timelineOptions = ["Today", "Few Days", "Weeks", "Months"];

  const handleMicToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        const spoken = "Mujhe do din se bukhar aur tez khansi hai";
        setComplaintText(spoken);
        setIsRecording(false);
        generateFollowupChips(spoken);
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  const generateFollowupChips = async (complaint: string) => {
    setIsGeneratingChips(true);
    if (complaint.toLowerCase().includes("chest pain") || complaint.toLowerCase().includes("chhati")) {
      onTriggerRedFlag();
      return;
    }
    
    setTimeout(() => {
      setDynamicChips([
        "Severe body ache & chills",
        "Loss of taste / smell",
        "Worse at night",
        "No chest pain"
      ]);
      setIsGeneratingChips(false);
    }, 1000);
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
    <div className="w-full space-y-5">
      
      {/* Joint-Family Speaker Switch Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
        <span className="font-semibold text-[#0f2942]">Who is currently answering?</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCurrentSpeaker("patient")}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentSpeaker === "patient" 
                ? "bg-[#0f4c81] text-white shadow-xs" 
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <User className="w-3.5 h-3.5" /> Patient (Self)
          </button>
          <button
            type="button"
            onClick={() => setCurrentSpeaker("caregiver")}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentSpeaker === "caregiver" 
                ? "bg-[#0f4c81] text-white shadow-xs" 
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Family Escort
          </button>
        </div>
      </div>

      {/* Voice Input & Text Box */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#0f2942] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0f4c81]" />
            Describe your main health issue / मुख्य लक्षण बताएं *
          </label>
          {isRecording && (
            <span className="text-xs text-red-600 font-bold animate-pulse flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Listening to voice...
            </span>
          )}
        </div>

        <textarea
          value={complaintText}
          onChange={(e) => setComplaintText(e.target.value)}
          placeholder="Speak or type how you are feeling (e.g. 'Mujhe do din se bukhar aur tez khansi hai')..."
          className="w-full h-24 bg-slate-50 border border-gray-300 rounded-lg p-3.5 text-xs sm:text-sm text-[#0f2942] font-medium focus:bg-white focus:ring-2 focus:ring-[#0f4c81] outline-none resize-none"
        />

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-gray-500">
            Voice noise suppression active • Speak in Hindi, Telugu, Tamil, etc.
          </p>
          <button
            type="button"
            onClick={handleMicToggle}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isRecording
                ? "bg-red-600 text-white animate-pulse shadow-sm"
                : "bg-[#0f4c81] hover:bg-blue-900 text-white shadow-sm"
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording ? "Stop Listening" : "Tap Mic to Speak"}
          </button>
        </div>
      </div>

      {/* Visual Timeline Scale */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0f4c81]" />
            <span className="text-xs font-bold text-[#0f2942]">Since when have you had these symptoms?</span>
          </div>
          <span className="text-xs font-bold text-[#0f4c81] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {timeline}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {timelineOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setTimeline(opt)}
              className={`py-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                timeline === opt
                  ? "bg-[#0f4c81] text-white border-[#0f4c81] shadow-xs"
                  : "bg-slate-50 border-gray-200 text-gray-700 hover:bg-slate-100"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Follow-up Parameter Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#0f2942]">
            Suggested Clinical Parameters {isGeneratingChips && "(Generating...)"}
          </span>
          <span className="text-gray-500 text-[11px]">Select all that apply</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {dynamicChips.map((chip) => {
            const isSelected = selectedChips.includes(chip);
            return (
              <button
                key={chip}
                type="button"
                onClick={() => toggleChip(chip)}
                className={`p-3 rounded-lg border text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-50 border-[#0f4c81] text-[#0f4c81] ring-1 ring-[#0f4c81]"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-slate-50"
                }`}
              >
                <span>{chip}</span>
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-[#0f4c81]" />
                ) : (
                  <span className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center text-gray-400 text-[10px]">+</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={handleProceed}
          className="bg-[#1d2d44] hover:bg-[#0f2942] text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 text-sm shadow-sm transition-colors cursor-pointer"
        >
          Proceed to AYUSH Pariksha <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
