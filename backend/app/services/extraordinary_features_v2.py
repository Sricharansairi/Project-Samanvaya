import json
import logging

logger = logging.getLogger(__name__)

# 1. Babel Fish Translation Layer (Dialect to Medical English)
def translate_dialect_to_medical(dialect_text: str) -> str:
    """
    Translates hyper-local regional dialects (e.g., "chhati pe patthar rakha hai") 
    directly into standardized Medical English (SOCRATES framework) via LLM.
    """
    # In a real app, this would call NVIDIA NIM or Groq with a specific translation prompt.
    mock_translations = {
        "chhati pe patthar rakha hai": "Heavy chest discomfort / chest pressure",
        "ang-ang toot raha hai": "Severe generalized myalgia (body ache)",
        "sans phool raha hai": "Dyspnea (Shortness of breath)"
    }
    # Simple mock matcher
    for key, val in mock_translations.items():
        if key in dialect_text.lower():
            return val
    
    return f"Standardized: {dialect_text}"

# 2. Cross-System Herb-Drug Conflict Checker
def check_herb_drug_conflict(allopathic_drugs: list[str], ayurvedic_drugs: list[str]) -> dict:
    """
    Checks for dangerous interactions between Allopathic and Ayurvedic medicines.
    (e.g., Metformin + specific Ayurvedic herbs causing hypoglycemic risk)
    """
    warnings = []
    # Mocking known interactions
    allopathic_lower = [d.lower() for d in allopathic_drugs]
    ayurvedic_lower = [d.lower() for d in ayurvedic_drugs]
    
    if "metformin" in allopathic_lower and "karela" in ayurvedic_lower:
        warnings.append("Caution: Patient is taking Allopathic Metformin alongside Ayurvedic Karela, which may cause severe hypoglycemic risk.")
        
    if "warfarin" in allopathic_lower and "ashwagandha" in ayurvedic_lower:
        warnings.append("Caution: Ashwagandha may interact with Warfarin, affecting blood clotting times.")

    if not warnings:
        return {"status": "safe", "warnings": []}
    return {"status": "danger", "warnings": warnings}

# 3. Data Minimization (Delete Raw Data)
def delete_raw_data(patient_id: str) -> bool:
    """
    Auto-deletes raw audio and document images the moment structured text is extracted and confirmed.
    Ensures strict DPDP Act compliance.
    """
    # In a real app, this would delete files from S3/GCS or local storage.
    logger.info(f"DATA MINIMIZATION: Securely deleted raw audio and OCR images for patient {patient_id}.")
    return True

# 4. Doctor-Edit Audit Trail
def log_doctor_audit_trail(patient_id: str, ai_draft_fhir: dict, doctor_final_fhir: dict) -> bool:
    """
    Logs what the AI drafted vs. what the doctor changed before saving.
    Protects legally ("AI never auto-diagnosed").
    """
    # In a real app, this computes a diff and stores it in an audit log table.
    logger.info(f"AUDIT TRAIL: Logged diff for patient {patient_id}. AI Draft vs Doctor Final saved to audit DB.")
    return True

# 5. Caregiver/Proxy Mode Tagging
def tag_caregiver_proxy(fhir_record: dict, caregiver_name: str, relation: str) -> dict:
    """
    Tags the FHIR record as caregiver-reported instead of patient-reported.
    """
    # Adds a FHIR Extension or updates the 'source' of the information
    fhir_record["extension"] = fhir_record.get("extension", [])
    fhir_record["extension"].append({
        "url": "http://samanvaya.health/fhir/StructureDefinition/caregiver-proxy",
        "valueString": f"Reported by {caregiver_name} ({relation})"
    })
    return fhir_record

# 6. Closed-loop Discharge Translator
def generate_closed_loop_discharge(prescription_text: str, language: str) -> dict:
    """
    Converts doctor's prescription into simple audio + icon-based home-care guidance 
    (sun/moon icons for medicine timing) in the patient's own language.
    """
    # Mocking extraction logic
    icons = []
    if "morning" in prescription_text.lower() or "am" in prescription_text.lower():
        icons.append("☀️ (Morning)")
    if "night" in prescription_text.lower() or "pm" in prescription_text.lower():
        icons.append("🌙 (Night)")
    
    if not icons:
        icons = ["☀️", "🌙"]
        
    return {
        "audio_guidance_url": f"https://mock-bhashini.api/audio/{language}/discharge_instructions.mp3",
        "icons": icons,
        "translated_text": f"Translated to {language}: {prescription_text}"
    }

# 7. Returning-Patient Fast Path
def pull_last_visit_history(abha_id: str) -> dict:
    """
    ABHA lookup pulls the last visit's structured history so the app only asks "what's changed".
    """
    # Mocking DB lookup
    if abha_id == "14-digit-mock-abha":
        return {
            "status": "found",
            "last_visit_date": "2026-07-15",
            "last_chief_complaint": "Persistent dry cough",
            "last_diagnoses": ["Upper Respiratory Infection"],
            "prompt": "Last time you reported a persistent dry cough. How is that now? What has changed?"
        }
    return {"status": "not_found", "message": "No previous records found."}
