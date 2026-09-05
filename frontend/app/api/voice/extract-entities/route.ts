import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript = "" } = body;

    const kimiUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
    const kimiKey = "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";

    const systemPrompt = `You are a clinical NLP extractor for Project Samanvaya.
Extract patient entities from this speech transcript.
Return JSON with keys:
- "name": string or null
- "phone": string or null
- "weight": string or null
- "bp": string or null
- "temp": string or null
- "chief_concern": string or null

Return ONLY raw valid JSON.`;

    const payload = {
      model: "moonshotai/kimi-k3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: transcript }
      ],
      max_tokens: 300,
      temperature: 0.1
    };

    try {
      const res = await fetch(kimiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${kimiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      let rawText = data?.choices?.[0]?.message?.content?.trim() || "{}";
      if (rawText.startsWith("```json")) {
        rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      }
      return NextResponse.json(JSON.parse(rawText));
    } catch (e: any) {
      console.warn("Kimi entity extraction fallback:", e.message);
      return NextResponse.json({
        name: null,
        phone: null,
        weight: null,
        bp: null,
        temp: null,
        chief_concern: transcript
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
