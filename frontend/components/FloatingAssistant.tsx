"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Sparkles, X, Send, Bot, Loader2 } from "lucide-react";

import { useRouter, usePathname } from "next/navigation";

interface FloatingAssistantProps {
  currentStep?: number;
  onNavigate?: (step: number) => void;
  onAction?: (action: string, value?: any) => void;
  onLanguageChange?: (lang: string) => void;
}

export default function FloatingAssistant({ currentStep = 1, onNavigate, onAction, onLanguageChange }: FloatingAssistantProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [ambiguousOptions, setAmbiguousOptions] = useState<{label: string, action: () => void}[]>([]);

  const [assistantResponse, setAssistantResponse] = useState<string | null>(
    "Hello! I am Samanvaya Voice AI. You can say 'Open schemes', 'Change to Hindi', 'Doctor view', or 'Scan prescription'."
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Function to play audio from base64
  const playAudioBase64 = (base64Audio: string) => {
    if (!base64Audio) return;
    try {
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      audio.play();
    } catch (e) {
      console.error("Failed to play audio response", e);
    }
  };

  // Transcribe audio using backend (NVIDIA NIM Whisper API)
  const transcribeAudioBlob = async (blob: Blob) => {
    setIsProcessing(true);
    setAssistantResponse("Transcribing audio via Whisper...");
    try {
      const formData = new FormData();
      formData.append("file", blob, "audio.webm");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/voice/transcribe`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const transcribedText = data.text || "";
      setUserInput(transcribedText);
      if (transcribedText) {
        processCommand(transcribedText);
      } else {
        setAssistantResponse("Sorry, I didn't catch that. Please try again.");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      setAssistantResponse("Error transcribing audio. Check API connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Speak text using backend (NVIDIA NIM Magpie TTS)
  const speakText = async (text: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/voice/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.base64_audio) {
        playAudioBase64(data.base64_audio);
      }
    } catch (err) {
      console.error("TTS error:", err);
    }
  };

  // Autonomous Natural Language Command Processor
  const processCommand = (cmd: string) => {
    const text = cmd.toLowerCase().trim();
    if (!text) return;

    let reply = "";
    setAmbiguousOptions([]);

    // 1. Language Switching Commands
    if (text.includes("hindi") || text.includes("हिन्दी")) {
      if (onLanguageChange) onLanguageChange("hi");
      if (onAction) onAction("change_language", "hi");
      reply = "Switched language to Hindi.";
    } else if (text.includes("telugu") || text.includes("తెలుగు")) {
      if (onLanguageChange) onLanguageChange("te");
      if (onAction) onAction("change_language", "te");
      reply = "Switched language to Telugu.";
    } else if (text.includes("english") || text.includes("अंग्रेजी")) {
      if (onLanguageChange) onLanguageChange("en");
      if (onAction) onAction("change_language", "en");
      reply = "Language switched to English.";
    }
    // 2. Navigation Commands
    else if (text.includes("doctor") || text.includes("clinic") || text.includes("physician")) {
      if (onNavigate) onNavigate(12);
      router.push("/his/doctor");
      if (onAction) onAction("doctor_view");
      reply = "Opening Physician Consultation Desk.";
    } else if (text.includes("scheme") || text.includes("yojana")) {
      if (onNavigate) onNavigate(8);
      if (onAction) onAction("open_scheme");
      reply = "Opening Government Scheme Eligibility checker.";
    } else if (text.includes("prescription") || text.includes("ocr") || text.includes("scan")) {
      if (onNavigate) onNavigate(7);
      if (onAction) onAction("open_ocr");
      router.push("/his/ocr");
      reply = "Opening Prescription OCR Scanner.";
    } else if (text.includes("home") || text.includes("main")) {
      if (onNavigate) onNavigate(1);
      router.push("/");
      if (onAction) onAction("restart");
      reply = "Navigating to Home Portal.";
    }
    // 3. Form Filling / Entity Extraction (True NLP)
    else if (text.length > 20) {
      setIsProcessing(true);
      setAssistantResponse("Analyzing clinical data using Kimi K3...");
      
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/voice/extract-entities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text })
      })
      .then(res => res.json())
      .then(data => {
        let updatedFields = [];
        if (data.name) { onAction?.("fill_name", data.name); updatedFields.push("name"); }
        if (data.phone) { onAction?.("fill_phone", data.phone); updatedFields.push("phone"); }
        if (data.weight) { onAction?.("fill_weight", data.weight); updatedFields.push("weight"); }
        if (data.bp) { onAction?.("fill_bp", data.bp); updatedFields.push("blood pressure"); }
        if (data.temp) { onAction?.("fill_temp", data.temp); updatedFields.push("temperature"); }
        if (data.concern) { onAction?.("fill_concern", data.concern); updatedFields.push("chief concern"); }
        
        if (updatedFields.length > 0) {
          reply = `Got it. I've updated the following details: ${updatedFields.join(", ")}.`;
        } else {
          reply = "I heard you, but couldn't find any specific patient details in that sentence.";
        }
        setAssistantResponse(reply);
        speakText(reply);
      })
      .catch(err => {
        console.error(err);
        reply = "NLP engine failed to process the clinical entities.";
        setAssistantResponse(reply);
        speakText(reply);
      })
      .finally(() => setIsProcessing(false));
      return;
    }
    else {
      reply = `I heard "${cmd}", but I'm not entirely sure which module you need.`;
      setAmbiguousOptions([
        { label: "Check Schemes", action: () => processCommand("open scheme") },
        { label: "Doctor View", action: () => processCommand("open doctor view") }
      ]);
    }

    setAssistantResponse(reply);
    speakText(reply);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        transcribeAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop()); // Stop mic
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAssistantResponse("Listening... Speak clearly.");
    } catch (err) {
      console.error("Error accessing microphone", err);
      setAssistantResponse("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    processCommand(userInput);
    setUserInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            className="mb-4 w-88 bg-white border border-gray-200 rounded-2xl p-5 shadow-2xl text-[#0f2942] font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0f4c81] flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0f2942]">Samanvaya NIM AI</h4>
                  <p className="text-[10px] text-emerald-700 font-medium">● Whisper + Magpie Active</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Status Response Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 min-h-[70px] flex flex-col justify-center text-xs relative overflow-hidden">
              {isRecording ? (
                <div className="flex items-center gap-2 text-red-600 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Recording... Click mic to stop</span>
                </div>
              ) : isProcessing ? (
                <div className="flex items-center gap-2 text-[#0f4c81] font-bold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{assistantResponse}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {assistantResponse}
                  </p>
                  {/* Disambiguation Buttons */}
                  {ambiguousOptions.length > 0 && (
                      <div className="flex flex-col gap-2 mt-2 border-t border-gray-200 pt-3">
                          {ambiguousOptions.map((opt, i) => (
                              <button
                                  key={i}
                                  onClick={opt.action}
                                  className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold py-2 px-3 rounded-lg text-left w-full transition-colors"
                              >
                                  {opt.label}
                              </button>
                          ))}
                      </div>
                  )}
                </div>
              )}
            </div>

            {/* Interactive Voice & Text Input Bar */}
            <form onSubmit={handleSubmitText} className="flex items-center gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type or speak..."
                className="flex-1 bg-slate-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-[#0f2942] font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-[#0f4c81]"
                disabled={isRecording || isProcessing}
              />
              <button
                type="button"
                onClick={handleMicClick}
                disabled={isProcessing}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  isRecording
                    ? "bg-red-600 text-white animate-pulse shadow-sm"
                    : "bg-blue-50 border border-blue-200 text-[#0f4c81] hover:bg-blue-100 disabled:opacity-50"
                }`}
                title={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                type="submit"
                disabled={isRecording || isProcessing}
                className="bg-[#0f4c81] hover:bg-blue-900 text-white p-2 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Orb Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-full bg-[#0f4c81] hover:bg-blue-900 border-2 border-white flex items-center justify-center text-white shadow-xl backdrop-blur-md relative cursor-pointer"
        title="Open Samanvaya NIM AI"
      >
        <Sparkles className="w-6 h-6 text-white" />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
      </motion.button>
    </div>
  );
}
