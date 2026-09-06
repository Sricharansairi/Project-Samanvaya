import os
import io
import base64
import requests
from PIL import Image, ImageDraw
from dotenv import load_dotenv

load_dotenv("backend/.env")

img = Image.new("RGB", (600, 300), color=(255, 255, 255))
d = ImageDraw.Draw(img)
d.text((20, 30), "CITY GENERAL HOSPITAL & CLINIC", fill=(0, 0, 0))
d.text((20, 60), "Dr. Arvind Sharma, MBBS, MD (Reg: MCI-84920)", fill=(0, 0, 0))
d.text((20, 100), "Patient: Rajesh Kumar, 45 Yrs, Male", fill=(0, 0, 0))
d.text((20, 130), "BP: 130/84 mmHg  Pulse: 76 bpm  Temp: 98.6 F", fill=(0, 0, 0))
d.text((20, 160), "Diagnosis: Acute Bronchitis", fill=(0, 0, 0))
d.text((20, 190), "Rx:", fill=(0, 0, 0))
d.text((20, 210), "1. Tab. Azithromycin 500mg (1-0-0) x 3 days", fill=(0, 0, 0))
d.text((20, 240), "2. Tab. Paracetamol 650mg (1-0-1) x 5 days", fill=(0, 0, 0))

buf = io.BytesIO()
img.save(buf, format="JPEG")
jpeg_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
data_url = f"data:image/jpeg;base64,{jpeg_b64}"

key = os.getenv("NVIDIA_LLAMA_3_3_70B_KEY_1")
url = "https://ai.api.nvidia.com/v1/cv/nvidia/nemotron-ocr-v2"
headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
payload = {"input": [{"type": "image_url", "url": data_url}]}

res = requests.post(url, headers=headers, json=payload, timeout=20)
if res.ok:
    data = res.json()
    detections = []
    for item in data.get("data", []):
        for det in item.get("text_detections", []):
            t = det.get("text_prediction", {}).get("text")
            if t: detections.append(t)
    raw_ocr = "\n".join(detections)
    print("=== RAW OCR EXTRACTED ===")
    print(raw_ocr)

    # Now test Groq gpt-oss-120b deconstruction
    groq_key = os.getenv("GROQ_API_KEY")
    prompt = f"""You are a Senior Hospital Pharmacist for Project Samanvaya.
Extract structured clinical JSON from these OCR lines:
{raw_ocr}

Return strict JSON with:
clinic_name, doctor_name, patient_name, patient_age, patient_gender, vitals (bp, pulse, temp, spo2), diagnoses (array), medications (array of objects with name, dosage, frequency, duration, instructions)."""

    groq_res = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
        json={
            "model": "openai/gpt-oss-120b",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
            "response_format": {"type": "json_object"}
        },
        timeout=15
    )
    print("\n=== GROQ GPT-OSS-120B CLINICAL DECONSTRUCTION ===")
    print(groq_res.json()["choices"][0]["message"]["content"])
