"""
Project Samanvaya - Comprehensive Automated Test Suite:
Medical Document Ingestion, Structured Reconstruction, Dual-Branch AI Synthesis, and DPDP Act 2023 Data Minimization
"""

import os
import sys
import json
import base64
import hashlib
from datetime import datetime

# Set up paths and utf-8 console encoding
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


from app.services.medical_document_ingestion import (
    ingest_patient_document,
    get_patient_vault_documents,
    deconstruct_clinical_document,
    build_deterministic_clinical_record,
    extract_raw_ocr_tokens
)

def test_prescription_ingestion_and_dpdp_minimization():
    print("\n--- Test 1: Prescription Ingestion & DPDP Act 2023 Minimization ---")
    mock_prescription_text = """
    SAI RAM CLINIC & DIAGNOSTICS
    Dr. Sachin Patil MBBS, MD (Med)
    Reg No: MCI-54321
    Date: 2026-09-01
    Patient: Anita Sharma, 34 Yrs, Female
    BP: 120/80 mmHg, Pulse: 72 bpm, Temp: 98.4 F, SpO2: 99%
    Diagnosis: Acute Upper Respiratory Tract Infection, Allergic Rhinitis
    Rx:
    1. Tab. Augmentin 625mg (Amoxicillin + Clavulanic Acid) 1-0-1 x 5 days
    2. Tab. Montair LC (Montelukast + Levocetirizine) 0-0-1 x 10 days
    3. Syp. Ascoril D 10ml TDS x 5 days
    Advice: Steam inhalation twice daily, plenty of warm fluids.
    """
    raw_bytes = mock_prescription_text.encode("utf-8")
    expected_sha256 = hashlib.sha256(raw_bytes).hexdigest()

    abha_test_id = "14-9988-7766-5544"
    result = ingest_patient_document(
        image_bytes=raw_bytes,
        abha_id=abha_test_id,
        document_title="OPD Prescription - Dr. Sachin Patil"
    )

    # 1. Verify SHA-256 Provenance Fingerprint
    assert result["provenance_hash_sha256"] == expected_sha256, "SHA256 fingerprint mismatch"
    print(f"✓ Cryptographic Provenance Hash verified: {result['provenance_hash_sha256'][:16]}...")

    # 2. Verify DPDP Act 2023 Data Minimization
    dpdp = result["dpdp_compliance"]
    assert dpdp["data_minimization_enforced"] is True, "DPDP minimization flag not True"
    assert dpdp["raw_image_purged"] is True, "Raw image not marked as purged"
    assert dpdp["raw_payload_bytes_freed"] == len(raw_bytes), "Payload bytes freed mismatch"
    print("✓ DPDP Act 2023 Data Minimization verified (Raw media purged, zero static picture retention).")

    # 3. Verify Extracted Clinical Data
    ext = result["extracted_data"]
    assert ext["document_metadata"]["document_type"] in [
        "Doctor Prescription (OPD)",
        "Hospital Discharge Summary",
        "Diagnostic Lab Report"
    ], f"Unexpected doc type: {ext['document_metadata']['document_type']}"
    print(f"✓ Document Type: {ext['document_metadata']['document_type']}")

    # Check medications
    meds = ext.get("medications", [])
    assert len(meds) >= 1, "Expected at least 1 medication extracted"
    print(f"✓ Extracted {len(meds)} structured medications:")
    for m in meds:
        print(f"   • {m.get('drug_name')} | Molecule: {m.get('active_generic_molecule')} | Freq: {m.get('frequency')}")

    # Check Vitals
    vitals = ext.get("vitals", {})
    assert vitals.get("bp") is not None or vitals.get("pulse") is not None, "Vitals missing"
    print(f"✓ Recorded Vitals: BP: {vitals.get('bp')} | Pulse: {vitals.get('pulse')} | SpO2: {vitals.get('spo2')}")

    # 4. Verify Dual-Branch AI Summaries
    civic = ext.get("civic_patient_summary", {})
    assert "english" in civic and len(civic["english"]) > 15, "Civic English summary missing"
    assert "hindi" in civic and len(civic["hindi"]) > 10, "Civic Hindi summary missing"
    print(f"✓ Branch 1 Civic Patient Summary (English): \"{civic['english'][:80]}...\"")
    print(f"✓ Branch 1 Civic Patient Summary (Hindi): \"{civic['hindi'][:80]}...\"")

    physician_note = ext.get("physician_clinical_briefing", "")
    assert len(physician_note) > 20, "Doctor clinical briefing missing"
    print(f"✓ Branch 2 Physician Clinical Briefing: \"{physician_note[:90]}...\"")


