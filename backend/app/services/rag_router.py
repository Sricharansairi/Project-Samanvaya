from app.services.db import supabase
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
from app.core.key_rotator import key_rotator

# Initialize embedding model for queries using NVIDIA's fast cloud endpoint
embeddings_model = NVIDIAEmbeddings(
    model="nvidia/nv-embedqa-e5-v5", 
    api_key=key_rotator.get_llama_3_3_70b_key()
)

def query_medical_guidelines(query_text: str, match_count: int = 5):
    """
    Queries the Supabase pgvector database for medical guidelines matching the query.
    """
    # 1. Embed the query
    query_embedding = embeddings_model.embed_query(query_text)
    
    # 2. Call the hybrid search PostgreSQL function we created in schema
    try:
        response = supabase.rpc(
            "match_medical_guidelines",
            {
                "query_embedding": query_embedding,
                "match_count": match_count
            }
        ).execute()
        
        return response.data
    except Exception as e:
        print(f"[ERROR] Failed to query database: {e}")
        return []

# Placeholder for the Adaptive Router Logic
def adaptive_route_query(query: str):
    """
    Determine if a query is medical, malicious, or a general FAQ.
    If medical, route to `query_medical_guidelines`.
    """
    # TODO: Integrate with SmartKeyRotator and LLM logic
    pass
