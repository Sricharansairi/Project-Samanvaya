import re

def strip_pii(text: str) -> str:
    """
    Lightweight service to strip PII before sending data to external LLMs.
    Specifically targets:
    1. Aadhaar numbers (12 digits, optional spaces/dashes)
    2. Phone numbers (10 digits, optional spaces/dashes, optional +91)
    """
    if not text:
        return text

    # Strip Aadhaar (e.g., 1234 5678 9012 or 123456789012)
    aadhaar_pattern = r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b'
    text = re.sub(aadhaar_pattern, '[REDACTED_AADHAAR]', text)

    # Strip Indian Phone Numbers (e.g., +91 9876543210, 9876543210, 09876543210)
    phone_pattern = r'(\+91[\-\s]?)?[0]?(9\d{9}|8\d{9}|7\d{9}|6\d{9})\b'
    text = re.sub(phone_pattern, '[REDACTED_PHONE]', text)

    return text
