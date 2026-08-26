import os
import sys

# Ensure we can import from the app directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from app.services.db import supabase

# Initialize the embedding model (runs locally)
print("Initializing embedding model (this may take a moment to download weights)...")
embeddings_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def ingest_pdf(pdf_path: str):
    print(f"\n--- Ingesting {pdf_path} ---")
    
    if not os.path.exists(pdf_path):
        print(f"[ERROR] File not found: {pdf_path}")
        return

    # 1. Load the PDF
    print("Loading PDF...")
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()
    print(f"Loaded {len(documents)} pages.")

    # 2. Chunk the text
    print("Chunking text...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} text chunks.")

    # 3. Generate Embeddings and Push to Supabase
    print("Generating embeddings and pushing to Supabase...")
    
    # Process in batches to avoid rate limits or memory issues
    batch_size = 50
    for i in range(0, len(chunks), batch_size):
        batch_chunks = chunks[i:i+batch_size]
        batch_texts = [chunk.page_content for chunk in batch_chunks]
        
        # Generate embeddings
        batch_embeddings = embeddings_model.embed_documents(batch_texts)
        
        # Prepare Supabase payload
        payload = []
        for j, chunk in enumerate(batch_chunks):
            payload.append({
                "content": chunk.page_content,
                "metadata": chunk.metadata,
                "embedding": batch_embeddings[j]
            })
            
        # Insert into icmr_guidelines table
        try:
            supabase.table("icmr_guidelines").insert(payload).execute()
            print(f"Successfully uploaded batch {i//batch_size + 1} ({len(payload)} chunks).")
        except Exception as e:
            print(f"[ERROR] Failed to upload batch {i//batch_size + 1}: {e}")

    print("--- Ingestion Complete! ---")

if __name__ == "__main__":
    # Example usage:
    # Place a PDF in backend/data/ and run this script
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
    sample_pdf = os.path.join(data_dir, "sample_guideline.pdf")
    
    if os.path.exists(sample_pdf):
        ingest_pdf(sample_pdf)
    else:
        print(f"Please place a PDF at {sample_pdf} and run this script again.")
