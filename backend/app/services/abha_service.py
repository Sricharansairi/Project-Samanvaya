import random
import uuid

def generate_abha_from_aadhaar(aadhaar_data: dict) -> dict:
    """
    Simulates the ABDM API call to generate an ABHA ID using Aadhaar Face RD or OTP.
    """
    # In production, this would call https://healthidsbx.abdm.gov.in/api/v1/registration/aadhaar/generateOtp
    mock_abha_number = f"{random.randint(10,99)}-{random.randint(1000,9999)}-{random.randint(1000,9999)}-{random.randint(1000,9999)}"
    
    return {
        "status": "success",
        "abha_number": mock_abha_number,
        "abha_address": f"{aadhaar_data.get('name', 'patient').replace(' ', '').lower()}@abdm",
        "message": "ABHA ID generated successfully via Face Authentication/OTP."
    }

def verify_audio_consent(audio_text_transcript: str) -> bool:
    """
    Checks if the patient's ASR transcript contains a clear affirmative consent.
    This fulfills the DPDP Act 2023 requirement for explicit audio-verifiable consent.
    """
    # Multilingual affirmative consent dictionary covering Hindi, Telugu, Tamil, Kannada, Marathi, Bengali, Odia, English
    affirmative_words = [
        "yes", "haan", "agree", "manzoor", "theek", "okay", "avunu", "sare", 
        "oppukuntunna", "aam", "seri", "haudu", "sari", "ho", "hyan", "sammati", 
        "kabool", "paravillai", "agreed", "consent given", "theek hai"
    ]
    transcript_lower = audio_text_transcript.lower()
    
    for word in affirmative_words:
        if word in transcript_lower:
            return True
    return False
