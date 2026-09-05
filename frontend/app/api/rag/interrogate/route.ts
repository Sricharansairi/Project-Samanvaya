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
      category: dq.category,
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
        sourceCitation: guideline.sourceCitation,
        department: guideline.department,
        urgency: guideline.urgency,
        icd10: guideline.icd10,
        snomedCode: guideline.snomedCode,
        snomedDisplay: guideline.snomedDisplay,
        preliminaryAdvice: guideline.preliminaryAdvice,
        emergencyAction: guideline.emergencyAction,
        contraindications: guideline.contraindications,
        recommendedWorkup: guideline.recommendedWorkup
      },
      parameterConfigs,
      relevanceScore: ragResult.relevanceScore,
      retrievalArchitecture: ragResult.retrievalArchitecture,
      differentialDiagnoses: ragResult.differentialDiagnoses
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
