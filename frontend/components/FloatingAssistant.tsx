"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, MicOff, Sparkles, X, Send, Bot, Loader2, Volume2, VolumeX, 
  Settings2, Stethoscope, ChevronRight, AlertTriangle, 
  CheckCircle2, ArrowUpRight, Play, HeartPulse, ShieldAlert, Radio
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { translatePatientToClinical, ClinicalTranslationResult } from "@/services/clinical_nlp";

interface FloatingAssistantProps {
  currentStep?: number;
  onNavigate?: (step: number) => void;
  onAction?: (action: string, value?: any) => void;
  onLanguageChange?: (lang: string) => void;
}

export type VoicePersona = "priya" | "aditya" | "pooja" | "kavitha" | "ritu";

interface VoiceConfig {
  id: VoicePersona;
  name: string;
  role: string;
  lang: string;
  sarvamSpeaker: string;
  gender: "female" | "male";
}

const VOICE_PERSONAS: VoiceConfig[] = [
  { id: "priya", name: "Dr. Priya", role: "Indian English Female Doctor", lang: "en-IN", sarvamSpeaker: "priya", gender: "female" },
  { id: "aditya", name: "Dr. Aditya", role: "Indian English Male Physician", lang: "en-IN", sarvamSpeaker: "aditya", gender: "male" },
  { id: "pooja", name: "Pooja", role: "Hindi Natural Voice", lang: "hi-IN", sarvamSpeaker: "pooja", gender: "female" },
  { id: "kavitha", name: "Kavitha", role: "Telugu Natural Voice", lang: "te-IN", sarvamSpeaker: "kavitha", gender: "female" },
  { id: "ritu", name: "Dr. Ritu", role: "Hindi Clinical Specialist", lang: "hi-IN", sarvamSpeaker: "ritu", gender: "female" }
];

