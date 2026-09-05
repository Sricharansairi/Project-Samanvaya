import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text = "Hello from Samanvaya" } = body;

    const magpieKey = "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";
    const magpieUrl = "https://877104f7-e885-42b9-8de8-f6e4c6303969.invocation.api.nvcf.nvidia.com/v1/audio/synthesize";

    const formData = new FormData();
    formData.append("text", text);
    formData.append("language", "en-US");
    formData.append("voice", "Magpie-Multilingual.EN-US.Aria");
    formData.append("encoding", "LINEAR_PCM");
    formData.append("sample_rate_hz", "44100");

    const ttsRes = await fetch(magpieUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${magpieKey}`
      },
      body: formData
    });

    if (ttsRes.ok) {
      const buffer = await ttsRes.arrayBuffer();
      const base64Audio = Buffer.from(buffer).toString("base64");
      return NextResponse.json({ base64_audio: base64Audio });
    } else {
      console.warn("Magpie TTS response status:", ttsRes.status);
      return NextResponse.json({ base64_audio: null, error: "TTS fallback to client speech" });
    }
  } catch (error: any) {
    return NextResponse.json({ base64_audio: null, error: error.message });
  }
}
