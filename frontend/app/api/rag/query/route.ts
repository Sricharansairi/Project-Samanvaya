import { NextResponse } from "next/server";
import { queryMedicalRAG } from "@/services/medical_rag";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query = "" } = body;

    if (!query.trim()) {
      return NextResponse.json({ success: false, message: "Query string required" }, { status: 400 });
    }

    const result = queryMedicalRAG(query);

    return NextResponse.json({
      success: true,
      query,
      isEmergency: result.isEmergency,
      emergencyAlert: result.emergencyAlert,
      matchedGuideline: result.matchedGuideline,
      relevanceScore: result.relevanceScore,
      retrievalArchitecture: result.retrievalArchitecture,
      differentialDiagnoses: result.differentialDiagnoses
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
