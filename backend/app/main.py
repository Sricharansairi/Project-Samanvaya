from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from app.services.triage_service import triage_symptoms
from app.services.vision_service import process_medical_image
from app.services.audio_service import transcribe_audio, generate_speech
from app.services.pii_service import strip_pii
from app.services.fhir_service import convert_to_fhir_r4
from app.services.clinical_automation import evaluate_overdose_guard, generate_ayurvedic_regimen, generate_patient_questions
from app.services.hospital_finder import get_nearby_hospitals
from app.services.whatsapp_service import send_whatsapp_message
from app.services.extraordinary_features import (
    generate_dynamic_followup_chips, append_doctor_dictation_to_fhir,
    get_festival_analytics, estimate_rough_cost, generate_remote_assist_link,
    fetch_asha_records, play_old_prescription
)
from app.services.extraordinary_features_v2 import (
    translate_dialect_to_medical, check_herb_drug_conflict, delete_raw_data,
    log_doctor_audit_trail, tag_caregiver_proxy, generate_closed_loop_discharge,
    pull_last_visit_history
)

class TranscribeRequest(BaseModel):
    base64_audio: str
    source_language: str = "hi"

class SpeakRequest(BaseModel):
    text: str
    target_language: str = "hi"
    gender: str = "female"

class TriageRequest(BaseModel):
    symptoms: str

class OCRRequest(BaseModel):
    base64_image: str

class AutomationRequest(BaseModel):
    ocr_medications: list[str] = []
    dosha: str = "vata"
    lat: float = 28.6139
    lon: float = 77.2090
    triage_condition: str = ""

class HospitalRequest(BaseModel):
    postal_code: str

class WhatsappRequest(BaseModel):
    phone_number: str
    message: str
    document_url: str = None

app = FastAPI(
    title="Project Samanvaya API",
    description="Backend for the Patient Case-Taking PWA",
    version="1.0.0"
)

# Configure CORS for PWA
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Samanvaya API"}

@app.post("/api/triage")
async def handle_triage(request: TriageRequest):
    # 1. Strip PII (Aadhaar, Phone Numbers)
    safe_symptoms = strip_pii(request.symptoms)
    
    # 2. RAG + Triage LLM
    result = triage_symptoms(safe_symptoms)
    
    # 3. Translate to FHIR R4 Standard
    fhir_bundle = convert_to_fhir_r4(result, safe_symptoms)
    
    return fhir_bundle

@app.post("/api/vision/ocr")
async def handle_ocr(request: OCRRequest):
    result = process_medical_image(request.base64_image)
    return result

from fastapi import UploadFile, File
import base64

