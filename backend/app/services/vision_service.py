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

    system_prompt = """
        You are an expert AI Medical Document and Darshana Pariksha Analyzer at an Indian Government Hospital.
        If the image is a medical document (prescription, lab report, discharge summary):
        Extract all text accurately. Return a JSON object with:
        - "document_type": The type of document
        - "diagnoses": List of any extracted diagnoses
        - "medications": List of any extracted medications (brand name or generic)
        - "abnormal_labs": List of any lab results that fall outside the reference range
        
        If the image is a picture of a patient's face, tongue, or nails (Darshana Pariksha):
        Return a JSON object with:
        - "document_type": "darshana_pariksha"
        - "inferred_prakriti": The likely dominant dosha (Vata/Pitta/Kapha) based on visual features (e.g. dry skin = Vata, redness = Pitta).
        - "clinical_signs": List of any visible signs (e.g. pallor, icterus).
        
        Return ONLY valid JSON and nothing else.
        """

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
