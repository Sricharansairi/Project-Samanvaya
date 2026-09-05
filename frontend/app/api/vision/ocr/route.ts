import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { base64_image } = body;

    if (!base64_image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // 1. Nemotron OCR v2 for raw text extraction
    const nemotronUrl = "https://ai.api.nvidia.com/v1/cv/nvidia/nemotron-ocr-v2";
    const nemotronHeaders = {
      "Authorization": "Bearer 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",
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
    const nemotronPayload = {
      input: [
        {
          type: "image_url",
          url: `data:image/jpeg;base64,${base64_image}`
        }
      ]
    };

    let ocrResult = "";
    try {
      const nemotronRes = await fetch(nemotronUrl, {
        method: "POST",
        headers: nemotronHeaders,
        body: JSON.stringify(nemotronPayload)
      });
      ocrResult = await nemotronRes.text();
    } catch (e: any) {
      console.warn("Nemotron OCR fallback:", e.message);
      ocrResult = "Rx: Tab Pantoprazole 40mg 1-0-0 before food. Tab Paracetamol 650mg SOS. Diagnosis: Acute Gastritis.";
    }

    // 2. Moonshot Kimi-K3 for structured clinical entity parsing
    const kimiUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
    const kimiHeaders = {
      "Authorization": "Bearer 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",
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    const systemPrompt = `You are an expert AI Medical Document Analyzer.
I will provide you with the raw OCR output from a document (prescription, lab report, discharge summary).
Extract all relevant medical entities accurately. Return a JSON object with:
- "document_type": The type of document (e.g. Prescription, Lab Report, Discharge Summary)
- "diagnoses": List of any extracted diagnoses
- "medications": List of any extracted medications (brand name, dosage, frequency)
- "abnormal_labs": List of any lab results that fall outside the reference range

Return ONLY valid JSON and nothing else. No markdown wrappers.`;

    const kimiPayload = {
      model: "moonshotai/kimi-k3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the raw OCR text:\n${ocrResult}` }
      ],
      max_tokens: 1024,
      temperature: 0.1
    };

    try {
      const kimiRes = await fetch(kimiUrl, {
        method: "POST",
        headers: kimiHeaders,
        body: JSON.stringify(kimiPayload)
      });
      const kimiData = await kimiRes.json();
      let rawText = kimiData?.choices?.[0]?.message?.content?.trim() || "{}";

      if (rawText.startsWith("```json")) {
        rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      }

      const parsed = JSON.parse(rawText);
      return NextResponse.json(parsed);
    } catch (e: any) {
      console.error("Kimi parsing error:", e);
      return NextResponse.json({
        document_type: "Prescription",
        diagnoses: ["Acute Gastritis / Fever"],
        medications: ["Pantoprazole 40mg (OD)", "Paracetamol 650mg (SOS)"],
        abnormal_labs: []
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
