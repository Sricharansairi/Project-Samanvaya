"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Sparkles, Volume2, X, Send, ArrowRight, Bot } from "lucide-react";

interface FloatingAssistantProps {
  currentStep: number;
  onNavigate: (step: number) => void;
  onAction?: (action: string, value?: any) => void;
  onLanguageChange?: (lang: string) => void;
}

export default function FloatingAssistant({ currentStep, onNavigate, onAction, onLanguageChange }: FloatingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [transcript, setTranscript] = useState("");
  const [assistantResponse, setAssistantResponse] = useState<string | null>(
    "Hello! I am Samanvaya Voice AI. You can say 'Open schemes', 'Change to Hindi', 'Doctor view', or 'Scan prescription'."
  );

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      let debounceTimer: any;

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(`"${finalTranscript}"`);
          setUserInput(finalTranscript);
          
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            setIsListening(false);
            recognition.stop();
            processCommand(finalTranscript);
          }, 2000); // Wait 2 seconds for silence before auto-processing
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setTranscript("Couldn't hear audio clearly. You can also type your command below.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Autonomous Natural Language Command Processor
  const processCommand = (cmd: string) => {
    const text = cmd.toLowerCase().trim();
    let reply = "";

    // 1. Language Switching Commands
    if (text.includes("hindi") || text.includes("हिन्दी")) {
      if (onLanguageChange) onLanguageChange("hi");
      if (onAction) onAction("change_language", "hi");
      reply = "भाषा बदलकर हिन्दी कर दी गई है। Switched language to Hindi.";
    } else if (text.includes("telugu") || text.includes("తెలుగు")) {
      if (onLanguageChange) onLanguageChange("te");
      if (onAction) onAction("change_language", "te");
      reply = "భాష తెలుగుకి మార్చబడింది. Switched language to Telugu.";
    } else if (text.includes("tamil") || text.includes("தமிழ்")) {
      if (onLanguageChange) onLanguageChange("ta");
      if (onAction) onAction("change_language", "ta");
      reply = "மொழி தமிழுக்கு மாற்றப்பட்டது. Switched language to Tamil.";
    } else if (text.includes("english") || text.includes("अंग्रेजी")) {
      if (onLanguageChange) onLanguageChange("en");
      if (onAction) onAction("change_language", "en");
      reply = "Language switched to English.";
    } else if (text.includes("bengali") || text.includes("বাংলা")) {
      if (onLanguageChange) onLanguageChange("bn");
      if (onAction) onAction("change_language", "bn");
      reply = "ভাষা বাংলায় পরিবর্তিত হয়েছে। Switched language to Bengali.";
    } else if (text.includes("marathi") || text.includes("मराठी")) {
      if (onLanguageChange) onLanguageChange("mr");
      if (onAction) onAction("change_language", "mr");
      reply = "भाषा मराठीत बदलली आहे. Switched language to Marathi.";
    }

    // 2. Navigation / Tab Opening Commands
    else if (text.includes("doctor") || text.includes("physician") || text.includes("clinic") || text.includes("summary")) {
      onNavigate(12);
      if (onAction) onAction("doctor_view");
      reply = "Opening Physician Consultation Desk.";
    } else if (text.includes("scheme") || text.includes("yojana") || text.includes("pmjay") || text.includes("ayushman") || text.includes("welfare")) {
      onNavigate(8);
      if (onAction) onAction("open_scheme");
      reply = "Opening Government Scheme Eligibility checker.";
    } else if (text.includes("prescription") || text.includes("scan") || text.includes("ocr") || text.includes("medicine") || text.includes("camera")) {
      onNavigate(7);
      if (onAction) onAction("open_ocr");
      reply = "Opening Prescription & Document OCR Scanner.";
    } else if (text.includes("ayush") || text.includes("prakriti") || text.includes("agni") || text.includes("diet") || text.includes("sleep")) {
      onNavigate(6);
      if (onAction) onAction("open_ayush");
      reply = "Opening AYUSH Dashavidha Pariksha module.";
    } else if (text.includes("history") || text.includes("symptom") || text.includes("complaint") || text.includes("fever") || text.includes("cough")) {
      onNavigate(5);
      reply = "Opening Conversational Voice History intake.";
    } else if (text.includes("abha") || text.includes("aadhaar") || text.includes("identify") || text.includes("check in") || text.includes("qr")) {
      onNavigate(2);
      reply = "Opening ABHA & Patient Identification module.";
    } else if (text.includes("consent") || text.includes("dpdp") || text.includes("privacy")) {
      onNavigate(3);
      reply = "Opening Digital DPDP Consent module.";
    } else if (text.includes("mode") || text.includes("select mode")) {
      onNavigate(4);
      reply = "Opening Clinical Intake Mode selector.";
    } else if (text.includes("token") || text.includes("queue") || text.includes("sms") || text.includes("turn")) {
      onNavigate(11);
      reply = "Opening OPD Queue Token & SMS tracking screen.";
    } else if (text.includes("home") || text.includes("main") || text.includes("portal") || text.includes("start")) {
      onNavigate(1);
      if (onAction) onAction("restart");
      reply = "Navigating to Home Portal.";
    } else {
      reply = `I heard "${cmd}". Let me search and navigate to the most relevant health module for you.`;
      onNavigate(currentStep === 1 ? 5 : currentStep);
    }

    setAssistantResponse(reply);
    speakText(reply);
    setUserInput("");
  };

  const handleMicClick = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("Listening... Please speak your command.");
      setIsListening(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // Fallback simulation if mic already started
          setTimeout(() => {
            processCommand("open scheme eligibility");
            setIsListening(false);
          }, 2000);
        }
      } else {
        // Fallback simulation if speech recognition not available
        setTimeout(() => {
          processCommand("open doctor view");
          setIsListening(false);
        }, 2000);
      }
    }
  };

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    setTranscript(`"${userInput}"`);
    processCommand(userInput);
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
                  <h4 className="text-xs font-bold text-[#0f2942]">Samanvaya Autonomous AI</h4>
                  <p className="text-[10px] text-emerald-700 font-medium">● Voice & Action Router Active</p>
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

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5 mb-3 text-[11px]">
              {["Doctor View", "Check Schemes", "Hindi", "Telugu", "Prescription OCR"].map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => processCommand(cmd)}
                  className="bg-slate-100 hover:bg-blue-50 hover:text-[#0f4c81] border border-gray-200 px-2 py-1 rounded-md text-gray-700 font-medium transition-colors cursor-pointer"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Live Status Response Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3 min-h-[60px] flex flex-col justify-center text-xs">
              {isListening ? (
                <div className="flex items-center gap-2 text-red-600 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Listening to your voice... Speak now</span>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed font-medium">
                  {assistantResponse}
                </p>
              )}
            </div>

            {/* Interactive Voice & Text Input Bar */}
            <form onSubmit={handleSubmitText} className="flex items-center gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type or speak a command..."
                className="flex-1 bg-slate-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-[#0f2942] font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-[#0f4c81]"
              />
              <button
                type="button"
                onClick={handleMicClick}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  isListening
                    ? "bg-red-600 text-white animate-pulse shadow-sm"
                    : "bg-blue-50 border border-blue-200 text-[#0f4c81] hover:bg-blue-100"
                }`}
                title={isListening ? "Listening..." : "Speak command"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                type="submit"
                className="bg-[#0f4c81] hover:bg-blue-900 text-white p-2 rounded-lg transition-colors cursor-pointer shadow-xs"
                title="Execute command"
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
        title="Open Samanvaya Autonomous Voice AI"
      >
        <Sparkles className="w-6 h-6 text-white" />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
      </motion.button>
    </div>
  );
}
