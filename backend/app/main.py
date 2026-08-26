from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.services.triage_service import triage_symptoms
from app.services.vision_service import process_medical_image
from app.services.bhashini_service import bhashini_service

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
    result = triage_symptoms(request.symptoms)
    return result

@app.post("/api/vision/ocr")
async def handle_ocr(request: OCRRequest):
    result = process_medical_image(request.base64_image)
    return result

@app.post("/api/voice/transcribe")
async def handle_voice_transcribe(request: TranscribeRequest):
    text = bhashini_service.transcribe_audio(request.base64_audio, request.source_language)
    return {"text": text}

@app.post("/api/voice/speak")
async def handle_voice_speak(request: SpeakRequest):
    base64_audio = bhashini_service.generate_speech(request.text, request.target_language, request.gender)
    return {"base64_audio": base64_audio}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
