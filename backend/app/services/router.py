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
    Uses Semantic-Similarity Routing Layer (Phase 8 - Groq LPU) 
    via Llama-3-8b to parse intents at extremely high speeds.
    """
    query_lower = query.lower()
    
    # Prompt injection check
    malicious_keywords = ["ignore previous", "system prompt", "forget all", "bypass"]
    for keyword in malicious_keywords:
        if keyword in query_lower:
            return {"intent": "MALICIOUS", "confidence": 1.0}

    # Connect to Groq API
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    if not groq_api_key or groq_api_key == "your_groq_key_here":
        # Fallback if key is not configured
        if "scheme" in query_lower or "fund" in query_lower or "card" in query_lower:
            return {"intent": "SCHEME_RAG", "confidence": 0.9}
        elif "fever" in query_lower or "pain" in query_lower or "cough" in query_lower:
            return {"intent": "MEDICAL_RAG", "confidence": 0.9}
        return {"intent": "GENERAL_FAQ", "confidence": 0.5}

    try:
        from openai import OpenAI
        client = OpenAI(
            api_key=groq_api_key,
            base_url="https://api.groq.com/openai/v1"
        )
        
        prompt = f"""You are a fast intent router for a hospital kiosk.
Classify the following user utterance into EXACTLY ONE of these categories:
- SCHEME_RAG: Questions about government funds, Ayushman card, PMJAY, free treatment.
- MEDICAL_RAG: Mention of symptoms, pain, fever, medical problems.
- GENERAL_FAQ: General greetings, asking where things are in the hospital.
- NONE_OF_THESE: If the user says something completely unrelated to the hospital, or asks you to do something you cannot do (like book a flight).

Utterance: "{query}"
Reply ONLY with the category name (e.g. MEDICAL_RAG). Nothing else. If you are not completely sure, reply with NONE_OF_THESE."""

        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=15
        )
        
        intent = response.choices[0].message.content.strip().upper()
        if intent not in ["SCHEME_RAG", "MEDICAL_RAG", "GENERAL_FAQ", "NONE_OF_THESE"]:
            intent = "NONE_OF_THESE"
            
        return {"intent": intent, "confidence": 0.95}
        
    except Exception as e:
        print(f"Groq Routing Error: {e}")
        return {"intent": "NONE_OF_THESE", "confidence": 0.0}

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
        
    elif intent == "NONE_OF_THESE":
        return {"error": "I can't do that from here — please ask at the reception counter."}
        
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
