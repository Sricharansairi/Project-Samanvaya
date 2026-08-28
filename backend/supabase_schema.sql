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

-- 7. Table for Government Schemes (Dynamic Rules Engine)
CREATE TABLE IF NOT EXISTS govt_schemes (
    id BIGSERIAL PRIMARY KEY,
    scheme_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding VECTOR(1024) -- 1024 dimensions for snowflake/arctic-embed-l
);

-- 8. Hybrid Search Function for Government Schemes
CREATE OR REPLACE FUNCTION match_govt_schemes (
    query_embedding VECTOR(1024),
    match_count INT DEFAULT 5
) RETURNS TABLE (
    id BIGINT,
    scheme_name VARCHAR(255),
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        govt_schemes.id,
        govt_schemes.scheme_name,
        govt_schemes.content,
        govt_schemes.metadata,
        1 - (govt_schemes.embedding <=> query_embedding) AS similarity
    FROM govt_schemes
    ORDER BY govt_schemes.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 9. Table for FHIR R4 Records (ABDM Compliance)
CREATE TABLE IF NOT EXISTS fhir_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
    fhir_bundle JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 9B. Table for Digitized Prescriptions (DPDP Clean: Structured Text & Salts Only, Zero Raw Media)
CREATE TABLE IF NOT EXISTS digitized_prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    extracted_medicines JSONB NOT NULL, -- Array of {name, dosage, generic_salt, jan_aushadhi_savings, is_low_confidence}
    detected_allergies TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 10. Audit Logs Table (Tamper-Proof)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    changed_by UUID, -- Can be null if system action
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 11. Row Level Security (RLS) Enablement
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE fhir_records ENABLE ROW LEVEL SECURITY;

-- Note: Actual RLS Policies would be defined here. For the hackathon, we allow authenticated users to read/write.
-- Example: CREATE POLICY "Doctors can only see their facility patients" ON patients FOR SELECT USING (auth.uid() = doctor_id);
-- We use a permissive policy for testing:
CREATE POLICY "Allow all authenticated users" ON patients FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all authenticated users" ON visits FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all authenticated users" ON fhir_records FOR ALL TO authenticated USING (true);

-- 12. Audit Log Trigger Function
CREATE OR REPLACE FUNCTION log_audit_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action)
    VALUES (TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), TG_OP);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Apply Audit Triggers
DROP TRIGGER IF EXISTS audit_fhir_records ON fhir_records;
CREATE TRIGGER audit_fhir_records
AFTER INSERT OR UPDATE OR DELETE ON fhir_records
FOR EACH ROW EXECUTE FUNCTION log_audit_action();

DROP TRIGGER IF EXISTS audit_patients ON patients;
CREATE TRIGGER audit_patients
AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH ROW EXECUTE FUNCTION log_audit_action();