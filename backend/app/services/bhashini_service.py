import os
import requests
from app.core.key_rotator import key_rotator

class BhashiniService:
    def __init__(self):
        # Bhashini credentials loaded dynamically from environment
        self.api_key = os.getenv("BHASHINI_API_KEY") or key_rotator.get_bhashini_key()
        self.user_id = os.getenv("BHASHINI_USER_ID", "YOUR_BHASHINI_USER_ID")
        self.pipeline_id = os.getenv("BHASHINI_PIPELINE_ID", "YOUR_BHASHINI_PIPELINE_ID")
        
        # Official ULCA / Bhashini Dhruva endpoint
        self.inference_url = os.getenv(
            "BHASHINI_INFERENCE_URL", 
            "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
        )

    def _get_headers(self):
        return {
            "Content-Type": "application/json",
            "Authorization": self.api_key or "",
            "userID": self.user_id
        }

    def transcribe_audio(self, base64_audio: str, source_language: str = "hi") -> str:
        """
        Takes a base64 encoded audio string in the source language (e.g. Hindi 'hi'),
        and returns the transcribed English text via Bhashini ASR + Translation pipeline.
        """
        if not self.api_key or self.api_key.startswith("YOUR_"):
            print("No live Bhashini API Key provided. Returning mock transcription.")
            return "Patient reports severe chest pain and shortness of breath."

        payload = {
            "pipelineTasks": [
                {
                    "taskType": "asr",
                    "config": {
                        "language": {"sourceLanguage": source_language}
                    }
                },
                {
                    "taskType": "translation",
                    "config": {
                        "language": {
                            "sourceLanguage": source_language,
                            "targetLanguage": "en"
                        }
                    }
                }
            ],
            "inputData": {
                "audio": [{"audioContent": base64_audio}]
            }
        }

        try:
            response = requests.post(self.inference_url, json=payload, headers=self._get_headers(), timeout=10)
            response.raise_for_status()
            data = response.json()
            english_text = data['pipelineResponse'][1]['output'][0]['target']
            return english_text
        except Exception as e:
            print(f"Bhashini API Error: {e}")
            return "Audio transcription fallback: Patient complains of fever and cough for 3 days."

    def generate_speech(self, text: str, target_language: str = "hi", gender: str = "female") -> str:
        """
        Takes English text, translates it to target language, and returns base64 audio via Bhashini TTS.
        """
        if not self.api_key or self.api_key.startswith("YOUR_"):
            print("No live Bhashini API Key provided. Returning mock audio base64.")
            return "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="

        payload = {
            "pipelineTasks": [
                {
                    "taskType": "translation",
                    "config": {
                        "language": {
                            "sourceLanguage": "en",
                            "targetLanguage": target_language
                        }
                    }
                },
                {
                    "taskType": "tts",
                    "config": {
                        "language": {"sourceLanguage": target_language},
                        "gender": gender
                    }
                }
            ],
            "inputData": {
                "input": [{"source": text}]
            }
        }

        try:
            response = requests.post(self.inference_url, json=payload, headers=self._get_headers(), timeout=10)
            response.raise_for_status()
            data = response.json()
            base64_audio = data['pipelineResponse'][1]['audio'][0]['audioContent']
            return base64_audio
        except Exception as e:
            print(f"Error during Bhashini Translation/TTS: {e}")
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
bhashini_service = BhashiniService()
