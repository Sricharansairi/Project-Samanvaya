"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, MicOff, Sparkles, X, Send, Bot, Loader2, Volume2, VolumeX, 
  Settings2, Stethoscope, ChevronRight, AlertTriangle, 
  CheckCircle2, ArrowUpRight, Play, HeartPulse, ShieldAlert, Radio, Languages
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { translatePatientToClinical, ClinicalTranslationResult } from "@/services/clinical_nlp";
import {
  startRecording as bhashiniStartRecording,
  stopRecording as bhashiniStopRecording,
  transcribeAudio,
  textToSpeech,
  playAudioBase64,
  clinicalRAGQuery,
  translateText as bhashiniTranslate,
  BHASHINI_LANGUAGES,
  type ClinicalRAGResponse,
} from "@/services/bhashini_client";

interface FloatingAssistantProps {
  currentStep?: number;
  onNavigate?: (step: number) => void;
  onAction?: (action: string, value?: any) => void;
  onLanguageChange?: (lang: string) => void;
}

export type VoicePersona = 
  | "bhashini_hi" | "bhashini_en" | "bhashini_te" | "bhashini_ta" 
  | "bhashini_kn" | "bhashini_ml" | "bhashini_bn" | "bhashini_mr" 
  | "bhashini_gu" | "bhashini_pa" | "bhashini_or" | "bhashini_as"
  | "bhashini_ur" | "bhashini_sa" | "bhashini_ne" | "bhashini_brx"
  | "bhashini_doi" | "bhashini_ks" | "bhashini_gom" | "bhashini_mai"
  | "bhashini_mni" | "bhashini_sat" | "bhashini_sd";

interface VoiceConfig {
  id: VoicePersona;
  name: string;
  nativeName: string;
  role: string;
  lang: string;
  bhashiniCode: string;
  gender: "female" | "male";
  nativeGreeting: string;
}

export interface AssistantChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  englishExplanation?: string;
  timestamp: number;
  route?: string | null;
  chips?: string[];
  isEmergency?: boolean;
  clinicalCondition?: string | null;
  icd10?: string | null;
}

