/**
 * Project Samanvaya - Bhashini Voice Pipeline Client
 * ====================================================
 * Frontend service for browser-based audio recording, Bhashini API calls,
 * and TTS audio playback. Connects to backend /api/bhashini/* endpoints.
 *
 * Features:
 * - Browser microphone recording via MediaRecorder API
 * - Audio blob → base64 conversion
 * - Bhashini ASR (speech-to-text), NMT (translation), TTS (text-to-speech)
 * - Full ASR→NMT→TTS combo pipeline
 * - Audio language detection (ALD)
 * - TTS audio playback via AudioContext
 * - Unified clinical RAG query with voice I/O
 */

const API_BASE =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// =============================================================================
// AUDIO RECORDING (Browser MediaRecorder)
// =============================================================================

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingStream: MediaStream | null = null;

export async function startRecording(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      sampleRate: 16000,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
    },
  });
  recordingStream = stream;
  audioChunks = [];

  mediaRecorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm",
  });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  mediaRecorder.start(250); // Collect chunks every 250ms
}

export async function stopRecording(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      reject(new Error("No active recording"));
      return;
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const base64 = await blobToBase64(audioBlob);

      // Cleanup
      if (recordingStream) {
        recordingStream.getTracks().forEach((track) => track.stop());
        recordingStream = null;
      }
      mediaRecorder = null;
      audioChunks = [];

      resolve(base64);
    };

    mediaRecorder.stop();
  });
}

export function isRecording(): boolean {
  return mediaRecorder !== null && mediaRecorder.state === "recording";
}

// =============================================================================
// AUDIO UTILITIES
// =============================================================================

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      // Strip the "data:audio/webm;base64," prefix
      const base64 = dataUrl.split(",")[1] || dataUrl;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Play base64-encoded audio through the browser speakers.
 * Supports WAV and WebM formats from Bhashini TTS.
 */
export async function playAudioBase64(base64Audio: string): Promise<void> {
  if (!base64Audio || base64Audio.length < 50) return;

  try {
    const binaryStr = atob(base64Audio);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const audioCtx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer);
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(0);

    // Return a promise that resolves when playback is done
    return new Promise((resolve) => {
      source.onended = () => {
        audioCtx.close();
        resolve();
      };
    });
  } catch (err) {
    // Fallback: use Audio element with data URL
    console.warn("[Bhashini] AudioContext failed, falling back to Audio element:", err);
    const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
    return audio.play();
  }
}

// =============================================================================
// BHASHINI API CALLS
// =============================================================================

/**
 * Bhashini ASR: Speech-to-text for any of 22 Indian languages.
 */
export async function transcribeAudio(
  base64Audio: string,
  sourceLanguage: string = "hi"
): Promise<{ text: string; latency_ms: number; language: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/bhashini/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64_audio: base64Audio,
        source_language: sourceLanguage,
      }),
    });
    if (!res.ok) throw new Error(`ASR failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[Bhashini ASR]", err);
    return { text: "", latency_ms: 0, language: sourceLanguage };
  }
}

/**
 * Bhashini NMT: Translate text between any Indic language pair.
 */
export async function translateText(
  text: string,
  sourceLanguage: string = "hi",
  targetLanguage: string = "en"
): Promise<{ translated_text: string; latency_ms: number }> {
  try {
    const res = await fetch(`${API_BASE}/api/bhashini/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      }),
    });
    if (!res.ok) throw new Error(`NMT failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[Bhashini NMT]", err);
    return { translated_text: text, latency_ms: 0 };
  }
}

/**
 * Bhashini TTS: Convert text to spoken audio.
 */
export async function textToSpeech(
  text: string,
  language: string = "hi",
  gender: string = "female",
  speed: number = 1.0
): Promise<{ audio_base64: string; latency_ms: number }> {
  try {
    const res = await fetch(`${API_BASE}/api/bhashini/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language, gender, speed }),
    });
    if (!res.ok) throw new Error(`TTS failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[Bhashini TTS]", err);
    return { audio_base64: "", latency_ms: 0 };
  }
}

/**
 * Full Bhashini ASR→NMT→TTS combo pipeline.
 */
export async function voiceToVoice(
  base64Audio: string,
  sourceLanguage: string = "hi",
  targetLanguage: string = "en",
  gender: string = "female"
): Promise<{
  transcribed_text: string;
  translated_text: string;
  audio_base64: string;
  latency_ms: number;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/bhashini/pipeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64_audio: base64Audio,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        gender,
      }),
    });
    if (!res.ok) throw new Error(`Pipeline failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[Bhashini Pipeline]", err);
    return {
      transcribed_text: "",
      translated_text: "",
      audio_base64: "",
      latency_ms: 0,
    };
  }
}

