import os
import requests
import json
from dotenv import load_dotenv

load_dotenv("backend/.env")

key = os.getenv("NVIDIA_LLAMA_3_2_90B_KEY_1")
url = "https://integrate.api.nvidia.com/v1/chat/completions"
headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}

# Small real test image with text "Dr. Patil Clinic Rx: Tab Paracetamol 650mg 1-0-1"
# Let's create a minimal test image or use a tiny data url
tiny_jpeg = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="

for model in [
    "meta/llama-3.2-11b-vision-instruct",
    "meta/llama-3.2-90b-vision-instruct",
    "microsoft/phi-3-vision-128k-instruct"
]:
    print(f"\n--- Testing {model} ---")
    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Describe what you see in this image. Output JSON with key 'description'."},
                    {"type": "image_url", "image_url": {"url": tiny_jpeg}}
                ]
            }
        ],
        "max_tokens": 100,
        "temperature": 0.1
    }
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=20)
        print("Status:", res.status_code)
        if res.ok:
            print("Response:", res.json()["choices"][0]["message"]["content"])
        else:
            print("Error:", res.text[:200])
    except Exception as e:
        print("Exception:", e)
