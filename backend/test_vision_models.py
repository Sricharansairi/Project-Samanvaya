"""
Test Multimodal Vision Models for Doctor Prescription Extraction
"""
import os
import sys
import json
import base64
import requests
from dotenv import load_dotenv

# Ensure UTF-8 console output on Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

load_dotenv("backend/.env")

def test_models():
    nvidia_key_90b = os.getenv("NVIDIA_LLAMA_3_2_90B_KEY_1")
    groq_key = os.getenv("GROQ_API_KEY")

    print(f"NVIDIA 90B Key Present: {bool(nvidia_key_90b)}")
    print(f"Groq Key Present: {bool(groq_key)}")

    # Create a tiny 1x1 test JPEG base64
    tiny_jpeg = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="

    # 1. Test NVIDIA Llama 3.2 90B Vision Instruct
    print("\n--- Testing NVIDIA meta/llama-3.2-90b-vision-instruct ---")
    try:
        url = "https://integrate.api.nvidia.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {nvidia_key_90b}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "meta/llama-3.2-90b-vision-instruct",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "What do you see in this image? Respond with 'Ready' if working."},
                        {"type": "image_url", "image_url": {"url": tiny_jpeg}}
                    ]
                }
            ],
            "max_tokens": 50,
            "temperature": 0.1
        }
        res = requests.post(url, headers=headers, json=payload, timeout=15)
        print(f"Status: {res.status_code}")
        if res.ok:
            data = res.json()
            print("Response:", data["choices"][0]["message"]["content"])
        else:
            print("Error:", res.text[:200])
    except Exception as e:
        print("NVIDIA 90B Exception:", e)

    # 2. Test Groq Llama 3.2 Vision
    print("\n--- Testing Groq llama-3.2-11b-vision-preview ---")
    try:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.2-11b-vision-preview",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "What do you see in this image? Respond with 'Ready' if working."},
                        {"type": "image_url", "image_url": {"url": tiny_jpeg}}
                    ]
                }
            ],
            "max_tokens": 50,
            "temperature": 0.1
        }
        res = requests.post(url, headers=headers, json=payload, timeout=15)
        print(f"Status: {res.status_code}")
        if res.ok:
            data = res.json()
            print("Response:", data["choices"][0]["message"]["content"])
        else:
            print("Error:", res.text[:200])
    except Exception as e:
        print("Groq Vision Exception:", e)

if __name__ == "__main__":
    test_models()
