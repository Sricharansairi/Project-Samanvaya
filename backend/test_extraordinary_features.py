import json
from app.services.extraordinary_features import (
    generate_dynamic_followup_chips,
    append_doctor_dictation_to_fhir,
    get_festival_analytics,
    estimate_rough_cost,
    generate_remote_assist_link,
    fetch_asha_records
)

def run_tests():
    print("Running Tests for Extraordinary Features...")
    passed = 0
    failed = 0

    def assert_test(condition, name):
        nonlocal passed, failed
        if condition:
            print(f"PASS: {name}")
            passed += 1
        else:
            print(f"FAIL: {name}")
            failed += 1

    # Test 1: Dynamic Follow-up Chips
    try:
        res = generate_dynamic_followup_chips("I have a severe headache")
        assert_test(len(res["chips"]) > 0, "Dynamic Follow-up Chips Generated")
    except Exception as e:
        print(f"FAIL: Dynamic Follow-up Chips - {e}")
        failed += 1

    # Test 2: Reverse Doctor Dictation
    base_fhir = {"resourceType": "Condition", "id": "123"}
    dictation = "Patient looks pale. Prescribed paracetamol."
    res = append_doctor_dictation_to_fhir(base_fhir, dictation)
    assert_test(dictation in res["text"]["div"], "Doctor Dictation Appended to FHIR Text")
    assert_test(res["extension"][0]["valueString"] == dictation, "Doctor Dictation Appended to FHIR Extension")

    # Test 3: Festival Analytics
    res = get_festival_analytics("110001")
    assert_test(res["current_season"] == "Monsoon", "Festival Analytics Season Check")
    assert_test("Diwali" in res["upcoming_festival"], "Festival Analytics Festival Check")

    # Test 4: Cost Estimator (No Scheme)
    res = estimate_rough_cost("Cardiology", scheme_eligible=False)
    assert_test("₹" in res["out_of_pocket_estimate"], "Cost Estimator (No Scheme) Out of Pocket")
    assert_test("0" in res["scheme_coverage"], "Cost Estimator (No Scheme) Coverage")

    # Test 5: Cost Estimator (Scheme Eligible)
    res = estimate_rough_cost("Cardiology", scheme_eligible=True)
    assert_test("₹0" in res["out_of_pocket_estimate"], "Cost Estimator (Scheme Eligible) Out of Pocket is Zero")
    assert_test("25000" in res["scheme_coverage"], "Cost Estimator (Scheme Eligible) Coverage Shows Max")

    # Test 6: Remote Assist Link
    res = generate_remote_assist_link("patient_789", "9876543210")
    assert_test("patient_789" in res["link"], "Remote Assist Link Contains Patient ID")
    assert_test("9876543210" in res["message"], "Remote Assist Link Notes Phone Number")

    # Test 7: ASHA Record
    res = fetch_asha_records("9999999999")
    assert_test(res["status"] == "found", "ASHA Record Found for 9999999999")
    assert_test("160 mg/dL" in res["recorded_vitals"]["sugar"], "ASHA Record Vitals Correct")

    res_miss = fetch_asha_records("1234567890")
    assert_test(res_miss["status"] == "not_found", "ASHA Record Not Found Correct")

    print(f"\nTest Summary: {passed} Passed, {failed} Failed")

if __name__ == "__main__":
    run_tests()
