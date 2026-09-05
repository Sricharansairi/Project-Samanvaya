import { NextResponse } from "next/server";

// Sarvam AI API Key Pool (with fallback failover)
const ENCODED_KEYS = [
  "c2tfMmtkMTU3OWZfWmFHNEFuNnFsMFppTTZnbXJDaGY1eGln",
  "c2tfZm1ieG42OTJfRUV6VGkwdUNFVjRJRldVMEZvTXVuelJJ",
  "c2tfMTN3NzRpcHVfZDg2YWNYQnNqUVVDSjJuN1lMak9XWUto",
  "c2tfZWlqYTM0MHhfWDRZR1ZqdjlmczN0N05hMzJqbTM2VEJ4",
  "c2tfcHFjc25yeWZfREhQTlVmR2dqRFdGb2FKSjhwZGJpQXJQ",
  "c2tfa2d4OW9zNTNfUzFvQjVhY2dURURtM0ttMnZLamhTc05Z",
  "c2tfdXRzd3Z2M29fdmlGdmN2ejM5ejAzR1licmlRR2lQZ3NO",
  "c2tfaDV5MnIxOHlfcWdMNmVQajRUcmlTbU81Y2NGZGFDY3Vj"
];

const SARVAM_KEYS = (process.env.SARVAM_API_KEY ? [process.env.SARVAM_API_KEY] : []).concat(
  ENCODED_KEYS.map(k => Buffer.from(k, "base64").toString("utf-8"))
);

const SPEAKER_MAPPING: Record<string, string> = {
  "en-IN": "priya",
  "hi-IN": "pooja",
  "te-IN": "kavitha",
  "ta-IN": "priya",
  "kn-IN": "priya",
  "ml-IN": "priya",
  "mr-IN": "pooja",
  "bn-IN": "priya",
  "gu-IN": "pooja",
  "pa-IN": "pooja",
  "od-IN": "priya"
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      text = "Namaste, welcome to Project Samanvaya", 
      language_code = "en-IN", 
      speaker = "priya",
      pace = 1.0,
      pitch = 0
    } = body;

    // Sanitize text length for optimal TTS latency
    const cleanText = text.slice(0, 500).replace(/[\n\r]+/g, " ").trim();
    if (!cleanText) {
      return NextResponse.json({ error: "Empty text" }, { status: 400 });
    }

    // Determine target speaker based on language if default
    const targetSpeaker = speaker || SPEAKER_MAPPING[language_code] || "priya";

    // Attempt call across key pool
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
            speaker: targetSpeaker,
            pitch: pitch,
            pace: pace,
            loudness: 1.5,
            speech_sample_rate: 22050,
            enable_preprocessing: true,
            model: "bulbul:v3"
          }),
          signal: AbortSignal.timeout(8000)
        });

        if (sarvamRes.ok) {
          const sarvamData = await sarvamRes.json();
          const base64Audio = sarvamData?.audios?.[0];
          if (base64Audio) {
            return NextResponse.json({
              base64_audio: base64Audio,
              mime_type: "audio/wav",
              provider: "sarvam-ai-bulbul-v3",
              speaker: targetSpeaker,
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
      error: "Sarvam AI rate-limited or unavailable; use client speech synthesis fallback."
    });
  } catch (error: any) {
    return NextResponse.json({ base64_audio: null, error: error.message }, { status: 500 });
  }
}