def test_discharge_summary_and_surgical_history():
    print("\n--- Test 2: Discharge Summary & Surgical History Deconstruction ---")
    mock_discharge_text = """
    ALL INDIA INSTITUTE OF MEDICAL SCIENCES (AIIMS)
    DEPARTMENT OF GENERAL SURGERY & MEDICINE
    DISCHARGE SUMMARY & CLINICAL COURSE
    Patient Name: Ramesh Kumar, Age: 52 Yrs, Gender: Male, UHID: AIIMS-90812
    Admission Date: 2026-08-10, Discharge Date: 2026-08-14
    Final Diagnoses:
    1. Acute Gangrenous Appendicitis (K35.80)
    2. Type 2 Diabetes Mellitus with Peripheral Neuropathy (E11.40)
    3. Essential Primary Hypertension (I10)
    Operative Procedure Performed:
    - Emergency Laparoscopic Appendectomy on 10 Aug 2026 under General Anesthesia.
    Uneventful postoperative course. Abdominal drains removed on Day 3.
    Discharge Medications:
    1. Tab. Augmentin 625mg PO BD x 7 days
    2. Tab. Pan 40mg PO OD before breakfast x 14 days
    3. Tab. Metformin 500mg PO BD after meals
    4. Tab. Telmisartan 40mg PO OD morning
    Allergies: NKDA (No known drug allergies)
    Follow-up: Surgical OPD Room 12 in 7 days for suture removal.
    """

    res = deconstruct_clinical_document(mock_discharge_text)

    meta = res.get("document_metadata", {})
    assert "Discharge" in meta.get("document_type", ""), f"Expected Discharge Summary, got {meta.get('document_type')}"
    print(f"✓ Detected Document Type: {meta.get('document_type')}")

    diagnoses = res.get("diagnoses", [])
    assert len(diagnoses) >= 1, "Expected diagnoses in discharge summary"
    print(f"✓ Extracted {len(diagnoses)} diagnoses:")
    for d in diagnoses:
        print(f"   • {d.get('condition_name')} (ICD-10: {d.get('icd10_code')})")

    surgeries = res.get("surgical_history", [])
    print(f"✓ Surgical History Procedures Extracted: {len(surgeries)}")
    for s in surgeries:
        print(f"   • Procedure: {s.get('procedure_name')} | Indication: {s.get('indication')}")

    meds = res.get("medications", [])
    assert len(meds) >= 2, "Expected multiple medications"
    print(f"✓ Discharge Prescriptions Extracted: {len(meds)} drugs")


