import json
import urllib.request
import datetime

# Mock Jan Aushadhi Database for Overdose Guard
GENERIC_MAP = {
    "augmentin": "Amoxicillin/Clavulanate",
    "crocin": "Paracetamol",
    "dolo": "Paracetamol",
    "calpol": "Paracetamol",
    "glucophage": "Metformin",
    "janumet": "Sitagliptin/Metformin"
}

def evaluate_overdose_guard(ocr_medications: list) -> dict:
    """
    Checks the OCR extracted medications against the Generic Map.
    Flags if multiple expensive brand names map to the same generic salt.
    """
    salt_counts = {}
    # Polypharmacy Clash Matrix (Allopathic vs Ayurvedic)
    DANGEROUS_INTERACTIONS = {
        "aspirin": ["ginkgo", "garlic", "ginger"],
        "warfarin": ["ginkgo", "garlic", "ginger", "ginseng"],
        "metformin": ["bitter gourd", "karela", "fenugreek"]
    }
    
    warnings = []
    detected_generics = []
    
    # Check for polypharmacy clashes
    meds_lower = [m.lower() for m in ocr_medications]
    for allopathic, ayurvedics in DANGEROUS_INTERACTIONS.items():
        if any(allopathic in m for m in meds_lower):
            for herb in ayurvedics:
                if any(herb in m for m in meds_lower):
                    warnings.append(f"SEVERE POLYPHARMACY CLASH: Patient is taking Blood Thinner/Metabolic ({allopathic}) with Ayurvedic Herb ({herb}). High risk of adverse reaction.")
    
    for med in ocr_medications:
        med_lower = med.lower().strip()
        if med_lower in GENERIC_MAP:
            salt = GENERIC_MAP[med_lower]
            if salt in salt_counts:
                salt_counts[salt].append(med)
            else:
                salt_counts[salt] = [med]
                
    for salt, brands in salt_counts.items():
        if len(brands) > 1:
            warnings.append(f"WARNING: Potential duplicate dosing for generic salt '{salt}'. Patient is taking multiple brands: {', '.join(brands)}")
            
    return {
        "status": "warning" if warnings else "safe",
        "warnings": warnings
    }


def get_live_weather(lat: float = 28.6139, lon: float = 77.2090) -> dict:
    """
    Fetches real-time weather data from Open-Meteo (No API key needed).
    Defaults to New Delhi coordinates.
    """
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,precipitation&timezone=auto"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'ProjectSamanvaya/1.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            current = data.get("current", {})
            return {
                "temperature": current.get("temperature_2m", 25.0),
                "precipitation": current.get("precipitation", 0.0)
            }
    except Exception as e:
        print(f"Weather API Error: {e}")
        # Fallback to defaults
        return {"temperature": 25.0, "precipitation": 0.0}

def generate_ayurvedic_regimen(dosha: str, lat: float = 28.6139, lon: float = 77.2090) -> str:
    """
    Checks LIVE weather data to append specific Ritucharya (Seasonal Regimen).
    """
    weather = get_live_weather(lat, lon)
    temp = weather["temperature"]
    precip = weather["precipitation"]
    
    advice = f"General Ayurvedic Advice for {dosha} dosha."
    
    if precip > 0.5:
        # Raining -> Varsha Ritu (Monsoon)
        advice = f"Varsha Ritu (Monsoon) Regimen (Temp: {temp}°C, Raining): Vata dosha gets aggravated. Eat warm, freshly cooked food with a little ghee. Avoid cold, raw salads and stale food. Drink boiled water."
    elif temp > 35.0:
        # Hot -> Grishma Ritu (Summer)
        advice = f"Grishma Ritu (Summer) Regimen (Temp: {temp}°C): Pitta dosha is dominant. Eat sweet, light, and liquid-rich foods. Drink buttermilk and coconut water. Avoid spicy, sour, and salty foods."
    elif temp < 15.0:
        # Cold -> Hemanta/Shishira Ritu (Winter)
        advice = f"Hemanta Ritu (Winter) Regimen (Temp: {temp}°C): Kapha dosha accumulates. Eat warm, nourishing, and slightly heavy foods. Use warming spices like ginger and black pepper."
    else:
        # Moderate -> Vasanta Ritu (Spring) or Sharad Ritu (Autumn)
        advice = f"Moderate Season Regimen (Temp: {temp}°C): Balance your diet according to your primary dosha. Avoid excessive heavy or extremely light foods."
        
    return advice


def generate_patient_questions(condition_text: str) -> list:
    """
    Generates simple questions for the patient to ask the doctor based on the Triage output.
    Uses hardcoded templates for speed, but could use an LLM in production.
    """
    condition_lower = condition_text.lower()
    questions = []
    
    if "fever" in condition_lower:
        questions.append("How many days should I wait before taking a blood test?")
        questions.append("Can I take Paracetamol if the fever comes back at night?")
    if "pain" in condition_lower:
        questions.append("Are there any exercises I should avoid?")
        questions.append("Should I apply ice or heat to the painful area?")
    if "cough" in condition_lower or "cold" in condition_lower:
        questions.append("Is this contagious? Should I stay away from children?")
        questions.append("Are there any dietary restrictions (like avoiding cold water)?")
        
    if not questions:
        questions.append("What are the side effects of the medicines you are prescribing?")
        questions.append("When should I come back for a follow-up?")
        
    return questions
