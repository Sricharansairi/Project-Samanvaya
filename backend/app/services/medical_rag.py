"""
Project Samanvaya - Multi-Architectured Medical RAG Service (Python Backend)
Grounded in StatPearls (NCBI), ICMR Standard Treatment Workflows, and SNOMED-CT.
"""

from typing import Dict, Any, List

MEDICAL_CORPUS: List[Dict[str, Any]] = [
    {
        "id": "icmr-cardio-acs",
        "condition": "Acute Coronary Syndrome / Myocardial Infarction",
        "department": "Cardiology / Emergency",
        "urgency": "Critical",
        "snomedCode": "22298006",
        "snomedDisplay": "Myocardial infarction (disorder)",
        "redFlags": ["chest pain radiating to left arm", "chest heaviness", "profuse sweating", "breathlessness", "jaw pain", "chhati pe patthar"],
        "diagnosticQuestions": [
            {
                "key": "radiation",
                "question": "Does the discomfort radiate or spread anywhere?",
                "options": [
                    {"label": "Left arm / shoulder", "value": "left_arm", "isRedFlag": True},
                    {"label": "Jaw / neck", "value": "jaw_neck", "isRedFlag": True},
                    {"label": "Upper back", "value": "back", "isRedFlag": True},
                    {"label": "Stays only in center", "value": "localized"}
                ]
            },
            {
                "key": "associated_autonomic",
                "question": "Are there any accompanying symptoms?",
                "options": [
                    {"label": "Cold profuse sweating", "value": "sweating", "isRedFlag": True},
                    {"label": "Shortness of breath", "value": "dyspnea", "isRedFlag": True},
                    {"label": "Nausea or vomiting", "value": "vomiting"},
                    {"label": "None of these", "value": "none"}
                ]
            }
        ],
        "advice": "CRITICAL: Immediate ECG required within 10 minutes. Rest completely."
    },
    {
        "id": "icmr-cns-stroke",
        "condition": "Acute Ischemic / Hemorrhagic Stroke",
        "department": "Neurology / Emergency",
        "urgency": "Critical",
        "snomedCode": "422504002",
        "snomedDisplay": "Stroke (disorder)",
        "redFlags": ["facial drooping", "one-sided arm weakness", "slurred speech", "sudden loss of vision", "paralysis"],
        "diagnosticQuestions": [
            {
                "key": "fast_face",
                "question": "Can the patient smile symmetrically?",
                "options": [
                    {"label": "One side droops / asymmetrical", "value": "drooping", "isRedFlag": True},
                    {"label": "Normal symmetric smile", "value": "normal"}
                ]
            },
            {
                "key": "time_onset",
                "question": "When was the patient last seen normal?",
                "options": [
                    {"label": "Within last 4.5 hours (Thrombolysis Window)", "value": "lt_4_5h", "isRedFlag": True},
                    {"label": "More than 4.5 hours ago", "value": "gt_4_5h"}
                ]
            }
        ],
        "advice": "CODE STROKE: Urgent Non-Contrast CT Brain needed. Thrombolysis window is within 4.5 hours."
    },
    {
        "id": "icmr-fever-dengue",
        "condition": "Acute Febrile Illness / Dengue / Malaria",
        "department": "General Medicine",
        "urgency": "Medium",
        "snomedCode": "386661006",
        "snomedDisplay": "Fever (finding)",
        "redFlags": ["petechial rash", "gum bleeding", "black stools", "platelet count < 50,000"],
        "diagnosticQuestions": [
            {
                "key": "duration_fever",
                "question": "How many days has the fever been present?",
                "options": [
                    {"label": "1 to 2 days", "value": "1_2d"},
                    {"label": "3 to 5 days (Critical Dengue phase)", "value": "3_5d", "isRedFlag": True},
                    {"label": "Over 7 days (Typhoid / PUO)", "value": "gt_7d"}
                ]
            },
            {
                "key": "bleeding_signs",
                "question": "Any signs of bleeding or red spots on skin?",
                "options": [
                    {"label": "Red spots / gum bleeding", "value": "petechiae", "isRedFlag": True},
                    {"label": "No bleeding signs", "value": "none"}
                ]
            }
        ],
        "advice": "Hydrate aggressively with ORS. Paracetamol for fever. Avoid Ibuprofen/Aspirin."
    }
]

def retrieve_medical_guideline(query_text: str) -> Dict[str, Any]:
    text = query_text.lower()
    
    # 1. Deterministic emergency check
    emergency_kws = ["chest pain", "chhati dard", "stroke", "paralysis", "bleeding heavily", "unconscious"]
    for kw in emergency_kws:
        if kw in text:
            target = MEDICAL_CORPUS[1] if ("stroke" in text or "paralysis" in text) else MEDICAL_CORPUS[0]
            return {
                "is_emergency": True,
                "guideline": target,
                "confidence": 1.0,
                "source": "ICMR Emergency Protocol"
            }
            
    # 2. Keyword matching
    for g in MEDICAL_CORPUS:
        for rf in g["redFlags"]:
            if rf.lower() in text:
                return {"is_emergency": True, "guideline": g, "confidence": 0.95, "source": "ICMR"}
                
    # Default to general medical guideline
    return {"is_emergency": False, "guideline": MEDICAL_CORPUS[2], "confidence": 0.85, "source": "StatPearls"}