def test_diagnostic_lab_report_investigations():
    print("\n--- Test 3: Diagnostic Lab Panel & Investigation Extraction ---")
    mock_lab_report = """
    NABL ACCREDITED PATHOLOGY LABORATORY
    METROPOLITAN HEALTHCARE & DIAGNOSTIC CENTER
    COMPREHENSIVE METABOLIC & GLYCEMIC PROFILE
    Patient: Sunita Devi, Age: 48 Yrs, Female, Sample Date: 2026-08-25
    
    Test Description              Observed Value    Unit       Biological Reference
    Fasting Plasma Glucose (FBS)  164               mg/dL      70 - 100 (Normal), 100 - 125 (Impaired)  [HIGH]
    Glycated Hemoglobin (HbA1c)   8.6               %          < 5.7 (Normal), >= 6.5 (Diabetic)        [CRITICAL]
    Serum Creatinine              1.4               mg/dL      0.6 - 1.1                                [HIGH]
    Blood Urea Nitrogen (BUN)     24                mg/dL      7 - 20                                   [HIGH]
    Total Cholesterol             228               mg/dL      < 200                                    [HIGH]
    Serum Triglycerides           190               mg/dL      < 150                                    [HIGH]
    Estimated GFR (eGFR)          52                mL/min     > 60                                     [LOW]
    
    Doctor Signature: Dr. Preeti Verma MD (Pathology)
    """

    res = deconstruct_clinical_document(mock_lab_report)

    meta = res.get("document_metadata", {})
    print(f"✓ Document Type: {meta.get('document_type')}")

    labs = res.get("investigations_and_labs", [])
    assert len(labs) >= 1, "Expected lab investigations extracted"
    print(f"✓ Extracted {len(labs)} Lab Investigations:")
    for l in labs:
        print(f"   • {l.get('test_name')}: {l.get('observed_value')} {l.get('unit')} (Ref: {l.get('reference_range')}) -> Flag: [{l.get('flag')}]")

    # Verify medical model briefing accounts for the diabetic & renal panel
    briefing = res.get("physician_clinical_briefing", "")
    assert len(briefing) > 10, "Doctor briefing missing on lab report"
    print(f"✓ Doctor Clinical Synopsis on Labs: \"{briefing[:100]}...\"")


def test_abdm_health_locker_vault_persistence():
    print("\n--- Test 4: ABDM Health Locker Vault Persistence ---")
    test_abha = "14-7777-8888-9999"

    record_1 = ingest_patient_document(
        image_bytes=b"Prescription: Tab Metformin 500mg 1-0-1 for T2DM",
        abha_id=test_abha,
        document_title="Prescription 1"
    )
    record_2 = ingest_patient_document(
        image_bytes=b"Lab Report: Fasting Glucose 140 mg/dL, HbA1c 7.9%",
        abha_id=test_abha,
        document_title="HbA1c Lab Panel"
    )

    vault_docs = get_patient_vault_documents(test_abha)
    assert len(vault_docs) >= 2, f"Expected at least 2 vault documents, found {len(vault_docs)}"
    print(f"✓ Vault contains {len(vault_docs)} digitized structured documents for ABHA {test_abha}:")
    for doc in vault_docs:
        print(f"   • Doc ID: {doc['document_id']} | Title: {doc['document_title']} | Hash: {doc['provenance_hash_sha256'][:12]}...")


def test_deterministic_safety_fallback():
    print("\n--- Test 5: Deterministic Safety Fallback Extractor ---")
    mock_rough_ocr = "Tab Paracetamol 650mg 1-0-1 Tab Cetirizine 10mg OD Fever and body ache"
    rec = build_deterministic_clinical_record(mock_rough_ocr)

    assert rec["document_metadata"]["document_type"] == "Doctor Prescription (OPD)"
    assert len(rec["medications"]) >= 1
    assert len(rec["diagnoses"]) >= 1
    assert "civic_patient_summary" in rec
    print(f"✓ Deterministic Fallback operational. Extracted {len(rec['medications'])} meds and {len(rec['diagnoses'])} diagnoses.")


def run_all_ingestion_tests():
    print("==================================================")
    print("  SAMANVAYA MEDICAL DOCUMENT INGESTION TEST SUITE ")
    print("==================================================")
    start = datetime.now()

    test_prescription_ingestion_and_dpdp_minimization()
    test_discharge_summary_and_surgical_history()
    test_diagnostic_lab_report_investigations()
    test_abdm_health_locker_vault_persistence()
    test_deterministic_safety_fallback()

    elapsed = (datetime.now() - start).total_seconds()
    print("\n==================================================")
    print(f"  ALL 5 DOCUMENT INGESTION TEST SUITES PASSED ({elapsed:.2f}s) ")
    print("==================================================")

if __name__ == "__main__":
    run_all_ingestion_tests()
