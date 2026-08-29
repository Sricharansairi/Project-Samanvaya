from openai import OpenAI
import json
from app.core.key_rotator import key_rotator
from app.services.sarvam_service import sarvam_service

def generate_dynamic_followup_chips(complaint: str) -> dict:
    """
    (Feature: Dynamic Per-Complaint Questioning)
    Uses a fast LLM (Groq in production, NIM here for fallback) to generate 4-6 specific 
    follow-up questions (chips) based on the initial free-text complaint.
    """
    # Using Llama 3.3 for speed
    api_key = key_rotator.get_llama_3_3_70b_key()
    client = OpenAI(base_url="https://integrate.api.nvidia.com/v1", api_key=api_key)
    
    prompt = f"""
    The patient's chief complaint is: "{complaint}".
    Generate exactly 4 relevant, distinct follow-up questions they could answer with a single tap.
    Return ONLY a JSON array of strings. No markdown, no explanation.
    Example: ["Since yesterday", "For a few weeks", "Yes, with fever", "No fever"]
    """
    try:
        completion = client.chat.completions.create(
            model="nvidia/llama-3.1-nemotron-70b-instruct",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=100
        )
        content = completion.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:-3]
        chips = json.loads(content)
        return {"status": "success", "chips": chips}
    except Exception as e:
        print(f"Error generating chips: {e}")
        return {"status": "error", "chips": ["Less than 3 days", "More than a week", "Yes", "No"]}

def append_doctor_dictation_to_fhir(fhir_record: dict, dictated_text: str) -> dict:
    """
    (Feature: Reverse Doctor Dictation)
    Appends doctor's post-consultation voice dictation back into the FHIR record.
    """
    if "text" not in fhir_record:
        fhir_record["text"] = {"status": "generated", "div": ""}
        
    fhir_record["text"]["div"] += f"<p><strong>Doctor's Dictation:</strong> {dictated_text}</p>"
    
    # In a real system, NLP would extract SNOMED CT codes from dictation here
    if "extension" not in fhir_record:
        fhir_record["extension"] = []
    
    fhir_record["extension"].append({
        "url": "http://example.org/fhir/StructureDefinition/doctor-dictation",
        "valueString": dictated_text
    })
    return fhir_record

def get_festival_analytics(hospital_pin: str) -> dict:
    """
    (Feature: Festival/Season-Aware OPD Analytics)
    Returns predicted surges based on Indian festival and season calendar.
    """
    return {
        "current_season": "Monsoon",
        "upcoming_festival": "Diwali",
        "predicted_surges": [
            {"condition": "Respiratory Illness / Asthma", "expected_surge": "+45%", "reason": "Post-Diwali Smog"},
            {"condition": "Gastroenteritis", "expected_surge": "+30%", "reason": "Monsoon waterlogging in PIN " + hospital_pin}
        ],
        "recommended_action": "Increase inventory for Inhalers and ORS."
    }

def estimate_rough_cost(department: str, scheme_eligible: bool) -> dict:
    """
    (Feature: Rough Cost Estimator)
    Provides cost bounds for transparency.
    """
    base_costs = {
        "Cardiology": {"min": 5000, "max": 25000},
        "Orthopedics": {"min": 3000, "max": 15000},
        "General Medicine": {"min": 500, "max": 2000}
    }
    
    dept_cost = base_costs.get(department, {"min": 1000, "max": 5000})
    
    if scheme_eligible:
        return {
            "department": department,
            "out_of_pocket_estimate": "₹0",
            "scheme_coverage": f"Up to ₹{dept_cost['max']}",
            "message": "Fully covered by matched government scheme."
        }
    else:
        return {
            "department": department,
            "out_of_pocket_estimate": f"₹{dept_cost['min']} - ₹{dept_cost['max']}",
            "scheme_coverage": "₹0",
            "message": "Standard hospital rates apply."
        }

