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
    
    # Get a fresh key from the rotator
    api_key = key_rotator.get_llama_3_3_70b_key()
    
    # 1. Fetch RAG Context
    medical_context = get_medical_context(symptom_text, api_key)
    
    context_injection = ""
    if medical_context:
        context_injection = f"\n\nCRITICAL - Base your assessment strictly on the following official ICMR guidelines:\n{medical_context}"

    # Initialize the OpenAI client pointing to NVIDIA's endpoint
    client = OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=api_key
    )

    system_prompt = f"""You are an advanced AI medical triage assistant. 
    Analyze the provided symptoms and return a JSON object with the following fields:
    - "urgency": (string) Low, Medium, High, or Critical.
    - "department": (string) The recommended medical department (e.g., Cardiology, General Practice).
    - "advice": (string) Brief, safe, preliminary advice (e.g., "Rest and hydrate" or "Seek emergency care immediately").
    Do not include any Markdown formatting in your response, just the raw JSON object.{context_injection}"""

    try:
        completion = client.chat.completions.create(
            model="nvidia/llama-3.1-nemotron-70b-instruct",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Patient symptoms: {symptom_text}"}
            ],
            temperature=0.2,
            max_tokens=256
        )
        
        response_text = completion.choices[0].message.content.strip()
        # Ensure we parse JSON properly
        result = json.loads(response_text)
        
        # Phase 6: Map patient dialect to FHIR/SNOMED-CT before returning
        vocab_mapping = translate_to_controlled_vocabulary(symptom_text)
        result["snomed_mapping"] = vocab_mapping
        result["confidence"] = intent_data["confidence"]
        
        return result
    except Exception as e:
        print(f"Error during triage: {e}")
        return {
            "urgency": "Unknown",
            "department": "General",
            "advice": "Unable to process symptoms at this time. Please consult a doctor."
        }
