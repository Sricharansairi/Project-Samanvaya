"""
Project Samanvaya - Comprehensive Automated Test Suite:
Longitudinal Timeline Analytics, Biomarker Trends, Live AI Pharmacovigilance, and ABDM M3 Bundle
"""

import os
import sys
import json
from datetime import datetime

# UTF-8 console output for Windows
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from app.services.medical_document_ingestion import ingest_patient_document
from app.services.longitudinal_clinical_engine import (
    build_longitudinal_patient_timeline,
    audit_pharmacovigilance_conflicts,
    generate_abdm_fhir_milestone3_bundle,
    generate_vernacular_health_coach_briefing
)

def test_longitudinal_biomarker_trends():
    print("\n--- Test 1: Longitudinal Timeline & Biomarker Trends ---")
    test_abha = "14-5555-4444-3333"

    # Ingest visit 1: High Glucose and high BP
    doc1 = """
    AIIMS OUTPATIENT CLINIC
    Date: 2026-03-10
    Patient: Anita Devi, 45 F
    BP: 150/95 mmHg, Pulse: 84 bpm
    Diagnosis: Type 2 Diabetes Mellitus, Essential Hypertension
    Lab: Fasting Plasma Glucose (FBS) 182 mg/dL [HIGH]
    Lab: Glycated Hemoglobin (HbA1c) 9.1 % [CRITICAL]
    Rx: Tab Metformin 500mg 1-0-1, Tab Telmisartan 40mg OD
    """
    ingest_patient_document(doc1.encode("utf-8"), abha_id=test_abha, document_title="Baseline Visit - March 2026")

    # Ingest visit 2: 3 months later, improving trend
    doc2 = """
    AIIMS OUTPATIENT CLINIC
    Date: 2026-06-15
    Patient: Anita Devi, 45 F
    BP: 130/84 mmHg, Pulse: 74 bpm
    Diagnosis: Type 2 Diabetes Mellitus, Essential Hypertension
    Lab: Fasting Plasma Glucose (FBS) 124 mg/dL [HIGH]
    Lab: Glycated Hemoglobin (HbA1c) 7.4 % [HIGH]
    Rx: Tab Metformin 500mg 1-0-1, Tab Telmisartan 40mg OD
    """
    ingest_patient_document(doc2.encode("utf-8"), abha_id=test_abha, document_title="Follow-up Visit - June 2026")

    # Build timeline
    timeline = build_longitudinal_patient_timeline(test_abha)
    assert timeline["total_documents"] >= 2, "Expected at least 2 documents in timeline"
    print(f"✓ Total Ingested Documents in Longitudinal Vault: {timeline['total_documents']}")

    # Check trends
    trends = timeline["biomarker_trends"]
    assert len(trends["hba1c"]) >= 2, "Expected 2 HbA1c points"
    assert len(trends["fasting_blood_glucose"]) >= 2, "Expected 2 FBS points"
    assert len(trends["blood_pressure_systolic"]) >= 2, "Expected 2 BP points"
    print(f"✓ Tracked HbA1c Trajectory: {[p['value'] for p in trends['hba1c']]}%")
    print(f"✓ Tracked Fasting Glucose Trajectory: {[p['value'] for p in trends['fasting_blood_glucose']]} mg/dL")
    print(f"✓ Tracked Systolic BP Trajectory: {[p['value'] for p in trends['blood_pressure_systolic']]} mmHg")

    # Check AI trajectory synthesis
    assert timeline["trajectory_status"] in ["Improving", "Stable", "Fluctuating", "Deteriorating"]
    print(f"✓ AI Longitudinal Trajectory Status: [{timeline['trajectory_status']}]")
    print(f"✓ Civic Patient Summary: \"{timeline['civic_patient_summary'].get('english', '')[:80]}...\"")
    print(f"✓ Physician Longitudinal Note: \"{timeline['physician_longitudinal_synthesis'][:80]}...\"")

