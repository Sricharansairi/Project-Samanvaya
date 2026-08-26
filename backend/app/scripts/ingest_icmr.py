import os
import requests
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
from langchain_text_splitters import RecursiveCharacterTextSplitter

# We assume this is run from the 'backend' directory
load_dotenv(".env")

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
nvidia_key = os.getenv("NVIDIA_NIM_KEY", "dummy_key")

if not supabase_url or not supabase_key:
    print("WARNING: Missing Supabase URL or Key in .env. Exiting.")
    sys.exit(1)

supabase: Client = create_client(supabase_url, supabase_key)

# Mock ICMR Guidelines (Hardcoded for hackathon demo to save parsing time)
medical_text = """
ICMR Guideline for Dengue Fever:
1. Classification: Dengue fever is classified into Dengue without warning signs, Dengue with warning signs, and Severe Dengue.
2. Warning Signs: Abdominal pain, persistent vomiting, clinical fluid accumulation, mucosal bleed, lethargy, liver enlargement >2cm.
3. Management: Adequate fluid intake is crucial. Paracetamol is recommended for fever. NSAIDs (like Ibuprofen) and Aspirin are strictly contraindicated due to bleeding risk.
4. Monitoring: Monitor hematocrit (HCT) and platelet count daily.

ICMR Guideline for Malaria:
1. Diagnosis: Rapid Diagnostic Test (RDT) or Microscopy of blood smear.
2. Treatment for P. vivax: Chloroquine 25mg/kg over 3 days, followed by Primaquine for 14 days to prevent relapse.
3. Treatment for P. falciparum: Artemisinin-based Combination Therapy (ACT).
"""

print("Chunking medical text...")
splitter = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=30)
chunks = splitter.split_text(medical_text)
print(f"Generated {len(chunks)} chunks.")

headers = {
    "Authorization": f"Bearer {nvidia_key}",
    "Content-Type": "application/json"
}

for i, chunk in enumerate(chunks):
    print(f"Processing chunk {i+1}/{len(chunks)}...")
    try:
        # 1. Generate Embedding
        payload = {
            "input": [chunk],
            "model": "snowflake/arctic-embed-l",
            "input_type": "passage"
        }
        res = requests.post("https://integrate.api.nvidia.com/v1/embeddings", json=payload, headers=headers)
        
        if res.status_code == 200:
            embedding = res.json()["data"][0]["embedding"]
        else:
            print(f"NIM API Error: {res.status_code} - Using mock 1024D vector.")
            # If the user hasn't set a real NIM key, generate a dummy 1024 vector to keep the pipeline moving
            embedding = [0.001] * 1024
            
        # 2. Insert into Supabase
        supabase.table("icmr_guidelines").insert({
            "content": chunk,
            "metadata": {"source": "ICMR_Guidelines_Mock", "chunk_id": i},
            "embedding": embedding
        }).execute()
        print(f"Chunk {i+1} inserted into Supabase pgvector.")
        
    except Exception as e:
        print(f"Failed to process chunk {i+1}: {e}")

print("RAG Ingestion Complete!")
