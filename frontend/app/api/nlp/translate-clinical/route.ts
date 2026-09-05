import { NextResponse } from "next/server";
import { translatePatientToClinical, ClinicalTranslationResult } from "@/services/clinical_nlp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt = "", language = "auto" } = body;

    if (!prompt.trim()) {
      return NextResponse.json({ error: "No patient speech or prompt provided" }, { status: 400 });
    }

    // Immediate rule-based and local ontology evaluation for guaranteed high-speed baseline
    const localResult = translatePatientToClinical(prompt);

    // Kimi-K3 Deep Reasoning Configuration (NVIDIA NIM Moonshot Kimi-K3)
    const kimiUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
    const kimiKey = "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";

    const systemPrompt = `You are the Chief AI Medical Informaticist & Clinical Lexicographer for Project Samanvaya, India's national healthcare platform.
The patient has expressed their symptoms in colloquial, layperson, or regional vernacular (Hindi, Telugu, Hinglish, or casual English).
Patients DO NOT know formal medical terms (e.g. they say "pet me tez jalan" instead of "Postprandial Dyspepsia/GERD", or "seene pe bhaari pathar" instead of "Acute Coronary Syndrome").

Your job is to translate and standardize their speech into rigorous clinical terminology with accurate medical ontology codes.

Return ONLY raw JSON with the following schema:
{
  "detectedLanguage": string ("Hindi" | "Telugu" | "Hinglish" | "English" | "Regional"),
  "standardizedMedicalTerm": string (Formal clinical diagnostic entity),
  "icd10Code": string (Valid WHO ICD-10 code, e.g. "I21.9", "K21.9", "A90", "R04.2", "N23"),
  "snomedCode": string (Valid SNOMED-CT concept ID, e.g. "29857009"),
  "snomedDisplay": string (SNOMED-CT preferred concept term),
  "anatomicalSystem": string ("Cardiovascular" | "Gastrointestinal" | "Neurological" | "Respiratory" | "Infectious" | "Nephro-Urological" | "Musculoskeletal" | "Dermatological"),
  "clinicalSeverity": string ("Critical" | "High" | "Medium" | "Low"),
  "isLifeThreat": boolean,
  "clinicalRedFlags": string[] (List of high-risk red flag triggers present or to monitor),
  "differentialDiagnoses": string[] (Top 3-4 clinical differential diagnoses),
  "recommendedLabWorkup": string[] (Standard diagnostic tests, LOINC / imaging),
  "standardMedicationClasses": string[] (Evidence-based medication categories per ICMR STW),
  "contraindications": string[] (Critical clinical contraindications, e.g. NSAIDs in Dengue/Ulcer),
  "autonomousAction": {
    "targetRoute": string ("/his/registration" for emergency/triage, "/his/rag" for clinical co-pilot, "/his/doctor" for consult, "/his/schemes" for insurance),
    "actionName": string ("emergency_triage" | "open_rag_console" | "prefill_registration" | "evaluate_schemes"),
    "reason": string
  },
  "patientFriendlyExplanation": string (Empathetic, clear explanation in simple language reassuring the patient)
}

DO NOT wrap in markdown fences. Return ONLY valid JSON.`;

    const kimiPayload = {
      model: "moonshotai/kimi-k3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Patient Prompt: "${prompt}" (Language hint: ${language})` }
      ],
      max_tokens: 800,
      temperature: 0.1
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 second safety timeout

      const kimiRes = await fetch(kimiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${kimiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(kimiPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (kimiRes.ok) {
        const kimiData = await kimiRes.json();
        let rawText = kimiData?.choices?.[0]?.message?.content?.trim() || "";
        if (rawText.startsWith("```json")) {
          rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        } else if (rawText.startsWith("```")) {
          rawText = rawText.replace(/```/g, "").trim();
        }

        const parsedKimi = JSON.parse(rawText);

        // Merge Kimi AI reasoning with local ground truth
        const mergedResult: ClinicalTranslationResult = {
          patientRawPrompt: prompt,
          detectedLanguage: parsedKimi.detectedLanguage || localResult.detectedLanguage,
          standardizedMedicalTerm: parsedKimi.standardizedMedicalTerm || localResult.standardizedMedicalTerm,
          icd10Code: parsedKimi.icd10Code || localResult.icd10Code,
          snomedCode: parsedKimi.snomedCode || localResult.snomedCode,
          snomedDisplay: parsedKimi.snomedDisplay || localResult.snomedDisplay,
          anatomicalSystem: parsedKimi.anatomicalSystem || localResult.anatomicalSystem,
          clinicalSeverity: parsedKimi.clinicalSeverity || localResult.clinicalSeverity,
          isLifeThreat: typeof parsedKimi.isLifeThreat === "boolean" ? parsedKimi.isLifeThreat : localResult.isLifeThreat,
          clinicalRedFlags: parsedKimi.clinicalRedFlags?.length ? parsedKimi.clinicalRedFlags : localResult.clinicalRedFlags,
          differentialDiagnoses: parsedKimi.differentialDiagnoses?.length ? parsedKimi.differentialDiagnoses : localResult.differentialDiagnoses,
          recommendedLabWorkup: parsedKimi.recommendedLabWorkup?.length ? parsedKimi.recommendedLabWorkup : localResult.recommendedLabWorkup,
          standardMedicationClasses: parsedKimi.standardMedicationClasses?.length ? parsedKimi.standardMedicationClasses : localResult.standardMedicationClasses,
          contraindications: parsedKimi.contraindications?.length ? parsedKimi.contraindications : localResult.contraindications,
          autonomousAction: {
            targetRoute: parsedKimi.autonomousAction?.targetRoute || localResult.autonomousAction.targetRoute,
            actionName: parsedKimi.autonomousAction?.actionName || localResult.autonomousAction.actionName,
            reason: parsedKimi.autonomousAction?.reason || localResult.autonomousAction.reason,
            prefillData: {
              chiefConcern: parsedKimi.standardizedMedicalTerm || localResult.standardizedMedicalTerm,
              icd10: parsedKimi.icd10Code || localResult.icd10Code,
              snomed: parsedKimi.snomedCode || localResult.snomedCode,
              severity: parsedKimi.clinicalSeverity || localResult.clinicalSeverity
            }
          },
          patientFriendlyExplanation: parsedKimi.patientFriendlyExplanation || localResult.patientFriendlyExplanation
        };

        return NextResponse.json({
          success: true,
          engine: "Samanvaya Clinical NLP + SNOMED-CT Ontology",
          result: mergedResult
        });
      }
    } catch (e: any) {
      console.warn("Kimi-K3 inference fallback to local clinical ontology:", e.message);
    }

    // Zero-latency reliable local ontology fallback
    return NextResponse.json({
      success: true,
      engine: "Samanvaya 2000+ Verified Clinical Ontology",
      result: localResult
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
