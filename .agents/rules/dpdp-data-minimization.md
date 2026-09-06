# Rule: DPDP Act 2023 Clinical Media Minimization Invariant

## Scope
Universal across all patient document upload, prescription OCR, and diagnostic scan ingestion features in Project Samanvaya.

## Rule Invariant
Whenever a citizen or physician uploads raw clinical media (scanned prescriptions, discharge summaries, radiological images, lab PDF slips), the system MUST NEVER store the raw unparsed binary media in permanent storage or relational databases.

Instead, the system must:
1. **Cryptographic Provenance Fingerprint**: Compute a SHA-256 cryptographic provenance hash (`abdm-doc-xxxxxxxxxxxx`) for non-repudiation, integrity proofs, and legal auditability.
2. **Structured Clinical Deconstruction**: Extract all clinical entities (vitals, diagnoses with ICD-10/SNOMED-CT, active medications, surgical history, lab investigation values with biological reference flags) into structured FHIR-compliant digital health records.
3. **Immediate Raw Media Purge**: Immediately purge the raw media bytes from memory and disk (`raw_image_purged = True`, payload bytes freed). Zero static picture retention.
4. **Bilingual Civic Plain-Language Summaries**: Generate accessible, jargon-free patient summaries in English and Hindi paired with one-tap spoken voice audio synthesis for common citizens.
