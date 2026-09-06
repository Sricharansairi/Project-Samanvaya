import os
import io
import base64
import requests
from PIL import Image, ImageDraw
from dotenv import load_dotenv

load_dotenv("backend/.env")

img = Image.new("RGB", (600, 300), color=(255, 255, 255))
d = ImageDraw.Draw(img)
d.text((20, 30), "Dr. Ramesh Patil Clinic", fill=(0, 0, 0))
d.text((20, 60), "Patient: Rajesh Kumar, 45y M", fill=(0, 0, 0))
d.text((20, 100), "Rx:", fill=(0, 0, 0))
d.text((20, 130), "1. Tab. Amoxicillin 500mg (1-0-1)", fill=(0, 0, 0))
d.text((20, 160), "2. Tab. Paracetamol 650mg (1-0-1)", fill=(0, 0, 0))

buf = io.BytesIO()
img.save(buf, format="JPEG")
data_url = f"data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode('utf-8')}"

key = os.getenv("NVIDIA_LLAMA_3_2_90B_KEY_1")
url = "https://integrate.api.nvidia.com/v1/chat/completions"
headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}

for model in ["meta/llama-3.2-11b-vision-instruct", "meta/llama-3.2-90b-vision-instruct"]:
    print(f"\nTesting {model} with real prescription image...")
    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Extract all text and medications from this prescription slip as JSON with keys clinic, patient, medications."},
                    {"type": "image_url", "image_url": {"url": data_url}}
                ]
            }
        ],
        "max_tokens": 300,
        "temperature": 0.1
    }
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=25)
        print("Status:", res.status_code)
        if res.ok:
            print("Content:", res.json()["choices"][0]["message"]["content"][:300])
            break
        else:
            print("Error:", res.text[:200])
    except Exception as e:
        print("Error:", e)
