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
                                                         - DPDP Consent Auditor
```

---

## 3. Civic & Public Healthcare Innovation Roadmap (India Focus)

Based on in-depth operational analysis of Indian civic and district hospitals, the following 8 features comprise the National Civic Healthcare Suite:

### Phase 1: Immediate Citizen Out-of-Pocket Relief & Vernacular Clarity
1. **PMBJP Generic Medicine Alternative & Cost-Saving Finder**:
   - Deconstructs branded medicines extracted from OCR prescriptions into active chemical salts and strengths.
   - Matches against Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) and NPPA NLEM ceiling price matrices.
   - Delivers a clear breakdown showing market costs vs. Jan Aushadhi costs (averaging 70–88% savings).
   - Locates nearby Pradhan Mantri Bhartiya Janaushadhi Kendras (PMBJK).
2. **Vernacular Audio Discharge Summary & Medication Instructions**:
   - Synthesizes natural regional speech (Hindi, Telugu, Tamil, Kannada, Marathi, Bengali, Odia, Gujarati, Punjabi) using Sarvam AI.
   - Explains dosage timings (*"peeli goli subah khali pet"*), precaution red-flags, and wound care for low-literacy patients.
   - Delivers in-kiosk playback and WhatsApp-ready downloadable audio guidance.

### Phase 2: Clinical Safety & National Health Priorities
3. **ICMR & WHO AWaRe Antimicrobial Stewardship Audit**:
   - Automated non-blocking audit categorizing every prescribed antibiotic into *Access*, *Watch*, or *Reserve*.
   - Flags reserve antibiotic stewardship alerts to mitigate India's urgent Antimicrobial Resistance (AMR) crisis.
4. **De-Stigmatized Tele-MANAS Mental Health Screener**:
   - Somatic symptom screening (PHQ-4 / GAD-2) integrated into vernacular voice triage without psychiatric stigmatization.
   - Direct confidential linkage to the National 24x7 Tele-MANAS Helpline (14416).

### Phase 3: Civic Operations & Emergency Grid
5. **ABDM "Scan-to-Queue" Smart OPD Pass with Live Wait-Time Forecast**:
   - Rolling-window moving average algorithm forecasting patient wait time by room and physician velocity.
   - Staggered patient arrivals eliminating 5:00 AM hospital queues.
6. **Civic Bed, ICU & Blood Availability Grid (108 Ambulance Diverter)**:
   - Real-time district bed and ventilator tracking linked to e-RaktKosh blood bank inventory.
   - Prevents fatal ambulance turnaways by routing 108 emergencies to hospitals with confirmed vacancy.
7. **U-WIN National Child & Maternal Immunization Dropout Tracker**:
   - Syncs with Ministry of Health U-WIN matrices to catch missed booster doses during routine hospital visits.
8. **Digital Medical Death Certificate (MCCD Form 4/4A) & NOTTO Organ Screening**:
   - Standardized WHO ICD-10 mortality cause generator preventing erroneous "cardiopulmonary arrest" entries.
   - Confidential NOTTO brain-stem death screening protocol for deceased organ donation coordination.

---

## 4. Phase 1 Technical Architecture (Active Implementation)

### A. PMBJP Jan Aushadhi Integration Engine
- **Salt Mapping Module**: `frontend/services/janaushadhi_engine.ts`
  - High-speed fuzzy salt normalizer and brand-to-generic dictionary.
  - Covers top prescribed therapeutic classes: Antibiotics, Antacids/PPIs, Antidiabetics, Antihypertensives, Analgesics, Respiratory.
  - Price benchmarks: Commercial Branded MRP vs PMBI Jan Aushadhi MRP.
- **OCR Integration**: `frontend/app/api/vision/ocr/route.ts`
  - Returns `jan_aushadhi_analysis` containing itemized savings and overall prescription financial relief.
- **User Interface**: `frontend/app/his/ocr/page.tsx`
  - UIDAI-styled high-contrast **Jan Aushadhi Generic Savings Card** with total rupees saved, percentage discount, and active salt breakdown.

### B. Vernacular Audio Instructions Engine
- **TTS Synthesis Module**: `frontend/app/api/vision/ocr/discharge-audio/route.ts`
  - Leverages Sarvam AI `bulbul:v1` / `bulbul:v2` with Indian multi-speaker mapping.
  - Clinical audio script generator tailored to local dialect idioms.
- **In-Page Audio Player**:
  - Embedded waveform preview, play/pause controls, language switch, and WhatsApp export simulator.
