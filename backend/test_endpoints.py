from fastapi.testclient import TestClient
from app.main import app
import sys

client = TestClient(app)

def test_health():
    print("Testing GET /health...")
    response = client.get("/health")
    assert response.status_code == 200
    print(f"Success: {response.json()}\n")

def test_triage():
    print("Testing POST /api/triage...")
    payload = {"symptoms": "Severe headache and sensitivity to light."}
    response = client.post("/api/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "urgency" in data
    assert "department" in data
    print(f"Success: {data}\n")

def test_vision_ocr():
    print("Testing POST /api/vision/ocr...")
    # Dummy base64 string
    payload = {"base64_image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="}
    response = client.post("/api/vision/ocr", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "document_type" in data
    assert "extracted_text" in data
    print(f"Success: {data}\n")

def test_voice_transcribe():
    print("Testing POST /api/voice/transcribe...")
    payload = {"base64_audio": "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=", "source_language": "hi"}
    response = client.post("/api/voice/transcribe", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "text" in data
    print(f"Success: {data}\n")

def test_voice_speak():
    print("Testing POST /api/voice/speak...")
    payload = {"text": "Hello, how can I help you?", "target_language": "hi"}
    response = client.post("/api/voice/speak", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "base64_audio" in data
    print(f"Success (Audio Base64 Received): {str(data['base64_audio'])[:30]}...\n")

if __name__ == "__main__":
    try:
        test_health()
        test_triage()
        test_vision_ocr()
        test_voice_transcribe()
        test_voice_speak()
        print("ALL TESTS PASSED SUCCESSFULLY!")
    except Exception as e:
        print(f"TEST FAILED: {e}")
        sys.exit(1)
