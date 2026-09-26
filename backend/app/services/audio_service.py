import os
import requests
import io
import base64
from app.core.key_rotator import key_rotator
from app.services.bhashini_service import bhashini_service

WHISPER_KEY = os.getenv("NVIDIA_WHISPER_KEY") or key_rotator.get_llama_3_3_70b_key() or ""
MAGPIE_KEY = os.getenv("NVIDIA_MAGPIE_KEY") or key_rotator.get_llama_3_3_70b_key() or ""

def transcribe_audio(audio_bytes: bytes, source_language: str = "hi") -> str:
    """
    Primary: Bhashini Government ASR (22 Indic languages)
    Fallback: Sarvam AI Saaras STT
    Tertiary: NVIDIA NIM Whisper-Large-v3
    """
    # =========================================================================
    # TIER 1: BHASHINI GOVERNMENT ASR (PRIMARY)
    # =========================================================================
    try:
        b64_audio = base64.b64encode(audio_bytes).decode("utf-8")
        bhashini_result = bhashini_service.speech_to_text(
            base64_audio=b64_audio,
            source_language=source_language
        )
        text = bhashini_result.get("text", "").strip()
        if text:
            print(f"[Audio Service] Transcribed via Bhashini ASR ({source_language}): '{text[:40]}...'")
            return text
    except Exception as e:
        print(f"[Audio Service] Bhashini ASR failed, trying Sarvam: {e}")

    # =========================================================================
    # TIER 2: SARVAM AI SAARAS STT (FALLBACK)
    # =========================================================================
    for key in key_rotator.sarvam_keys:
        try:
            lang_code = f"{source_language}-IN" if not source_language.endswith("-IN") else source_language
            files = {"file": ("audio.webm", audio_bytes, "audio/webm")}
            data = {"language_code": lang_code, "model": "saaras:v1"}
            headers = {"api-subscription-key": key}
            resp = requests.post("https://api.sarvam.ai/speech-to-text", headers=headers, files=files, data=data, timeout=8)
            if resp.status_code == 200:
                s_text = resp.json().get("transcript", "").strip()
                if s_text:
                    print(f"[Audio Service] Transcribed via Sarvam AI ({lang_code}): '{s_text[:40]}...'")
                    return s_text
        except Exception as s_err:
            print(f"[Audio Service] Sarvam key attempt failed: {s_err}")

    # =========================================================================
    # TIER 3: NVIDIA NIM WHISPER-LARGE-V3 (TERTIARY)
    # =========================================================================
    if WHISPER_KEY:
        try:
            url = "https://integrate.api.nvidia.com/v1/audio/transcriptions"
            headers = {"Authorization": f"Bearer {WHISPER_KEY}"}
            files = {"file": ("audio.webm", audio_bytes, "audio/webm")}
            data = {"model": "openai/whisper-large-v3", "response_format": "json"}
            response = requests.post(url, headers=headers, files=files, data=data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                return result.get("text", "")
        except Exception as e:
            print(f"[Audio Service] Whisper Exception: {e}")

    return "Could not transcribe audio."


def generate_speech(text: str, language: str = "hi", gender: str = "female") -> bytes:
    """
    Primary: Bhashini Government TTS (22 Indic languages)
    Fallback: Sarvam AI Bulbul v3 TTS
    Tertiary: NVIDIA NIM Magpie-TTS
    """
    clean_text = text.strip()
    if not clean_text:
        return b""

    # =========================================================================
    # TIER 1: BHASHINI GOVERNMENT TTS (PRIMARY)
    # =========================================================================
    try:
        bhashini_result = bhashini_service.text_to_speech(
            text=clean_text,
            language=language,
            gender=gender
        )
        audio_b64 = bhashini_result.get("audio_base64", "")
        if audio_b64 and len(audio_b64) > 100:
            print(f"[Audio Service] Synthesized via Bhashini TTS ({language}, {gender})")
            return base64.b64decode(audio_b64)
    except Exception as e:
        print(f"[Audio Service] Bhashini TTS failed, falling back to Sarvam: {e}")

    # =========================================================================
    # TIER 2: SARVAM AI BULBUL V3 (FALLBACK)
    # =========================================================================
    for key in key_rotator.sarvam_keys:
        try:
            target_lang = f"{language}-IN" if not language.endswith("-IN") else language
            payload = {
                "inputs": [clean_text[:500]],
                "target_language_code": target_lang,
                "speaker": "pooja" if gender == "female" else "aditya",
                "pitch": 0,
                "pace": 1.0,
                "loudness": 1.5,
                "speech_sample_rate": 22050,
                "enable_preprocessing": True,
                "model": "bulbul:v3"
            }
            resp = requests.post(
                "https://api.sarvam.ai/text-to-speech",
                headers={"api-subscription-key": key, "Content-Type": "application/json"},
                json=payload,
                timeout=8
            )
            if resp.status_code == 200:
                data = resp.json()
                audios = data.get("audios", [])
                if audios and len(audios[0]) > 100:
                    print(f"[Audio Service] Synthesized via Sarvam AI Fallback ({target_lang})")
                    return base64.b64decode(audios[0])
        except Exception as s_err:
            print(f"[Audio Service] Sarvam TTS fallback error: {s_err}")

    # =========================================================================
    # TIER 3: NVIDIA NIM MAGPIE-TTS (TERTIARY)
    # =========================================================================
    if MAGPIE_KEY:
        try:
            url = "https://877104f7-e885-42b9-8de8-f6e4c6303969.invocation.api.nvcf.nvidia.com/v1/audio/synthesize"
            headers = {"Authorization": f"Bearer {MAGPIE_KEY}"}
            data = {
                "text": clean_text,
                "language": "en-US",
                "voice": "Magpie-Multilingual.EN-US.Aria",
                "encoding": "LINEAR_PCM",
                "sample_rate_hz": "44100"
            }
            response = requests.post(url, headers=headers, data=data, timeout=10)
            if response.status_code == 200:
                return response.content
        except Exception as e:
            print(f"[Audio Service] Magpie Exception: {e}")

    return b""
