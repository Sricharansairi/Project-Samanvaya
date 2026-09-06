import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { abha_id = "14-XXXX-XXXX-XXXX", preferred_language = "hi", conditions = [], trajectory = "Stable" } = body;

    // 1. Try FastAPI Backend
    try {
      const beRes = await fetch("http://127.0.0.1:8000/api/patient/health-coach-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abha_id, preferred_language }),
        signal: AbortSignal.timeout(4000)
      });
      if (beRes.ok) {
        const data = await beRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback to Edge AI
    }

    // 2. Edge Autonomous Generation via Groq LPU
    const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_1;
    const langNames: Record<string, string> = {
      hi: "Hindi (हिंदी)",
      ta: "Tamil (தமிழ்)",
      te: "Telugu (తెలుగు)",
      kn: "Kannada (ಕನ್ನಡ)",
      bn: "Bengali (বাংলা)",
      mr: "Marathi (मराठी)",
      en: "English"
    };
    const langLabel = langNames[preferred_language] || "Hindi (हिंदी)";

    let advice = "नमस्ते! अपनी दवाएं समय पर लेते रहें, संतुलित भोजन करें और अपने डॉक्टर की सलाह का पालन करें।";
    if (groqKey) {
      try {
        const groqResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: [
              {
                role: "system",
                content: `You are Samanvaya Community Health Coach. Provide 2-3 warm, empathetic, encouraging sentences in ${langLabel} to help the patient manage their condition.`
              },
              {
                role: "user",
                content: `Patient conditions: ${JSON.stringify(conditions)}. Trajectory: ${trajectory}. Give practical dietary and medication adherence advice.`
              }
            ],
            max_tokens: 250,
            temperature: 0.2
          }),
          signal: AbortSignal.timeout(3500)
        });
        if (groqResp.ok) {
          const gData = await groqResp.json();
          advice = gData.choices[0]?.message?.content?.trim() || advice;
        }
      } catch {}
    }

    return NextResponse.json({
      abha_id,
      preferred_language,
      language_display: langLabel,
      coaching_script: advice,
      spoken_audio_ready: true,
      trajectory_status: trajectory
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
