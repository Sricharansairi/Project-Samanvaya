import os, time, base64, json
from dotenv import load_dotenv
load_dotenv('backend/.env')
import requests

with open('preview_full.png', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

data_url = f'data:image/png;base64,{b64}'
k_nv = os.getenv('NVIDIA_LLAMA_3_3_70B_KEY_1')
k_groq = os.getenv('GROQ_API_KEY')

print('--- 1. Testing VLM Vision Transcription ---')
t0 = time.time()
vlm_prompt = (
    "You are a Senior Hospital Pharmacist and Medical Scribe. Read this prescription or clinical document photo carefully. "
    "Transcribe all visible medical writing:\n"
    "1. Clinic / Hospital name and location\n"
    "2. Doctor name, degrees (MBBS, MD), and registration number\n"
    "3. Patient name, age, and gender\n"
    "4. Vitals: BP, Pulse, Temperature, SpO2\n"
    "5. Clinical complaints or diagnoses (e.g. Fever, Cough, Bronchial Asthma, Hypertension, Diabetes)\n"
    "6. ALL prescribed medications: dosage form (Tab/Cap/Syp/Inj), medicine name, strength (mg/ml), frequency (1-0-1, OD, BD, TDS, SOS), and instructions\n"
    "7. Advice or investigations\n"
    "Transcribe line by line with highest accuracy."
)

v_res = requests.post('https://integrate.api.nvidia.com/v1/chat/completions', json={
    'model': 'meta/llama-3.2-11b-vision-instruct',
    'messages': [
        {
            'role': 'user', 
            'content': [
                {'type': 'text', 'text': vlm_prompt}, 
                {'type': 'image_url', 'image_url': {'url': data_url}}
            ]
        }
    ],
    'max_tokens': 600,
    'temperature': 0.1
}, headers={'Authorization': f'Bearer {k_nv}', 'Content-Type': 'application/json'}, timeout=25)

print(f'VLM done in {time.time()-t0:.2f}s, status={v_res.status_code}')
vlm_text = v_res.json()['choices'][0]['message']['content'] if v_res.ok else ''
print('VLM Extracted:\n', vlm_text)

print('\n--- 2. Testing Groq 120B Vast Parameter Structuring ---')
t1 = time.time()
sys_prompt = """You are a Chief Medical Informatics Officer. Extract clinical JSON from the transcribed prescription:
{
  "clinic_name": string or null,
  "doctor_name": string or null,
  "patient_name": string or null,
  "patient_age": string or null,
  "patient_gender": "Male" | "Female" | null,
  "vitals": {"bp": string or null, "pulse": string or null, "temp": string or null, "spo2": string or null},
  "diagnoses": string[],
  "medications": string[]
}"""

g_res = requests.post('https://api.groq.com/openai/v1/chat/completions', json={
    'model': 'openai/gpt-oss-120b',
    'messages': [
        {'role': 'system', 'content': sys_prompt}, 
        {'role': 'user', 'content': f"Prescription transcription:\n{vlm_text}"}
    ],
    'response_format': {'type': 'json_object'},
    'temperature': 0.1
}, headers={'Authorization': f'Bearer {k_groq}', 'Content-Type': 'application/json'}, timeout=15)

print(f'Groq 120B done in {time.time()-t1:.2f}s, status={g_res.status_code}')
if g_res.ok:
    parsed = json.loads(g_res.json()['choices'][0]['message']['content'])
    print('Structured Result:\n', json.dumps(parsed, indent=2))
