import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Sarvam AI API Key Pool (fallback tier)
const ENCODED_KEYS = [
  "c2tfMmtkMTU3OWZfWmFHNEFuNnFsMFppTTZnbXJDaGY1eGln",
  "c2tfZm1ieG42OTJfRUV6VGkwdUNFVjRJRldVMEZvTXVuelJJ",
  "c2tfMTN3NzRpcHVfZDg2YWNYQnNqUVVDSjJuN1lMak9XWUto",
  "c2tfZWlqYTM0MHhfWDRZR1ZqdjlmczN0N05hMzJqbTM2VEJ4"
];

const SARVAM_KEYS = (process.env.SARVAM_API_KEY ? [process.env.SARVAM_API_KEY] : []).concat(
  ENCODED_KEYS.map(k => Buffer.from(k, "base64").toString("utf-8"))
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      text = "Namaste, welcome to Project Samanvaya", 
      language_code = "hi-IN", 
      gender = "female"
    } = body;

    const cleanText = text.slice(0, 500).replace(/[\n\r]+/g, " ").trim();
    if (!cleanText) {
      return NextResponse.json({ error: "Empty text" }, { status: 400 });
    }

    const bhashiniLang = language_code.split("-")[0] || "hi";

    // =========================================================================
    // TIER 1: BHASHINI GOVERNMENT AI API (PRIMARY TTS ENGINE)
    // =========================================================================
    try {
      const bhashiniRes = await fetch(`${BACKEND_URL}/api/bhashini/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText,
          language: bhashiniLang,
          target_language: bhashiniLang,
          gender: gender
        })
      });

      if (bhashiniRes.ok) {
        const bhashiniData = await bhashiniRes.json();
        if (bhashiniData.base64_audio && bhashiniData.base64_audio.length > 100) {
          return NextResponse.json({
            base64_audio: bhashiniData.base64_audio,
            mime_type: "audio/wav",
            provider: "bhashini-government-ai",
            language: bhashiniLang
          });
        }
      }
    } catch (err: any) {
      console.warn("[Voice Speak Route] Bhashini primary failed, falling back:", err.message);
    }

    // =========================================================================
    // TIER 2: SARVAM AI BULBUL V3 (SECONDARY FALLBACK ENGINE)
    // =========================================================================
    for (const apiKey of SARVAM_KEYS) {
      try {
        const sarvamRes = await fetch("https://api.sarvam.ai/text-to-speech", {
          method: "POST",
          headers: {
            "api-subscription-key": apiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: [cleanText],
            target_language_code: language_code,
            speaker: gender === "female" ? "pooja" : "aditya",
            pitch: 0,
            pace: 1.0,
            loudness: 1.5,
            speech_sample_rate: 22050,
            enable_preprocessing: true,
            model: "bulbul:v3"
          }),
          signal: AbortSignal.timeout(6000)
        });

        if (sarvamRes.ok) {
          const sarvamData = await sarvamRes.json();
          const base64Audio = sarvamData?.audios?.[0];
          if (base64Audio) {
            return NextResponse.json({
              base64_audio: base64Audio,
              mime_type: "audio/wav",
              provider: "sarvam-ai-bulbul-v3",
              language: language_code
            });
          }
        }
      } catch (err: any) {
        console.warn("Sarvam key failover:", err.message);
      }
    }

    return NextResponse.json({
      base64_audio: null,
      error: "All voice engines unavailable; use client speech synthesis fallback."
    });
  } catch (error: any) {
    return NextResponse.json({ base64_audio: null, error: error.message }, { status: 500 });
  }
}
