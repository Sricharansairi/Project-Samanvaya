import json
import requests

def process_medical_image(base64_image: str) -> dict:
    """
    Takes a base64 encoded image, runs Nemotron OCR v2 to extract raw text,
    and then uses Moonshot Kimi K3 to parse that text into structured JSON.
    """
    # 1. Nemotron OCR v2 for raw text extraction
    nemotron_url = "https://ai.api.nvidia.com/v1/cv/nvidia/nemotron-ocr-v2"
    nemotron_headers = {
        "Authorization": "Bearer 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",
        "Accept": "application/json"
    }
    nemotron_payload = {
        "input": [
            {
                "type": "image_url",
                "url": f"data:image/jpeg;base64,{base64_image}"
            }
        ]
    }
    
    print("[Vision Service] Calling Nemotron OCR v2...")
    try:
        nemotron_response = requests.post(nemotron_url, headers=nemotron_headers, json=nemotron_payload)
        ocr_result = nemotron_response.text
        print("[Vision Service] Nemotron extraction complete.")
    except Exception as e:
        print(f"Error during Nemotron OCR: {e}")
        ocr_result = "OCR Failed"

    # 2. Moonshot Kimi K3 for structured parsing (Reasoning)
    kimi_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    kimi_headers = {
        "Authorization": "Bearer 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",
        "Accept": "application/json",
    }
    
    system_prompt = """
        You are an expert AI Medical Document Analyzer.
        I will provide you with the raw OCR output from a document (prescription, lab report, discharge summary).
        Extract all relevant medical entities accurately. Return a JSON object with:
        - "document_type": The type of document
        - "diagnoses": List of any extracted diagnoses
        - "medications": List of any extracted medications (brand name or generic)
        - "abnormal_labs": List of any lab results that fall outside the reference range
        
        Return ONLY valid JSON and nothing else. No markdown wrappers.
        """
        
    kimi_payload = {
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": f"Here is the raw OCR output from Nemotron OCR:\n{ocr_result}"
            }
        ],
        "model": "moonshotai/kimi-k3",
        "max_tokens": 1024,
        "temperature": 0.1
    }
    
    print("[Vision Service] Calling Kimi K3 for structured parsing...")
    try:
        kimi_response = requests.post(kimi_url, headers=kimi_headers, json=kimi_payload)
        response_json = kimi_response.json()
        response_text = response_json["choices"][0]["message"]["content"].strip()
        
        # Clean up markdown if present
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "").strip()
            
        result = json.loads(response_text)
        print("[Vision Service] Kimi parsing complete.")
        return result
    except Exception as e:
        print(f"Error during Kimi parsing: {e}")
        return {
            "document_type": "Unknown",
            "diagnoses": [],
            "medications": [],
            "abnormal_labs": ["Failed to extract data."]
        }