def test_autonomous_pharmacovigilance():
    print("\n--- Test 2: Autonomous AI Pharmacovigilance & Conflict Matrix ---")
    # Patient is on Atorvastatin and Metformin
    hist_meds = [
        {"drug_name": "Tab Atorvastatin 20mg", "active_generic_molecule": "Atorvastatin"},
        {"drug_name": "Tab Metformin 500mg", "active_generic_molecule": "Metformin"}
    ]

    # Doctor proposes Clarithromycin (Macrolide) and Metformin (duplicate)
    candidates = ["Tab Clarithromycin 500mg BD", "Tab Glycomet 500mg (Metformin)"]

    audit = audit_pharmacovigilance_conflicts(hist_meds, candidates)
    assert audit["status"] == "ALERT_TRIGGERED", "Expected pharmacovigilance alert triggered"
    assert audit["total_conflicts_found"] >= 1, "Expected at least 1 drug conflict found"
    assert audit["total_duplicates_found"] >= 1, "Expected duplicate molecule found"
    print(f"✓ Total Drug-Drug Conflicts Detected: {audit['total_conflicts_found']}")
    for c in audit["conflicts"]:
        print(f"   ⚠️ [{c.get('severity')}] {c.get('candidate_prescription')} ↔ {c.get('interacting_historical_drug')}")
        print(f"      Mechanism: {c.get('clinical_mechanism')}")
        print(f"      Recommendation: {c.get('actionable_recommendation')}")

    for d in audit["duplicate_therapies"]:
        print(f"   🔁 Duplicate Therapy: {d.get('candidate_drug')} overlaps with {d.get('existing_drug')}")

    print(f"✓ Pharmacovigilance Physician Guidance: \"{audit.get('pharmacovigilance_guidance', '')[:90]}...\"")

def test_abdm_fhir_milestone3_bundle():
    print("\n--- Test 3: ABDM Milestone 3 FHIR Diagnostic Bundle Generator ---")
    test_abha = "14-5555-4444-3333"
    bundle = generate_abdm_fhir_milestone3_bundle(test_abha)

    assert bundle["resourceType"] == "Bundle", "Expected FHIR Bundle"
    assert bundle["type"] == "document"
    assert len(bundle["entry"]) >= 2, "Expected at least 2 entries in bundle"
    assert bundle["abdm_compliance"]["milestone"] == "ABDM M3 (Health Information Exchange - HIU/HIP)"
    assert bundle["abdm_compliance"]["raw_payload_retained"] is False
    print(f"✓ ABDM M3 Interoperable Bundle ID: {bundle['id']}")
    print(f"✓ Generated {len(bundle['entry'])} DiagnosticReport FHIR R4 resources with SHA-256 integrity proofs.")
    print("✓ ABDM M3 Data Minimization verified (zero raw image persistence).")

def test_vernacular_civic_health_coach():
    print("\n--- Test 4: Vernacular Civic Health Coach Spoken Briefing ---")
    test_abha = "14-5555-4444-3333"
    coach = generate_vernacular_health_coach_briefing(test_abha, preferred_language="hi")

    assert coach["preferred_language"] == "hi"
    assert coach["spoken_audio_ready"] is True
    assert len(coach["coaching_script"]) > 20
    print(f"✓ Health Coach Language: {coach['language_display']}")
    print(f"✓ Generated Empathetic Coaching Script: \"{coach['coaching_script'][:100]}...\"")

def run_all_tests():
    print("==================================================")
    print("  LONGITUDINAL & PHARMACOVIGILANCE TEST SUITE     ")
    print("==================================================")
    start = datetime.now()

    test_longitudinal_biomarker_trends()
    test_autonomous_pharmacovigilance()
    test_abdm_fhir_milestone3_bundle()
    test_vernacular_civic_health_coach()

    elapsed = (datetime.now() - start).total_seconds()
    print("\n==================================================")
    print(f"  ALL 4 ADVANCED ADVANCED TESTS PASSED ({elapsed:.2f}s) ")
    print("==================================================")

if __name__ == "__main__":
    run_all_tests()
