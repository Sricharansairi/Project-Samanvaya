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
    print("  ✓ Festival/Season-Aware OPD Analytics: PASSED")
    
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

    print("\n==================================================")
    print("  ALL 15 BACKEND CORE TEST SUITES PASSED (100%)    ")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
