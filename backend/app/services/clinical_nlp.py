"""
Project Samanvaya - Clinical NLP & Medical Ontology Engine (Python Service)
Translates colloquial, layperson, regional vernacular (Hindi, Telugu, Hinglish, casual English)
into standardized medical terminology, SNOMED-CT, ICD-10, differential diagnoses, and contraindications.
Powered by Moonshot Kimi-K3 via NVIDIA NIM with local clinical ontology fallback.
"""

import re
import json
import requests
from typing import Dict, Any, List

KIMI_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
KIMI_KEY = "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"

VERNACULAR_PATTERNS = [
    {
        "patterns": [
            r"(seene|chaati|chhati|chest|chati|gunde)\s*(me|pe|par|lo)?\s*(bahut|tez|bohot|severe|heavy|bhaari|pathar|dabav|noppi|dard|pain)",
            r"(bayen|left|baayein)\s*(haath|arm|hand|bhuja|shoulder|kandhe)\s*(me|ko|lo)?\s*(dard|pain|kheench|lagestundi)",
            r"(heart|dil|hrudayam)\s*(attack|stroke|band|ruk|valapallu)",
            r"(pathar|heavy stone|bojh|pressure)\s*(on chest|seene pe|chhati par)"
        ],
        "standard_term": "Acute Coronary Syndrome (ACS) / Unstable Angina / Acute Myocardial Infarction",
        "icd10": "I21.9",
        "snomed_code": "29857009",
        "snomed_display": "Chest pain (finding)",
        "system": "Cardiovascular System",
        "severity": "Critical",
        "is_life_threat": True,
        "red_flags": ["Radiation to left arm/jaw", "Diaphoresis", "Dyspnea at rest"],
        "differentials": ["STEMI", "NSTEMI", "Acute Aortic Dissection", "Pulmonary Embolism"],
        "workup": ["12-Lead ECG within 10 min", "Cardiac Troponin-I", "CK-MB", "Bedside Echo"],
        "medications": ["Aspirin 325mg chewed", "Clopidogrel 300mg", "Sublingual Nitroglycerin"],
        "contraindications": ["Strictly avoid Nitrates if sBP < 90 mmHg or PDE-5 inhibitors used", "Avoid NSAIDs in acute myocardial infarction"],
        "route": "/his/registration",
        "explanation": "Critical cardiac symptom detected. Direct routing to Emergency Triage required."
    },
    {
        "patterns": [
            r"(pet|pait|stomach|belly|kadupu)\s*(me|lo)?\s*(jalan|jalan ho|burning|acid|tezaab|manta)",
            r"(khatti dakar|sour burp|acid reflux|heartburn|gas chad gayi|khana upar aa raha)",
            r"(pet kharab|loose motion|dast|pakhana|vidirechanalu|diarrhea|watery stool)",
            r"(pet me dard|pait dard|kadupu noppi|abdominal cramp|cramping after eating)"
        ],
        "standard_term": "Postprandial Dyspepsia / Gastroesophageal Reflux Disease (GERD) / Acute Gastroenteritis",
        "icd10": "K21.9",
        "snomed_code": "16331000",
        "snomed_display": "Heartburn (finding)",
        "system": "Gastrointestinal System",
        "severity": "Medium",
        "is_life_threat": False,
        "red_flags": ["Hematemesis (blood in vomit)", "Melena (black stools)", "Peritoneal rigidity"],
        "differentials": ["GERD", "Peptic Ulcer Disease", "Acute Cholecystitis", "Acute Gastritis"],
        "workup": ["CBC with Platelet Count", "Serum Electrolytes", "Abdominal USG", "UGI Endoscopy if alarm signs"],
        "medications": ["Proton Pump Inhibitor (Pantoprazole 40mg)", "WHO ORS", "Antacid Suspension"],
        "contraindications": ["Avoid NSAIDs (Diclofenac/Ibuprofen) due to ulcer perforation risk", "Avoid Loperamide in acute bloody diarrhea"],
        "route": "/his/rag",
        "explanation": "Symptoms match acute dyspeptic acid reflux. Anti-secretory PPI therapy indicated."
    },
    {
        "patterns": [
            r"(bukhar|tezz bukhar|thand lagke|kampkampi|fever|chills|rigors|jwaram|chaddi jwaram)",
            r"(shareer toot raha|haddiyo me dard|body pain|bone breaking pain|angamula noppulu)",
            r"(aankhon ke peeche dard|retro-orbital|lal chinte|red spots|bleeding gums)",
            r"(3 din se bukhar|fever since|platelet kam|dengue shanka)"
        ],
        "standard_term": "Acute Febrile Illness / Pyrexia with Rigors / Suspected Dengue Fever / Malaria",
        "icd10": "A90",
        "snomed_code": "386661006",
        "snomed_display": "Fever (finding)",
        "system": "Infectious Diseases / Hematology",
        "severity": "High",
        "is_life_threat": False,
        "red_flags": ["Mucosal hemorrhage", "Platelets < 50,000 / uL", "Plasma leakage", "Severe persistent vomiting"],
        "differentials": ["Dengue Fever / DHF", "Plasmodium Falciparum/Vivax Malaria", "Enteric Fever (Typhoid)"],
        "workup": ["CBC with Platelet Count & Hematocrit", "Dengue NS1 Antigen & IgM ELISA", "Peripheral Blood Smear for MP"],
        "medications": ["Oral Rehydration Solution (ORS)", "Paracetamol 500-650mg SOS (Max 3g/24h)"],
        "contraindications": ["STRICTLY CONTRAINDICATED: Aspirin, Ibuprofen, Diclofenac (NSAIDs) trigger severe GI bleeding in Dengue"],
        "route": "/his/rag",
        "explanation": "High fever with chills and bone aches. Platelet monitoring and hydration therapy needed."
    }
]

