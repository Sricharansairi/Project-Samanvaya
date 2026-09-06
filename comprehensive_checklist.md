# Comprehensive Checklist: Project Samanvaya HIS & Civic Suite

## Core Foundation (Completed)
- [x] Lightweight Hospital Information System (HIS) bifurcated routing (`/patient` & `/his`).
- [x] Multi-Lingual Indian Language Expansion across all 11 Indian Languages.
- [x] Dynamic All-India Scheme Engine (PM-JAY, Ayushman Vay Vandana, State Schemes like Aarogyasri, MJPJAY).
- [x] Multi-Architectured Medical RAG Engine with ICMR emergency guardrails.
- [x] Layperson-to-Clinical Vernacular NLP (Colloquial speech to ICD-10/SNOMED).
- [x] AYUSH Tridosha / Prakriti Assessment & Integration.
- [x] DPDP Act 2023 Cryptographic Consent & Audit Engine.
- [x] AI Prescription OCR with NVIDIA Nemotron OCR v2 + Moonshot Kimi-K3 / Groq.
- [x] Camera digital zoom (1x, 1.5x, 2x) & dynamic exposure lighting compensation.

---

## Civic & Public Healthcare Suite Roadmap

### Phase 1: Out-of-Pocket Relief & Vernacular Clarity (Completed & Deployed)
- [x] **PMBJP Generic Medicine Alternative & Cost-Saving Engine**:
  - [x] Build `frontend/services/janaushadhi_engine.ts` with zero-hardcoded dynamic Groq LLM brand-to-salt normalizer & PMBJP price directory.
  - [x] Integrate Jan Aushadhi analysis into `frontend/app/api/vision/ocr/route.ts`.
  - [x] Add UIDAI-styled Jan Aushadhi Savings Card to `frontend/app/his/ocr/page.tsx` displaying:
    - [x] Itemized generic salt equivalents.
    - [x] Commercial branded price vs PMBJP price.
    - [x] Total rupee savings & % reduction (50% to 90% savings).
    - [x] Real-time OpenStreetMap Overpass live GPS Jan Aushadhi Kendra locator modal/card with turn-by-turn navigation.
- [x] **Vernacular Audio Discharge Summary & Medication Instructions**:
  - [x] Create `frontend/app/api/vision/ocr/discharge-audio/route.ts` leveraging Sarvam AI multi-speaker TTS.
  - [x] Generate dialect-aware patient-friendly spoken instructions (timings, precautions, red flags).
  - [x] Add interactive audio player with waveform preview, 6-language switcher, and WhatsApp share in `/his/ocr`.
- [x] **Frontend Visibility & Accessibility**:
  - [x] Update Card 3 on Landing Page (`/`) to "Prescription OCR & Jan Aushadhi" with "85% Generic Relief" badge.
  - [x] Add Phase 1 National Civic Healthcare Hero Banner on Home Page with live savings demonstration.
  - [x] Add 85% Off navigation badge in `TrustBanner.tsx` and quick access card in Doctor Desk (`/his/doctor`).

### Phase 1.1 / Phase 1.2: Visual Document & Clinical Flowchart RAG (Completed & Deployed)
- [x] **Multimodal Document Retrieval (`llama-nemotron-embed-vl-1b-v2`)**:
  - [x] Ingest clinical guideline documents as raw page images (preventing OCR loss on complex flowcharts and tables).
  - [x] Map natural text inquiries directly into multimodal visual latent spaces.
- [x] **Visual Passage Probability Reranking (`llama-nemotron-rerank-vl-1b-v2`)**:
  - [x] GPU-accelerated passage probability scoring for multi-branch flowchart nodes.
  - [x] Return normalized visual bounding boxes `[ymin, xmin, ymax, xmax]`, trigger criteria, target time windows, and safety contraindications.
- [x] **Interactive Clinical Flowchart Console**:
  - [x] Integrated into `/his/rag` with category filtering (Cardiology, Infectious Disease, Neurology, Hematology).
  - [x] Interactive decision tree viewer for ICMR Acute STEMI Reperfusion, NVBDCP National Dengue, AIIMS Stroke rtPA, and WHO/ICMR CBC charts.
  - [x] API endpoint `frontend/app/api/rag/visual-search/route.ts` and engine `frontend/services/visual_rag_engine.ts`.

### Autonomous Floating Clinical Assistant Engine (Overhauled)
- [x] **Audio Mutual Exclusion & Echo Elimination**:
  - [x] Added `isAssistantSpeakingRef` mutex locking to prevent microphone feedback loops.
  - [x] Automatically pauses listening during speech synthesis and discards residual speaker audio.
  - [x] Completely eliminated double, triple, and looping speech phenomena.
- [x] **Prioritized Navigation Intent Routing**:
  - [x] Evaluates navigation commands before form fill intent.
  - [x] Reliable voice and text routing across all 10 Samanvaya routes (`/his/ocr`, `/his/doctor`, `/his/registration`, `/his/schemes`, `/his/queue`, `/patient`, `/his/ayush`, `/his/rag`, `/his/dpdp`, `/`).
- [x] **Dynamic AI Spoken Reasoning**:
  - [x] Built `/api/assistant/chat` powered by Groq LLM (`llama-3.3-70b-versatile`).
  - [x] Delivers natural, dynamic, 1-3 sentence spoken responses for any medical or hospital query with clickable action buttons.

---

### Phase 2: Clinical Safety & Antimicrobial Stewardship (Planned)
- [ ] ICMR & WHO AWaRe Antimicrobial Stewardship Audit.
- [ ] De-Stigmatized Tele-MANAS (14416) Mental Health Screener.

### Phase 3: Civic Operations & Emergency Logistics (Planned)
- [ ] ABDM "Scan-to-Queue" Smart OPD Pass with Live Wait-Time Forecast.
- [ ] Civic Bed, ICU & Blood Availability Grid (108 Ambulance Diverter).
- [ ] U-WIN National Child & Maternal Immunization Dropout Tracker.
- [ ] Digital Medical Death Certificate (MCCD Form 4/4A) & NOTTO Screening.
