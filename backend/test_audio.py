import requests
import json
import base64

API_URL = "http://127.0.0.1:8000"

def test_tts():
    print("Testing TTS (Magpie)...")
    res = requests.post(f"{API_URL}/api/voice/speak", json={"text": "Hello! I am Samanvaya Autonomous AI."})
    if res.status_code == 200:
        audio = res.json().get("base64_audio")
        if audio:
            print("SUCCESS: TTS generated base64 audio successfully.")
            return True
    print(f"FAILED TTS: {res.text}")
    return False

def test_stt():
    print("Testing STT (Whisper)...")
    # create a dummy wav file
    dummy_audio = b"RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
    files = {"file": ("test.wav", dummy_audio, "audio/wav")}
    res = requests.post(f"{API_URL}/api/voice/transcribe", files=files)
    if res.status_code == 200:
        print("SUCCESS: STT API responded:", res.json())
        return True
    print(f"FAILED STT: {res.text}")
    return False

if __name__ == "__main__":
    import sys
    try:
        requests.get(f"{API_URL}/health")
    except:
        print("Backend is not running at", API_URL)
        sys.exit(1)
        
    t1 = test_tts()
    t2 = test_stt()
    if t1 and t2:
        print("ALL NEW AUDIO MODULES CONNECTED SUCCESSFULLY!")
