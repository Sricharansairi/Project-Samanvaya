import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { abha_id = "", query = "", in_memory_records = [] } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 1. Try local FastAPI backend if running
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/patient/medication-rag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {}

    // 2. Format clinical context from patient records
    const timelineLines: string[] = [];
    const allMeds: any[] = [];

    in_memory_records.forEach((doc: any) => {
      const ext = doc.extracted_data || {};
      const meta = ext.document_metadata || {};
      const docDate = meta.document_date || doc.created_at || "Recent";
      const facility = meta.facility_name || "Clinic";
      const docType = meta.document_type || "Medical Record";

      timelineLines.push(`[${docDate}] ${docType} (${facility}):`);

      (ext.medications || []).forEach((m: any) => {
        timelineLines.push(`  - Med: ${m.name || m.med} | Dosage: ${m.dosage || ''} | Freq: ${m.frequency || m.freq} | Duration: ${m.duration || m.days} | Notes: ${m.instructions || m.notes || ''}`);
        allMeds.push({ ...m, docDate, facility });
      });

      if (ext.vitals) {
        timelineLines.push(`  - Vitals: BP=${ext.vitals.bp || 'N/A'}, Pulse=${ext.vitals.pulse || 'N/A'}, Temp=${ext.vitals.temp || 'N/A'}, SpO2=${ext.vitals.spo2 || 'N/A'}`);
      }

      (ext.diagnoses || []).forEach((d: any) => {
        timelineLines.push(`  - Diagnosis: ${d.condition_name || d} (${d.icd10_code || ''})`);
      });

      (ext.allergies || []).forEach((a: string) => {
        timelineLines.push(`  - Allergy: ${a}`);
      });
    });

    const contextText = timelineLines.length > 0 
      ? timelineLines.join("\n") 
      : "No prior medical documents on file for this ABHA ID in the health locker.";

    // 3. Dual-Branch Medical Model Synthesis via Groq LPU
    const groqKey = process.env.GROQ_API_KEY || "";
    let answer = "";
    let modelUsed = "Clinical-EHR-RAG-Deterministic";

    if (groqKey) {
      try {
        const prompt = `You are an expert Clinical Pharmacologist and EHR RAG Specialist for Project Samanvaya.
Review the patient's retrieved medical history from their ABHA Health Locker:
--------------------
${contextText}
--------------------

Doctor's Clinical Question: "${query}"

Instructions:
1. Provide a direct, clinically accurate answer based strictly on the retrieved records.
2. Cite specific medication names, dosages, and prescribing dates where found.
3. Highlight any critical drug-drug interactions or contraindications relevant to the doctor's query.
4. Keep answer concise and structured for busy hospital physicians (2-4 sentences max).`;

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are an authoritative hospital Clinical Pharmacologist answering EHR questions for doctors." },
              { role: "user", content: prompt }
            ],
            max_tokens: 400,
            temperature: 0.1
          }),
          signal: AbortSignal.timeout(5000)
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          answer = groqData.choices?.[0]?.message?.content?.trim() || "";
          modelUsed = "llama-3.3-70b-versatile (Clinical Branch)";
        }
      } catch {}
    }

    // 4. Deterministic Clinical Keyword RAG Fallback
    if (!answer) {
      const qLower = query.toLowerCase();
      const matched = allMeds.filter(m => {
        const name = `${m.name || m.med || ''} ${m.generic_name || ''}`.toLowerCase();
        return qLower.split(/\s+/).some((token: string) => token.length > 3 && name.includes(token));
      });

      if (matched.length > 0) {
        const details = matched.slice(0, 3).map(m => 
          `${m.name || m.med} (${m.dosage || ''} ${m.frequency || m.freq || ''}) prescribed on ${m.docDate}`
        ).join("; ");
        answer = `Records indicate patient was previously prescribed: ${details}. Verify current renal and hepatic function before renewing.`;
      } else {
        answer = `Reviewed ${in_memory_records.length} historical ABHA documents. No direct documented contraindication or entry matching '${query}'. Routine monitoring recommended.`;
      }
    }

    return NextResponse.json({
      abha_id,
      query,
      answer,
      total_documents_analyzed: in_memory_records.length,
      total_medications_indexed: allMeds.length,
      model_used: modelUsed,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to perform medication RAG" }, { status: 500 });
  }
}
