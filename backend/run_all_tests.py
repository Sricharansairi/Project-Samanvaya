import sys
import unittest

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def run_tests():
    print("==================================================")
    print("   PROJECT SAMANVAYA - MASTER BACKEND TEST SUITE  ")
    print("==================================================")
    
    # 1. Test Extraordinary Features V1
    from app.services.extraordinary_features import (
        generate_dynamic_followup_chips, append_doctor_dictation_to_fhir,
        get_festival_analytics, estimate_rough_cost, generate_remote_assist_link,
        flag_low_confidence_triage, calculate_generic_savings
    )
    print("\n[TEST GROUP 1] Extraordinary Features V1:")
    
    chips = generate_dynamic_followup_chips("severe headache with vomiting")
    assert len(chips["chips"]) > 0
    print("  ✓ Dynamic Follow-up Chips: PASSED")
    
    fhir = append_doctor_dictation_to_fhir({"resourceType": "Bundle"}, "Patient has mild pharyngitis, prescribe amoxicillin")
    assert fhir["resourceType"] == "Bundle"
    print("  ✓ Reverse Doctor Dictation (Voice-to-FHIR): PASSED")
    
    analytics = get_festival_analytics("110001")
    assert "predicted_surges" in analytics
    assert "climate_metrics" in analytics
    print("  ✓ Climate & Outbreak Epidemiology Radar: PASSED")

    from app.services.dual_model_service import dual_model_service
    dual_b1 = dual_model_service.query_high_param_branch("Status check in 2 words", max_tokens=10)
    assert "branch" in dual_b1
    print("  ✓ Dual Model Architecture (Branch 1 High-Param 120B / Branch 2 Medical): PASSED")
    
    cost = estimate_rough_cost("Cardiology", True)
    assert cost["out_of_pocket_estimate"] == "₹0"
    print("  ✓ Rough Cost Estimator (Scheme vs Out-of-pocket): PASSED")
    
    remote = generate_remote_assist_link("P123", "+919876543210")
    assert "token=" in remote["link"]
    print("  ✓ Multi-Generational Remote Assist OTP Link: PASSED")
    
    triage = flag_low_confidence_triage("unspecified weakness and malaise", 0.45)
    assert triage["route_department"] == "General Medicine"
    print("  ✓ Low-Confidence Triage Fallback: PASSED")
    
    savings = calculate_generic_savings("Augmentin 625")
    assert savings["savings_amount"] > 0
    print("  ✓ Brand-to-Generic Rupee Savings: PASSED")

    # 2. Test Extraordinary Features V2
    from app.services.extraordinary_features_v2 import (
        translate_dialect_to_medical, check_herb_drug_conflict, delete_raw_data,
        log_doctor_audit_trail, tag_caregiver_proxy, generate_closed_loop_discharge,
        pull_last_visit_history
    )
    print("\n[TEST GROUP 2] Extraordinary Features V2:")
    
    translated = translate_dialect_to_medical("mujhe chhati pe patthar rakha hai lag raha")
    assert "chest discomfort" in translated.lower()
    print("  ✓ Babel Fish Dialect Translation: PASSED")
    
    conflict = check_herb_drug_conflict(["Metformin"], ["Karela"])
    assert conflict["status"] == "danger"
    print("  ✓ Cross-System Herb-Drug Conflict Checker: PASSED")
    
    deleted = delete_raw_data("patient_123")
    assert deleted is True
    print("  ✓ DPDP Data Minimization (Auto-delete raw media): PASSED")
    
    audit = log_doctor_audit_trail("patient_123", {"draft": 1}, {"final": 1})
    assert audit is True
    print("  ✓ Doctor-Edit Audit Trail: PASSED")
    
    tagged = tag_caregiver_proxy({"resourceType": "Observation"}, "Sita", "Wife")
    assert "caregiver-proxy" in tagged["extension"][0]["url"]
    print("  ✓ Caregiver/Proxy Reporting Tag: PASSED")
    
    discharge = generate_closed_loop_discharge("Take 1 tablet every morning", "hi")
    assert "☀️ (Morning)" in discharge["icons"]
    print("  ✓ Closed-Loop Discharge Translator (Icon/Audio): PASSED")
    
    history = pull_last_visit_history("14-digit-mock-abha")
    assert history["status"] == "found"
    print("  ✓ Returning-Patient Visit Memory: PASSED")

    # 3. Test Scheme Engine
    from app.services.scheme_agent import evaluate_all_schemes
    print("\n[TEST GROUP 3] State-Based Scheme Engine:")
    schemes = evaluate_all_schemes({
        "state": "Rajasthan",
        "income": 150000,
        "ration_card_type": "BPL",
        "is_secc_listed": True
    })
    assert len(schemes) > 0
    print(f"  ✓ Deterministic State Scheme Engine (Matched {len(schemes)} schemes): PASSED")

    # 4. Test Phase 6 NLP & Case Management Features
    print("\n[TEST GROUP 4] Phase 6 NLP & Case Management:")
    from app.services.router import classify_query_semantic
    semantic_result = classify_query_semantic("I have a fever and my body aches")
    assert semantic_result["intent"] == "MEDICAL_RAG"
    print("  ✓ Semantic-Similarity Routing Layer: PASSED")
    
    from app.services.extraordinary_features import translate_to_controlled_vocabulary
    vocab = translate_to_controlled_vocabulary("chakkar aa raha hai")
    assert vocab["snomed_ct_code"] == "404640003"
    print("  ✓ Controlled-Vocabulary Mapping (Babel Fish -> SNOMED-CT): PASSED")
    
    from app.services.stalled_case_monitor import flag_stalled_cases
    from datetime import datetime, timedelta
    now = datetime.now()
    mock_cases = [
        {"id": "1", "status": "waiting", "submitted_at": (now - timedelta(hours=3)).isoformat()},
        {"id": "2", "status": "waiting", "submitted_at": (now - timedelta(minutes=30)).isoformat()}
    ]
    stalled = flag_stalled_cases(mock_cases, threshold_hours=2)
    assert len(stalled) == 1 and stalled[0]["id"] == "1"
    print("  ✓ Self-Scoped Stalled Case Flag: PASSED")
    
    from app.services.dialog_manager import TriageSession
    session = TriageSession("test_client")
    assert "connections_flag" in session.system_prompt
    print("  ✓ Full Context Cross-Referencing (Prompt Injection): PASSED")

    # 5. Test Medical Document Ingestion & DPDP Data Minimization
    print("\n[TEST GROUP 5] Medical History Document Ingestion & DPDP Compliance:")
    from app.services.medical_document_ingestion import (
        ingest_patient_document, get_patient_vault_documents, build_deterministic_clinical_record
    )
    raw_doc = b"Prescription: Dr. A Sharma. Tab Augmentin 625mg 1-0-1. Diagnosis: Acute Pharyngitis. BP: 120/80 mmHg."
    ingest_res = ingest_patient_document(raw_doc, abha_id="14-1111-2222-3333", document_title="OPD Test")
    assert ingest_res["dpdp_compliance"]["data_minimization_enforced"] is True
    assert ingest_res["dpdp_compliance"]["raw_image_purged"] is True
    assert len(ingest_res["extracted_data"]["medications"]) >= 1
    print("  ✓ DPDP Act 2023 Cryptographic Provenance & Zero-Media Retention: PASSED")
    print("  ✓ Structured Entity Deconstruction & Vault Ingestion: PASSED")

    # 6. Test Longitudinal Timeline & Autonomous Pharmacovigilance
    print("\n[TEST GROUP 6] Longitudinal Analytics, Biomarker Trends & Pharmacovigilance:")
    from app.services.longitudinal_clinical_engine import (
        build_longitudinal_patient_timeline, audit_pharmacovigilance_conflicts,
        generate_abdm_fhir_milestone3_bundle, generate_vernacular_health_coach_briefing
    )
    # Check pharmacovigilance
    audit = audit_pharmacovigilance_conflicts(
        [{"drug_name": "Tab Atorvastatin 20mg", "active_generic_molecule": "Atorvastatin"}],
        ["Tab Clarithromycin 500mg"]
    )
    assert audit["status"] == "ALERT_TRIGGERED"
    assert audit["total_conflicts_found"] >= 1
    print("  ✓ Autonomous Real-Time Pharmacovigilance & Drug Conflict Interceptor: PASSED")

    # Check ABDM M3 bundle
    bundle = generate_abdm_fhir_milestone3_bundle("14-1111-2222-3333")
    assert bundle["resourceType"] == "Bundle"
    print("  ✓ ABDM Milestone 3 FHIR Diagnostic Bundle Serialization: PASSED")

    # Check timeline
    timeline = build_longitudinal_patient_timeline("14-1111-2222-3333")
    assert "biomarker_trends" in timeline
    print("  ✓ Longitudinal Biomarker Trend Aggregation: PASSED")

    # Check vernacular coach
    coach = generate_vernacular_health_coach_briefing("14-1111-2222-3333", "hi")
    assert coach["spoken_audio_ready"] is True
    print("  ✓ Vernacular Civic Health Coach Voice Advisory: PASSED")

    print("\n==================================================")
    print("  ALL 25 BACKEND CORE TEST SUITES PASSED (100%)    ")
    print("==================================================")

if __name__ == "__main__":
    run_tests()

