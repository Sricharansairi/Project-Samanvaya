# Project Samanvaya: Master Backend, ML & Endpoint Directory

This document provides the complete, authoritative reference for all **20+ Backend API Endpoints**, **Machine Learning Services**, and **Data Models** powering Project Samanvaya (SIH 26047).

---

## 🤖 Machine Learning & Tiered AI Architecture

| Subsystem | Primary Engine / Model | Fallback / Offline Engine | Purpose |
|---|---|---|---|
| **Real-Time UI Voice Assistant** | Groq (Llama 3.3 70B / 8B) | Local quantized rule router | Sub-second voice tool/function calling for navigation |
| **Conversational History (SOCRATES)** | NVIDIA NIM (Llama 3.1 Nemotron 70B) | Local quantized Mistral / rules | Clinical extraction into FHIR Condition & Observation |
| **Voice ASR (Regional Audio)** | Bhashini / AI4Bharat (Bhasha ASR) | Self-hosted IndicWhisper / Whisper.js | Streaming speech-to-text in 7+ Indian languages |
| **Voice TTS (Audio Narration)** | Bhashini TTS | Web Speech API (`SpeechSynthesis`) | Audio consent, question readbacks, and prescription audio |
| **Prescription & Document OCR** | Llama 3.2 Vision 90B (NVIDIA NIM) | Tesseract.js / PaddleOCR | Extracting active salts with "Not Sure" crop fallback |
| **Babel Fish Dialect Translator** | Llama 3.1 70B Instruct | Regex dictionary mapping | Translating regional idioms ("chhati pe patthar") to Medical English |
| **Acoustic Biomarkers** | Simulated Waveform Classifier | Sandbox Mock | Respiratory dyspnea / wet cough indicator (Mocked) |

---

## 🌐 Complete API Endpoint Directory

### 1. Triage & Conversational Intake
* **`POST /api/triage/dynamic-chips`**
  * *Request:* `{"complaint": "severe headache with fever"}`
  * *Response:* `{"status": "success", "chips": ["Since yesterday", "Worse at night", "Nausea present", "No vision blur"]}`
* **`POST /api/triage/submit`**
  * *Request:* Full intake payload (Patient, Symptoms, Timeline, Ayush metrics, Consent)
  * *Response:* `{"status": "success", "token_number": "A-142", "department": "General Medicine"}`
* **`POST /api/triage/low-confidence-check`**
  * *Request:* `{"symptoms": "unspecified fatigue", "confidence": 0.45}`
  * *Response:* `{"route_department": "General Medicine", "escalated_to_nurse": true}`

### 2. AYUSH & Herb-Drug Safety Engine
* **`POST /api/safety/herb-drug-check`**
  * *Request:* `{"allopathic_drugs": ["Metformin"], "ayurvedic_herbs": ["Karela"]}`
  * *Response:* `{"status": "danger", "warnings": ["Severe additive hypoglycemic risk detected."]}`
* **`POST /api/ayush/dashavidha-evaluate`**
  * *Request:* `{"agni": "Manda", "nidra": "Disturbed", "diet": "Roti/Dal", "fasting": false}`
  * *Response:* `{"prakriti_trend": "Vata-Kapha", "ama_risk": "Moderate", "recommendations": "Deepana-Pachana herbs"}`

### 3. Government Scheme Rules Engine
* **`POST /api/schemes/evaluate`**
  * *Request:* `{"state": "Rajasthan", "income": 150000, "ration_card_type": "BPL", "is_secc_listed": true}`
  * *Response:* `{"eligible_schemes": [{"name": "Chiranjeevi", "coverage": "₹25L"}, {"name": "PM-JAY", "coverage": "₹5L"}]}`
* **`GET /api/schemes/rough-cost?dept=Cardiology&has_scheme=true`**
  * *Response:* `{"out_of_pocket_estimate": "₹0", "scheme_coverage": "Up to ₹25,000", "message": "Fully covered"}`

### 4. Prescription OCR & Generic Savings
* **`POST /api/ocr/process-prescription`**
  * *Request:* `Multipart/form-data` image file
  * *Response:* `{"extracted_meds": [{"name": "Augmentin 625", "dosage": "1 tab BD", "generic": "Amoxicillin-Clav", "is_low_confidence": false}]}`
* **`GET /api/generics/savings?brand=Augmentin+625`**
  * *Response:* `{"brand_price": 220, "jan_aushadhi_price": 45, "savings_amount": 175, "savings_percentage": 79.5}`
* **`POST /api/ocr/readback-audio`**
  * *Request:* `{"drug_name": "Metformin", "dosage": "1 tablet after dinner", "language": "hi"}`
  * *Response:* `{"audio_b64": "...", "text": "This is Metformin..."}`

### 5. Clinician Dashboard & Audit Trail
* **`POST /api/doctor/dictation`**
  * *Request:* `{"fhir_record": {...}, "dictated_text": "Bilateral wheezing present."}`
  * *Response:* Updated FHIR Encounter Bundle with doctor-dictation extension.
* **`POST /api/doctor/audit-log`**
  * *Request:* `{"patient_id": "P123", "ai_draft": {...}, "doctor_final": {...}}`
  * *Response:* `{"status": "logged", "audit_id": "aud_9841"}`
* **`GET /api/patient/history/{abha_id}`**
  * *Response:* `{"status": "found", "last_visit_date": "2026-08-14", "last_diagnoses": ["URI"], "last_complaint": "Dry cough"}`

### 6. Notifications, Queue & Remote Assist
* **`POST /api/queue/live-alert`**
  * *Request:* `{"phone_number": "+919876543210", "token_number": "A-142", "department": "General Medicine"}`
  * *Response:* `{"status": "registered", "message": "Alerts activated for token A-142"}`
* **`POST /api/patient/remote-assist`**
  * *Request:* `{"patient_id": "P123", "relative_phone": "+919876543210"}`
  * *Response:* `{"status": "success", "link": "https://samanvaya.gov.in/assist/P123?token=abc123xyz"}`
* **`POST /api/notifications/whatsapp`**
  * *Request:* `{"phone_number": "+919876543210", "message": "Your token is A-142", "document_url": "..."}`
  * *Response:* `{"status": "sent"}`
* **`POST /api/patient/discharge-translate`**
  * *Request:* `{"discharge_instructions": "Take 1 tablet every morning", "language": "hi"}`
  * *Response:* `{"translated_text": "रोज सुबह 1 गोली लें", "icons": ["☀️ (Morning)"]}`

### 7. Administrative & Public Health Analytics
* **`GET /api/admin/festival-analytics/{pincode}`**
  * *Response:* `{"current_season": "Monsoon", "upcoming_festival": "Diwali", "predicted_surges": [{"condition": "Asthma / Smog", "expected_surge": "+45%"}]}`
* **`GET /api/admin/epidemic-radar`**
  * *Response:* Aggregated symptom surge alert triggers across hospital PIN codes.

### 8. DPDP Data Minimization
* **`POST /api/privacy/data-minimize`**
  * *Request:* `{"patient_id": "P123"}`
  * *Response:* `{"status": "deleted", "message": "Raw audio and image files purged."}`

---

## 🔒 Security & Privacy Guarantees
1. **Zero Raw Media Retention:** Purged immediately upon patient structured text confirmation.
2. **Deterministic Financial Guarantees:** Scheme eligibility uses strict JSON conditionals, completely removing LLM hallucination risk.
3. **Doctor Legal Demarcation:** All entries have line-by-line accept/reject audit trails.
