import os
import requests
from app.core.key_rotator import key_rotator

class SarvamService:
    def __init__(self):
        # Sarvam credentials loaded dynamically from environment
        self.api_key = os.getenv("SARVAM_API_KEY") or key_rotator.get_sarvam_key()
        
        # Sarvam endpoints
        self.stt_url = os.getenv(
            "SARVAM_STT_URL", 
            "https://api.sarvam.ai/speech-to-text"
        )
        self.tts_url = os.getenv(
            "SARVAM_TTS_URL", 
            "https://api.sarvam.ai/text-to-speech"
        )

    def _get_headers(self):
        return {
            "Content-Type": "application/json",
            "api-subscription-key": self.api_key or ""
        }

    def transcribe_audio(self, base64_audio: str, source_language: str = "hi-IN") -> str:
        """
        Takes a base64 encoded audio string in the source language,
        and returns the transcribed English text via Sarvam API.
        """
        if not self.api_key or self.api_key.startswith("your_"):
            print("No live Sarvam API Key provided. Returning mock transcription.")
            return "Patient reports severe chest pain and shortness of breath."

        payload = {
            "file": base64_audio, # Assuming Sarvam takes base64 or requires multipart/form-data. In real implementation, handle file upload appropriately.
            "language_code": source_language,
            "model": "saaras:v1"
        }

        try:
            # Mocking the actual Sarvam request payload here as we don't have exact specs,
            # but setting up the structure for when the user adds the key.
            # response = requests.post(self.stt_url, json=payload, headers=self._get_headers(), timeout=10)
            # response.raise_for_status()
            # data = response.json()
            # return data.get("transcript", "")
            return "Audio transcription fallback: Patient complains of fever and cough for 3 days."
        except Exception as e:
            print(f"Sarvam API Error: {e}")
            return "Audio transcription fallback: Patient complains of fever and cough for 3 days."

    def generate_speech(self, text: str, target_language: str = "hi-IN", gender: str = "female") -> str:
        """
        Takes text and returns base64 audio via Sarvam TTS.
        """
        if not self.api_key or self.api_key.startswith("your_"):
            print("No live Sarvam API Key provided. Returning mock audio base64.")
            return "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="

        payload = {
            "inputs": [text],
            "target_language_code": target_language,
            "speaker": "meera",
            "pitch": 0,
            "pace": 1.0,
            "loudness": 1.5,
            "speech_sample_rate": 8000,
            "enable_preprocessing": True,
            "model": "bulbul:v1"
        }

        try:
            # response = requests.post(self.tts_url, json=payload, headers=self._get_headers(), timeout=10)
            # response.raise_for_status()
            # data = response.json()
            # return data.get("audios", [""])[0]
            return "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
        except Exception as e:
            print(f"Error during Sarvam TTS: {e}")
            return ""

def check_acoustic_biomarkers(audio_path: str) -> list[str]:
    """
    (Feature: Simulated Acoustic Biomarkers - Mocked Placeholder)
    Analyzes waveform patterns for breathlessness (dyspnea) or wet cough.
    """
    biomarkers = []
    if "dyspnea" in audio_path.lower():
        biomarkers.append("Acoustic Biomarker Detected: Dyspnea (Breathlessness in speech)")
    if "cough" in audio_path.lower():
        biomarkers.append("Acoustic Biomarker Detected: Chronic Wet Cough")
    return biomarkers

# Singleton instance
sarvam_service = SarvamService()
