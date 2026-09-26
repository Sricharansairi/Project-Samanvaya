import os
import random
import json
from dotenv import load_dotenv

load_dotenv(override=True)

from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import List, Optional, Annotated
from google import genai
from google.genai import types
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_keys = [v for k, v in os.environ.items() if k.startswith("GEMINI_API_KEY")]
if not api_keys:
    api_keys = [""]


class Vitals(BaseModel):
    bp: Optional[str] = Field(description="Blood pressure, e.g. 120/80")
    pulse: Optional[str] = Field(description="Heart rate / pulse")
    temp: Optional[str] = Field(description="Temperature")
    spo2: Optional[str] = Field(description="Blood oxygen level")


class PrescriptionAnalysis(BaseModel):
    document_type: Optional[str] = Field(description="Type of document, e.g., Doctor Prescription (OPD)")
    clinic_name: Optional[str] = Field(description="Name of the clinic or hospital")
    doctor_name: Optional[str] = Field(description="Name of the prescribing doctor")
    patient_name: Optional[str] = Field(description="Name of the patient")
    patient_age: Optional[str] = Field(description="Age of the patient")
    patient_gender: Optional[str] = Field(description="Gender of the patient")
    vitals: Optional[Vitals] = Field(description="Patient vitals recorded on prescription")
    diagnoses: List[str] = Field(description="List of detected diagnoses or clinical signs")
    medications: List[str] = Field(description="List of extracted medications including dosage and frequency")
    raw_ocr_lines: List[str] = Field(description="List of all raw text lines extracted from the image")


@app.post("/api/analyze")
async def analyze_prescription(
    file: Annotated[UploadFile, File(...)],
    language: Annotated[str, Form()] = "English",
):
    image_bytes = await file.read()
    mime_type = file.content_type if file.content_type else "image/jpeg"
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)

    prompt = "Extract all available medical information from this prescription image into the exact JSON schema provided. Include clinic name, doctor, patient details, vitals, diagnoses, and medications."

    keys_to_try = list(api_keys)
    random.shuffle(keys_to_try)

    for selected_key in keys_to_try:
        client = genai.Client(api_key=selected_key)
        try:
            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=[image_part, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=PrescriptionAnalysis,
                ),
            )

            if not response.text:
                return JSONResponse(status_code=500, content={"error": "Failed to generate content (empty response)"})

            print(f"SUCCESS! Processed image using API Key ending in: ...{selected_key[-6:]}")
            return json.loads(response.text)

        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "quota" in error_str.lower() or "RESOURCE_EXHAUSTED" in error_str:
                print(f"WARNING: Key ending in ...{selected_key[-6:]} is exhausted. Trying next key...")
                continue
            return JSONResponse(status_code=500, content={"error": f"API Error: {error_str}"})

    return JSONResponse(
        status_code=429,
        content={"error": "All API keys have exceeded their daily free-tier quota limits. Please try again tomorrow or upgrade your plan."},
    )