export default function FloatingAssistant({ onNavigate, onAction, onLanguageChange }: FloatingAssistantProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>("priya");
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
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
    const msg = `Voice changed to ${persona?.name} (${persona?.role}).`;
    setAssistantResponse(msg);
    speakResponse(msg, personaId);
  };

  // -------------------------------------------------------------
  // SARVAM AI VOICE SYNTHESIS + STRICT AUDIO LOCKING
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

    try {
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          language_code: persona.lang,
          speaker: persona.sarvamSpeaker
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
  // -------------------------------------------------------------
  const processAutonomousCommand = async (rawCmd: string) => {
    const text = rawCmd.toLowerCase().trim();
    if (!text) return;

    setIsProcessing(true);
    setClinicalNlpResult(null);
    setQuickActions([]);
    setLastActionExecuted(null);

    let reply = "";

    // A. VOICE PERSONA SWITCHER
    if (text.includes("change voice") || text.includes("switch voice") || text.includes("different voice")) {
      const nextIdx = (VOICE_PERSONAS.findIndex(p => p.id === selectedPersona) + 1) % VOICE_PERSONAS.length;
      changePersona(VOICE_PERSONAS[nextIdx].id);
      setIsProcessing(false);
      return;
    }

    // ==============================================================
    // B. NAVIGATION INTENTS (EVALUATED FIRST!)
    // Directly opens any page in Project Samanvaya reliably
    // ==============================================================
    const isNavCommand = 
      text.startsWith("open") || text.startsWith("go to") || text.startsWith("navigate") || 
      text.startsWith("show") || text.startsWith("take me to") || text.includes("page") || 
      text.includes("portal") || text.includes("desk");

    // 1. Prescription OCR & Jan Aushadhi Generic Savings
    if (
      text.includes("ocr") || text.includes("prescription") || text.includes("jan aushadhi") || 
      text.includes("janaushadhi") || text.includes("generic medicine") || text.includes("parchi scan") ||
      text.includes("medicine savings") || text.includes("kendra locator") || text.includes("scan medicine")
    ) {
      router.push("/his/ocr");
      setLastActionExecuted("Navigated to Prescription OCR & Jan Aushadhi");
      reply = "Opening Prescription OCR and PMBJP Jan Aushadhi generic savings portal.";
      setAssistantResponse(reply);
      speakResponse(reply);
      setIsProcessing(false);
      return;
    }

    // 2. Physician Consultation & CDSS Desk
    if (
      text.includes("doctor") || text.includes("physician") || text.includes("opd desk") || 
      text.includes("consultation") || text.includes("cdss") || text.includes("clinical decision")
    ) {
      router.push("/his/doctor");
      setLastActionExecuted("Navigated to Doctor Desk");
      reply = "Opening Physician Consultation Desk and Clinical Decision Support System.";
      setAssistantResponse(reply);
      speakResponse(reply);
      setIsProcessing(false);
      return;
    }

    // 3. Smart Parchi Kiosk & Patient Registration
    if (
      (isNavCommand && (text.includes("registration") || text.includes("kiosk") || text.includes("admit"))) ||
      text.includes("smart parchi") || text.includes("patient registration") || text.includes("triage desk")
    ) {
      router.push("/his/registration");
      setLastActionExecuted("Navigated to Patient Registration");
      reply = "Opening Smart Parchi Patient Registration and Triage Kiosk.";
      setAssistantResponse(reply);
      speakResponse(reply);
      setIsProcessing(false);
      return;
    }

    // 4. Government Health Schemes & PM-JAY Cashless Claims
    if (
      text.includes("scheme") || text.includes("pmjay") || text.includes("ayushman") || 
      text.includes("insurance") || text.includes("claim") || text.includes("golden card") ||
      text.includes("aarogyasri") || text.includes("mjpjay")
    ) {
      router.push("/his/schemes");
      setLastActionExecuted("Navigated to Schemes");
      reply = "Opening Ayushman Bharat PM-JAY and State Health Scheme Navigator.";
      setAssistantResponse(reply);
      speakResponse(reply);
      setIsProcessing(false);
      return;
    }

    // 5. Live OPD Queue & SMS Token Board
    if (
      text.includes("queue") || text.includes("token") || text.includes("opd queue") || 
      text.includes("wait time") || text.includes("waiting line")
    ) {
      router.push("/his/queue");
      setLastActionExecuted("Navigated to Live Queue");
      reply = "Opening Live OPD Queue and Smart Token Board.";
      setAssistantResponse(reply);
      speakResponse(reply);
      setIsProcessing(false);
      return;
    }

    // 6. Patient Self-Service Portal & 3D ABHA Card
    if (
      (isNavCommand && text.includes("patient")) || text.includes("patient portal") || 
      text.includes("my card") || text.includes("abha card") || text.includes("health locker")
    ) {
      router.push("/patient");
      setLastActionExecuted("Navigated to Patient Portal");
      reply = "Opening Patient Self-Service Portal with 3D Ayushman ABHA Smart Card.";
      setAssistantResponse(reply);
      speakResponse(reply);
      setIsProcessing(false);
      return;
    }

    // 7. AYUSH Prakriti Pariksha & Integrative Care
    if (
      text.includes("ayush") || text.includes("prakriti") || text.includes("ayurveda") || 
      text.includes("tridosha") || text.includes("vata") || text.includes("pitta") || text.includes("kapha")
    ) {
      router.push("/his/ayush");
      setLastActionExecuted("Navigated to AYUSH");
      reply = "Opening AYUSH Prakriti Pariksha and Tridosha Assessment.";
      setAssistantResponse(reply);
      speakResponse(reply);
      setIsProcessing(false);
      return;
    }

    // 8. Clinical RAG & Visual Flowchart Guidelines
    if (
      text.includes("rag") || text.includes("guideline") || text.includes("flowchart") || 
      text.includes("decision tree") || text.includes("icmr protocol") || text.includes("visual rag")
    ) {
      router.push("/his/rag");
      setLastActionExecuted("Navigated to Clinical RAG");
      reply = "Opening Evidence-Based Clinical RAG and Visual Flowchart Decision System.";
      setAssistantResponse(reply);
      speakResponse(reply);
      setIsProcessing(false);
      return;
    }

    // 9. DPDP Act 2023 Consent & Audit
    if (
      text.includes("dpdp") || text.includes("consent") || text.includes("privacy") || 
      text.includes("audit log") || text.includes("data protection")
    ) {
      router.push("/his/dpdp");
      setLastActionExecuted("Navigated to DPDP Privacy");
      reply = "Opening DPDP Act 2023 Digital Consent and Cryptographic Audit Manager.";
      setAssistantResponse(reply);
      speakResponse(reply);
      setIsProcessing(false);
      return;
    }

    // 10. WHO AWaRe Antimicrobial Stewardship Audit (Phase 2)
    if (
      text.includes("amr") || text.includes("antibiotic") || text.includes("aware") || 
      text.includes("stewardship") || text.includes("icmr antibiotic") || text.includes("drug resistance")
    ) {
      router.push("/his/antimicrobial");
      setLastActionExecuted("Navigated to Antimicrobial Stewardship");
      reply = "Opening WHO AWaRe Antimicrobial Stewardship Audit and ICMR Prescription Safety Engine.";
      setAssistantResponse(reply);
      speakResponse(reply);
      setIsProcessing(false);
      return;
    }

    // 11. Tele-MANAS (14416) Mental Health Screener (Phase 2)
    if (
      text.includes("tele manas") || text.includes("telemanas") || text.includes("mental health") || 
      text.includes("14416") || text.includes("stress") || text.includes("anxiety") || 
      text.includes("breathing") || text.includes("counseling") || text.includes("depression")
    ) {
      router.push("/his/tele-manas");
      setLastActionExecuted("Navigated to Tele-MANAS");
      reply = "Opening Tele-MANAS 14416 Mental Wellness Screener and Box Breathing guide.";
      setAssistantResponse(reply);
      speakResponse(reply);
      setIsProcessing(false);
      return;
    }

    // 10. Home / Main Portal
    if (
      text.includes("home") || text.includes("main page") || text.includes("landing page") || 
      text.includes("start page")
    ) {
      router.push("/");
      setLastActionExecuted("Navigated to Home");
      reply = "Returning to Project Samanvaya Home Portal.";
      setAssistantResponse(reply);
      speakResponse(reply);
      setIsProcessing(false);
      return;
    }

    // ==============================================================
    // C. DIRECT WEB FORM AUTO-FILLER (NAME, AGE, PHONE, VITALS, COMPLAINT)
    // Only runs when demographic/vitals parameters are supplied
    // ==============================================================
    const hasFillIntent = 
      (text.includes("register") || text.includes("fill") || text.includes("name is") || 
       text.includes("named") || text.includes("bp") || text.includes("fever") || text.includes("temp")) &&
      !isNavCommand;

    if (hasFillIntent) {
      const nameMatch = rawCmd.match(/(?:named|name is|patient)\s+([A-Za-z\s]+?)(?:\s+(?:age|aged|phone|mobile|having|with|and|\d)|$)/i);
      const ageMatch = rawCmd.match(/(?:age|aged|years old|yr)\s*[:=]?\s*(\d{1,3})/i);
      const phoneMatch = rawCmd.match(/(?:phone|mobile|contact|call)\s*[:=]?\s*(\d{10})/i);
      const bpMatch = rawCmd.match(/(?:bp|blood pressure)\s*[:=]?\s*(\d{2,3}[/\s]\d{2,3})/i);
      const tempMatch = rawCmd.match(/(?:temp|temperature|fever)\s*[:=]?\s*(\d{2,3}(?:\.\d)?)/i);

      const extractedName = nameMatch ? nameMatch[1].trim() : "";
      const extractedAge = ageMatch ? ageMatch[1] : "";
      const extractedPhone = phoneMatch ? phoneMatch[1] : "";
      const extractedBp = bpMatch ? bpMatch[1].replace(/\s+/, "/") : "";
      const extractedTemp = tempMatch ? tempMatch[1] : "";

      const hasExtractedData = extractedName || extractedAge || extractedPhone || extractedBp || extractedTemp;

      if (hasExtractedData) {
        const isRegistrationPage = pathname === "/his/registration";

        if (!isRegistrationPage) {
          sessionStorage.setItem("samanvaya_pending_fill", JSON.stringify({
            name: extractedName,
            age: extractedAge,
            phone: extractedPhone,
            bp: extractedBp,
            temp: extractedTemp,
            concern: rawCmd
          }));
          router.push("/his/registration");
        }

        let filledFields: string[] = [];
        if (extractedName) {
          autoFillDOMInput('input[placeholder*="Patient" i], input[placeholder*="Name" i], input[name="name"], input[id*="name" i]', extractedName);
          filledFields.push(`Name: ${extractedName}`);
        }
        if (extractedAge) {
          autoFillDOMInput('input[placeholder*="Age" i], input[name="age"], input[id*="age" i]', extractedAge);
          filledFields.push(`Age: ${extractedAge} Yrs`);
        }
        if (extractedPhone) {
          autoFillDOMInput('input[placeholder*="Mobile" i], input[placeholder*="Phone" i], input[name="phone"], input[type="tel"]', extractedPhone);
          filledFields.push(`Phone: ${extractedPhone}`);
        }
        if (extractedBp) {
          autoFillDOMInput('input[placeholder*="120/80" i], input[placeholder*="BP" i], input[name*="bp" i]', extractedBp);
          filledFields.push(`BP: ${extractedBp}`);
        }
        if (extractedTemp) {
          autoFillDOMInput('input[placeholder*="98.6" i], input[placeholder*="Temp" i], input[name*="temp" i]', extractedTemp);
          filledFields.push(`Temp: ${extractedTemp}°F`);
        }

        autoFillDOMInput('textarea, input[placeholder*="fever" i], input[placeholder*="concern" i], input[placeholder*="complaint" i]', rawCmd);

        dispatchInAppAction("fill_form", {
          name: extractedName,
          age: extractedAge,
          phone: extractedPhone,
          bp: extractedBp,
          temp: extractedTemp,
          concern: rawCmd
        });

        reply = `Autonomously filled form fields with: ${filledFields.join(", ")}.`;
        setLastActionExecuted(`Auto-filled: ${filledFields.join(", ")}`);
        setAssistantResponse(reply);
        speakResponse(reply);
        setIsProcessing(false);
        return;
      }
    }

    // C2. UNIVERSAL SEARCH / FILTER AUTO-FILLER
    if (text.startsWith("search") || text.startsWith("find") || text.startsWith("filter")) {
      const queryTerm = rawCmd.replace(/^(search|find|filter|look for)\s*(for|about)?\s*/i, "").trim();
      if (queryTerm) {
        const didFill = autoFillDOMInput('input[type="search"], input[placeholder*="search" i], input[placeholder*="filter" i]', queryTerm);
        if (didFill) {
          reply = `Autonomously populated search bar with '${queryTerm}'.`;
          setLastActionExecuted(`Searched: ${queryTerm}`);
          setAssistantResponse(reply);
          speakResponse(reply);
          setIsProcessing(false);
          return;
        }
      }
    }

    // C3. DOCTOR DESK PRESCRIPTION AUTO-FILLER
    if (text.startsWith("prescribe") || text.startsWith("give medicine") || text.startsWith("add rx")) {
      const rxTerm = rawCmd.replace(/^(prescribe|give medicine|add rx)\s*/i, "").trim();
      if (rxTerm) {
        if (pathname !== "/his/doctor") {
          router.push("/his/doctor");
        }
        setTimeout(() => {
          autoFillDOMInput('input[placeholder*="medicine" i], input[placeholder*="drug" i], textarea[placeholder*="rx" i], textarea', rxTerm);
        }, 500);
        reply = `Opening Doctor Desk and autonomously queuing prescription: ${rxTerm}.`;
        setLastActionExecuted(`Prescribed: ${rxTerm}`);
        setAssistantResponse(reply);
        speakResponse(reply);
        setIsProcessing(false);
        return;
      }
    }

    // ==============================================================
    // D. CLINICAL NLP SYMPTOM TRANSLATION & STANDARDIZATION
    // ==============================================================
    const isClinicalSymptom = 
      text.includes("dard") || text.includes("pain") || text.includes("jalan") || 
      text.includes("bukhar") || text.includes("fever") || text.includes("cough") || 
      text.includes("khansi") || text.includes("chest") || text.includes("vomit") || 
      text.includes("ulti") || text.includes("seene") || text.includes("pet") || 
      text.includes("chakkar") || text.includes("dizzy") || text.includes("jwaram") || 
      text.includes("noppi") || text.includes("asthma");

    if (isClinicalSymptom) {
      const baselineResult = translatePatientToClinical(rawCmd);
      setClinicalNlpResult(baselineResult);

      let finalResult = baselineResult;
      try {
        const nlpRes = await fetch("/api/nlp/translate-clinical", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: rawCmd })
        });
        if (nlpRes.ok) {
          const nlpData = await nlpRes.json();
          if (nlpData.result) {
            finalResult = nlpData.result;
            setClinicalNlpResult(nlpData.result);
          }
        }
      } catch (err) {
        console.warn("Clinical NLP async inference fallback:", err);
      }

      setLastActionExecuted(`Standardized: ${finalResult.standardizedMedicalTerm}`);

      if (finalResult.isLifeThreat) {
        reply = `Red flag clinical alert. Symptoms indicate '${finalResult.standardizedMedicalTerm}' with ICD-10 ${finalResult.icd10Code}. Routing immediately to Emergency Triage.`;
        router.push("/his/registration");
        dispatchInAppAction("fill_form", {
          concern: finalResult.standardizedMedicalTerm,
          icd10: finalResult.icd10Code
        });
      } else {
        reply = `Clinical finding: Standardized as '${finalResult.standardizedMedicalTerm}' under ICD-10 ${finalResult.icd10Code}. ${finalResult.patientFriendlyExplanation}`;
      }

      setAssistantResponse(reply);
      speakResponse(reply);
      setIsProcessing(false);
      return;
    }

    // ==============================================================
    // E. DYNAMIC CLINICAL AI REASONING VIA GROQ (CONVERSATIONAL BACKEND)
    // No more static canned text! Fully intelligent dynamic responses
    // ==============================================================
    try {
      const chatRes = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: rawCmd,
          currentPath: pathname
        })
      });

      if (chatRes.ok) {
        const chatData = await chatRes.json();
        reply = chatData.spokenReply || `I can help you navigate Samanvaya. Let's look at available options.`;

        if (chatData.suggestedActions && chatData.suggestedActions.length > 0) {
          setQuickActions(
            chatData.suggestedActions.map((act: { label: string; path: string }, idx: number) => ({
              label: act.label,
              action: () => router.push(act.path),
              isPrimary: idx === 0
            }))
          );
        }

        if (chatData.route) {
          setLastActionExecuted(`Navigating to ${chatData.route}`);
          setTimeout(() => router.push(chatData.route), 1200);
        }

        setAssistantResponse(reply);
        speakResponse(reply);
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.warn("Assistant dynamic chat API error:", err);
    }

    // Fallback if API fails
    reply = `I have received your request. You can scan prescriptions for Jan Aushadhi generic savings, register for an ABHA card, or check PM-JAY schemes.`;
    setQuickActions([
      { label: "📄 Prescription OCR & Jan Aushadhi", action: () => router.push("/his/ocr"), isPrimary: true },
      { label: "🛡️ Check PM-JAY Schemes", action: () => router.push("/his/schemes") },
      { label: "🩺 Doctor OPD Desk", action: () => router.push("/his/doctor") }
    ]);
    setAssistantResponse(reply);
    speakResponse(reply);
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

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch (e) {}
        }
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        const persona = VOICE_PERSONAS.find(p => p.id === selectedPersona) || VOICE_PERSONAS[0];
        recognition.lang = persona.lang;
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsRecording(true);
          reset8sSilenceTimer();
          setAssistantResponse("Voice Assistant Active: Listening... Speak naturally.");
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

        setIsProcessing(true);
        setAssistantResponse("Processing speech via Whisper...");

        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "audio.webm");
          const res = await fetch(`/api/voice/transcribe`, { method: "POST", body: formData });
          const data = await res.json();
          if (data.text) {
            setUserInput(data.text);
            processAutonomousCommand(data.text);
          } else {
            setAssistantResponse("Sorry, I could not catch that. Please type below.");
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

            {/* Voice Settings Panel (Sarvam AI Personas) */}
            <AnimatePresence>
              {showVoiceSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-3 text-xs space-y-2.5 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Clinical Voice Personas:</span>
                    <button
                      type="button"
                      onClick={() => speakResponse("Namaste, I am testing the selected clinical voice.")}
                      className="text-[10px] text-[#0f4c81] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3" /> Test
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1.5">
                    {VOICE_PERSONAS.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => changePersona(p.id)}
                        className={`text-left p-2 rounded-xl border transition-all text-[11px] cursor-pointer ${
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

            {/* Response Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-3 min-h-[75px] flex flex-col justify-center text-xs relative overflow-hidden">
              {isProcessing ? (
                <div className="flex items-center gap-2.5 text-[#0f4c81] font-bold">
                  <Loader2 className="w-4 h-4 animate-spin text-[#0f4c81]" />
                  <span>Clinical AI dynamic reasoning...</span>
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

                  {/* Clinical NLP Standardized Pathology Card */}
                  {clinicalNlpResult && (
                    <div className={`mt-2.5 p-3 rounded-2xl border text-xs shadow-xs space-y-2 ${
                      clinicalNlpResult.isLifeThreat
                        ? "bg-red-50/90 border-red-300 text-red-950"
                        : "bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/60 border-indigo-200 text-slate-900"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-md">
                          <Sparkles className="w-3 h-3 text-indigo-600" /> Clinical NLP Co-Pilot
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          clinicalNlpResult.clinicalSeverity === "Critical" 
                            ? "bg-red-600 text-white animate-pulse" 
                            : clinicalNlpResult.clinicalSeverity === "High"
                            ? "bg-amber-600 text-white"
                            : "bg-blue-600 text-white"
                        }`}>
                          {clinicalNlpResult.clinicalSeverity}
                        </span>
                      </div>

                      <div className="font-bold text-slate-900 text-xs mt-0.5 flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{clinicalNlpResult.standardizedMedicalTerm}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-white p-2 rounded-xl border border-slate-200">
                        <div>ICD-10: <strong>{clinicalNlpResult.icd10Code}</strong></div>
                        <div>SNOMED: <strong>{clinicalNlpResult.snomedCode}</strong></div>
                      </div>
                    </div>
                  )}

                  {/* Interactive Quick Action Buttons */}
                  {quickActions.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-2.5 pt-2.5 border-t border-slate-200">
                      {quickActions.map((qa, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            qa.action();
                            setQuickActions([]);
                          }}
                          className={`text-left text-[11px] font-bold py-1.5 px-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
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
