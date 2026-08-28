import pytest
from app.services.extraordinary_features_v2 import (
    translate_dialect_to_medical, check_herb_drug_conflict, delete_raw_data,
    log_doctor_audit_trail, tag_caregiver_proxy, generate_closed_loop_discharge,
    pull_last_visit_history
)

def test_dialect_translation():
    assert "chest discomfort" in translate_dialect_to_medical("mujhe chhati pe patthar rakha hai lag raha").lower()
    assert "body ache" in translate_dialect_to_medical("Mera ang-ang toot raha hai doctor sahab").lower()

def test_herb_drug_conflict():
    safe = check_herb_drug_conflict(["Paracetamol"], ["Tulsi"])
    assert safe["status"] == "safe"
    assert len(safe["warnings"]) == 0

    danger = check_herb_drug_conflict(["Metformin"], ["Karela"])
    assert danger["status"] == "danger"
    assert "hypoglycemic risk" in danger["warnings"][0].lower()

def test_data_minimization():
    assert delete_raw_data("patient_123") == True

def test_doctor_audit_trail():
    assert log_doctor_audit_trail("patient_123", {"draft": 1}, {"final": 1}) == True

def test_caregiver_proxy_tag():
    base_fhir = {"resourceType": "Observation"}
    tagged = tag_caregiver_proxy(base_fhir, "Sita", "Wife")
    assert "caregiver-proxy" in tagged["extension"][0]["url"]
    assert "Sita" in tagged["extension"][0]["valueString"]
    assert "Wife" in tagged["extension"][0]["valueString"]

def test_discharge_translator():
    result = generate_closed_loop_discharge("Take 1 tablet every morning", "te")
    assert "☀️ (Morning)" in result["icons"]
    assert "te" in result["translated_text"]

def test_returning_patient_fast_path():
    result = pull_last_visit_history("14-digit-mock-abha")
    assert result["status"] == "found"
    assert "Upper Respiratory Infection" in result["last_diagnoses"]
    
    empty = pull_last_visit_history("0000000")
    assert empty["status"] == "not_found"
