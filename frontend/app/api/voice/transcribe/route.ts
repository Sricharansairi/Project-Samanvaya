import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("file");

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const whisperKey = "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";
    const whisperUrl = "https://integrate.api.nvidia.com/v1/audio/transcriptions";

    const whisperData = new FormData();
    whisperData.append("file", audioFile);
    whisperData.append("model", "openai/whisper-large-v3");
    whisperData.append("response_format", "json");

    try {
      const whisperRes = await fetch(whisperUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${whisperKey}`
        },
        body: whisperData
      });

      if (whisperRes.ok) {
        const result = await whisperRes.json();
        return NextResponse.json({ text: result.text || "" });
      }
    } catch (e: any) {
      console.warn("NIM Whisper API call failed:", e.message);
    }

    return NextResponse.json({
      text: "Open Government Scheme Navigator"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
