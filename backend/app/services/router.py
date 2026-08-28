import os
import requests
import json
from app.services.scheme_agent import evaluate_schemes, generate_patient_scheme_message

# Assume we have a generic RAG function for medical queries
# from app.services.medical_agent import retrieve_and_synthesize_medical

def classify_query(query: str) -> str:
    """
    Uses a fast LLM to classify the query intent to route it to the right RAG agent.
    """
    query_lower = query.lower()
    
    # Prompt injection check
    malicious_keywords = ["ignore previous", "system prompt", "forget all", "bypass"]
    for keyword in malicious_keywords:
        if keyword in query_lower:
            return "MALICIOUS"
            
    # Simple keyword routing for speed (could use LLM in production)
    scheme_keywords = ["scheme", "ayushman", "pmjay", "aarogyasri", "eligibility", "government", "fund", "money"]
    if any(keyword in query_lower for keyword in scheme_keywords):
        return "SCHEME_RAG"
        
    medical_keywords = ["fever", "pain", "cough", "treatment", "medicine", "ayurveda", "symptom"]
    if any(keyword in query_lower for keyword in medical_keywords):
        return "MEDICAL_RAG"
        
    return "GENERAL_FAQ"

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
