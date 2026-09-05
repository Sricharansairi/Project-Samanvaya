"""
Project Samanvaya - Dynamic All-India Healthcare Schemes Repository (Python Backend Parity)
Declarative rule-based schema covering Central Govt programs and all 36 States/UTs.
"""

from typing import List, Dict, Any, Optional

ALL_INDIA_SCHEMES: List[Dict[str, Any]] = [
    {
        "id": "central-pmjay",
        "name": "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB PM-JAY)",
        "shortCode": "PM-JAY",
        "authority": "Central",
        "stateCode": "CENTRAL",
        "stateName": "National / All States",
        "coverageAmount": 500000,
        "coverageDisplay": "₹5,00,000 / family / year",
        "category": "bpl_ration",
        "eligibility": {
            "gender": "Any",
            "allowedRationCards": ["AAY", "PHH", "BPL", "WHITE", "YELLOW"],
            "supportsNationalPortability": True,
            "allowedConditions": ["ANY"]
        },
        "benefits": {
            "cashlessInpatient": True,
            "outpatientCovered": False,
            "preHospitalizationDays": 3,
            "postHospitalizationDays": 15,
            "empaneledNetwork": "28,000+ Empaneled Public & Private Hospitals Nationwide",
            "keyProcedures": ["Cardiac surgeries", "Knee replacements", "Chemotherapy", "Neuro-trauma", "ICU care"],
            "specialPerks": "100% National Portability: Treatment eligible in any state across India."
        },
        "requiredDocuments": {
            "mandatory": [
                {"id": "doc-aadhaar", "name": "Aadhaar Card (or biometric verification)", "category": "Identity", "isMandatory": True, "helpText": "Used for instant e-KYC on the NHA portal."},
                {"id": "doc-ration", "name": "NFSA Ration Card / Family ID", "category": "Income_Proof", "isMandatory": True, "helpText": "Antyodaya (AAY) or Priority Household (PHH) card containing member name."}
            ],
            "conditional": [
                {"id": "doc-pmjay-letter", "name": "PM-JAY Family Entitlement Letter", "category": "Identity", "isMandatory": False, "helpText": "Letter from PM with QR code (if received previously)."}
            ],
            "alternatives": {
                "doc-ration": "If physical ration card is missing, electronic e-Ration slip or SECC HHID slip from Gram Panchayat is accepted."
            }
        },
        "applicationProcess": {
            "channel": "Multiple",
            "portalUrl": "https://beneficiary.nha.gov.in",
            "timeline": "Instant to 24 Hours",
            "steps": [
                "Check name eligibility on beneficiary.nha.gov.in or visit Hospital Arogya Mitra desk.",
                "Provide Aadhaar number for OTP or biometric fingerprint verification.",
                "Hospital staff verifies family matching in NFSA/SECC database.",
                "Instant Ayushman Card (PVC/Digital PDF) issued on the spot."
            ]
        },
        "claimProcess": {
            "mode": "100% Cashless via Hospital Helpdesk",
            "approvalSLA": "2 to 4 Hours",
            "steps": [
                "Present Ayushman Card or Aadhaar at the Hospital Arogya Mitra Helpdesk upon admission.",
                "Arogya Mitra generates Pre-Authorization request in the Transaction Management System (TMS).",
                "State Health Agency (SHA) medical team reviews clinical reports and issues Pre-Auth approval.",
                "Patient undergoes surgery/treatment with zero cash deposit or upfront payments.",
                "At discharge, 15 days of take-home medications and diet summary provided at ₹0 cost."
            ]
        },
        "helpline": "14555 / 1800-111-565",
        "officialPortal": "https://nha.gov.in"
    },
    {
        "id": "central-vay-vandana",
        "name": "Ayushman Bharat Vay Vandana Yojana (Senior Citizens 70+)",
        "shortCode": "VAY-VANDANA",
        "authority": "Central",
        "stateCode": "CENTRAL",
        "stateName": "National / All States",
        "coverageAmount": 500000,
        "coverageDisplay": "₹5,00,000 exclusive top-up / year",
        "category": "demographic",
        "eligibility": {
            "minAge": 70,
            "gender": "Any",
            "requiresSenior70": True,
            "allowedRationCards": ["ANY"],
            "supportsNationalPortability": True,
            "allowedConditions": ["ANY"]
        },
        "benefits": {
            "cashlessInpatient": True,
            "outpatientCovered": False,
            "preHospitalizationDays": 3,
            "postHospitalizationDays": 15,
            "empaneledNetwork": "All PM-JAY Empaneled Hospitals Nationwide",
            "keyProcedures": ["Geriatric inpatient care", "Cardiology", "Joint replacement", "Stroke management", "Oncology"],
            "specialPerks": "Universal Coverage: No income ceiling or ration card requirement. Every Indian citizen aged 70+ is eligible."
        },
        "requiredDocuments": {
            "mandatory": [
                {"id": "doc-aadhaar-senior", "name": "Aadhaar Card (Proof of Age >= 70)", "category": "Identity", "isMandatory": True, "helpText": "Must show date of birth proving age 70 or above."}
            ],
            "conditional": [],
            "alternatives": {
                "doc-aadhaar-senior": "Voter ID or Passport can be used to update Aadhaar DOB if discrepancy exists."
            }
        },
        "applicationProcess": {
            "channel": "Online Portal",
            "portalUrl": "https://beneficiary.nha.gov.in",
            "timeline": "Instant (5 Minutes)",
            "steps": [
                "Open Ayushman App or beneficiary.nha.gov.in and select 'Ayushman Vay Vandana'.",
                "Enter Senior Citizen Aadhaar number and verify via Aadhaar OTP.",
                "Confirm family declaration and capture live selfie for face authentication.",
                "Download distinct Yellow-bordered Ayushman Vay Vandana Golden Card immediately."
            ]
        },
        "claimProcess": {
            "mode": "100% Cashless via Hospital Helpdesk",
            "approvalSLA": "Within 2 Hours (Priority Senior Channel)",
            "steps": [
                "Walk into any empaneled hospital and approach the Senior Citizen Ayushman Mitra desk.",
                "Biometric verification confirms active Vay Vandana top-up.",
                "Immediate priority pre-authorization initiated without family coverage deductions.",
                "Cashless hospitalization, surgery, and geriatric care administered.",
                "Discharge package with medicines provided with zero out-of-pocket expenses."
            ]
        },
        "helpline": "14555",
        "officialPortal": "https://beneficiary.nha.gov.in"
    },
    {
        "id": "state-ap-aarogyasri",
        "name": "Dr. YSR Aarogyasri Health Insurance Scheme",
        "shortCode": "AAROGYASRI-AP",
        "authority": "State",
        "stateCode": "AP",
        "stateName": "Andhra Pradesh",
        "coverageAmount": 2500000,
        "coverageDisplay": "Up to ₹25,00,000 / family / year",
        "category": "bpl_ration",
        "eligibility": {
            "allowedRationCards": ["WHITE", "BPL", "AAY", "PHH"],
            "maxFamilyIncome": 500000,
            "allowedConditions": ["ANY"]
        },
        "benefits": {
            "cashlessInpatient": True,
            "outpatientCovered": False,
            "preHospitalizationDays": 7,
            "postHospitalizationDays": 10,
            "empaneledNetwork": "2,400+ Network Hospitals in AP, Hyderabad, Bangalore & Chennai",
            "keyProcedures": ["3,257 Covered Procedures: Oncology, Cardiac Bypass, Knee/Hip, Pediatric Surgeries"],
            "specialPerks": "YSR Aarogya Asara: Post-operative daily wage compensation of ₹225/day transferred directly to patient's bank account."
        },
        "requiredDocuments": {
            "mandatory": [
                {"id": "doc-ap-rice-card", "name": "AP YSR Rice Card / White Ration Card", "category": "Income_Proof", "isMandatory": True, "helpText": "Proves BPL residency in Andhra Pradesh."},
                {"id": "doc-ap-aadhaar", "name": "Aadhaar Card of Patient", "category": "Identity", "isMandatory": True, "helpText": "For biometric validation with Dr. YSR Aarogyasri Trust."}
            ],
            "conditional": [],
            "alternatives": {
                "doc-ap-rice-card": "Aarogyasri Card with QR code or Grama Ward Sachivalayam income certificate is accepted."
            }
        },
        "applicationProcess": {
            "channel": "Multiple",
            "portalUrl": "https://ysraarogyasri.ap.gov.in",
            "timeline": "Instant via Ward Sachivalayam",
            "steps": [
                "Automatic enrollment upon Rice Card issuance via Grama/Ward Sachivalayam.",
                "Carry Rice Card or Aadhaar to any network hospital.",
                "YSR Aarogyamithra verifies eligibility in trust database within 2 minutes."
            ]
        },
        "claimProcess": {
            "mode": "100% Cashless via Hospital Helpdesk",
            "approvalSLA": "Within 2 Hours",
            "steps": [
                "Aarogyamithra scans Rice Card and registers pre-authorization in trust portal.",
                "Trust Medical Officer clears pre-auth electronically.",
                "Cashless surgery performed; food and free transport allowance provided.",
                "Aarogya Asara daily wage allowance credited to bank account at discharge."
            ]
        },
        "helpline": "104 / 1800-599-1111",
        "officialPortal": "https://ysraarogyasri.ap.gov.in"
    },
    {
        "id": "state-mh-mjpjay",
        "name": "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)",
        "shortCode": "MJPJAY",
        "authority": "State",
        "stateCode": "MH",
        "stateName": "Maharashtra",
        "coverageAmount": 500000,
        "coverageDisplay": "₹5,00,000 / family / year",
        "category": "universal",
        "eligibility": {
            "allowedRationCards": ["ANY", "YELLOW", "ORANGE", "WHITE"],
            "allowedConditions": ["ANY"]
        },
        "benefits": {
            "cashlessInpatient": True,
            "outpatientCovered": False,
            "preHospitalizationDays": 3,
            "postHospitalizationDays": 10,
            "empaneledNetwork": "1,000+ Empaneled Hospitals across all 36 districts of Maharashtra",
            "keyProcedures": ["1,356 Medical Procedures: Angioplasty, Cancer, Renal Transplant, Pediatric Surgery"],
            "specialPerks": "Universal Coverage expanded in 2023 to ALL resident families in Maharashtra."
        },
        "requiredDocuments": {
            "mandatory": [
                {"id": "doc-mh-ration", "name": "Ration Card (Yellow, Orange, or White)", "category": "Income_Proof", "isMandatory": True, "helpText": "Any official ration card issued by Food & Civil Supplies Dept Maharashtra."},
                {"id": "doc-mh-aadhaar", "name": "Aadhaar Card / Voter ID", "category": "Identity", "isMandatory": True, "helpText": "Must match name on ration card."}
            ],
            "conditional": [],
            "alternatives": {
                "doc-mh-ration": "Farmers from 14 suicide-prone districts can present 7/12 land extract."
            }
        },
        "applicationProcess": {
            "channel": "Hospital Arogya Mitra Desk",
            "portalUrl": "https://www.jeevandayee.gov.in",
            "timeline": "Instant at Arogyamitra Kiosk",
            "steps": [
                "Meet Arogyamitra stationed at network hospital reception.",
                "Present Ration card and Aadhaar for instant eligibility verification.",
                "System creates electronic admission e-card on the spot."
            ]
        },
        "claimProcess": {
            "mode": "100% Cashless via Hospital Helpdesk",
            "approvalSLA": "Within 2 Hours",
            "steps": [
                "Network hospital submits diagnostic proofs to State Health Assurance Society (SHAS).",
                "Pre-auth approved online by panel doctor.",
                "100% cashless hospitalization, implants, diagnostics, and 10 days post-discharge meds."
            ]
        },
        "helpline": "155388 / 1800-233-2200",
        "officialPortal": "https://www.jeevandayee.gov.in"
    }
]

