import uuid
import datetime

def convert_to_fhir_r4(triage_data: dict, patient_symptoms: str) -> dict:
    """
    Converts the output of the Triage AI into a structured FHIR R4 Bundle.
    Contains:
    - Patient (stub)
    - Encounter (Triage event)
    - Condition (The stated symptoms/provisional diagnosis)
    """
    encounter_id = str(uuid.uuid4())
    patient_id = "temp-patient-123" # In production, this comes from GoTrue auth/ABHA
    condition_id = str(uuid.uuid4())
    
    # Map urgency to FHIR Priority
    urgency_map = {
        "Low": "routine",
        "Medium": "urgent",
        "High": "stat",
        "Critical": "stat"
    }
    
    priority_code = urgency_map.get(triage_data.get("urgency", "Low"), "routine")
    
    # Construct FHIR Bundle
    fhir_bundle = {
        "resourceType": "Bundle",
        "type": "collection",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "entry": [
            {
                "fullUrl": f"urn:uuid:{encounter_id}",
                "resource": {
                    "resourceType": "Encounter",
                    "id": encounter_id,
                    "status": "triaged",
                    "class": {
                        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                        "code": "AMB",
                        "display": "ambulatory"
                    },
                    "priority": {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/v3-ActPriority",
                                "code": priority_code
                            }
                        ]
                    },
                    "subject": {
                        "reference": f"Patient/{patient_id}"
                    },
                    "reasonCode": [
                        {
                            "text": triage_data.get("department", "General")
                        }
                    ]
                }
            },
            {
                "fullUrl": f"urn:uuid:{condition_id}",
                "resource": {
                    "resourceType": "Condition",
                    "id": condition_id,
                    "clinicalStatus": {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                                "code": "active"
                            }
                        ]
                    },
                    "subject": {
                        "reference": f"Patient/{patient_id}"
                    },
                    "encounter": {
                        "reference": f"urn:uuid:{encounter_id}"
                    },
                    "note": [
                        {
                            "text": f"Symptoms: {patient_symptoms}\nAdvice: {triage_data.get('advice', '')}"
                        }
                    ]
                }
            }
        ]
    }
    
    return fhir_bundle
