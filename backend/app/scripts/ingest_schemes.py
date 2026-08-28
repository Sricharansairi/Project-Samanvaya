import os
import requests
from dotenv import load_dotenv
from supabase import create_client, Client
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

# Setup Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    print("Missing Supabase credentials in .env")
    exit(1)

supabase: Client = create_client(supabase_url, supabase_key)
nvidia_api_key = os.getenv("NVIDIA_NIM_KEY", "dummy_key")

# Mock Government Schemes Data
SCHEMES_DATA = [
    {
        "name": "PM-JAY (Ayushman Bharat)",
        "content": """
        Scheme: Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)
        Eligibility: 
        - Low income families identified by the SECC database.
        - Applicable nationwide.
        - Families with no adult male member aged 16-59.
        - Landless households deriving major income from manual casual labor.
        Benefits: Health cover of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization.
        Application Process:
        1. Visit the nearest Empanelled Health Care Provider (EHCP) or CSC.
        2. Provide Aadhaar Card or Ration Card for identity verification.
        3. Authenticate via biometric/iris scan or OTP.
        4. Receive Ayushman card upon successful verification.
        """
    },
    {
        "name": "Aarogyasri",
        "content": """
        Scheme: Dr. YSR Aarogyasri (Andhra Pradesh / Telangana)
        Eligibility:
        - Residents of Andhra Pradesh or Telangana.
        - Must hold a BPL (Below Poverty Line) White Ration Card.
        - Annual income less than Rs. 5 Lakhs.
        Benefits: Financial assistance for BPL families to meet catastrophic health needs. End-to-end cashless services.
        Application Process:
        1. Approach the Aarogyasri Mithra at a PHC, CHC, Area Hospital, District Hospital or Network Hospital.
        2. Present the White Ration Card and Aadhaar Card.
        3. Undergo evaluation; if treatment is needed, it is registered online.
        4. Get treated cashless at a network hospital.
        """
    },
    {
        "name": "CGHS",
        "content": """
        Scheme: Central Government Health Scheme (CGHS)
        Eligibility:
        - All Central Government employees and their dependent family members residing in CGHS covered areas.
        - Pensioners drawing pension from Central Civil Estimates.
        - Members of Parliament and ex-MPs.
        Benefits: Comprehensive medical care facilities to Central Government employees and pensioners.
        Application Process:
        1. Fill out the CGHS application form.
        2. Attach passport size photographs and proof of residence/employment.
        3. Submit to the concerned department/office.
        4. The index card is issued, which is then used to generate a plastic CGHS card.
        """
    }
]

def ingest_schemes():
    print("Starting Government Schemes Ingestion...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)

    for scheme in SCHEMES_DATA:
        print(f"Processing scheme: {scheme['name']}")
        chunks = text_splitter.split_text(scheme["content"])
        
        for i, chunk in enumerate(chunks):
            print(f"  Embedding chunk {i+1}/{len(chunks)}...")
            
            headers = {"Authorization": f"Bearer {nvidia_api_key}", "Content-Type": "application/json"}
            payload = {"input": [chunk], "model": "snowflake/arctic-embed-l", "input_type": "passage"}
            
            try:
                res = requests.post("https://integrate.api.nvidia.com/v1/embeddings", json=payload, headers=headers)
                
                if res.status_code == 200:
                    embedding = res.json()["data"][0]["embedding"]
                else:
                    print(f"  NIM API Error: {res.status_code} - Using mock 1024D vector.")
                    embedding = [0.001] * 1024
                    
                supabase.table("govt_schemes").insert({
                    "scheme_name": scheme["name"],
                    "content": chunk,
                    "metadata": {"source": "Mock_Data", "chunk_id": i},
                    "embedding": embedding
                }).execute()
                print(f"  Inserted chunk {i+1} into Supabase.")
                
            except Exception as e:
                print(f"  Failed to process chunk {i+1}: {e}")

    print("Scheme Ingestion Complete!")

if __name__ == "__main__":
    ingest_schemes()