@app.post("/api/voice/transcribe")
async def handle_voice_transcribe(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    text = transcribe_audio(audio_bytes)
    return {"text": text}

@app.post("/api/voice/speak")
async def handle_voice_speak(request: SpeakRequest):
    audio_bytes = generate_speech(request.text)
    base64_audio = base64.b64encode(audio_bytes).decode('utf-8')
    return {"base64_audio": base64_audio}

class VoiceTranscriptRequest(BaseModel):
    transcript: str

from app.services.triage_service import extract_patient_entities

@app.post("/api/voice/extract-entities")
async def handle_entity_extraction(request: VoiceTranscriptRequest):
    entities = extract_patient_entities(request.transcript)
    return entities

@app.post("/api/automations/evaluate")
async def handle_automations(request: AutomationRequest):
    overdose = evaluate_overdose_guard(request.ocr_medications)
    ayurvedic = generate_ayurvedic_regimen(request.dosha, request.lat, request.lon)
    prompter = generate_patient_questions(request.triage_condition)
    return {
        "overdose_guard": overdose,
        "ayurvedic_regimen": ayurvedic,
        "patient_questions": prompter
    }

from fastapi import HTTPException

# Mock supabase client for the rollback transaction example
class MockSupabase:
    def table(self, name):
        class MockTable:
            def insert(self, data):
                class MockResponse:
                    def execute(self):
                        return type('obj', (object,), {'data': [{'id': 'mock_id_123'}]})()
                return MockResponse()
            def delete(self):
                class MockResponse:
                    def eq(self, k, v):
                        class MockEq:
                            def execute(self): pass
                        return MockEq()
                return MockResponse()
        return MockTable()
supabase = MockSupabase()

from app.services.epidemic_radar import detect_epidemic_outbreak
from app.services.abha_service import generate_abha_from_aadhaar, verify_audio_consent

@app.get("/api/admin/epidemic-radar/{postal_code}")
async def check_epidemic_radar(postal_code: str):
    return detect_epidemic_outbreak(supabase, postal_code)

class AbhaRequest(BaseModel):
    name: str
    aadhaar_number: str

@app.post("/api/abha/create")
async def create_abha(request: AbhaRequest):
    return generate_abha_from_aadhaar(request.dict())

class ConsentRequest(BaseModel):
    audio_transcript: str

@app.post("/api/abha/consent")
async def verify_consent(request: ConsentRequest):
    has_consent = verify_audio_consent(request.audio_transcript)
    if not has_consent:
        raise HTTPException(status_code=403, detail="Audio consent not verified. Patient must clearly say Yes.")
    return {"status": "success", "message": "Immutable audio consent verified and attached to FHIR bundle."}

class FamilyAuthRequest(BaseModel):
    phone_number: str
    otp: str

@app.post("/api/family/auth")
async def family_cluster_auth(request: FamilyAuthRequest):
    # Mock returning multiple profiles for a single phone number
    if request.otp == "1234":
        return {
            "status": "success",
            "profiles": [
                {"id": "p1", "name": "Ramesh", "relation": "Self", "abha_id": "12-3456-7890-1234"},
                {"id": "p2", "name": "Sita", "relation": "Wife", "abha_id": "98-7654-3210-9876"},
                {"id": "p3", "name": "Arjun", "relation": "Son", "abha_id": "55-5555-5555-5555"}
            ]
        }
    raise HTTPException(status_code=401, detail="Invalid OTP")

@app.post("/api/triage/submit")
async def handle_triage_submission(patient_id: str, fhir_json: dict):
    """
    Saves a FHIR record safely. If any step fails, the transaction rolls back.
    (Simulated using Supabase RPC or Python-level orchestration).
    """
    try:
        # In a real app, this would use an RPC call for a true Postgres transaction:
        # response = supabase.rpc('insert_triage_transaction', {'p_id': patient_id, 'fhir': fhir_json}).execute()
        
        # Simulating Python-level rollback safety:
        visit_response = supabase.table("visits").insert({"patient_id": patient_id, "status": "triaged"}).execute()
        if not visit_response.data:
            raise Exception("Failed to create visit.")
            
        visit_id = visit_response.data[0]['id']
        
        fhir_response = supabase.table("fhir_records").insert({"visit_id": visit_id, "fhir_bundle": fhir_json}).execute()
        if not fhir_response.data:
            # Rollback visit if FHIR fails
            supabase.table("visits").delete().eq("id", visit_id).execute()
            raise Exception("Failed to insert FHIR record. Rolling back visit.")
            
        return {"status": "success", "visit_id": visit_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database Transaction Failed: {str(e)}")


@app.post("/api/clinics/nearby")
async def handle_clinics(request: HospitalRequest):
    hospitals = get_nearby_hospitals(request.postal_code)
    return {"hospitals": hospitals}

@app.post("/api/notifications/whatsapp")
async def handle_whatsapp(request: WhatsappRequest):
    success = send_whatsapp_message(request.phone_number, request.message, request.document_url)
    return {"success": success}

class FollowUpRequest(BaseModel):
    complaint: str

@app.post("/api/triage/dynamic-chips")
async def get_dynamic_chips(request: FollowUpRequest):
    return generate_dynamic_followup_chips(request.complaint)

class DictationRequest(BaseModel):
    fhir_record: dict
    dictated_text: str

@app.post("/api/doctor/dictation")
async def append_dictation(request: DictationRequest):
    return append_doctor_dictation_to_fhir(request.fhir_record, request.dictated_text)

@app.get("/api/admin/festival-analytics/{postal_code}")
async def get_festival_stats(postal_code: str):
    return get_festival_analytics(postal_code)

@app.get("/api/cost-estimator")
async def get_cost_estimate(department: str, scheme_eligible: bool = False):
    return estimate_rough_cost(department, scheme_eligible)

from typing import Optional

class SchemeEvaluationRequest(BaseModel):
    state: str = "CENTRAL"
    age: int = 35
    gender: str = "Any"
    income: Optional[int] = None
    ration_card_type: str = "WHITE"
    clinical_condition: str = "ANY"
    is_migrant: bool = False

@app.post("/api/schemes/evaluate")
async def handle_evaluate_schemes(request: SchemeEvaluationRequest):
    from app.services.schemes_repository import evaluate_patient_schemes
    return evaluate_patient_schemes(
        state_code=request.state,
        age=request.age,
        gender=request.gender,
        annual_income=request.income,
        ration_card=request.ration_card_type,
        clinical_condition=request.clinical_condition,
        is_migrant=request.is_migrant
    )

@app.get("/api/schemes/catalog")
async def handle_schemes_catalog():
    from app.services.schemes_repository import ALL_INDIA_SCHEMES
    return {"schemes": ALL_INDIA_SCHEMES}

class ClinicalInterrogateRequest(BaseModel):
    complaint: str

@app.post("/api/rag/clinical-interrogate")
async def handle_clinical_interrogation(request: ClinicalInterrogateRequest):
    from app.services.medical_rag import retrieve_medical_guideline
    return retrieve_medical_guideline(request.complaint)

class RemoteAssistRequest(BaseModel):
    patient_id: str
    relative_phone: str

@app.post("/api/family/remote-assist")
async def request_remote_assist(request: RemoteAssistRequest):
    return generate_remote_assist_link(request.patient_id, request.relative_phone)

@app.get("/api/asha-records/{phone_number}")
async def get_asha_records(phone_number: str):
    return fetch_asha_records(phone_number)

class PrescriptionAudioRequest(BaseModel):
    drug_name: str
    dosage: str
    language: str = "hi"

@app.post("/api/voice/play-prescription")
async def play_prescription(request: PrescriptionAudioRequest):
    return play_old_prescription(request.drug_name, request.dosage, request.language)

class DialectRequest(BaseModel):
    dialect_text: str

@app.post("/api/translate/dialect")
async def translate_dialect(request: DialectRequest):
    return {"medical_english": translate_dialect_to_medical(request.dialect_text)}

class ConflictRequest(BaseModel):
    allopathic_drugs: list[str]
    ayurvedic_drugs: list[str]

@app.post("/api/safety/herb-drug-conflict")
async def check_conflict(request: ConflictRequest):
    return check_herb_drug_conflict(request.allopathic_drugs, request.ayurvedic_drugs)

@app.delete("/api/privacy/delete-raw/{patient_id}")
async def data_minimization(patient_id: str):
    success = delete_raw_data(patient_id)
    return {"status": "success", "deleted": success}

class AuditRequest(BaseModel):
    patient_id: str
    ai_draft_fhir: dict
    doctor_final_fhir: dict

@app.post("/api/audit/doctor-edit")
async def log_audit_trail(request: AuditRequest):
    success = log_doctor_audit_trail(request.patient_id, request.ai_draft_fhir, request.doctor_final_fhir)
    return {"status": "success", "logged": success}

class ProxyRequest(BaseModel):
    fhir_record: dict
    caregiver_name: str
    relation: str

@app.post("/api/triage/proxy-tag")
async def tag_proxy(request: ProxyRequest):
    return tag_caregiver_proxy(request.fhir_record, request.caregiver_name, request.relation)

class DischargeRequest(BaseModel):
    prescription_text: str
    language: str = "hi"

@app.post("/api/discharge/translator")
async def discharge_translator(request: DischargeRequest):
    return generate_closed_loop_discharge(request.prescription_text, request.language)

@app.get("/api/triage/fast-path/{abha_id}")
async def fast_path_history(abha_id: str):
    return pull_last_visit_history(abha_id)

from app.services.dialog_manager import TriageSession

# Store active sessions in memory
active_sessions: dict[str, TriageSession] = {}

@app.websocket("/ws/triage/{client_id}")
async def websocket_triage(websocket: WebSocket, client_id: str):
    await websocket.accept()
    
    # Initialize a new stateful session for this client
    session = TriageSession(client_id)
    active_sessions[client_id] = session
    
    # Send the initial greeting
    initial_greeting = json.loads(session.history[1]["content"])
    await websocket.send_json(initial_greeting)
    
    try:
        while True:
            # Receive patient's answer (voice transcribed to text, or chip tap)
            data = await websocket.receive_text()
            
            # Process through the Dialog Manager
            response = session.process_patient_input(data)
            
            # Stream back the next question and chips
            await websocket.send_json(response)
            
            if response.get("status") == "complete":
                # In a real app, trigger convert_to_fhir_r4 here
                break
    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected")
    finally:
        if client_id in active_sessions:
            del active_sessions[client_id]

class QueueAlertRequest(BaseModel):
    phone_number: str
    token_number: str
    department: str

class RemoteAssistRequest(BaseModel):
    patient_id: str
    relative_phone: str

@app.post("/api/queue/live-alert")
async def register_queue_alert(request: QueueAlertRequest):
    """
    (Feature: 'How long until my turn' live SMS alerts)
    """
    return {
        "status": "registered",
        "phone_number": request.phone_number,
        "token_number": request.token_number,
        "message": f"Alerts activated. You will receive an SMS when 3 patients away from {request.department}."
    }

@app.post("/api/patient/remote-assist")
async def create_remote_assist(request: RemoteAssistRequest):
    """
    (Feature: Multi-Generational Remote Assist)
    """
    return generate_remote_assist_link(request.patient_id, request.relative_phone)

from app.services.stalled_case_monitor import flag_stalled_cases
from datetime import datetime, timedelta

@app.get("/api/admin/stalled-cases")
async def get_stalled_cases():
    """
    (Phase 6 Integration: Self-Scoped Stalled Case Flag)
    Retrieves cases that have been waiting beyond the threshold.
    """
    now = datetime.now()
    # Mocking active cases database for the demo
    mock_active_cases = [
        {"id": "V-1234", "patient_name": "Ramesh Kumar", "status": "waiting", "submitted_at": (now - timedelta(hours=3)).isoformat()},
        {"id": "V-5678", "patient_name": "Sita Devi", "status": "waiting", "submitted_at": (now - timedelta(minutes=45)).isoformat()}
    ]
    return flag_stalled_cases(mock_active_cases, threshold_hours=2)

# ==========================================
# PHASE 5: SUPABASE DATABASE INTEGRATION
# ==========================================

class PatientRequest(BaseModel):
    abha_id: str
    name: str
    phone: str

@app.post("/api/db/patients")
async def upsert_patient(request: PatientRequest):
    if not supabase: return {"status": "error", "message": "Supabase not configured"}
    
    # Try to find existing
    res = supabase.table("patients").select("*").eq("abha_id", request.abha_id).execute()
    if res.data and len(res.data) > 0:
        return {"status": "success", "patient": res.data[0]}
    
    # Insert new
    insert_res = supabase.table("patients").insert({
        "abha_id": request.abha_id,
        "name": request.name,
        "phone": request.phone
    }).execute()
    return {"status": "success", "patient": insert_res.data[0]}


class VisitRequest(BaseModel):
    abha_id: str
    vitals: dict
    chief_concern: str
    urgency: str
    department: str

@app.post("/api/db/visits")
async def create_visit(request: VisitRequest):
    if not supabase: return {"status": "error", "message": "Supabase not configured"}
    
    # Get patient ID
    patient_res = supabase.table("patients").select("id").eq("abha_id", request.abha_id).execute()
    if not patient_res.data:
        raise HTTPException(status_code=404, detail="Patient not found. Register patient first.")
    patient_id = patient_res.data[0]["id"]
    
    # Generate Token Number safely
    import random
    token = f"A-{random.randint(100, 999)}"
    
    # Check for collision (naive)
    collision_res = supabase.table("visits").select("id").eq("token_number", token).execute()
    if collision_res.data:
        token = f"A-{random.randint(1000, 9999)}"
        
    res = supabase.table("visits").insert({
        "patient_id": patient_id,
        "token_number": token,
        "vitals": request.vitals,
        "chief_concern": request.chief_concern,
        "urgency": request.urgency,
        "department": request.department,
        "status": "waiting"
    }).execute()
    
    return {"status": "success", "visit": res.data[0]}

@app.get("/api/db/queue")
async def get_clinic_queue():
    if not supabase: return {"status": "error", "message": "Supabase not configured"}
    
    res = supabase.table("visits").select("*, patients(name, abha_id, phone)").eq("status", "waiting").order("created_at").execute()
    return {"queue": res.data}

class PrescriptionDataRequest(BaseModel):
    visit_id: str
    doctor_name: str
    medications: list
    clinical_summary: str

@app.post("/api/db/prescriptions")
async def save_prescription(request: PrescriptionDataRequest):
    if not supabase: return {"status": "error", "message": "Supabase not configured"}
    
    # 1. Save prescription
    presc_res = supabase.table("prescriptions").insert({
        "visit_id": request.visit_id,
        "doctor_name": request.doctor_name,
        "medications": request.medications,
        "clinical_summary": request.clinical_summary
    }).execute()
    
    # 2. Update visit status to completed
    supabase.table("visits").update({"status": "completed"}).eq("id", request.visit_id).execute()
    
    return {"status": "success", "prescription": presc_res.data[0]}

@app.get("/api/db/history/{abha_id}")
async def get_patient_history(abha_id: str):
    if not supabase: return {"status": "error", "message": "Supabase not configured"}
    
    patient_res = supabase.table("patients").select("id").eq("abha_id", abha_id).execute()
    if not patient_res.data:
        return {"history": []}
    
    patient_id = patient_res.data[0]["id"]
    
    # Get completed visits with prescriptions
    res = supabase.table("visits").select("*, prescriptions(*)").eq("patient_id", patient_id).eq("status", "completed").order("created_at", desc=True).execute()
    
    return {"history": res.data}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
