from app.services.db import supabase
from langchain_community.embeddings import HuggingFaceEmbeddings

# Initialize embedding model for queries
embeddings_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

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