def translate_patient_prompt_local(prompt: str) -> Dict[str, Any]:
    text = prompt.strip()
    for entry in VERNACULAR_PATTERNS:
        for p in entry["patterns"]:
            if re.search(p, text, re.IGNORECASE):
                return {
                    "patient_raw_prompt": text,
                    "standardized_medical_term": entry["standard_term"],
                    "icd10_code": entry["icd10"],
                    "snomed_code": entry["snomed_code"],
                    "snomed_display": entry["snomed_display"],
                    "anatomical_system": entry["system"],
                    "clinical_severity": entry["severity"],
                    "is_life_threat": entry["is_life_threat"],
                    "clinical_red_flags": entry["red_flags"],
                    "differential_diagnoses": entry["differentials"],
                    "recommended_lab_workup": entry["workup"],
                    "standard_medication_classes": entry["medications"],
                    "contraindications": entry["contraindications"],
                    "suggested_route": entry["route"],
                    "patient_explanation": entry["explanation"]
                }
    
    # Generic fallback
    return {
        "patient_raw_prompt": text,
        "standardized_medical_term": f"General Clinical Finding: {text[:50]}",
        "icd10_code": "R69",
        "snomed_code": "404684003",
        "snomed_display": "Clinical finding (finding)",
        "anatomical_system": "General Internal Medicine",
        "clinical_severity": "Medium",
        "is_life_threat": False,
        "clinical_red_flags": ["Syncope", "Severe dyspnea", "Uncontrolled hemorrhage"],
        "differential_diagnoses": ["Primary Medical Syndrome", "Metabolic Etiology", "Infectious Syndrome"],
        "recommended_lab_workup": ["CBC", "RBS", "Urinalysis"],
        "standard_medication_classes": ["Symptomatic relief per physician"],
        "contraindications": ["Avoid unmonitored empirical sedative or antibiotic use"],
        "suggested_route": "/his/registration",
        "patient_explanation": "Your symptom has been standardized and scheduled for physician evaluation."
    }

def translate_patient_prompt_kimi(prompt: str) -> Dict[str, Any]:
    local_baseline = translate_patient_prompt_local(prompt)
    try:
        system_prompt = (
            "You are the Chief AI Medical Informaticist for Project Samanvaya India. "
            "Translate colloquial Indian layperson symptoms into formal clinical terminology, ICD-10, and SNOMED-CT. "
            "Return ONLY raw JSON with keys: standardized_medical_term, icd10_code, snomed_code, snomed_display, "
            "anatomical_system, clinical_severity, is_life_threat (bool), clinical_red_flags (list), "
            "differential_diagnoses (list), recommended_lab_workup (list), standard_medication_classes (list), "
            "contraindications (list), suggested_route, patient_explanation."
        )
        payload = {
            "model": "moonshotai/kimi-k3",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Patient prompt: '{prompt}'"}
            ],
            "max_tokens": 600,
            "temperature": 0.1
        }
        res = requests.post(KIMI_URL, json=payload, headers={"Authorization": f"Bearer {KIMI_KEY}", "Content-Type": "application/json"}, timeout=5)
        if res.status_code == 200:
            data = res.json()
            raw = data["choices"][0]["message"]["content"].strip()
            if raw.startswith("```json"):
                raw = raw.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(raw)
            parsed["patient_raw_prompt"] = prompt
            return parsed
    except Exception as e:
        print(f"[Clinical NLP] Kimi K3 inference fallback: {e}")
    
    return local_baseline
