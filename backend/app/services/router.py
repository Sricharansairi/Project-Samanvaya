import os
import requests
import json
from app.services.scheme_agent import evaluate_schemes, generate_patient_scheme_message

# Assume we have a generic RAG function for medical queries
# from app.services.medical_agent import retrieve_and_synthesize_medical

def get_embedding(text: str) -> list:
    """Mock call to NVIDIA NIM embedding model to get vector representations."""
    # In production, this calls: https://integrate.api.nvidia.com/v1/embeddings
    # with model="nvidia/llama-3.2-nv-embedqa-1b-v1"
    # For now, we simulate semantic similarity scoring.
    return [0.1] * 1024  # Simulated vector

def cosine_similarity(vec1: list, vec2: list) -> float:
    """Computes similarity between two vectors."""
    # Simulated semantic score generator based on keyword overlap as fallback
    return 0.85

def classify_query_semantic(query: str) -> dict:
    """
    Uses Semantic-Similarity Routing Layer (Feature 62) via embeddings
    to map utterances to canonical intents instead of strict string matching.
    Returns a dict with 'intent' and 'confidence'.
    """
    query_lower = query.lower()
    
    # Prompt injection check
    malicious_keywords = ["ignore previous", "system prompt", "forget all", "bypass"]
    for keyword in malicious_keywords:
        if keyword in query_lower:
            return {"intent": "MALICIOUS", "confidence": 1.0}

    # Canonical Intents
    canonical_intents = {
        "SCHEME_RAG": ["I want to know about government health funds", "Am I eligible for PMJAY", "free treatment rules"],
        "MEDICAL_RAG": ["I have a fever and my body aches", "Need medicine for stomach pain", "Ayurvedic cure for cough"]
    }
    
    # Simulated Embedding Comparison (Semantic Match)
    # In real execution, we embed the query and compute cosine distance against the canonical set.
    best_intent = "GENERAL_FAQ"
    best_score = 0.4 # Baseline confidence
    
    # Simulate semantic matching logic
    if "scheme" in query_lower or "fund" in query_lower or "card" in query_lower or "pmjay" in query_lower:
        best_intent = "SCHEME_RAG"
        best_score = 0.92
    elif "fever" in query_lower or "pain" in query_lower or "cough" in query_lower or "sick" in query_lower:
        best_intent = "MEDICAL_RAG"
        best_score = 0.88
        
    return {"intent": best_intent, "confidence": best_score}

def classify_query(query: str) -> str:
    """Legacy wrapper for semantic router"""
    result = classify_query_semantic(query)
    return result["intent"]

def route_query(query: str, patient_profile: dict = None) -> dict:
    """
    Routes the query to the appropriate agent based on classification.
    """
    intent = classify_query(query)
    
    if intent == "MALICIOUS":
        return {"error": "Request denied. Prompt injection detected."}
        
    elif intent == "SCHEME_RAG":
        if patient_profile:
            eligible_schemes = evaluate_schemes(
                patient_state=patient_profile.get("state", "Unknown"),
                patient_income=patient_profile.get("income"),
                ration_card_color=patient_profile.get("ration_card"),
                secc_listed=patient_profile.get("secc_listed", False)
            )
            result = generate_patient_scheme_message(patient_profile, eligible_schemes)
            return {"source": "SCHEME_EVALUATOR", "result": result, "schemes": eligible_schemes}
        else:
            return {"error": "Patient profile required for scheme retrieval."}
            
    elif intent == "MEDICAL_RAG":
        # Placeholder for medical RAG agent
        return {"source": "MEDICAL_RAG", "result": "Medical RAG response would go here."}
        
    else:
        return {"source": "GENERAL_FAQ", "result": "I am a medical triage assistant. I can answer questions about your health or government schemes."}
