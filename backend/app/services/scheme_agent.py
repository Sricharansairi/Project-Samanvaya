import json
from openai import OpenAI
from app.core.key_rotator import key_rotator

# Deterministic Rules Engine Data
SCHEMES_DB = [
    {
        "state": "Rajasthan",
        "scheme_name": "Chiranjeevi Yojana (₹25L Coverage)",
        "type": "universal",
        "criteria": {},
        "integrates_with_pmjay": False
    },
    {
        "state": "West Bengal",
        "scheme_name": "Swasthya Sathi (₹5L Coverage)",
        "type": "universal",
        "criteria": {},
        "integrates_with_pmjay": False
    },
    {
        "state": "Andhra Pradesh",
        "scheme_name": "YSR Aarogyasri (₹25L Coverage)",
        "type": "income_threshold",
        "criteria": {"max_income": 500000}, # Under 5L PA
        "integrates_with_pmjay": False
    },
    {
        "state": "Maharashtra",
        "scheme_name": "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)",
        "type": "ration_card_category",
        "criteria": {"allowed_cards": ["yellow", "orange", "antyodaya", "annapurna"]},
        "integrates_with_pmjay": True
    },
    {
        "state": "Tamil Nadu",
        "scheme_name": "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS / Kalaignar)",
        "type": "income_threshold",
        "criteria": {"max_income": 120000},
        "integrates_with_pmjay": False
    },
    {
        "state": "Karnataka",
        "scheme_name": "Arogya Bhagya Yojana",
        "type": "universal",
        "criteria": {},
        "integrates_with_pmjay": True
    },
    {
        "state": "National",
        "scheme_name": "Central Government Health Scheme (CGHS)",
        "type": "universal",
        "criteria": {},
        "integrates_with_pmjay": False
    },
    {
        "state": "National",
        "scheme_name": "Ayushman Bharat PM-JAY (₹5L Coverage)",
        "type": "secc_deprivation",
        "criteria": {"listed_in_secc_2011": True},
        "integrates_with_pmjay": True
    }
]

def evaluate_all_schemes(patient_data: dict) -> list:
    """Helper wrapper for evaluating patient data dict directly."""
    return evaluate_schemes(
        patient_state=patient_data.get("state", ""),
        patient_income=patient_data.get("income"),
        ration_card_color=patient_data.get("ration_card_type") or patient_data.get("ration_card_color"),
        secc_listed=patient_data.get("is_secc_listed", False)
    )


def evaluate_schemes(patient_state: str, patient_income: int = None, ration_card_color: str = None, secc_listed: bool = False) -> list:
    """
    Deterministically evaluates which health schemes a patient is eligible for
    based on hard rules, completely avoiding LLM hallucination on financial matters.
    """
    eligible_schemes = []
    
    # Always check national PM-JAY first
    national_scheme = next(s for s in SCHEMES_DB if s["state"] == "National")
    if secc_listed:
        eligible_schemes.append(national_scheme)
        
    # Check state-specific schemes
    state_schemes = [s for s in SCHEMES_DB if s["state"].lower() == patient_state.lower()]
    
    for scheme in state_schemes:
        if scheme["type"] == "universal":
            eligible_schemes.append(scheme)
        elif scheme["type"] == "income_threshold" and patient_income is not None:
            if patient_income <= scheme["criteria"]["max_income"]:
                eligible_schemes.append(scheme)
        elif scheme["type"] == "ration_card_category" and ration_card_color:
            if ration_card_color.lower() in scheme["criteria"]["allowed_cards"]:
                eligible_schemes.append(scheme)
                
    return eligible_schemes

def generate_patient_scheme_message(patient_data: dict, eligible_schemes: list) -> str:
    """
    The LLM is ONLY used to format the deterministic result into a friendly, vernacular sentence.
    It does not compute eligibility itself.
    """
    if not eligible_schemes:
        return "You may not be directly eligible for the primary state schemes based on these details, but please confirm at the hospital welfare desk."
        
    api_key = key_rotator.get_llama_3_3_70b_key()
    client = OpenAI(base_url="https://integrate.api.nvidia.com/v1", api_key=api_key)
    
    scheme_names = [s["scheme_name"] for s in eligible_schemes]
    
    prompt = f"""
    The patient ({patient_data.get('state')}) has been deterministically verified to be eligible for: {', '.join(scheme_names)}.
    Write a 2-sentence friendly message telling them they are eligible. 
    You MUST end the message with exactly: "Please confirm your final eligibility at the official hospital welfare desk."
    Do NOT invent any other schemes or eligibility criteria.
    """
    
    try:
        completion = client.chat.completions.create(
            model="nvidia/llama-3.1-nemotron-70b-instruct",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=150
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error formatting scheme message: {e}")
        return f"You are eligible for: {', '.join(scheme_names)}. Please confirm your final eligibility at the official hospital welfare desk."
