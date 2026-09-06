import os
import requests
from dotenv import load_dotenv

load_dotenv("backend/.env")

token = os.getenv("VERCEL_TOKEN", "")
project_id = os.getenv("VERCEL_PROJECT_ID", "prj_9gfrMiXmPwRaphwEn3wS3dk2D0tP")
team_id = os.getenv("VERCEL_TEAM_ID", "team_419Kco741utwcSjYTxf5OfcN")

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# 1. Get existing env vars on Vercel
url_get = f"https://api.vercel.com/v9/projects/{project_id}/env?teamId={team_id}"
res = requests.get(url_get, headers=headers)
print("Get Env Status:", res.status_code)
existing = {}
if res.ok:
    for item in res.json().get("envs", []):
        existing[item["key"]] = item["id"]
    print(f"Existing Vercel keys: {list(existing.keys())}")

# 2. Keys to sync from backend/.env
keys_to_sync = [
    "NVIDIA_LLAMA_3_3_70B_KEY_1",
    "NVIDIA_LLAMA_3_3_70B_KEY_2",
    "NVIDIA_LLAMA_3_2_90B_KEY_1",
    "NVIDIA_PHI_4_KEY_1",
    "GROQ_API_KEY",
    "SARVAM_API_KEY_1",
    "SARVAM_API_KEY_2",
    "SARVAM_API_KEY_3"
]

url_post = f"https://api.vercel.com/v10/projects/{project_id}/env?teamId={team_id}"

for key in keys_to_sync:
    val = os.getenv(key)
    if not val:
        continue
    
    # If already exists, delete it first to update
    if key in existing:
        del_url = f"https://api.vercel.com/v9/projects/{project_id}/env/{existing[key]}?teamId={team_id}"
        requests.delete(del_url, headers=headers)
        print(f"Deleted old {key}")

    # Add new
    payload = {
        "key": key,
        "value": val.strip(),
        "type": "encrypted",
        "target": ["production", "preview", "development"]
    }
    add_res = requests.post(url_post, headers=headers, json=payload)
    print(f"Added {key} -> Status {add_res.status_code}")

print("\nEnvironment variables sync complete!")
