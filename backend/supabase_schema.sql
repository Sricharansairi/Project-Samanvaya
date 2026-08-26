-- Project Samanvaya: Supabase Database Schema

-- 1. Enable the pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Table for ICMR Medical Guidelines (Knowledge Base for RAG)
CREATE TABLE IF NOT EXISTS icmr_guidelines (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding VECTOR(1024) -- 1024 dimensions for snowflake/arctic-embed-l
);

-- 3. Table for Patients (ABHA Compliant structure)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    abha_id VARCHAR(255) UNIQUE,
    -- PII fields like name would be encrypted in a production environment
    patient_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Table for Patient Visits/Triage
CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    symptoms_summary TEXT, -- PII-stripped summary of symptoms
    triage_recommendation TEXT, -- Output from the LLM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Table for Audit Logs (Strict ABDM Compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action_type VARCHAR(255) NOT NULL,
    performed_by UUID, -- Reference to the user or agent making the action
    details JSONB, -- Context of the action
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. Hybrid Search Function for LangChain
-- This function computes the cosine distance (<=>) between the query vector and database vectors
CREATE OR REPLACE FUNCTION match_medical_guidelines (
    query_embedding VECTOR(1024),
    match_count INT DEFAULT 5
) RETURNS TABLE (
    id BIGINT,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        icmr_guidelines.id,
        icmr_guidelines.content,
        icmr_guidelines.metadata,
        1 - (icmr_guidelines.embedding <=> query_embedding) AS similarity
    FROM icmr_guidelines
    ORDER BY icmr_guidelines.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;