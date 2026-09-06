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

### Phase 1: Out-of-Pocket Relief & Vernacular Clarity (Active)
- [ ] **PMBJP Generic Medicine Alternative & Cost-Saving Engine**:
  - [ ] Build `frontend/services/janaushadhi_engine.ts` with brand-to-salt normalizer & PMBJP price directory.
  - [ ] Integrate Jan Aushadhi analysis into `frontend/app/api/vision/ocr/route.ts`.
  - [ ] Add UIDAI-styled Jan Aushadhi Savings Card to `frontend/app/his/ocr/page.tsx` displaying:
    - [ ] Itemized generic salt equivalents.
    - [ ] Commercial branded price vs PMBJP price.
    - [ ] Total rupee savings & % reduction.
    - [ ] Nearby Jan Aushadhi Kendra locator modal/card.
- [ ] **Vernacular Audio Discharge Summary & Medication Instructions**:
  - [ ] Create `frontend/app/api/vision/ocr/discharge-audio/route.ts` leveraging Sarvam AI.
  - [ ] Generate dialect-aware patient-friendly spoken instructions (timings, precautions, red flags).
  - [ ] Add interactive audio player with waveform preview, language switcher, and WhatsApp share in `/his/ocr`.

### Phase 2: Clinical Safety & Antimicrobial Stewardship
- [ ] ICMR & WHO AWaRe Antimicrobial Stewardship Audit.
- [ ] De-Stigmatized Tele-MANAS (14416) Mental Health Screener.

### Phase 3: Civic Operations & Emergency Logistics
- [ ] ABDM "Scan-to-Queue" Smart OPD Pass with Live Wait-Time Forecast.
- [ ] Civic Bed, ICU & Blood Availability Grid (108 Ambulance Diverter).
- [ ] U-WIN National Child & Maternal Immunization Dropout Tracker.
- [ ] Digital Medical Death Certificate (MCCD Form 4/4A) & NOTTO Screening.
