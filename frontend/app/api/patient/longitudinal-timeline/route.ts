import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const abhaId = searchParams.get("abha_id") || "14-XXXX-XXXX-XXXX";

  // 1. Try FastAPI Backend
  try {
    const beRes = await fetch(`http://127.0.0.1:8000/api/patient/longitudinal-timeline/${encodeURIComponent(abhaId)}`, {
      signal: AbortSignal.timeout(4000)
    });
    if (beRes.ok) {
      const data = await beRes.json();
      return NextResponse.json(data);
    }
  } catch {
    // Fallback
  }

  // 2. Default Dynamic Trajectory
  return NextResponse.json({
    abha_id: abhaId,
    total_documents: 0,
    active_chronic_conditions: [],
    biomarker_trends: {
      fasting_blood_glucose: [],
      hba1c: [],
      serum_creatinine: [],
      blood_pressure_systolic: [],
      blood_pressure_diastolic: [],
      pulse: [],
      total_cholesterol: []
    },
    trajectory_status: "Stable",
    civic_patient_summary: {
      english: "Your longitudinal health record is active. Upload medical reports to view historical vital trends.",
      hindi: "आपका डिजिटल स्वास्थ्य रिकॉर्ड सक्रिय है। पुराने ट्रेंड्स देखने के लिए मेडिकल रिपोर्ट अपलोड करें।"
    },
    physician_longitudinal_synthesis: "No historical records retrieved for longitudinal analysis."
  });
}
