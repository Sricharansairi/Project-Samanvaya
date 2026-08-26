# Project Samanvaya - Ultra-Comprehensive Master Checklist

This checklist tracks every single feature outlined in the `project_samanvaya_analysis.md` architecture document. Features are organized by domain, prioritizing the Backend (which must be finished first) over the Frontend.

## 🧠 Core AI & Infrastructure (Backend)
- `[x]` **Smart Key Rotator:** Dynamic rotation of NVIDIA NIM API keys.
- `[x]` **Voice Pipeline (Bhashini):** FastAPI endpoints for ASR (Speech-to-Text) and TTS (Text-to-Speech) using AI4Bharat models.
- `[x]` **Triage Pipeline (LLM):** `nvidia/llama-3.1-nemotron-70b-instruct` integrated for extracting symptoms, urgency, and department into structured JSON.
- `[x]` **OCR Pipeline (Vision):** `meta/llama-3.2-90b-vision-instruct` integrated for reading medical lab reports and prescriptions.
- `[ ]` **Supabase Database Initialization:** Setup PostgreSQL schema (`Patients`, `Visits`, `Documents`, `Queue`, `FHIR_Records`).
- `[ ]` **Supabase RLS & Auth:** Configure Row Level Security and GoTrue authentication for doctors/admins.
- `[ ]` **Zero-Click FHIR R4 Translation:** Python logic to convert the extracted Triage JSON into strict FHIR R4 standard format before DB insertion.
- `[ ]` **PII Stripping:** Lightweight Python regex to strip Aadhaar/Phone numbers before sending data to external LLMs.
- `[ ]` **Audit Logging System:** Tamper-proof logging for all API actions in Supabase.

## 📚 Multi-Architecture RAG Module (The Medical Brain)
- `[ ]` **Data Ingestion Script:** Download ICMR STWs, Ayurvedic Pharmacopoeia, and WHO Triage Tool PDFs.
- `[ ]` **Chunking & Embedding:** Use LangChain and `snowflake/arctic-embed-l` to embed medical texts into Supabase `pgvector`.
- `[ ]` **Adaptive Query Router:** LLM routing to differentiate between Triage questions vs. General FAQs vs. Prompt Injection.
- `[ ]` **Hybrid Search Engine:** Implement BM25 (Keyword) + pgvector (Semantic) search for high-accuracy retrieval.
- `[ ]` **Self-Corrective Generation Loop:** Internal validation prompt to ensure LLM output aligns with ICMR guidelines before returning to the doctor.

## ⚙️ Smart Automation & Rules Engines (Backend)
- `[ ]` **Government Scheme Rules Engine:** Hardcoded Python/JSON matrix matching patient demographics (Income, State) to schemes like PM-JAY/Aarogyasri (No AI guesswork).
- `[ ]` **Brand-to-Generic Overdose Guard:** Logic to map private brand-name drugs from OCR to Jan Aushadhi generic salts.
- `[ ]` **Ayurvedic Seasonal Regimen (*Ritucharya*):** Auto-advisory generation based on patient dosha and current Indian weather.
- `[ ]` **Pre-Consultation "Patient Question Prompter":** Generate 2-3 personalized questions for the patient to ask the doctor based on their triage data.
- `[ ]` **Automated WhatsApp/SMS Delivery:** Webhook to send Government Scheme document checklists and diet charts to the patient's phone.
- `[ ]` **Reverse Doctor Voice Shorthand:** Endpoint to take 10 seconds of doctor's dictation and parse it straight into the FHIR record (saving typing time).
- `[ ]` **Nearest Budget Hospital Finder:** Integration with OpenStreetMap API (Nominatim) to find nearby specialized clinics.

## 📱 Frontend Interface (Next.js PWA / Kiosk) - *HOLD UNTIL END*
- `[ ]` **WASM Edge Noise Suppression:** Implement RNNoise locally in the browser to clean OPD fan/crowd noise before hitting Bhashini.
- `[ ]` **Glassmorphism UI System:** Premium dark theme (`#C891AA`, `#C2CD93`) with backdrop filters.
- `[ ]` **Voice-Enhanced Chip Parameters:** Interactive medical questionnaire generated dynamically by the LLM, with microphone dictation support.
- `[ ]` **Offline-First Storage:** IndexedDB setup for handling internet outages in rural CHCs.
- `[ ]` **Digital Queue Routing Board:** Supabase Realtime subscription to display token numbers visually.
- `[ ]` **Dynamic "Ahara-Vihara" Visual Builder:** Tap-based visual food plate for diet logging (zero literacy required).
- `[ ]` **OCR "Abnormal Value" Highlighter:** UI table that color-codes extracted lab values (Red = High/Danger) against reference ranges.
- `[ ]` **Bilingual Audio-Summary Playback:** Kiosk plays the summary aloud; patient taps a green checkmark to provide informed consent.
- `[ ]` **10-Second Vernacular Audio Consent:** DPDP Act 2023 compliance via localized audio clips.
- `[ ]` **Single-Phone Family Multi-Profile:** UI to switch between ABHA-linked family members without logging out.

---

## 🚀 Analysis: What's Next? (Prioritized)

Based on this breakdown, the core LLM engines are online, but they have no memory or medical grounding. 

**Priority 1: Supabase & Database Foundation**
Before we can build the RAG pipeline or save any FHIR records, we *must* have our database online. 
- *Next Action:* Initialize Supabase, enable the `pgvector` extension, and build the SQL tables (`Patients`, `Visits`, `FHIR_Records`).

**Priority 2: The Medical RAG Pipeline**
Once the database is up, we need to ingest the ICMR guidelines so our Triage LLM stops guessing and starts citing official medical protocol.
- *Next Action:* Write the Python script to chunk PDFs, embed them using NVIDIA NIM (`arctic-embed-l`), and push them to Supabase.

**Priority 3: Rules Engines & FHIR Translation**
- *Next Action:* Write the Python logic for the PM-JAY Government Scheme checker and the FHIR R4 JSON translator.