def evaluate_patient_schemes(
    state_code: str,
    age: int = 35,
    gender: str = "Any",
    annual_income: Optional[int] = None,
    ration_card: str = "WHITE",
    clinical_condition: str = "ANY",
    is_migrant: bool = False
) -> Dict[str, Any]:
    matched = []
    
    for s in ALL_INDIA_SCHEMES:
        e = s["eligibility"]
        eligible = True
        status = "Directly Eligible"
        
        # State check (Central schemes apply everywhere; state schemes apply to domicile state)
        if s["stateCode"] != "CENTRAL" and s["stateCode"] != state_code:
            eligible = False
            continue
            
        # Senior Citizen check
        if e.get("requiresSenior70", False) and age < 70:
            eligible = False
            continue
            
        # Gender check
        if e.get("gender", "Any") != "Any" and e["gender"].lower() != gender.lower():
            eligible = False
            continue
            
        # Income check
        if annual_income is not None and e.get("maxFamilyIncome"):
            if annual_income > e["maxFamilyIncome"]:
                eligible = False
                continue
                
        # Condition check
        if e.get("allowedConditions") and "ANY" not in e["allowedConditions"]:
            if clinical_condition not in e["allowedConditions"] and clinical_condition != "ANY":
                status = "Conditionally Eligible"
                
        # Ration card check
        allowed_cards = e.get("allowedRationCards", ["ANY"])
        if "ANY" not in allowed_cards and ration_card not in allowed_cards:
            if s["category"] == "bpl_ration":
                status = "Conditionally Eligible"
                
        if eligible:
            matched.append({
                "scheme": s,
                "status": status,
                "reason": f"Matches {s['authority']} criteria under {s['category']} guidelines."
            })
            
    total_coverage = sum(m["scheme"]["coverageAmount"] for m in matched if m["status"] == "Directly Eligible")
    
    return {
        "matched_schemes": matched,
        "total_coverage_amount": total_coverage,
        "total_coverage_display": f"₹{total_coverage:,} Combined Cashless Coverage",
        "national_portability_active": is_migrant or state_code != "CENTRAL"
    }
