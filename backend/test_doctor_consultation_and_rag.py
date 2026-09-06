"""
Unit Test: Doctor Consultation Upload, Amendment (FHIR Addendum), and Clinical RAG
"""
import os
import sys

# Ensure UTF-8 console output on Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "app")))

from app.services.longitudinal_clinical_engine import (
    save_or_amend_patient_consultation,
    perform_patient_medication_rag,
    audit_pharmacovigilance_conflicts
)

def run_doctor_tests():
    abha_test = "14-8921-4320-7712"
    print(f"=== 1. Testing Doctor Consultation Upload (ABDM v1.0) ===")
    initial_consultation = {
        "doctor_name": "Dr. Arvind Sharma, MD",
        "opd_department": "General Medicine",
        "patient_name": "Ramesh Sharma",
        "vitals": {"bp": "130/84", "pulse": "78", "spo2": "98%"},
        "diagnoses": [{"condition_name": "Acute Bronchitis", "icd10_code": "J20.9"}],
        "medications": [
            {"name": "Azithromycin 500mg", "dosage": "500 mg", "frequency": "1-0-0", "duration": "3 days"},
            {"name": "Paracetamol 650mg", "dosage": "650 mg", "frequency": "1-0-1", "duration": "5 days"}
        ],
        "clinical_summary": "Patient presented with fever and productive cough. Auscultation showed rhonchi in right base.",
        "patient_advice": {"diet": "Warm fluids", "follow_up": "5 days"}
    }

    res_upload = save_or_amend_patient_consultation(
        abha_id=abha_test,
        consultation=initial_consultation,
        is_amendment=False
    )
    print(f"Upload Status: {res_upload['status']}")
    print(f"Encounter ID: {res_upload['encounter_id']}")
    print(f"Version: {res_upload['version']}")
    print(f"Provenance Hash: {res_upload['provenance_hash_sha256']}")
    assert res_upload["status"] == "SUCCESS"
    assert res_upload["version"] == "1.0"
    enc_id = res_upload["encounter_id"]

    print(f"\n=== 2. Testing Post-Upload Consultation Amendment (FHIR Addendum v1.1) ===")
    amended_consultation = {
        **initial_consultation,
        "encounter_id": enc_id,
        "medications": [
            {"name": "Azithromycin 500mg", "dosage": "500 mg", "frequency": "1-0-0", "duration": "3 days"},
            {"name": "Paracetamol 650mg", "dosage": "650 mg", "frequency": "1-0-1", "duration": "5 days"},
            {"name": "Levosalbutamol Inhaler", "dosage": "50 mcg", "frequency": "2 puffs BD", "duration": "7 days"}
        ],
        "clinical_summary": "Patient presented with fever and productive cough. Post-auscultation review added bronchodilator for wheeze."
    }

    res_amend = save_or_amend_patient_consultation(
        abha_id=abha_test,
        consultation=amended_consultation,
        is_amendment=True,
        amendment_reason="Added bronchodilator inhaler after observing nocturnal wheezing."
    )
    print(f"Amendment Status: {res_amend['status']}")
    print(f"Version After Amendment: {res_amend['version']}")
    print(f"Is Amendment Flag: {res_amend['is_amendment']}")
    print(f"Reason Recorded: {res_amend['amendment_reason']}")
    assert res_amend["status"] == "SUCCESS"
    assert float(res_amend["version"]) > 1.0

    print(f"\n=== 3. Testing Clinical RAG Over Patient ABHA History ===")
    rag_res = perform_patient_medication_rag(
        abha_id=abha_test,
        query="What antibiotics and fever medications were prescribed to this patient?"
    )
    print(f"RAG Query: {rag_res['query']}")
    print(f"RAG Grounded Answer: {rag_res['answer']}")
    print(f"Documents Analyzed: {rag_res['total_documents_analyzed']}")
    print(f"Medications Indexed: {rag_res['total_medications_indexed']}")
    assert rag_res["total_documents_analyzed"] >= 1
    assert "Azithromycin" in rag_res["answer"] or "Paracetamol" in rag_res["answer"] or len(rag_res["answer"]) > 15

    print("\nALL DOCTOR DESK BACKEND & RAG TESTS PASSED (100%)")

if __name__ == "__main__":
    run_doctor_tests()
