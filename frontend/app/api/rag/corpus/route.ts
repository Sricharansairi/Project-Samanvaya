import { NextResponse } from "next/server";
import { MEDICAL_KNOWLEDGE_CORPUS } from "@/services/medical_rag";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");

    let guidelines = MEDICAL_KNOWLEDGE_CORPUS;
    if (department) {
      guidelines = guidelines.filter(g => g.department.toLowerCase().includes(department.toLowerCase()));
    }

    return NextResponse.json({
      success: true,
      total: guidelines.length,
      guidelines: guidelines.map(g => ({
        id: g.id,
        condition: g.condition,
        department: g.department,
        urgency: g.urgency,
        source: g.source,
        sourceCitation: g.sourceCitation,
        icd10: g.icd10,
        snomedCode: g.snomedCode,
        snomedDisplay: g.snomedDisplay,
        redFlags: g.redFlags,
        differentialDiagnoses: g.differentialDiagnoses,
        recommendedWorkup: g.recommendedWorkup
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
