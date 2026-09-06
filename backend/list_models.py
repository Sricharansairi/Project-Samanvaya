import os
import requests
from dotenv import load_dotenv

load_dotenv("backend/.env")

for key_name in ["NVIDIA_LLAMA_3_2_90B_KEY_1", "NVIDIA_PHI_4_KEY_1", "NVIDIA_LLAMA_3_3_70B_KEY_1"]:
    k = os.getenv(key_name)
    if not k:
        continue
    print(f"\nChecking models with {key_name}...")
    try:
        res = requests.get("https://integrate.api.nvidia.com/v1/models", headers={"Authorization": f"Bearer {k}"}, timeout=10)
        if res.ok:
            models = [m["id"] for m in res.json().get("data", [])]
            vision_models = [m for m in models if any(w in m.lower() for w in ["vision", "ocr", "vl", "multimodal", "phi", "palmyra", "nemotron"])]
            print(f"Total models accessible: {len(models)}")
            print("Vision/Multimodal/Medical models found:")
            for m in sorted(vision_models)[:25]:
                print(" -", m)
            break
        else:
            print("Failed:", res.status_code, res.text[:150])
    except Exception as e:
        print("Error:", e)
