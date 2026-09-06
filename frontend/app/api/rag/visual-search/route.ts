import { NextResponse } from "next/server";
import { queryVisualRAG } from "@/services/visual_rag_engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query = "", category = "All" } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "Missing clinical query for Visual RAG" }, { status: 400 });
    }

    const result = await queryVisualRAG(query, category);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Visual RAG API Error:", error);
    return NextResponse.json({ error: "Failed to process visual document retrieval" }, { status: 500 });
  }
}
