import requests
from app.core.key_rotator import key_rotator

class BhashiniService:
    def __init__(self):
        # The Bhashini API relies on standard config IDs for pipelines. 
        # These would typically be fetched dynamically via the Bhashini Pipeline Search API,
        # but for this service we'll structure it to accept the keys from the key rotator.
        
        # NOTE: Bhashini requires an active UserId, API Key, and Pipeline ID.
        self.api_key = key_rotator.get_bhashini_key()
        
        # You will need to replace these with your actual Bhashini credentials.
        self.user_id = "YOUR_BHASHINI_USER_ID"
        self.pipeline_id = "YOUR_BHASHINI_PIPELINE_ID"
        
        # Bhashini endpoint for inference (standard spec)
        self.inference_url = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

    def _get_headers(self):
        return {
            "Content-Type": "application/json",
            "Authorization": self.api_key,
            "userID": self.user_id
        }

    def transcribe_audio(self, base64_audio: str, source_language: str = "hi") -> str:
        """
        Takes a base64 encoded audio string in the source language (e.g. Hindi 'hi'),
        and returns the transcribed English text.
        """
        if not self.api_key:
            print("No Bhashini API Key provided. Returning mock transcription.")
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
            response = requests.post(self.inference_url, json=payload, headers=self._get_headers())
            response.raise_for_status()
            data = response.json()
            # Extract translated text from the nested response
            english_text = data['pipelineResponse'][1]['output'][0]['target']
            return english_text
        except Exception as e:
            print(f"Error during Bhashini ASR/Translation: {e}")
            return "Transcription failed. Please try again."


    def generate_speech(self, text: str, target_language: str = "hi", gender: str = "female") -> str:
        """
        Takes English text, translates it to the target language (e.g. Hindi 'hi'),
        and returns a base64 encoded audio string of the spoken text.
        """
        if not self.api_key:
            print("No Bhashini API Key provided. Returning mock audio base64.")
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
            response = requests.post(self.inference_url, json=payload, headers=self._get_headers())
            response.raise_for_status()
            data = response.json()
            # Extract base64 audio from the nested response
            base64_audio = data['pipelineResponse'][1]['audio'][0]['audioContent']
            return base64_audio
        except Exception as e:
            print(f"Error during Bhashini Translation/TTS: {e}")
            return ""

# Singleton instance
bhashini_service = BhashiniService()
