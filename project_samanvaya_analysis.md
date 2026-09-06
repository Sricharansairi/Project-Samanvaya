# Project Samanvaya — Master Feature & Architecture Analysis

## 1. Executive Summary & Vision
Project Samanvaya is a **Civic & Public Hospital Information System (HIS)** specifically architected for the realities of Indian public healthcare (AIIMS, District Hospitals, Medical Colleges, and Urban/Rural Primary Health Centres). 

By uniting **Vision AI (NVIDIA Nemotron OCR v2)**, **Reasoning LLMs (Moonshot Kimi-K3 / Groq)**, **Evidence-Based Medical RAG (ICMR & WHO AWaRe)**, **Vernacular Voice AI (Sarvam AI)**, and national standards (**ABDM & DPDP Act 2023**), Samanvaya drastically reduces hospital wait times, eliminates vernacular language barriers, and cuts out-of-pocket medical expenditures for low-income citizens.

---

## 2. Core Architecture
The system operates on a high-throughput, role-based bifurcated architecture:

```
                                  [ PROJECT SAMANVAYA ]
                                            │
                   ┌────────────────────────┴────────────────────────┐
                   ▼                                                 ▼
          [ PATIENT PORTAL ]                               [ HOSPITAL HIS ]
        - ABHA Login / QR Token                          - Front Desk Registration
        - Vernacular Audio Guides                        - ICQR Dynamic Queue Triage
        - Digital Health Records                         - Physician Desk & E-Rx
        - Scheme Subsidy Checker                         - AI Vision Prescription OCR
        - Jan Aushadhi Generic Finder                    - AYUSH Integrative Assessment
        - Live GPS Kendra Locator                        - DPDP Consent Auditor
                                                         - Visual Flowchart RAG (Nemotron)
```

---

## 3. Civic & Public Healthcare Innovation Roadmap (India Focus)

Based on in-depth operational analysis of Indian civic and district hospitals, the following features comprise the National Civic Healthcare Suite:

### Phase 1: Immediate Citizen Out-of-Pocket Relief & Vernacular Clarity (COMPLETED & DEPLOYED)
1. **PMBJP Generic Medicine Alternative & Cost-Saving Finder**:
   - Dynamically deconstructs any commercial branded medicine into active pharmacological chemical salts and strengths using zero-hardcoded clinical reasoning.
   - Computes commercial retail MRP vs. Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) subsidized rates, unlocking 50% to 90% direct out-of-pocket savings.
   - Integrates live OpenStreetMap GPS geo-locator finding real, verified Jan Aushadhi Kendras within 5km radius with turn-by-turn navigation.
2. **Vernacular Audio Discharge Summary & Medication Instructions**:
   - Synthesizes natural regional speech (Hindi, Telugu, Tamil, Kannada, Marathi, Bengali, English) via Sarvam AI voice engine.
   - Translates complex prescription directions into dialect-aware spoken instructions (*"peeli goli subah khali pet"*), precaution red flags, and emergency warnings.
   - Downloadable WhatsApp audio instructions for rural and low-literacy patient families.
3. **Frontend Visibility & Integration**:
   - Prominently showcased on Home Landing Page (`/`) with savings demonstration preview.
   - Integrated with TrustBanner top navigation header (`85% Off` badge) and Physician Consultation Desk (`/his/doctor`).

### Phase 1.1 / Phase 1.2: Visual Document & Clinical Flowchart RAG (COMPLETED & DEPLOYED)
1. **Multimodal Document Retrieval with `llama-nemotron-embed-vl-1b-v2`**:
   - Represents user queries as text and clinical guideline documents as raw page images.
   - Overcomes traditional OCR failure on Indian medical guidelines (ICMR, NVBDCP, AIIMS) where clinical guidelines are published as complex multi-branch decision trees, flowcharts, ECG strips, and multi-column diagnostic tables.
2. **GPU-Accelerated Visual Passage Probability Scoring with `llama-nemotron-rerank-vl-1b-v2`**:
   - Computes multimodal relevance probability scores (0.00 to 1.00) matching natural clinical inquiries against specific visual flowchart nodes.
   - Returns exact normalized bounding boxes `[ymin, xmin, ymax, xmax]`, triggering conditions, target dosage windows, and contraindication guardrails.
