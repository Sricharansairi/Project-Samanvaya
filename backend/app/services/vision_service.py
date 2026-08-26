from openai import OpenAI
from app.core.key_rotator import key_rotator
import json

def process_medical_image(base64_image: str) -> dict:
    """
    Takes a base64 encoded image (lab report, prescription) and uses NVIDIA NIM Phi-4
    (or Llama 3.2 90B Vision fallback) to extract medical text and structured data.
    """
    # Primary model is Phi-4
    api_key = key_rotator.get_phi_4_key()
    
    client = OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=api_key
    )

    system_prompt = """You are an expert medical document parser. 
    Analyze the provided image of a medical report or prescription. 
    Return a JSON object with the following fields:
    - "document_type": (string) E.g., 'Lab Report', 'Prescription', 'Discharge Summary'.
    - "extracted_text": (string) The raw text you can clearly read.
    - "key_findings": (list of strings) Important medical values, diagnoses, or prescribed medications.
    Do not include any Markdown formatting in your response, just the raw JSON object."""

    try:
        completion = client.chat.completions.create(
            model="meta/llama-3.2-90b-vision-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": system_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            temperature=0.1,
            max_tokens=512
        )
        
        response_text = completion.choices[0].message.content.strip()
        result = json.loads(response_text)
        return result
    except Exception as e:
        print(f"Error during OCR with Phi-4: {e}")
        # Could implement fallback to Llama 3.2 90B Vision here if needed.
        return {
            "document_type": "Unknown",
            "extracted_text": "",
            "key_findings": ["Failed to extract data."]
        }
