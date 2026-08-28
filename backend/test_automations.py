from fastapi.testclient import TestClient
from app.main import app
import sys

client = TestClient(app)

def test_automations():
    print("Testing POST /api/automations/evaluate...")
    payload = {
        "ocr_medications": ["augmentin", "calpol", "dolo"],
        "dosha": "vata",
        "current_month": "july",
        "triage_condition": "fever"
    }
    response = client.post("/api/automations/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "overdose_guard" in data
    assert "patient_questions" in data
    print(f"Success: {data}\n")

def test_clinics():
    print("Testing POST /api/clinics/nearby...")
    payload = {"postal_code": "500032"}
    response = client.post("/api/clinics/nearby", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "hospitals" in data
    print(f"Success: Found {len(data['hospitals'])} hospitals\n")

def test_whatsapp():
    print("Testing POST /api/notifications/whatsapp...")
    payload = {"phone_number": "1234567890", "message": "Test"}
    response = client.post("/api/notifications/whatsapp", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data.get("success") is True
    print(f"Success: {data}\n")

if __name__ == "__main__":
    try:
        test_automations()
        test_clinics()
        test_whatsapp()
        print("ALL AUTOMATION TESTS PASSED SUCCESSFULLY!")
    except Exception as e:
        print(f"TEST FAILED: {e}")
        sys.exit(1)