const VOICE_PERSONAS: VoiceConfig[] = [
  { id: "bhashini_hi", name: "Hindi", nativeName: "हिन्दी", role: "Primary Indic Voice (Bhashini AI)", lang: "hi-IN", bhashiniCode: "hi", gender: "female", nativeGreeting: "नमस्ते! मैं आपका समन्वय क्लिनिकल सहायक हूँ।" },
  { id: "bhashini_en", name: "English", nativeName: "English", role: "Indian English Voice (Bhashini AI)", lang: "en-IN", bhashiniCode: "en", gender: "female", nativeGreeting: "Namaste! I am your Samanvaya Autonomous Clinical Co-Pilot." },
  { id: "bhashini_te", name: "Telugu", nativeName: "తెలుగు", role: "Official Telugu Voice (Bhashini AI)", lang: "te-IN", bhashiniCode: "te", gender: "female", nativeGreeting: "నమస్కారం! నేను మీ సమన్వయ క్లినికల్ సహాయకుడిని." },
  { id: "bhashini_ta", name: "Tamil", nativeName: "தமிழ்", role: "Official Tamil Voice (Bhashini AI)", lang: "ta-IN", bhashiniCode: "ta", gender: "female", nativeGreeting: "வணக்கம்! நான் உங்கள் சமன்வய மருத்துவ உதவியாளர்." },
  { id: "bhashini_kn", name: "Kannada", nativeName: "ಕನ್ನಡ", role: "Official Kannada Voice (Bhashini AI)", lang: "kn-IN", bhashiniCode: "kn", gender: "female", nativeGreeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಸಮನ್ವಯ ಕ್ಲಿನಿಕಲ್ ಸಹಾಯಕ." },
  { id: "bhashini_ml", name: "Malayalam", nativeName: "മലയാളം", role: "Official Malayalam Voice (Bhashini AI)", lang: "ml-IN", bhashiniCode: "ml", gender: "female", nativeGreeting: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ സമന്വയ ക്ലിനിക്കൽ സഹായിയാണ്." },
  { id: "bhashini_bn", name: "Bengali", nativeName: "বাংলা", role: "Official Bengali Voice (Bhashini AI)", lang: "bn-IN", bhashiniCode: "bn", gender: "female", nativeGreeting: "নমস্কার! আমি আপনার সমন্বয় ক্লিনিক্যাল সহকারী।" },
  { id: "bhashini_mr", name: "Marathi", nativeName: "मराठी", role: "Official Marathi Voice (Bhashini AI)", lang: "mr-IN", bhashiniCode: "mr", gender: "female", nativeGreeting: "नमस्कार! मी तुमचा समन्वय क्लिनिकल सहाय्यक आहे." },
  { id: "bhashini_gu", name: "Gujarati", nativeName: "ગુજરાતી", role: "Official Gujarati Voice (Bhashini AI)", lang: "gu-IN", bhashiniCode: "gu", gender: "female", nativeGreeting: "નમસ્તે! હું તમારો સમન્વય ક્લિનિકલ સહાયક છું." },
  { id: "bhashini_pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", role: "Official Punjabi Voice (Bhashini AI)", lang: "pa-IN", bhashiniCode: "pa", gender: "female", nativeGreeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਸਮਨਵਿਆ ਕਲੀਨਿਕਲ ਸਹਾਇਕ ਹਾਂ।" },
  { id: "bhashini_or", name: "Odia", nativeName: "ଓଡ଼ିଆ", role: "Official Odia Voice (Bhashini AI)", lang: "or-IN", bhashiniCode: "or", gender: "female", nativeGreeting: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର ସମନ୍ୱୟ କ୍ଲିନିକାଲ ସହାୟକ |" },
  { id: "bhashini_as", name: "Assamese", nativeName: "অসমীয়া", role: "Official Assamese Voice (Bhashini AI)", lang: "as-IN", bhashiniCode: "as", gender: "female", nativeGreeting: "নমস্কাৰ! মই আপোনাৰ সমন্বয় ক্লিনিকেল সহায়ক।" },
  { id: "bhashini_ur", name: "Urdu", nativeName: "اردو", role: "Official Urdu Voice (Bhashini AI)", lang: "ur-IN", bhashiniCode: "ur", gender: "female", nativeGreeting: "السلام علیکم! میں آپ کا سمنوے کلینیکل اسسٹنٹ ہوں۔" },
  { id: "bhashini_sa", name: "Sanskrit", nativeName: "संस्कृतम्", role: "Classical Sanskrit Voice (Bhashini AI)", lang: "sa-IN", bhashiniCode: "sa", gender: "female", nativeGreeting: "नमस्ते! अहं भवतां समन्वय-चिकित्सा-सहायकः अस्मि।" },
  { id: "bhashini_ne", name: "Nepali", nativeName: "नेपाली", role: "Official Nepali Voice (Bhashini AI)", lang: "ne-IN", bhashiniCode: "ne", gender: "female", nativeGreeting: "नमस्ते! म तपाईंको समन्वय क्लिनिकल सहायक हुँ।" },
  { id: "bhashini_brx", name: "Bodo", nativeName: "बड़ो", role: "Official Bodo Voice (Bhashini AI)", lang: "brx-IN", bhashiniCode: "brx", gender: "female", nativeGreeting: "खुलुमबाय! आं नोंथांनि समन्वय क्लिनिकेल हेफाजाबगिरि।" },
  { id: "bhashini_doi", name: "Dogri", nativeName: "डोगरी", role: "Official Dogri Voice (Bhashini AI)", lang: "doi-IN", bhashiniCode: "doi", gender: "female", nativeGreeting: "नमस्ते! मैं थुआह्ड़ा समन्वय क्लिनिकल सहायक आं।" },
  { id: "bhashini_ks", name: "Kashmiri", nativeName: "كٲشُر", role: "Official Kashmiri Voice (Bhashini AI)", lang: "ks-IN", bhashiniCode: "ks", gender: "female", nativeGreeting: "سلام! بؤ چھس تُہُند समन्वय क्लिनिकल सहायक।" },
  { id: "bhashini_gom", name: "Konkani", nativeName: "कोंकणी", role: "Official Konkani Voice (Bhashini AI)", lang: "gom-IN", bhashiniCode: "gom", gender: "female", nativeGreeting: "नमस्कार! हांव तुमचो समन्वय क्लिनिकल सहाय्यक।" },
  { id: "bhashini_mai", name: "Maithili", nativeName: "मैथिली", role: "Official Maithili Voice (Bhashini AI)", lang: "mai-IN", bhashiniCode: "mai", gender: "female", nativeGreeting: "प्रणाम! हम अहाँक समन्वय क्लिनिकल सहायक छी।" },
  { id: "bhashini_mni", name: "Manipuri", nativeName: "মৈতৈলোন্", role: "Official Manipuri Voice (Bhashini AI)", lang: "mni-IN", bhashiniCode: "mni", gender: "female", nativeGreeting: "খুরুমজরি! ঐহাক অদোমগী সমন্বয় ক্লিনিকল তেংবাংবনি।" },
  { id: "bhashini_sat", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ", role: "Official Santali Voice (Bhashini AI)", lang: "sat-IN", bhashiniCode: "sat", gender: "female", nativeGreeting: "ᱡᱚᱦᱟᱨ! ᱤᱧ ᱫᱚ ᱟᱢᱟᱜ ᱥᱟᱢᱟᱱᱵᱷᱟᱭ ᱠᱞᱤᱱᱤᱠᱟᱞ ᱜᱚᱲᱚᱭᱤᱡ ᱠᱟᱱᱟᱹᱧ᱾" },
  { id: "bhashini_sd", name: "Sindhi", nativeName: "سنڌي", role: "Official Sindhi Voice (Bhashini AI)", lang: "sd-IN", bhashiniCode: "sd", gender: "female", nativeGreeting: "نمساتي! مان اوهان جو سمنوي ڪلينيڪل مددگار آهيان." }
];

export default function FloatingAssistant({ onNavigate, onAction, onLanguageChange }: FloatingAssistantProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>("bhashini_hi");
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");
  const [userInput, setUserInput] = useState("");
  const [lastActionExecuted, setLastActionExecuted] = useState<string | null>(null);
  const [silenceSecondsLeft, setSilenceSecondsLeft] = useState<number>(8);

  // Available system voices
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Disambiguation / Quick Action suggestions
  const [quickActions, setQuickActions] = useState<{ label: string; action: () => void; isPrimary?: boolean }[]>([]);

  // Clinical NLP Standardized Result State
  const [clinicalNlpResult, setClinicalNlpResult] = useState<ClinicalTranslationResult | null>(null);

  const [assistantResponse, setAssistantResponse] = useState<string>(
    "Namaste! I am your Samanvaya Autonomous Clinical Co-Pilot. I can answer medical queries, navigate to any hospital desk, and auto-fill patient details."
  );

  // Multi-turn conversation messages state
  const [chatMessages, setChatMessages] = useState<AssistantChatMessage[]>([
    {
      id: "init",
      sender: "assistant",
      text: "Namaste! I am your Samanvaya Autonomous Clinical Co-Pilot. You can converse with me in any of 22 Indian languages or English. I can navigate hospital desks, assess symptoms, and auto-fill forms.",
      englishExplanation: "Welcome to Samanvaya Autonomous Clinical Co-Pilot",
      timestamp: Date.now(),
      chips: [
        "📄 Scan Prescription (OCR)",
        "🩺 Consult Doctor Desk",
        "🌿 AYUSH Prakriti Test",
        "🏥 Register New Patient"
      ]
    }
  ]);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isProcessing]);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speechDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>("");

  // MUTUAL EXCLUSION REF: Stops mic echo loops & double/triple speaking
  const isAssistantSpeakingRef = useRef<boolean>(false);

  // Load voices from browser for fallback
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const updateVoices = () => {
        setSystemVoices(window.speechSynthesis.getVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      const savedPersona = localStorage.getItem("samanvaya_voice_persona") as VoicePersona;
      if (savedPersona && VOICE_PERSONAS.some(p => p.id === savedPersona)) {
        setSelectedPersona(savedPersona);
      }
      const savedMute = localStorage.getItem("samanvaya_voice_muted");
      if (savedMute !== null) setIsMuted(savedMute === "true");
    }

    return () => {
      stopListening();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const changePersona = (personaId: VoicePersona) => {
    setSelectedPersona(personaId);
    localStorage.setItem("samanvaya_voice_persona", personaId);
    const persona = VOICE_PERSONAS.find(p => p.id === personaId);
    const msg = persona?.nativeGreeting || `Voice changed to ${persona?.name}.`;
    setAssistantResponse(msg);
    setChatMessages(prev => [
      ...prev,
      {
        id: "sys-" + Date.now(),
        sender: "assistant",
        text: msg,
        englishExplanation: `Switched voice to ${persona?.name} (${persona?.nativeName})`,
        timestamp: Date.now(),
        chips: [
          "📄 Scan Prescription (OCR)",
          "🩺 Consult Doctor Desk",
          "🌿 AYUSH Prakriti Test",
          "🏥 Register Patient"
        ]
      }
    ]);
    speakResponse(msg, personaId);
    if (persona && onLanguageChange) {
      onLanguageChange(persona.bhashiniCode);
    }
  };

  // -------------------------------------------------------------
  // BHASHINI + SARVAM AI VOICE SYNTHESIS + STRICT AUDIO LOCKING
  // Priority: Bhashini TTS → Sarvam TTS → Browser SpeechSynthesis
  // -------------------------------------------------------------
  const speakResponse = async (text: string, overridePersona?: VoicePersona) => {
    if (isMuted || !text) return;

    // 1. Immediately halt all active listening to avoid picking up speaker voice
    stopListening();

    // 2. Cancel and destroy any prior speech or audio streams
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    // 3. Mark mutex locked
    isAssistantSpeakingRef.current = true;
    setIsSpeaking(true);

    const persona = VOICE_PERSONAS.find(p => p.id === (overridePersona || selectedPersona)) || VOICE_PERSONAS[0];
    // Map persona lang to Bhashini language code (e.g. "hi-IN" -> "hi")
    const bhashiniLang = persona.bhashiniCode || persona.lang.split("-")[0] || "hi";

    // TIER 1: Bhashini Government TTS (22 Indian languages)
    try {
      const ttsResult = await textToSpeech(text, bhashiniLang, persona.gender, 1.0);
      if (ttsResult.audio_base64 && ttsResult.audio_base64.length > 100) {
        await playAudioBase64(ttsResult.audio_base64);
        isAssistantSpeakingRef.current = false;
        setIsSpeaking(false);
        return;
      }
    } catch (err) {
      console.warn("[Bhashini TTS] Failed, falling back to Sarvam:", err);
    }

    // TIER 2: Sarvam AI TTS (fallback)
    try {
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          language: bhashiniLang,
          language_code: persona.lang,
          gender: persona.gender
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.base64_audio) {
          const audio = new Audio(`data:audio/wav;base64,${data.base64_audio}`);
          currentAudioRef.current = audio;

          audio.onplay = () => {
            isAssistantSpeakingRef.current = true;
            setIsSpeaking(true);
          };

          audio.onended = () => {
            isAssistantSpeakingRef.current = false;
            setIsSpeaking(false);
            currentAudioRef.current = null;
          };

          audio.onerror = () => {
            isAssistantSpeakingRef.current = false;
            setIsSpeaking(false);
            currentAudioRef.current = null;
            fallbackBrowserSpeech(text, persona);
          };

          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn("Sarvam AI speak error, falling back to browser speech:", err);
    }

    // TIER 3: Browser SpeechSynthesis (final fallback)
    fallbackBrowserSpeech(text, persona);
  };

  const fallbackBrowserSpeech = (text: string, persona: VoiceConfig) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      isAssistantSpeakingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = persona.lang;
    utterance.rate = 1.05;

    utterance.onstart = () => {
      isAssistantSpeakingRef.current = true;
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      isAssistantSpeakingRef.current = false;
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      isAssistantSpeakingRef.current = false;
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // -------------------------------------------------------------
  // AUTONOMOUS WEB FORM AUTO-FILLER
  // -------------------------------------------------------------
  const autoFillDOMInput = (selector: string, value: string): boolean => {
    if (typeof document === "undefined") return false;
    const el = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (el) {
      const proto = el instanceof HTMLSelectElement ? window.HTMLSelectElement.prototype
        : el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      if (setter) {
        setter.call(el, value);
      } else {
        el.value = value;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.classList.add("ring-2", "ring-emerald-500", "bg-emerald-50/30");
      setTimeout(() => el.classList.remove("ring-2", "ring-emerald-500", "bg-emerald-50/30"), 3000);
      return true;
    }
    return false;
  };

  const dispatchInAppAction = (action: string, payload?: any) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("samanvaya:assistant-action", {
        detail: { action, payload, timestamp: Date.now() }
      }));
    }
  };

  // -------------------------------------------------------------
  // AUTONOMOUS 8-SECOND SILENCE INACTIVITY TIMER
  // -------------------------------------------------------------
  const reset8sSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (silenceIntervalRef.current) clearInterval(silenceIntervalRef.current);

    setSilenceSecondsLeft(8);

    const startTime = Date.now();
    silenceIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, 8 - elapsed);
      setSilenceSecondsLeft(remaining);
      if (remaining <= 0 && silenceIntervalRef.current) {
        clearInterval(silenceIntervalRef.current);
      }
    }, 1000);

    silenceTimerRef.current = setTimeout(() => {
      stopListening();
      setAssistantResponse("No voice detected for 8 seconds. Listening paused. Tap the microphone whenever you want to speak.");
    }, 8000);
  }, []);

  const clearSilenceTimers = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (silenceIntervalRef.current) clearInterval(silenceIntervalRef.current);
    if (speechDebounceRef.current) clearTimeout(speechDebounceRef.current);
  };

  // -------------------------------------------------------------
  // OMNIPRESENT INTENT REASONING & AUTONOMOUS ACTION DISPATCHER
  // Powered by Groq LPU 120B + Indic NLP + Bhashini Tier 1 TTS
  // -------------------------------------------------------------
  const processAutonomousCommand = async (rawCmd: string) => {
    const text = rawCmd.toLowerCase().trim();
    if (!text) return;

    setIsProcessing(true);
    setClinicalNlpResult(null);
    setQuickActions([]);
    setLastActionExecuted(null);

    // 1. FAST-PATH: VOICE PERSONA SWITCHER
    if (text.includes("change voice") || text.includes("switch voice") || text.includes("different voice")) {
      const nextIdx = (VOICE_PERSONAS.findIndex(p => p.id === selectedPersona) + 1) % VOICE_PERSONAS.length;
      changePersona(VOICE_PERSONAS[nextIdx].id);
      setIsProcessing(false);
      return;
    }

    // Add user message to conversation history immediately
    const userMsgId = "user-" + Date.now();
    setChatMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text: rawCmd,
        timestamp: Date.now()
      }
    ]);

    const persona = VOICE_PERSONAS.find(p => p.id === selectedPersona) || VOICE_PERSONAS[0];
    const bhashiniLang = persona.bhashiniCode || "hi";

    try {
      // 2. PRIMARY: DYNAMIC NLP CHAT + AUTONOMOUS ROUTING + ENTITY EXTRACTION
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: rawCmd,
          currentPath: pathname,
          language: bhashiniLang,
          conversationHistory: chatMessages.slice(-6).map(m => ({
            role: m.sender === "user" ? "user" : "assistant",
            text: m.text
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        const spokenReply = data.spokenReply || "I have received your request.";
        setAssistantResponse(spokenReply);

        // Emergency triage detection
        if (data.isEmergency) {
          setLastActionExecuted("🚨 RED FLAG: Emergency Triage Alert Triggered");
          if (pathname !== "/his/registration") {
            router.push("/his/registration");
          }
        }

        // Standardized Clinical Terminology / ICD-10
        if (data.clinicalCondition || data.icd10) {
          const clinResult: ClinicalTranslationResult = {
            patientRawPrompt: rawCmd,
            detectedLanguage: (persona.name as any) || "Hindi",
            standardizedMedicalTerm: data.clinicalCondition || "Standardized Clinical Assessment",
            icd10Code: data.icd10 || "R07.9",
            snomedCode: "29857009",
            snomedDisplay: data.clinicalCondition || "Clinical Consultation",
            anatomicalSystem: "Multisystem",
            clinicalSeverity: data.isEmergency ? "Critical" : "High",
            isLifeThreat: Boolean(data.isEmergency),
            clinicalRedFlags: data.isEmergency ? ["Immediate medical attention required"] : [],
            differentialDiagnoses: [data.clinicalCondition || "Evaluation required"],
            recommendedLabWorkup: ["Vital Signs Panel", "CBC", "ECG if cardiac"],
            standardMedicationClasses: [],
            contraindications: [],
            autonomousAction: {
              targetRoute: data.route || "/his/doctor",
              actionName: "Autonomous Clinical Consultation",
              reason: data.englishExplanation || spokenReply
            },
            patientFriendlyExplanation: data.englishExplanation || spokenReply
          };
          setClinicalNlpResult(clinResult);
        }

        // Form Entity Extraction & DOM Auto-filling
        if (data.formAutoFill) {
          const fill = data.formAutoFill;
          const filledItems: string[] = [];

          if (fill.name) {
            autoFillDOMInput('input[placeholder*="Patient" i], input[placeholder*="Name" i], input[name="name"], input[id*="name" i]', fill.name);
            filledItems.push(`Name: ${fill.name}`);
          }
          if (fill.age) {
            autoFillDOMInput('input[placeholder*="Age" i], input[name="age"], input[id*="age" i]', fill.age);
            filledItems.push(`Age: ${fill.age}`);
          }
          if (fill.phone) {
            autoFillDOMInput('input[placeholder*="Mobile" i], input[placeholder*="Phone" i], input[name="phone"], input[type="tel"]', fill.phone);
            filledItems.push(`Phone: ${fill.phone}`);
          }
          if (fill.bp) {
            autoFillDOMInput('input[placeholder*="120/80" i], input[placeholder*="BP" i], input[name*="bp" i]', fill.bp);
            filledItems.push(`BP: ${fill.bp}`);
          }
          if (fill.temp) {
            autoFillDOMInput('input[placeholder*="98.6" i], input[placeholder*="Temp" i], input[name*="temp" i]', fill.temp);
            filledItems.push(`Temp: ${fill.temp}°F`);
          }
          if (fill.concern) {
            autoFillDOMInput('textarea, input[placeholder*="fever" i], input[placeholder*="concern" i], input[placeholder*="complaint" i]', fill.concern);
          }

          // Persist for page navigation intake
          sessionStorage.setItem("samanvaya_pending_fill", JSON.stringify(fill));
          dispatchInAppAction("fill_form", fill);

          if (filledItems.length > 0) {
            setLastActionExecuted(`Auto-filled: ${filledItems.join(", ")}`);
          }
        }

        // Autonomous Portal Navigation
        if (data.route) {
          const target = data.route.trim();
          const current = (pathname || "").trim();
          if (target && target !== current) {
            setLastActionExecuted(`Navigating to ${target}...`);
            try {
              router.push(target);
            } catch (err) {
              window.location.href = target;
            }
            setTimeout(() => {
              if (typeof window !== "undefined" && window.location.pathname !== target) {
                window.location.href = target;
              }
            }, 350);
          }
        }

        // Interactive Chips
        const chips: string[] = Array.isArray(data.suggestedChips) && data.suggestedChips.length > 0
          ? data.suggestedChips
          : ["📄 Scan Prescriptions", "🩺 Doctor OPD Desk", "🏥 Registration Kiosk"];

        setQuickActions(
          chips.map((chipText: string, idx: number) => ({
            label: chipText,
            action: () => processAutonomousCommand(chipText),
            isPrimary: idx === 0
          }))
        );

        // Append assistant message to chatMessages
        setChatMessages(prev => [
          ...prev,
          {
            id: "ast-" + Date.now(),
            sender: "assistant",
            text: spokenReply,
            englishExplanation: data.englishExplanation,
            timestamp: Date.now(),
            route: data.route,
            chips,
            isEmergency: Boolean(data.isEmergency),
            clinicalCondition: data.clinicalCondition,
            icd10: data.icd10
          }
        ]);

        // Speak aloud in Indic language via Bhashini TTS (Tier 1) -> Sarvam AI (Tier 2)
        speakResponse(spokenReply);
        setIsProcessing(false);
        return;
      }
    } catch (apiErr) {
      console.warn("Dynamic assistant chat API encountered an error, falling back:", apiErr);
    }

    // 3. DYNAMIC FALLBACK ROUTER (If Groq API temporarily unavailable)
    let fallbackReply = `I have received your request regarding: "${rawCmd}". Directing to relevant desk.`;
    let fallbackRoute: string | null = null;
    let fallbackChips: string[] = ["📄 Scan Prescriptions", "🩺 Doctor Desk", "🏥 Registration", "🌿 AYUSH"];

    if (text.includes("scheme") || text.includes("pmjay") || text.includes("ayushman") || text.includes("insurance") || text.includes("yojna") || text.includes("bpl") || text.includes("ration")) {
      fallbackReply = "Opening Ayushman Bharat PM-JAY and Government Health Scheme Navigator. What is your annual family income or do you hold a BPL ration card?";
      fallbackRoute = "/his/schemes";
      fallbackChips = ["Income < ₹2.5 Lakhs", "Income ₹2.5L - ₹5L", "BPL / Ration Card Holder", "Check PM-JAY Coverage"];
    } else if (text.includes("ocr") || text.includes("scan") || text.includes("prescription") || text.includes("parchi") || text.includes("jan aushadhi") || text.includes("generic")) {
      fallbackReply = "Opening Prescription OCR and PMBJP Jan Aushadhi generic savings portal. Please upload your prescription slip or enter your medicine name.";
      fallbackRoute = "/his/ocr";
      fallbackChips = ["Upload Prescription", "Locate Jan Aushadhi", "Check 80% Savings", "Audio Dosage"];
    } else if (text.includes("doctor") || text.includes("physician") || text.includes("opd") || text.includes("consult")) {
      fallbackReply = "Opening Physician Consultation Desk and Clinical Decision Support System. Which patient token shall we review?";
      fallbackRoute = "/his/doctor";
      fallbackChips = ["Review Queue", "Prescribe Medicines", "Clinical Decision", "Lab Investigations"];
    } else if (text.includes("register") || text.includes("triage") || text.includes("kiosk") || text.includes("admit") || text.includes("token")) {
      fallbackReply = "Opening Smart Parchi Patient Registration and Triage Kiosk. What is the patient's full name, age, and chief symptom?";
      fallbackRoute = "/his/registration";
      fallbackChips = ["Enter ABHA ID", "Record Vitals", "Generate Token", "Emergency Triage"];
    } else if (text.includes("ayush") || text.includes("prakriti") || text.includes("ayurved") || text.includes("dosha")) {
      fallbackReply = "Opening AYUSH Prakriti Pariksha and Tridosha Assessment. How is your digestion, sleep, and body temperature tolerance?";
      fallbackRoute = "/his/ayush";
      fallbackChips = ["Start Prakriti Quiz", "Tridosha Balance", "Herb-Drug Safety", "Dietary Regimen"];
    } else if (text.includes("queue") || text.includes("wait")) {
      fallbackReply = "Opening Live OPD Queue and Smart Token Board. What is your Token Number or OPD department?";
      fallbackRoute = "/his/queue";
      fallbackChips = ["View Token List", "Estimated Wait", "SMS Alerts", "Department Status"];
    } else if (text.includes("patient") || text.includes("card") || text.includes("abha") || text.includes("locker")) {
      fallbackReply = "Opening Patient Self-Service Portal with 3D Ayushman ABHA Smart Card. Would you like to view your card or medical locker?";
      fallbackRoute = "/patient";
      fallbackChips = ["View ABHA Card", "Past Prescriptions", "Health Locker", "Download QR"];
    } else if (text.includes("antibiotic") || text.includes("antimicrobial") || text.includes("aware")) {
      fallbackReply = "Opening WHO AWaRe Antimicrobial Stewardship Audit. Which antibiotic and indication shall we evaluate?";
      fallbackRoute = "/his/antimicrobial";
      fallbackChips = ["Audit Amoxicillin", "Check AWaRe Category", "ICMR Guidelines"];
    } else if (text.includes("mental") || text.includes("depression") || text.includes("stress") || text.includes("tele-manas")) {
      fallbackReply = "Opening Tele-MANAS 14416 Mental Health Portal. Would you like a PHQ-9 wellness check or guided breathing?";
      fallbackRoute = "/his/tele-manas";
      fallbackChips = ["Take PHQ-9 Assessment", "Guided Breathing", "Call 14416 Helpline"];
    } else if (text.includes("privacy") || text.includes("consent") || text.includes("dpdp")) {
      fallbackReply = "Opening DPDP 2023 Digital Health Consent Manager. Would you like to review active data sharing consents?";
      fallbackRoute = "/his/dpdp";
      fallbackChips = ["Review Consents", "Revoke Access", "Audit Trail"];
    }

    if (fallbackRoute) {
      const target = fallbackRoute.trim();
      const current = (pathname || "").trim();
      if (target && target !== current) {
        setLastActionExecuted(`Navigating to ${target}...`);
        try {
          router.push(target);
        } catch (e) {
          window.location.href = target;
        }
        setTimeout(() => {
          if (typeof window !== "undefined" && window.location.pathname !== target) {
            window.location.href = target;
          }
        }, 350);
      }
    }

    setAssistantResponse(fallbackReply);
    setChatMessages(prev => [
      ...prev,
      {
        id: "ast-" + Date.now(),
        sender: "assistant",
        text: fallbackReply,
        timestamp: Date.now(),
        route: fallbackRoute,
        chips: fallbackChips
      }
    ]);
    setQuickActions(
      fallbackChips.map((c, i) => ({
        label: c,
        action: () => processAutonomousCommand(c),
        isPrimary: i === 0
      }))
    );
    speakResponse(fallbackReply);
    setIsProcessing(false);
  };

  // -------------------------------------------------------------
  // REAL-TIME CONTINUOUS LISTENING SPEECH ENGINE
  // -------------------------------------------------------------
  const startListening = () => {
    if (typeof window === "undefined") return;

    // MUTEX CHECK: Do not start listening if assistant is actively speaking!
    if (isAssistantSpeakingRef.current) {
      console.log("Speech recognition start skipped: assistant is currently speaking.");
      return;
    }

    const persona = VOICE_PERSONAS.find(p => p.id === selectedPersona) || VOICE_PERSONAS[0];

    // For all regional Indic languages, Web Speech API has poor browser support on desktop.
    // We route directly to MediaRecorder + Bhashini Conformer ASR (with Sarvam fallback) for pristine accuracy!
    if (persona.bhashiniCode !== "en" && persona.bhashiniCode !== "hi") {
      fallbackMediaRecorder();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch (e) {}
        }
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.lang = persona.lang;
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsRecording(true);
          reset8sSilenceTimer();
          setAssistantResponse(`Listening to ${persona.name} (${persona.nativeName})... Speak naturally.`);
        };

        recognition.onresult = (event: any) => {
          // MUTEX CHECK: Completely discard any sound received while assistant is speaking
          if (isAssistantSpeakingRef.current) {
            return;
          }

          reset8sSilenceTimer();

          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentText = finalTranscript || interimTranscript;
          setUserInput(currentText);
          lastTranscriptRef.current = currentText;

          // Auto-process on stop speaking (1.2s debounce after speech pause)
          if (speechDebounceRef.current) clearTimeout(speechDebounceRef.current);
          speechDebounceRef.current = setTimeout(() => {
            if (lastTranscriptRef.current.trim().length > 2 && !isAssistantSpeakingRef.current) {
              const cmd = lastTranscriptRef.current;
              lastTranscriptRef.current = "";
              stopListening();
              processAutonomousCommand(cmd);
            }
          }, 1200);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          if (event.error === "not-allowed") {
            stopListening();
            setAssistantResponse("Microphone permission denied. Please allow microphone access in your browser.");
          } else {
            // Fall back to Bhashini MediaRecorder if browser speech recognition has issues
            fallbackMediaRecorder();
          }
        };

        recognition.onend = () => {
          // Only restart if still recording AND assistant is NOT speaking
          if (isRecording && !isAssistantSpeakingRef.current) {
            try {
              recognition.start();
            } catch (e) {
              setIsRecording(false);
            }
          } else {
            setIsRecording(false);
          }
        };

        recognition.start();
        return;
      } catch (e) {
        console.warn("SpeechRecognition init error:", e);
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
        
        if (isAssistantSpeakingRef.current) return;

        const persona = VOICE_PERSONAS.find(p => p.id === selectedPersona) || VOICE_PERSONAS[0];

        setIsProcessing(true);
        setAssistantResponse(`Transcribing ${persona.name} via Bhashini Government ASR...`);

        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "audio.webm");
          formData.append("language", persona.bhashiniCode);
          const res = await fetch(`/api/voice/transcribe`, { method: "POST", body: formData });
          const data = await res.json();
          if (data.text && data.text.trim().length > 0) {
            setUserInput(data.text);
            processAutonomousCommand(data.text);
          } else {
            setAssistantResponse("Could not transcribe speech. Please speak closer to the mic or type below.");
          }
        } catch (err) {
          setAssistantResponse("Speech transcription error. Please type below.");
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      reset8sSilenceTimer();
      setAssistantResponse("Recording audio... Speak now.");
    } catch (err) {
      setIsRecording(false);
      setAssistantResponse("Microphone access unavailable. Please use the text bar below.");
    }
  };

  const stopListening = () => {
    clearSilenceTimers();
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopListening();
    } else {
      if (isAssistantSpeakingRef.current) {
        // Cancel speech if user explicitly clicks mic to speak
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current = null;
        }
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        isAssistantSpeakingRef.current = false;
        setIsSpeaking(false);
      }
      startListening();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    const cmd = userInput;
    setUserInput("");
    stopListening();
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
            className="mb-4 w-96 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-2xl text-[#0f2942] font-sans overflow-hidden"
          >
            {/* Header with Live Status & Controls */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#0f4c81] via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                    <Sparkles className="w-5 h-5 animate-pulse" />
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
                    <h4 className="text-xs font-bold text-[#0f2942]">Samanvaya Clinical Assistant</h4>
                    <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 text-indigo-600 animate-pulse" /> Indian Voice
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {isSpeaking ? "Speaking natural Indian voice..." : isRecording ? `Live Listening (Sleep in ${silenceSecondsLeft}s)` : "Autonomous Live Assistant Ready"}
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
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1 border ${
                    showVoiceSettings 
                      ? "bg-blue-100 text-[#0f4c81] border-blue-300 shadow-2xs" 
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                  title="Switch Indic Language & Voice"
                >
                  <Languages className="w-3.5 h-3.5 text-[#0f4c81]" />
                  <span>{(VOICE_PERSONAS.find(p => p.id === selectedPersona) || VOICE_PERSONAS[0]).nativeName}</span>
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
                  onClick={() => {
                    stopListening();
                    if (currentAudioRef.current) {
                      currentAudioRef.current.pause();
                      currentAudioRef.current = null;
                    }
                    if (typeof window !== "undefined" && "speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                    }
                    isAssistantSpeakingRef.current = false;
                    setIsSpeaking(false);
                    setIsOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Voice & 22 Indic Languages Panel */}
            <AnimatePresence>
              {showVoiceSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-3 text-xs space-y-2.5 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">22 Scheduled Indian Languages:</span>
                      <p className="text-[10px] text-slate-500">Primary: Bhashini MeitY • Fallback: Sarvam AI</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const current = VOICE_PERSONAS.find(p => p.id === selectedPersona) || VOICE_PERSONAS[0];
                        speakResponse(current.nativeGreeting, current.id);
                      }}
                      className="text-[10px] text-[#0f4c81] font-bold hover:underline flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded-lg border border-slate-200"
                    >
                      <Play className="w-3 h-3 text-emerald-600" /> Test Voice
                    </button>
                  </div>

                  {/* Search Bar for Languages */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search language (e.g. Telugu, Tamil, हिन्दी, ಕನ್ನಡ)..."
                      value={languageSearch}
                      onChange={(e) => setLanguageSearch(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                  </div>
                  
                  {/* Languages Grid */}
                  <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {VOICE_PERSONAS
                      .filter(p => 
                        !languageSearch || 
                        p.name.toLowerCase().includes(languageSearch.toLowerCase()) || 
                        p.nativeName.toLowerCase().includes(languageSearch.toLowerCase()) ||
                        p.bhashiniCode.toLowerCase().includes(languageSearch.toLowerCase())
                      )
                      .map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            changePersona(p.id);
                            setShowVoiceSettings(false);
                          }}
                          className={`text-left p-2 rounded-xl border transition-all text-[11px] cursor-pointer ${
                            selectedPersona === p.id 
                              ? "bg-blue-50 border-blue-500 font-bold text-[#0f4c81] shadow-xs ring-1 ring-blue-400" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{p.nativeName}</span>
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">{p.bhashiniCode}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{p.name} • {p.gender}</div>
                        </button>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Visual Waveform & 8-Second Silence Pulse */}
            {isRecording && (
              <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-[#0f2942] text-white p-3 rounded-2xl mb-3 shadow-md">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Voice Listening Active</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono font-bold">
                    Auto-Sleep: {silenceSecondsLeft}s
                  </span>
                </div>

                {/* Animated Waveform Bars */}
                <div className="flex items-center justify-center gap-1 h-8">
                  {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 35, 75].map((height, i) => (
                    <motion.span
                      key={i}
                      animate={{ height: ["20%", `${height}%`, "20%"] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.06 }}
                      className="w-1 bg-gradient-to-t from-blue-400 to-indigo-300 rounded-full"
                    />
                  ))}
                </div>
                <p className="text-[10px] text-center text-blue-200 mt-1 truncate">
                  {userInput || "Speak now... Auto-processes when you pause."}
                </p>
              </div>
            )}

            {/* Conversation Dialogue Viewport */}
            <div 
              ref={chatScrollRef}
              className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3 mb-3 max-h-72 min-h-[90px] overflow-y-auto space-y-3 text-xs relative"
            >
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  {/* Sender Label */}
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {msg.sender === "user" ? "You" : "Samanvaya AI Co-Pilot"}
                    </span>
                    {msg.sender === "assistant" && isSpeaking && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </div>

                  {/* Speech / Text Bubble */}
                  <div className={`p-3 rounded-2xl max-w-[92%] shadow-xs transition-all ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-[#0f4c81] to-indigo-600 text-white rounded-tr-none font-medium text-right"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-none font-medium"
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>

                    {/* Subtitle / English Explanation if target language was vernacular */}
                    {msg.englishExplanation && msg.englishExplanation !== msg.text && (
                      <p className="text-[10px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-100 italic">
                        &ldquo;{msg.englishExplanation}&rdquo;
                      </p>
                    )}

                    {/* Emergency Warning */}
                    {msg.isEmergency && (
                      <div className="mt-2 p-2 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>RED-FLAG TRIAGE: Emergency priority assigned</span>
                      </div>
                    )}

                    {/* Standardized Clinical Finding */}
                    {(msg.clinicalCondition || msg.icd10) && (
                      <div className="mt-2 p-2 rounded-xl bg-indigo-50/90 border border-indigo-200 text-[#0f2942] text-[10px] space-y-1">
                        <div className="flex items-center gap-1 font-bold text-indigo-700">
                          <Stethoscope className="w-3 h-3 text-indigo-600" />
                          <span>{msg.clinicalCondition || "Standardized Clinical Assessment"}</span>
                        </div>
                        {msg.icd10 && (
                          <div className="text-slate-600 font-mono text-[9px]">
                            ICD-10 Code: <strong>{msg.icd10}</strong>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Autonomous Route Notification */}
                    {msg.route && (
                      <div className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>Opening {msg.route}</span>
                      </div>
                    )}

                    {/* Interactive Clickable Response Chips */}
                    {msg.chips && msg.chips.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {msg.chips.map((chipText, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => processAutonomousCommand(chipText)}
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#0f4c81] hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-102"
                          >
                            <span>{chipText}</span>
                            <ArrowUpRight className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Real-time Action Badge Toast */}
              {lastActionExecuted && (
                <div className="sticky bottom-0 inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-xl bg-emerald-600 text-white shadow-md">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{lastActionExecuted}</span>
                </div>
              )}

              {/* Dynamic Reasoning Spinner */}
              {isProcessing && (
                <div className="flex items-center gap-2 text-[#0f4c81] font-bold text-[11px] bg-blue-50/80 p-2.5 rounded-xl border border-blue-100 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0f4c81]" />
                  <span>Clinical AI dynamic reasoning in {VOICE_PERSONAS.find(p => p.id === selectedPersona)?.nativeName || "Indic language"}...</span>
                </div>
              )}
            </div>

            {/* Quick Command Suggestions Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar text-[10px]">
              <button
                type="button"
                onClick={() => processAutonomousCommand("open ocr")}
                className="whitespace-nowrap px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full font-bold border border-emerald-200 transition-colors cursor-pointer"
              >
                📄 Jan Aushadhi & OCR
              </button>
              <button
                type="button"
                onClick={() => processAutonomousCommand("open schemes")}
                className="whitespace-nowrap px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-[#f37021] rounded-full font-bold border border-orange-200 transition-colors cursor-pointer"
              >
                🛡️ PM-JAY Schemes
              </button>
              <button
                type="button"
                onClick={() => processAutonomousCommand("open doctor")}
                className="whitespace-nowrap px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full font-bold border border-purple-200 transition-colors cursor-pointer"
              >
                🩺 Doctor Desk
              </button>
              <button
                type="button"
                onClick={() => processAutonomousCommand("register patient Anita age 19 with high fever and BP 120 over 80")}
                className="whitespace-nowrap px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#0f4c81] rounded-full font-bold border border-blue-200 transition-colors cursor-pointer"
              >
                ✍️ Auto-Fill &quot;Anita 19F BP 120/80&quot;
              </button>
            </div>

            {/* Interactive Voice & Text Input Form */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask clinical queries, say 'open doctor', 'open ocr'..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#0f2942] font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#0f4c81] transition-all"
                disabled={isProcessing}
              />
              <button
                type="button"
                onClick={handleMicClick}
                disabled={isProcessing}
                className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  isRecording
                    ? "bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-300"
                    : "bg-gradient-to-tr from-[#0f4c81] to-indigo-600 text-white hover:opacity-90 shadow-sm"
                }`}
                title={isRecording ? "Stop listening" : "Start voice assistant listening"}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                type="submit"
                disabled={isProcessing || !userInput.trim()}
                className="bg-[#0f4c81] hover:bg-blue-900 text-white p-2.5 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Orb Button with Voice Waves */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          const nextState = !isOpen;
          setIsOpen(nextState);
          if (nextState) {
            // Cancel any leftover speech
            if (currentAudioRef.current) {
              currentAudioRef.current.pause();
              currentAudioRef.current = null;
            }
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
              window.speechSynthesis.cancel();
            }
            isAssistantSpeakingRef.current = false;
            setIsSpeaking(false);
            if (!isRecording) {
              startListening();
            }
          } else {
            stopListening();
          }
        }}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0f4c81] via-indigo-600 to-purple-600 hover:from-blue-900 hover:to-[#0f4c81] border-2 border-white flex items-center justify-center text-white shadow-2xl relative cursor-pointer"
        title="Open Samanvaya Clinical Assistant"
      >
        <Sparkles className="w-6 h-6 text-white" />
        
        {/* Active Live Indicator */}
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
