import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const SARVAM_KEYS = [
  process.env.SARVAM_API_KEY,
  "sk_2kd1579f_ZaG4An6ql0ZiM6gmrChf5xig",
  "sk_fmbxn692_EEzTi0uCEV4IFWU0FoMunzII",
  "sk_13w74ipu_d86acXBsjQUCJ2n7YLjOWYKh"
].filter(Boolean) as string[];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("file") as Blob | null;
    const sourceLanguage = (formData.get("language") as string) || "hi";
    const bhashiniLang = sourceLanguage.split("-")[0] || "hi";

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    // =========================================================================
    // TIER 1: BHASHINI GOVERNMENT ASR (PRIMARY SPEECH-TO-TEXT ENGINE)
    // =========================================================================
    try {
      const bhashiniRes = await fetch(`${BACKEND_URL}/api/bhashini/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64_audio: base64Audio,
          source_language: bhashiniLang
        })
      });

      if (bhashiniRes.ok) {
        const bhashiniData = await bhashiniRes.json();
        if (bhashiniData.text && bhashiniData.text.trim().length > 0) {
          return NextResponse.json({
            text: bhashiniData.text.trim(),
            provider: "bhashini-government-asr",
            language: bhashiniLang,
            latency_ms: bhashiniData.latency_ms
          });
        }
      }
    } catch (bErr: any) {
      console.warn("[Voice Transcribe Route] Bhashini ASR primary failed, falling back to Sarvam:", bErr.message);
    }

    // =========================================================================
    // TIER 2: SARVAM AI SAARAS STT (SECONDARY FALLBACK ENGINE)
    // =========================================================================
    for (const apiKey of SARVAM_KEYS) {
      try {
        const sarvamForm = new FormData();
        sarvamForm.append("file", audioFile, "audio.webm");
        sarvamForm.append("language_code", sourceLanguage === "en" ? "hi-IN" : (sourceLanguage.includes("-") ? sourceLanguage : `${sourceLanguage}-IN`));
        sarvamForm.append("model", "saaras:v1");

        const sarvamRes = await fetch("https://api.sarvam.ai/speech-to-text", {
          method: "POST",
          headers: {
            "api-subscription-key": apiKey
          },
          body: sarvamForm,
          signal: AbortSignal.timeout(6000)
        });

        if (sarvamRes.ok) {
          const sData = await sarvamRes.json();
          const transcript = sData?.transcript || sData?.text;
          if (transcript && transcript.trim().length > 0) {
            return NextResponse.json({
              text: transcript.trim(),
              provider: "sarvam-ai-saaras",
              language: sourceLanguage
            });
          }
        }
      } catch (sErr: any) {
        console.warn("[Voice Transcribe Route] Sarvam key fallback:", sErr.message);
      }
    }

    // =========================================================================
    // TIER 3: NVIDIA WHISPER-LARGE-V3 (TERTIARY FALLBACK ENGINE)
    // =========================================================================
    const whisperKey = process.env.NVIDIA_WHISPER_KEY || process.env.NVIDIA_API_KEY || process.env.NVIDIA_LLAMA_3_3_70B_KEY_1 || "";
    if (whisperKey) {
      try {
        const whisperData = new FormData();
        whisperData.append("file", audioFile, "audio.webm");
        whisperData.append("model", "openai/whisper-large-v3");
        whisperData.append("response_format", "json");

        const whisperRes = await fetch("https://integrate.api.nvidia.com/v1/audio/transcriptions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${whisperKey}` },
          body: whisperData,
          signal: AbortSignal.timeout(6000)
        });

        if (whisperRes.ok) {
          const result = await whisperRes.json();
          if (result.text && result.text.trim().length > 0) {
            return NextResponse.json({
              text: result.text.trim(),
              provider: "nvidia-whisper-v3",
              language: "auto"
            });
          }
        }
      } catch (e: any) {
        console.warn("[Voice Transcribe Route] NIM Whisper API fallback failed:", e.message);
      }
    }

    return NextResponse.json({
      text: "",
      error: "Unable to transcribe audio across all primary and fallback providers."
    }, { status: 422 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