/**
 * Bhashini ALD: Auto-detect spoken language from raw audio.
 */
export async function detectLanguage(
  base64Audio: string
): Promise<{ detected_language: string; latency_ms: number }> {
  try {
    const res = await fetch(`${API_BASE}/api/bhashini/detect-language`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64_audio: base64Audio }),
    });
    if (!res.ok) throw new Error(`ALD failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[Bhashini ALD]", err);
    return { detected_language: "hi", latency_ms: 0 };
  }
}

// =============================================================================
// UNIFIED CLINICAL RAG + VOICE QUERY
// =============================================================================

export interface ClinicalRAGResponse {
  query: string;
  response: string;
  response_english: string;
  llm_metadata: {
    branch: string;
    model: string;
    parameter_scale: string;
    tier: string;
    llm_latency_seconds: number;
  };
  rag_metadata: {
    matched_condition: string;
    is_emergency: boolean;
    confidence: number;
  } | null;
  tts: { audio_base64: string; latency_ms: number } | null;
  pipeline_latency_ms: number;
  source_language: string;
  target_language: string;
}

/**
 * Unified clinical RAG query with optional voice I/O.
 * Translates → RAG retrieval → Dual-Branch LLM → Translate back → TTS
 */
export async function clinicalRAGQuery(
  query: string,
  sourceLanguage: string = "en",
  targetLanguage: string = "en",
  options: {
    useMedicalBranch?: boolean;
    useRag?: boolean;
    speakResponse?: boolean;
    voiceGender?: string;
  } = {}
): Promise<ClinicalRAGResponse> {
  const {
    useMedicalBranch = true,
    useRag = true,
    speakResponse = false,
    voiceGender = "female",
  } = options;

  try {
    const res = await fetch(`${API_BASE}/api/clinical/rag-query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        use_medical_branch: useMedicalBranch,
        use_rag: useRag,
        speak_response: speakResponse,
        voice_gender: voiceGender,
      }),
    });
    if (!res.ok) throw new Error(`Clinical RAG failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[Clinical RAG]", err);
    return {
      query,
      response: "Service temporarily unavailable. Please try again.",
      response_english: "",
      llm_metadata: {
        branch: "error",
        model: "fallback",
        parameter_scale: "N/A",
        tier: "Error",
        llm_latency_seconds: 0,
      },
      rag_metadata: null,
      tts: null,
      pipeline_latency_ms: 0,
      source_language: sourceLanguage,
      target_language: targetLanguage,
    };
  }
}

// =============================================================================
// LANGUAGE CODE MAP (for UI dropdowns)
// =============================================================================

export const BHASHINI_LANGUAGES = [
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
  { code: "brx", name: "Bodo", nativeName: "बड़ो" },
  { code: "doi", name: "Dogri", nativeName: "डोगरी" },
  { code: "ks", name: "Kashmiri", nativeName: "كٲشُر" },
  { code: "gom", name: "Konkani", nativeName: "कोंकणी" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली" },
  { code: "mni", name: "Manipuri", nativeName: "মৈতৈলোন্" },
  { code: "sat", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي" },
] as const;

export type BhashiniLanguageCode = (typeof BHASHINI_LANGUAGES)[number]["code"];
