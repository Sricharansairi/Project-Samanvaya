import { NextResponse } from "next/server";
import { queryMedicalRAG } from "@/services/medical_rag";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { complaint = "" } = body;

    if (!complaint.trim()) {
      return NextResponse.json({
        success: false,
        message: "No chief complaint provided"
      }, { status: 400 });
    }

    const ragResult = queryMedicalRAG(complaint);
    const guideline = ragResult.matchedGuideline;

    // Format into ChipParameterModal parameterConfigs
    const parameterConfigs = guideline.diagnosticQuestions.map((dq) => ({
      key: dq.key,
      label: dq.question,
      question: dq.question,
      options: dq.options.map(opt => ({
        label: opt.label,
        value: opt.value,
        isRedFlag: opt.isRedFlag || false
      }))
    }));

    return NextResponse.json({
      success: true,
      isEmergency: ragResult.isEmergency,
      emergencyAlert: ragResult.emergencyAlert,
      guideline: {
        id: guideline.id,
        condition: guideline.condition,
        source: guideline.source,
        department: guideline.department,
        urgency: guideline.urgency,
        snomedCode: guideline.snomedCode,
        snomedDisplay: guideline.snomedDisplay,
        preliminaryAdvice: guideline.preliminaryAdvice,
        contraindications: guideline.contraindications
      },
      parameterConfigs,
      relevanceScore: ragResult.relevanceScore
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
