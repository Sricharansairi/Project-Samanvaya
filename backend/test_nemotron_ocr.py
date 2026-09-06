import os
import requests
from dotenv import load_dotenv

load_dotenv("backend/.env")

url = "https://ai.api.nvidia.com/v1/cv/nvidia/nemotron-ocr-v2"
# Let's test all keys
keys = [
    os.getenv("NVIDIA_LLAMA_3_3_70B_KEY_1"),
    os.getenv("NVIDIA_LLAMA_3_3_70B_KEY_2"),
    os.getenv("NVIDIA_LLAMA_3_2_90B_KEY_1"),
    os.getenv("NVIDIA_PHI_4_KEY_1")
]

# Simple 100x100 white image with black text isn't needed, let's test with a real base64 or sample
tiny_jpeg = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="

for i, k in enumerate(keys):
    if not k: continue
    print(f"\nTesting Key {i+1} ({k[:15]}...):")
    try:
        res = requests.post(
            url,
            headers={"Authorization": f"Bearer {k}", "Content-Type": "application/json"},
            json={"input": [{"type": "image_url", "url": tiny_jpeg}]},
            timeout=10
        )
        print("Status:", res.status_code)
        if res.ok:
            print("Response:", res.json())
        else:
            print("Error:", res.text[:200])
    except Exception as e:
        print("Exception:", e)
