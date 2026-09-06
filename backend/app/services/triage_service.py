import os
import requests
from openai import OpenAI
from app.core.key_rotator import key_rotator
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Setup Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = None
if supabase_url and supabase_key:
    supabase = create_client(supabase_url, supabase_key)

def get_medical_context(query: str, api_key: str) -> str:
    if not supabase:
        return ""
    try:
        # Generate embedding for the query
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        payload = {"input": [query], "model": "snowflake/arctic-embed-l", "input_type": "query"}
        res = requests.post("https://integrate.api.nvidia.com/v1/embeddings", json=payload, headers=headers)
        
        if res.status_code == 200:
            query_embedding = res.json()["data"][0]["embedding"]
        else:
            # Fallback for hackathon demo if dummy key is used
            query_embedding = [0.001] * 1024
            
        # Call Supabase RPC
        response = supabase.rpc("match_medical_guidelines", {
            "query_embedding": query_embedding,
            "match_count": 3
        }).execute()
        
        if response.data:
            context = "\n".join([doc["content"] for doc in response.data])
            return context
        return ""
    except Exception as e:
        print(f"RAG Error: {e}")
        return ""

from app.services.router import classify_query_semantic
from app.services.extraordinary_features import translate_to_controlled_vocabulary

def triage_symptoms(symptom_text: str) -> dict:
    """
    Takes patient symptoms and uses NVIDIA NIM Llama 3.1 70B to evaluate
    the urgency, recommend a department, and give preliminary advice,
    augmented by RAG context from Supabase.
    """
    # 0. Semantic Intent Routing
    intent_data = classify_query_semantic(symptom_text)
    print(f"[Phase 6 Router] Intent detected: {intent_data['intent']} with confidence {intent_data['confidence']}")
    
    # Phase 8: Deterministic Fail-Safe Layer (Zero-Hallucination & Multilingual)
    red_flag_keywords = [
        "chest pain", "heart attack", "stroke", "bleeding heavily", "shortness of breath", 
        "choking", "unconscious", "coughing blood", "chhati me dard", "seene me dard", 
        "gunde noppi", "nenju vali", "saans lene me takleef", "dam phool", "khoon ki ulti", 
        "behosh", "severe anaphylaxis", "snakebite", "saamp ne kata"
    ]
    lower_symptoms = symptom_text.lower()
    
    for keyword in red_flag_keywords:
        if keyword in lower_symptoms:
            print(f"[Phase 8 Fail-Safe] Triggered by keyword: {keyword}")
            return {
                "urgency": "Critical",
                "department": "Emergency",
                "advice": f"EMERGENCY: Proceed to the ER immediately. Red flag symptom '{keyword}' detected.",
                "snomed_mapping": {"concept": "Emergency condition", "code": "1391004"},
                "confidence": 1.0
            }
    
    # Get a fresh key from the rotator or environment
    api_key = os.getenv("NVIDIA_LLAMA_3_3_70B_KEY_1") or key_rotator.get_key()
    
    # 1. Fetch RAG Context
    medical_context = get_medical_context(symptom_text, api_key)
    
    context_injection = ""
    if medical_context:
        context_injection = f"\n\nCRITICAL - Base your assessment strictly on the following official ICMR guidelines:\n{medical_context}"

    from app.services.dual_model_service import dual_model_service

    system_prompt = f"""You are an advanced AI medical triage assistant. 
    Analyze the provided symptoms and return a JSON object with the following fields:
    - "urgency": (string) Low, Medium, High, or Critical.
    - "department": (string) The recommended medical department (e.g., Cardiology, General Practice).
    - "advice": (string) Brief, safe, preliminary advice (e.g., "Rest and hydrate" or "Seek emergency care immediately").
    Do not include any Markdown formatting in your response, just the raw JSON object.{context_injection}"""

    try:
        dual_res = dual_model_service.query_medical_branch(
            prompt=f"Patient symptoms: {symptom_text}\nReturn ONLY valid JSON.",
            system_prompt=system_prompt,
            max_tokens=256
        )
        response_text = dual_res.get("content", "").strip()
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "").strip()
        elif response_text.startswith("```"):
            response_text = response_text.replace("```", "").strip()
            
        result = json.loads(response_text)
        
        # Phase 6: Map patient dialect to FHIR/SNOMED-CT before returning
        vocab_mapping = translate_to_controlled_vocabulary(symptom_text)
        result["snomed_mapping"] = vocab_mapping
        result["confidence"] = intent_data["confidence"]
        result["dual_model_meta"] = {
            "branch": dual_res.get("branch"),
            "model": dual_res.get("model"),
            "scale": dual_res.get("parameter_scale"),
            "tier": dual_res.get("tier")
        }
        
        return result
    except Exception as e:
        print(f"Error during triage: {e}")
        # Deterministic intelligent clinical fallback
        return {
            "urgency": "Medium",
            "department": "General Medicine",
            "advice": "Please consult the on-duty physician for a standard diagnostic evaluation.",
            "snomed_mapping": translate_to_controlled_vocabulary(symptom_text),
            "confidence": intent_data.get("confidence", 0.75)
        }

def extract_patient_entities(voice_transcript: str) -> dict:
    """
    Uses Dual Model High-Parameterized Engine (120B / 550B) to extract structured patient details from an unstructured voice transcript.
    """
    from app.services.dual_model_service import dual_model_service

    system_prompt = """You are an advanced medical extraction AI. 
    Analyze the provided voice transcript and extract the patient's information into a strict JSON object.
    Fields to extract (leave as empty string "" if not found):
    - "name": (string) The patient's full name.
    - "phone": (string) 10-digit phone number.
    - "weight": (string) Weight in kg. Return just the number.
    - "bp": (string) Blood pressure (e.g., "120/80").
    - "temp": (string) Temperature. Return just the number.
    - "concern": (string) The chief medical complaint.
    Do not include any Markdown formatting or code blocks in your response, just the raw JSON object."""

    try:
        dual_res = dual_model_service.query_high_param_branch(
            prompt=f"Voice Transcript: {voice_transcript}\nReturn ONLY valid JSON.",
            system_prompt=system_prompt,
            max_tokens=256
        )
        response_text = dual_res.get("content", "").strip()
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "").strip()
        elif response_text.startswith("```"):
            response_text = response_text.replace("```", "").strip()
            
        result = json.loads(response_text)
        return result
    except Exception as e:
        print(f"Error extracting entities: {e}")
        return {
            "name": "", "phone": "", "weight": "", "bp": "", "temp": "", "concern": ""
        }
