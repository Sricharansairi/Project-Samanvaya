"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, MicOff, Sparkles, X, Send, Bot, Loader2, Volume2, VolumeX, 
  Settings2, UserCheck, Stethoscope, Compass, ChevronRight, AlertTriangle, 
  CheckCircle2, ArrowUpRight, Play, RefreshCw
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { queryMedicalRAG } from "@/services/medical_rag";
import { ALL_INDIA_SCHEMES } from "@/services/schemes_repository";

interface FloatingAssistantProps {
  currentStep?: number;
  onNavigate?: (step: number) => void;
  onAction?: (action: string, value?: any) => void;
  onLanguageChange?: (lang: string) => void;
}

export type VoicePersona = "neerja" | "aarav" | "pooja" | "kavya" | "alex";

interface VoiceConfig {
  id: VoicePersona;
  name: string;
  role: string;
  lang: string;
  gender: "female" | "male";
  pitch: number;
  rate: number;
}

const VOICE_PERSONAS: VoiceConfig[] = [
  { id: "neerja", name: "Dr. Neerja", role: "Indian English Female Doctor", lang: "en-IN", gender: "female", pitch: 1.05, rate: 0.95 },
  { id: "aarav", name: "Dr. Aarav", role: "Indian English Male Physician", lang: "en-IN", gender: "male", pitch: 0.88, rate: 0.95 },
  { id: "pooja", name: "Pooja", role: "Hindi Natural Female Voice", lang: "hi-IN", gender: "female", pitch: 1.0, rate: 0.9 },
  { id: "kavya", name: "Kavya", role: "Telugu Natural Female Voice", lang: "te-IN", gender: "female", pitch: 1.0, rate: 0.9 },
  { id: "alex", name: "Dr. Alex", role: "Global Neutral Clear Voice", lang: "en-US", gender: "female", pitch: 1.0, rate: 1.0 }
];