3. **Clinical Visual Corpi & Interactive Console (`/his/rag`)**:
   - **ICMR Acute STEMI Reperfusion Algorithm**: Door-to-Needle thrombolysis (< 30 mins) vs. Primary PCI (< 120 mins) decision nodes and Rescue PCI triggers.
   - **NVBDCP National Dengue Management Algorithm**: Group A (Ambulatory) vs. Group B (Warning signs: HDU fluid titration 5-7 ml/kg/hr) vs. Group C (Severe Dengue Shock bolus 10-20 ml/kg/hr).
   - **AIIMS Emergency Code Stroke Protocol**: IV rtPA Alteplase eligibility (< 4.5 hrs, BP < 185/110) and Mechanical Thrombectomy pathway (< 24 hrs).
   - **WHO / ICMR Multi-Column Complete Blood Count (CBC) Chart**: Critical thrombocytopenia (< 20,000/μL) transfusion thresholds.

### Phase 2: Clinical Safety & National Health Priorities (Next)
4. **ICMR & WHO AWaRe Antimicrobial Stewardship Audit**:
   - Automated non-blocking audit categorizing every prescribed antibiotic into *Access*, *Watch*, or *Reserve*.
   - Flags reserve antibiotic stewardship alerts to mitigate India's urgent Antimicrobial Resistance (AMR) crisis.
5. **De-Stigmatized Tele-MANAS Mental Health Screener**:
   - Somatic symptom screening (PHQ-4 / GAD-2) integrated into vernacular voice triage without psychiatric stigmatization.
   - Direct confidential linkage to the National 24x7 Tele-MANAS Helpline (14416).

### Phase 3: Civic Operations & Emergency Grid
6. **ABDM "Scan-to-Queue" Smart OPD Pass with Live Wait-Time Forecast**:
   - Rolling-window moving average algorithm forecasting patient wait time by room and physician velocity.
   - Staggered patient arrivals eliminating 5:00 AM hospital queues.
7. **Civic Bed, ICU & Blood Availability Grid (108 Ambulance Diverter)**:
   - Real-time district bed and ventilator tracking linked to e-RaktKosh blood bank inventory.
   - Prevents fatal ambulance turnaways by routing 108 emergencies to hospitals with confirmed vacancy.
8. **U-WIN National Child & Maternal Immunization Dropout Tracker**:
   - Syncs with Ministry of Health U-WIN matrices to catch missed booster doses during routine hospital visits.
9. **Digital Medical Death Certificate (MCCD Form 4/4A) & NOTTO Organ Screening**:
   - Standardized WHO ICD-10 mortality cause generator preventing erroneous "cardiopulmonary arrest" entries.
   - Confidential NOTTO brain-stem death screening protocol for deceased organ donation coordination.

---

## 4. Autonomous Floating Clinical Assistant Overhaul

### Problem Diagnosis & Fixes:
1. **Audio Feedback Loop (Speaking Double/Triple)**:
   - *Root Cause*: Browser microphone remained active while assistant audio was playing through device speakers, capturing its own synthesized voice and triggering cascading recognition loops.
   - *Fix*: Implemented strict audio mutual exclusion with `isAssistantSpeakingRef`. Microphone recognition is immediately halted when speech starts and all recognition events during speech are silently discarded.
2. **Navigation Command Trapping**:
   - *Root Cause*: Form fill intent checking was evaluated before navigation checking, trapping commands like "open registration" or "open patient portal".
   - *Fix*: Re-ordered intent evaluation to prioritize navigation commands across all 10 Samanvaya routes (`/his/ocr`, `/his/doctor`, `/his/registration`, `/his/schemes`, `/his/queue`, `/patient`, `/his/ayush`, `/his/rag`, `/his/dpdp`, `/`).
3. **Dynamic Spoken Conversation Engine**:
   - *Root Cause*: Unrecognized queries returned a static canned string.
   - *Fix*: Created `/api/assistant/chat` powered by Groq LLM (`llama-3.3-70b-versatile`) that dynamically answers clinical, medical, and navigational inquiries in crisp, spoken-friendly sentences with clickable action links.

---

## 5. Technical Stack & Deployment Telemetry
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **AI & Vision Pipeline**: NVIDIA Nemotron OCR v2, Moonshot Kimi-K3 / Groq LLaMA 3.3 70B, Sarvam AI Voice TTS (`bulbul`).
- **Visual RAG**: NVIDIA `llama-nemotron-embed-vl-1b-v2` & `llama-nemotron-rerank-vl-1b-v2` architecture.
- **Mapping & Geolocation**: OpenStreetMap Overpass API for real-time Kendra discovery.
- **Production Host**: Vercel Serverless Edge Platform (`https://project-samanvaya.vercel.app`).
