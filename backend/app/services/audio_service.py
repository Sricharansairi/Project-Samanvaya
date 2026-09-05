import requests
import io

# API Keys provided by user
WHISPER_KEY = "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"
MAGPIE_KEY = "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"

def transcribe_audio(audio_bytes: bytes) -> str:
    """
    Sends audio bytes to NVIDIA NIM's Whisper-Large-v3 via OpenAI-compatible REST API.
    """
    url = "https://integrate.api.nvidia.com/v1/audio/transcriptions"
    headers = {
        "Authorization": f"Bearer {WHISPER_KEY}"
    }
    
    # We simulate a file payload as expected by standard Whisper API
    files = {
        "file": ("audio.webm", audio_bytes, "audio/webm")
    }
    data = {
        "model": "openai/whisper-large-v3",
        "response_format": "json"
    }
    
    try:
        print("[Audio Service] Sending audio to Whisper-Large-v3...")
        response = requests.post(url, headers=headers, files=files, data=data)
        if response.status_code == 200:
            result = response.json()
            return result.get("text", "")
        else:
            print(f"Whisper Error {response.status_code}: {response.text}")
            return "Could not transcribe audio."
    except Exception as e:
        print(f"STT Exception: {e}")
        return "Failed to connect to transcription service."

def generate_speech(text: str) -> bytes:
    """
    Sends text to NVIDIA NIM's Magpie-TTS Multilingual and returns audio bytes (WAV format).
    """
    url = "https://877104f7-e885-42b9-8de8-f6e4c6303969.invocation.api.nvcf.nvidia.com/v1/audio/synthesize"
    headers = {
        "Authorization": f"Bearer {MAGPIE_KEY}"
    }
    
    # Multipart form data as per NVIDIA docs
    data = {
        "text": text,
        "language": "en-US",
        "voice": "Magpie-Multilingual.EN-US.Aria",
        "encoding": "LINEAR_PCM",
        "sample_rate_hz": "44100"
    }
    
    try:
        print(f"[Audio Service] Sending text to Magpie-TTS: '{text[:30]}...'")
        response = requests.post(url, headers=headers, data=data)
        if response.status_code == 200:
            return response.content  # Returns the raw WAV audio bytes
        else:
            print(f"TTS Error {response.status_code}: {response.text}")
            return b""
    except Exception as e:
        print(f"TTS Exception: {e}")
        return b""