export default function FloatingAssistant({ onNavigate, onAction, onLanguageChange }: FloatingAssistantProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>("neerja");
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [lastActionExecuted, setLastActionExecuted] = useState<string | null>(null);

  // Available system voices
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Disambiguation / Quick Action suggestions
  const [quickActions, setQuickActions] = useState<{ label: string; action: () => void; isPrimary?: boolean }[]>([]);

  // Clinical RAG Rich Card State
  const [clinicalCard, setClinicalCard] = useState<{
    condition: string;
    snomed: string;
    icd10: string;
    urgency: string;
    advice: string;
    differentials: string[];
    isEmergency: boolean;
  } | null>(null);

  const [assistantResponse, setAssistantResponse] = useState<string>(
    "Namaste! I am Samanvaya Autonomous Clinical AI. Speak or type any command like 'Open Schemes', 'Check chest pain in RAG', 'Doctor view', 'Flip ABHA card', or 'Change voice'."
  );

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Load voices from browser
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setSystemVoices(voices);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      // Restore user settings
      const savedPersona = localStorage.getItem("samanvaya_voice_persona") as VoicePersona;
      if (savedPersona && VOICE_PERSONAS.some(p => p.id === savedPersona)) {
        setSelectedPersona(savedPersona);
      }
      const savedMute = localStorage.getItem("samanvaya_voice_muted");
      if (savedMute !== null) setIsMuted(savedMute === "true");
    }
  }, []);

  const changePersona = (personaId: VoicePersona) => {
    setSelectedPersona(personaId);
    localStorage.setItem("samanvaya_voice_persona", personaId);
    const persona = VOICE_PERSONAS.find(p => p.id === personaId);
    const msg = `Voice changed to ${persona?.name} (${persona?.role}).`;
    setAssistantResponse(msg);
    speakResponse(msg, personaId);
  };

  // Select exact browser voice matching persona
  const getMatchingVoice = (personaId: VoicePersona): SpeechSynthesisVoice | null => {
    if (!systemVoices.length) return null;
    const persona = VOICE_PERSONAS.find(p => p.id === personaId) || VOICE_PERSONAS[0];

    // Priority 1: Exact language match + name match
    if (persona.lang === "hi-IN") {
      const hiVoice = systemVoices.find(v => v.lang.startsWith("hi") || v.name.toLowerCase().includes("hindi") || v.name.includes("हिन्दी"));
      if (hiVoice) return hiVoice;
    }
    if (persona.lang === "te-IN") {
      const teVoice = systemVoices.find(v => v.lang.startsWith("te") || v.name.toLowerCase().includes("telugu") || v.name.includes("తెలుగు"));
      if (teVoice) return teVoice;
    }

    // Gender + Regional Indian English
    if (persona.lang === "en-IN") {
      const inVoices = systemVoices.filter(v => v.lang === "en-IN" || v.name.toLowerCase().includes("india"));
      if (persona.gender === "female") {
        const femaleIn = inVoices.find(v => v.name.toLowerCase().includes("heera") || v.name.toLowerCase().includes("neerja") || v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira"));
        if (femaleIn) return femaleIn;
        if (inVoices.length > 0) return inVoices[0];
      } else {
        const maleIn = inVoices.find(v => v.name.toLowerCase().includes("ravi") || v.name.toLowerCase().includes("prabhat") || v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david"));
        if (maleIn) return maleIn;
        if (inVoices.length > 0) return inVoices[0];
      }
    }

    // Fallback: Default or first voice matching language
    const langMatch = systemVoices.find(v => v.lang.startsWith(persona.lang.slice(0, 2)));
    return langMatch || systemVoices[0] || null;
  };

  // Autonomous Speech Synthesis with dynamic persona
  const speakResponse = (text: string, overridePersona?: VoicePersona) => {
    if (isMuted) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const persona = VOICE_PERSONAS.find(p => p.id === (overridePersona || selectedPersona)) || VOICE_PERSONAS[0];
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.lang = persona.lang;
    utterance.pitch = persona.pitch;
    utterance.rate = persona.rate * speechRate;

    const matchedVoice = getMatchingVoice(overridePersona || selectedPersona);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Dispatch omnipresent in-app actions to active pages
  const dispatchInAppAction = (action: string, payload?: any) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("samanvaya:assistant-action", {
        detail: { action, payload, timestamp: Date.now() }
      }));
    }
  };

  // Omnipresent Autonomous Intent Analyzer & Executor
  const processAutonomousCommand = async (rawCmd: string) => {
    const text = rawCmd.toLowerCase().trim();
    if (!text) return;

    setIsProcessing(true);
    setClinicalCard(null);
    setQuickActions([]);
    setLastActionExecuted(null);

    let reply = "";

    // -------------------------------------------------------------
    // INTENT 0: VOICE CHANGER COMMANDS
    // -------------------------------------------------------------
    if (text.includes("change voice") || text.includes("switch voice") || text.includes("different voice")) {
      const nextIdx = (VOICE_PERSONAS.findIndex(p => p.id === selectedPersona) + 1) % VOICE_PERSONAS.length;
      const nextPersona = VOICE_PERSONAS[nextIdx];
      changePersona(nextPersona.id);
      setIsProcessing(false);
      return;
    }

    if (text.includes("voice to neerja") || text.includes("female doctor voice") || text.includes("doctor neerja")) {
      changePersona("neerja");
      setIsProcessing(false);
      return;
    }
    if (text.includes("voice to aarav") || text.includes("male voice") || text.includes("doctor aarav")) {
      changePersona("aarav");
      setIsProcessing(false);
      return;
    }
    if (text.includes("voice to pooja") || text.includes("hindi voice")) {
      changePersona("pooja");
      setIsProcessing(false);
      return;
    }
    if (text.includes("voice to kavya") || text.includes("telugu voice")) {
      changePersona("kavya");
      setIsProcessing(false);
      return;
    }

    // -------------------------------------------------------------
    // INTENT 1: CRITICAL RED FLAG CLINICAL INTERCEPTOR
    // -------------------------------------------------------------
    if (
      text.includes("chest pain") || text.includes("heart attack") || 
      text.includes("stroke") || text.includes("paralysis") || 
      text.includes("heavy bleeding") || text.includes("unconscious") || 
      text.includes("choking") || text.includes("breathless")
    ) {
      reply = "RED FLAG EMERGENCY ALERT: Severe acute symptom detected! Immediately proceeding to Emergency Triage Registration.";
      setLastActionExecuted("🚨 Emergency ER Routing Active");
      router.push("/his/registration");
      
      const rag = queryMedicalRAG(text);
      setClinicalCard({
        condition: rag.matchedGuideline.condition,
        snomed: `${rag.matchedGuideline.snomedCode} (${rag.matchedGuideline.snomedDisplay})`,
        icd10: rag.matchedGuideline.icd10,
        urgency: "CRITICAL LIFE-THREAT",
        advice: rag.matchedGuideline.preliminaryAdvice,
        differentials: rag.differentialDiagnoses,
        isEmergency: true
      });

      setQuickActions([
        { label: "Proceed to ER Desk", action: () => router.push("/his/registration"), isPrimary: true },
        { label: "View Clinical RAG", action: () => router.push("/his/rag") }
      ]);

      setAssistantResponse(reply);
      speakResponse(reply);
      setIsProcessing(false);
      return;
    }

    // -------------------------------------------------------------
    // INTENT 2: IN-PAGE COMPONENT ACTIONS (ABHA, FLIP, TOKENS)
    // -------------------------------------------------------------
    if (text.includes("open abha") || text.includes("create abha") || text.includes("aadhaar e-kyc") || text.includes("ekyc") || text.includes("scan and share")) {
      dispatchInAppAction("open_abha_modal");
      setLastActionExecuted("Opened ABHA e-KYC Modal");
      reply = "Opening the interactive ABDM Ayushman Bharat Creation & Verification Modal.";
      
      if (pathname !== "/his/registration" && pathname !== "/patient") {
        router.push("/his/registration");
      }
    }
    else if (text.includes("flip card") || text.includes("show emergency card") || text.includes("show blood group") || text.includes("organ donor")) {
      dispatchInAppAction("flip_card");
      setLastActionExecuted("Flipped Ayushman Card");
      reply = "Flipping Ayushman Smart Card to display the Emergency Health Record and organ donor pledge.";
      
      if (pathname !== "/patient") {
        router.push("/patient");
      }
    }
    else if (text.includes("next patient") || text.includes("call next") || text.includes("next token") || text.includes("chime")) {
      dispatchInAppAction("call_next_token");
      setLastActionExecuted("Called Next OPD Token");
      reply = "Dispatched calling chime and SMS notification for the next patient in queue.";
      
      if (pathname !== "/his/queue") {
        router.push("/his/queue");
      }
    }

    // -------------------------------------------------------------
    // INTENT 3: LANGUAGE SWITCHING
    // -------------------------------------------------------------
    else if (text.includes("hindi") || text.includes("हिन्दी")) {
      if (onLanguageChange) onLanguageChange("hi");
      if (onAction) onAction("change_language", "hi");
      setLastActionExecuted("Language: Hindi (हिन्दी)");
      reply = "भाषा बदलकर हिन्दी कर दी गई है। आप अब हिन्दी में पूछ सकते हैं।";
      changePersona("pooja");
    } 
    else if (text.includes("telugu") || text.includes("తెలుగు")) {
      if (onLanguageChange) onLanguageChange("te");
      if (onAction) onAction("change_language", "te");
      setLastActionExecuted("Language: Telugu (తెలుగు)");
      reply = "భాష తెలుగులోకి మార్చబడింది. మీరు ఇప్పుడు మీ ఆరోగ్య వివరాలను అడగవచ్చు.";
      changePersona("kavya");
    } 
    else if (text.includes("english") || text.includes("अंग्रेजी")) {
      if (onLanguageChange) onLanguageChange("en");
      if (onAction) onAction("change_language", "en");
      setLastActionExecuted("Language: English");
      reply = "Language switched to English.";
      changePersona("neerja");
    }

    // -------------------------------------------------------------
    // INTENT 4: AUTONOMOUS MODULE NAVIGATION
    // -------------------------------------------------------------
    else if (text.includes("rag") || text.includes("decision support") || text.includes("clinical ai") || text.includes("medical knowledge") || text.includes("guideline")) {
      router.push("/his/rag");
      setLastActionExecuted("Navigated to Clinical RAG");
      reply = "Opening Clinical RAG Co-Pilot & Decision Support Console with dense-sparse vector telemetry.";
      setQuickActions([
        { label: "Open RAG Console", action: () => router.push("/his/rag"), isPrimary: true }
      ]);
    }
    else if (text.includes("scheme") || text.includes("yojana") || text.includes("pmjay") || text.includes("aarogyasri") || text.includes("insurance") || text.includes("claim") || text.includes("cashless") || text.includes("eligib")) {
      router.push("/his/schemes");
      setLastActionExecuted("Navigated to Schemes");
      reply = "Opening Government Health Scheme & Claim Navigator covering Central PM-JAY and all 36 States.";
      setQuickActions([
        { label: "Evaluate PM-JAY", action: () => router.push("/his/schemes"), isPrimary: true },
        { label: "Check Senior 70+ Coverage", action: () => router.push("/his/schemes") }
      ]);
    }
    else if (text.includes("doctor") || text.includes("clinic") || text.includes("physician") || text.includes("consult")) {
      router.push("/his/doctor");
      setLastActionExecuted("Navigated to Doctor Clinic");
      reply = "Opening Physician OPD Consultation Desk and prescription pad.";
      setQuickActions([
        { label: "Open Doctor Clinic", action: () => router.push("/his/doctor"), isPrimary: true }
      ]);
    }
    else if (text.includes("registration") || text.includes("register") || text.includes("triage") || text.includes("intake") || text.includes("vitals desk")) {
      router.push("/his/registration");
      setLastActionExecuted("Navigated to Registration");
      reply = "Opening Patient Registration & Vitals Triage Desk with ABDM Ayushman Suite.";
      setQuickActions([
        { label: "Register Patient", action: () => router.push("/his/registration"), isPrimary: true },
        { label: "Create ABHA", action: () => { router.push("/his/registration"); dispatchInAppAction("open_abha_modal"); } }
      ]);
    }
    else if (text.includes("queue") || text.includes("calling board") || text.includes("token board") || text.includes("opd status") || text.includes("waiting")) {
      router.push("/his/queue");
      setLastActionExecuted("Navigated to OPD Queue");
      reply = "Opening Live Hospital OPD Queue Board with voice chime announcements.";
      setQuickActions([
        { label: "View OPD Board", action: () => router.push("/his/queue"), isPrimary: true }
      ]);
    }
    else if (text.includes("patient") || text.includes("records") || text.includes("health locker") || text.includes("my card") || text.includes("abha card")) {
      router.push("/patient");
      setLastActionExecuted("Navigated to Patient Portal");
      reply = "Opening Patient Self-Service Portal with 3D Ayushman Bharat Card & ABDM Locker.";
      setQuickActions([
        { label: "View Ayushman Card", action: () => router.push("/patient"), isPrimary: true }
      ]);
    }
    else if (text.includes("prescription") || text.includes("ocr") || text.includes("scan") || text.includes("camera") || text.includes("photo")) {
      router.push("/his/ocr");
      setLastActionExecuted("Navigated to OCR Scanner");
      reply = "Opening Prescription & Document OCR Camera Scanner.";
      setQuickActions([
        { label: "Open Camera Scanner", action: () => router.push("/his/ocr"), isPrimary: true }
      ]);
    }
    else if (text.includes("ayush") || text.includes("prakriti") || text.includes("ayurveda") || text.includes("dosha") || text.includes("vata") || text.includes("pitta") || text.includes("kapha")) {
      router.push("/his/ayush");
      setLastActionExecuted("Navigated to AYUSH Profiler");
      reply = "Opening AYUSH Pariksha & Tridosha Prakriti Profiler.";
      setQuickActions([
        { label: "Start Prakriti Test", action: () => router.push("/his/ayush"), isPrimary: true }
      ]);
    }
    else if (text.includes("dpdp") || text.includes("privacy") || text.includes("consent") || text.includes("data protection") || text.includes("legal")) {
      router.push("/his/dpdp");
      setLastActionExecuted("Navigated to DPDP Manager");
      reply = "Opening DPDP 2023 Patient Consent Manager.";
      setQuickActions([
        { label: "Inspect Consent Tokens", action: () => router.push("/his/dpdp"), isPrimary: true }
      ]);
    }
    else if (text.includes("home") || text.includes("main") || text.includes("start") || text.includes("kiosk")) {
      router.push("/");
      setLastActionExecuted("Navigated to Home");
      reply = "Returning to Samanvaya Home Kiosk.";
    }

    // -------------------------------------------------------------
    // INTENT 5: CLINICAL KNOWLEDGE Q&A VIA MEDICAL RAG
    // -------------------------------------------------------------
    else if (
      text.includes("fever") || text.includes("pain") || text.includes("headache") || 
      text.includes("cough") || text.includes("rash") || text.includes("vomit") || 
      text.includes("dengue") || text.includes("covid") || text.includes("diabetes") ||
      text.includes("bp") || text.includes("symptom") || text.includes("treatment") ||
      text.includes("what is") || text.includes("how to treat")
    ) {
      const rag = queryMedicalRAG(text);
      const g = rag.matchedGuideline;
      reply = `Clinical RAG Insight: Grounded in ${g.source} for ${g.condition}. Preliminary advice: ${g.preliminaryAdvice}`;
      setLastActionExecuted(`Synthesized RAG: ${g.condition}`);

      setClinicalCard({
        condition: g.condition,
        snomed: `${g.snomedCode} (${g.snomedDisplay})`,
        icd10: g.icd10,
        urgency: g.urgency,
        advice: g.preliminaryAdvice,
        differentials: rag.differentialDiagnoses,
        isEmergency: rag.isEmergency
      });

      setQuickActions([
        { label: "Open Full RAG Console", action: () => router.push("/his/rag"), isPrimary: true },
        { label: "Send to Registration Triage", action: () => {
            router.push("/his/registration");
            dispatchInAppAction("fill_form", { concern: text });
          } 
        }
      ]);
    }

    // -------------------------------------------------------------
    // INTENT 6: PATIENT DETAILS AUTO-FILL (INSTANT NLP EXTRACTION)
    // -------------------------------------------------------------
    else if (text.includes("register") || text.includes("name is") || text.includes("phone") || text.includes("patient named")) {
      // Regex entity extraction for instant client-side execution
      const nameMatch = text.match(/(?:named|name is|patient)\s+([a-zA-Z\s]+?)(?:\s+(?:with|phone|mobile|having|and)|$)/i);
      const phoneMatch = text.match(/(?:phone|mobile|number|call)\s*(?:is)?\s*(\d{10})/i);
      const extractedName = nameMatch ? nameMatch[1].trim() : "Ramesh Kumar";
      const extractedPhone = phoneMatch ? phoneMatch[1] : "9876543210";

      dispatchInAppAction("fill_form", { name: extractedName, phone: extractedPhone, concern: rawCmd });
      router.push("/his/registration");
      reply = `Got it. Pre-filling patient registration with name '${extractedName}' and phone '${extractedPhone}'.`;
      setLastActionExecuted(`Filled: ${extractedName}`);
      setQuickActions([
        { label: "Review at Registration Desk", action: () => router.push("/his/registration"), isPrimary: true }
      ]);
    }

    // -------------------------------------------------------------
    // DEFAULT DISAMBIGUATION WITH RICH ACTION PILLS
    // -------------------------------------------------------------
    else {
      reply = `I processed "${rawCmd}". Here are the quickest actions for your request:`;
      setQuickActions([
        { label: "🏥 Open Schemes", action: () => router.push("/his/schemes"), isPrimary: true },
        { label: "🧠 Clinical RAG Co-Pilot", action: () => router.push("/his/rag") },
        { label: "🆔 Ayushman Smart Card", action: () => router.push("/patient") },
        { label: "🩺 Doctor Consultation", action: () => router.push("/his/doctor") }
      ]);
    }

    setAssistantResponse(reply);
    speakResponse(reply);
    setIsProcessing(false);
  };

  // Real-time Web Speech Recognition
  const startListening = () => {
    if (typeof window === "undefined") return;

    // Check for native browser SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        const persona = VOICE_PERSONAS.find(p => p.id === selectedPersona) || VOICE_PERSONAS[0];
        recognition.lang = persona.lang;
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsRecording(true);
          setAssistantResponse("Listening live... Speak your command clearly.");
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setUserInput(currentTranscript);

          if (event.results[0].isFinal) {
            recognition.stop();
            setIsRecording(false);
            processAutonomousCommand(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsRecording(false);
          if (event.error === "not-allowed") {
            setAssistantResponse("Microphone permission denied. Please allow mic access in your browser settings.");
          } else {
            // Fallback to MediaRecorder
            fallbackMediaRecorder();
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        return;
      } catch (e) {
        console.warn("Native SpeechRecognition start error, falling back:", e);
      }
    }

    fallbackMediaRecorder();
  };

  const fallbackMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(track => track.stop());
        setIsProcessing(true);
        setAssistantResponse("Transcribing audio via Whisper Large v3...");

        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "audio.webm");
          const res = await fetch(`/api/voice/transcribe`, { method: "POST", body: formData });
          const data = await res.json();
          if (data.text) {
            setUserInput(data.text);
            processAutonomousCommand(data.text);
          } else {
            setAssistantResponse("Sorry, I could not catch that. Please type your command below.");
          }
        } catch (err) {
          setAssistantResponse("Audio transcription error. Please use the text input below.");
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAssistantResponse("Recording via microphone... Click mic to complete.");
    } catch (err) {
      setIsRecording(false);
      setAssistantResponse("Microphone access unavailable. Please use the text bar below.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    const cmd = userInput;
    setUserInput("");
    processAutonomousCommand(cmd);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-96 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xl text-[#0f2942] font-sans overflow-hidden"
          >
            {/* Header with Persona & Controls */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0f4c81] to-blue-600 text-white flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  {isSpeaking && (
                    <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white"></span>
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-[#0f2942]">Samanvaya Autonomous AI</h4>
                    <span className="text-[10px] bg-blue-100 text-[#0f4c81] font-bold px-1.5 py-0.5 rounded">
                      {VOICE_PERSONAS.find(p => p.id === selectedPersona)?.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {isSpeaking ? "Speaking response..." : isRecording ? "Listening to voice..." : "Omnipresent Clinical Agent"}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isMuted ? "bg-red-50 text-red-600" : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                  }`}
                  title={isMuted ? "Unmute Voice" : "Mute Voice"}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    showVoiceSettings ? "bg-blue-100 text-[#0f4c81]" : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                  }`}
                  title="Voice & Engine Settings"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Voice Settings Dropdown / Panel */}
            <AnimatePresence>
              {showVoiceSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3 text-xs space-y-2.5 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Select Voice Persona:</span>
                    <button
                      onClick={() => speakResponse("Hello, I am testing the selected voice.")}
                      className="text-[10px] text-[#0f4c81] font-bold hover:underline flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Test Voice
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1.5">
                    {VOICE_PERSONAS.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => changePersona(p.id)}
                        className={`text-left p-2 rounded-lg border transition-all text-[11px] ${
                          selectedPersona === p.id 
                            ? "bg-blue-50 border-blue-500 font-bold text-[#0f4c81] shadow-xs" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{p.name}</span>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400">{p.gender}</span>
                        </div>
                        <div className="text-[9px] text-slate-500 truncate">{p.lang} • {p.role.split(' ')[0]}</div>
                      </button>
                    ))}
                  </div>

                  {/* Speech Speed Presets */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px]">
                    <span className="text-slate-500 font-medium">Pacing:</span>
                    <div className="flex gap-1">
                      {[0.8, 1.0, 1.2].map(rate => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setSpeechRate(rate)}
                          className={`px-2 py-0.5 rounded font-bold transition-all ${
                            speechRate === rate ? "bg-[#0f4c81] text-white" : "bg-white border text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live Status Response Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3 min-h-[75px] flex flex-col justify-center text-xs relative overflow-hidden">
              {isRecording ? (
                <div className="flex items-center gap-2.5 text-red-600 font-bold">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-red-700">Listening to voice...</p>
                    <p className="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                      {userInput || "Speak now, words will stream in real-time."}
                    </p>
                  </div>
                </div>
              ) : isProcessing ? (
                <div className="flex items-center gap-2.5 text-[#0f4c81] font-bold">
                  <Loader2 className="w-4 h-4 animate-spin text-[#0f4c81]" />
                  <span>Processing autonomous clinical action...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {lastActionExecuted && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {lastActionExecuted}
                    </div>
                  )}

                  <p className="text-slate-700 leading-relaxed font-medium">
                    {assistantResponse}
                  </p>

                  {/* Clinical RAG Diagnostic Card */}
                  {clinicalCard && (
                    <div className={`mt-2.5 p-2.5 rounded-lg border text-[11px] ${
                      clinicalCard.isEmergency 
                        ? "bg-red-50 border-red-200 text-red-900" 
                        : "bg-blue-50 border-blue-200 text-slate-800"
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className="truncate">{clinicalCard.condition}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          clinicalCard.isEmergency ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                        }`}>
                          {clinicalCard.urgency}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex gap-2">
                        <span>ICD-10: <strong>{clinicalCard.icd10}</strong></span>
                        <span>SNOMED: <strong>{clinicalCard.snomed}</strong></span>
                      </div>
                      {clinicalCard.differentials?.length > 0 && (
                        <div className="mt-1 text-[10px] text-slate-600">
                          <strong>Differentials:</strong> {clinicalCard.differentials.slice(0, 2).join(", ")}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interactive Quick Action Buttons */}
                  {quickActions.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-2.5 pt-2.5 border-t border-slate-200">
                      {quickActions.map((qa, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            qa.action();
                            setQuickActions([]);
                          }}
                          className={`text-left text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                            qa.isPrimary
                              ? "bg-[#0f4c81] text-white hover:bg-blue-900 shadow-xs"
                              : "bg-white hover:bg-blue-50 border border-slate-200 text-slate-700"
                          }`}
                        >
                          <span>{qa.label}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-70" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Command Suggestions Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar text-[10px]">
              <button
                type="button"
                onClick={() => processAutonomousCommand("Open schemes")}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-[#0f4c81] text-slate-600 rounded-full font-bold border border-slate-200 transition-colors"
              >
                🏥 Schemes
              </button>
              <button
                type="button"
                onClick={() => processAutonomousCommand("Open clinical RAG")}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-[#0f4c81] text-slate-600 rounded-full font-bold border border-slate-200 transition-colors"
              >
                🧠 Clinical RAG
              </button>
              <button
                type="button"
                onClick={() => processAutonomousCommand("Open ABHA creation")}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-[#0f4c81] text-slate-600 rounded-full font-bold border border-slate-200 transition-colors"
              >
                🆔 ABHA Modal
              </button>
              <button
                type="button"
                onClick={() => processAutonomousCommand("Doctor view")}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-[#0f4c81] text-slate-600 rounded-full font-bold border border-slate-200 transition-colors"
              >
                🩺 Doctor
              </button>
              <button
                type="button"
                onClick={() => processAutonomousCommand("Open camera OCR")}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-[#0f4c81] text-slate-600 rounded-full font-bold border border-slate-200 transition-colors"
              >
                📸 Scan OCR
              </button>
              <button
                type="button"
                onClick={() => processAutonomousCommand("Change voice")}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-[#0f4c81] text-slate-600 rounded-full font-bold border border-slate-200 transition-colors"
              >
                🗣️ Switch Voice
              </button>
            </div>

            {/* Interactive Voice & Text Input Form */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Speak or type command..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#0f2942] font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#0f4c81] transition-all"
                disabled={isRecording || isProcessing}
              />
              <button
                type="button"
                onClick={handleMicClick}
                disabled={isProcessing}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  isRecording
                    ? "bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-300"
                    : "bg-blue-50 border border-blue-200 text-[#0f4c81] hover:bg-blue-100 disabled:opacity-50"
                }`}
                title={isRecording ? "Stop listening" : "Start speaking"}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                type="submit"
                disabled={isRecording || isProcessing || !userInput.trim()}
                className="bg-[#0f4c81] hover:bg-blue-900 text-white p-2 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Orb Button with Voice Status Waves */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0f4c81] to-blue-600 hover:from-blue-900 hover:to-[#0f4c81] border-2 border-white flex items-center justify-center text-white shadow-2xl relative cursor-pointer"
        title="Open Samanvaya Autonomous AI"
      >
        <Sparkles className="w-6 h-6 text-white" />
        
        {/* Active Online / Voice Wave Indicator */}
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
        </span>

        {isSpeaking && (
          <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping opacity-60"></span>
        )}
      </motion.button>
    </div>
  );
}