def generate_remote_assist_link(patient_id: str, relative_phone: str) -> dict:
    """
    (Feature: Multi-Generational Remote Assist)
    Generates a secure OTP link for a family member to fill intake details remotely.
    """
    mock_link = f"https://samanvaya.gov.in/assist/{patient_id}?token=abc123xyz"
    # In a real app, send_whatsapp_message(relative_phone, f"Please help fill intake: {mock_link}")
    return {
        "status": "success",
        "link": mock_link,
        "message": f"Assist link sent via SMS to {relative_phone}"
    }

def fetch_asha_records(patient_phone: str) -> dict:
    """
    (Feature: ASHA Record Continuity)
    Pre-fills the session if the patient was screened at a village health worker level.
    """
    # Mock ASHA sub-center database lookup
    if patient_phone == "9999999999":
        return {
            "status": "found",
            "asha_worker_id": "ASHA-AP-104",
            "village_subcenter": "Guntur-Rural",
            "last_screening_date": "2023-10-01",
            "recorded_vitals": {"bp": "140/90", "sugar": "160 mg/dL"},
            "referral_reason": "Persistent hypertension"
        }
    return {"status": "not_found"}

def play_old_prescription(drug_name: str, dosage: str, language: str = "hi") -> dict:
    """
    (Feature: Audio Playback of Old Prescriptions)
    """
    text = f"This is {drug_name}. You need to take it {dosage}."
    base64_audio = sarvam_service.generate_speech(text, language, gender="female")
    return {
        "text": text,
        "audio_b64": base64_audio
    }

def flag_low_confidence_triage(symptoms: str, confidence_score: float) -> dict:
    """
    (Feature: Low-Confidence Triage Fallback)
    If the AI is unsure of specialist routing (confidence < 0.65), route to General Medicine.
    """
    if confidence_score < 0.65:
        return {
            "route_department": "General Medicine",
            "confidence": confidence_score,
            "escalated_to_nurse": True,
            "reason": "Low triage confidence, routing to General Medicine screening."
        }
    return {
        "route_department": "Specialist",
        "confidence": confidence_score,
        "escalated_to_nurse": False
    }

def calculate_generic_savings(branded_drug: str) -> dict:
    """
    (Feature: Brand-to-Generic Rupee Savings Display)
    """
    catalog = {
        "augmentin 625": {"generic": "Amoxicillin + Clavulanic Acid 625mg", "brand_price": 220, "generic_price": 45},
        "pan 40": {"generic": "Pantoprazole 40mg", "brand_price": 110, "generic_price": 18},
        "glycomet 500": {"generic": "Metformin 500mg", "brand_price": 60, "generic_price": 10}
    }
    key = branded_drug.strip().lower()
    item = catalog.get(key, {"generic": f"{branded_drug} (Generic Salt)", "brand_price": 150, "generic_price": 30})
    savings = item["brand_price"] - item["generic_price"]
    return {
        "branded_drug": branded_drug,
        "generic_name": item["generic"],
        "brand_price": item["brand_price"],
        "jan_aushadhi_price": item["generic_price"],
        "savings_amount": savings,
        "savings_percentage": round((savings / item["brand_price"]) * 100, 1)
    }

def translate_to_controlled_vocabulary(patient_idiom: str) -> dict:
    """
    (Feature 63: Controlled-Vocabulary Mapping)
    Expands the Babel Fish layer to map local idioms to standard medical terms (SNOMED-CT / FHIR).
    """
    # Mocking SNOMED-CT mapping for demonstration
    mapping = {
        "chhati pe patthar": {
            "english": "Chest heaviness / tightness",
            "snomed_ct_code": "29847000",
            "fhir_display": "Chest tightness (finding)"
        },
        "ang-ang toot raha hai": {
            "english": "Severe body ache",
            "snomed_ct_code": "28743005",
            "fhir_display": "Generalized body ache"
        },
        "chakkar aa raha hai": {
            "english": "Dizziness",
            "snomed_ct_code": "404640003",
            "fhir_display": "Dizziness (finding)"
        }
    }
    
    key = patient_idiom.strip().lower()
    return mapping.get(key, {
        "english": "Unmapped symptom",
        "snomed_ct_code": "Unknown",
        "fhir_display": "Unknown condition"
    })
