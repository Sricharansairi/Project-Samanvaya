# Project Samanvaya: Master Analysis & Architecture Strategy (ULTRA COMPREHENSIVE - 100% COMPLETE)

This document represents the master architectural blueprint and feature analysis for Project Samanvaya (SIH 26047), incorporating all insights, gap analyses, the 5-way hybrid mode split, and the 7 new game-changer features (lines 1 to 1206).

---

## 🏛️ 1. The 5-Way Hybrid Mode Architecture Split
Instead of an undifferentiated feature blob, Project Samanvaya cleanly separates features across 5 operational interfaces:

| Mode | Target User | Environment | Key Features & Responsibilities |
|---|---|---|---|
| **1. Kiosk Mode** | Walk-in OPD patients without smartphones | Hospital tablet / PC locked at counter | Full 12-step intake, touch/voice inputs, Dashavidha Pariksha, OCR scan, scheme check, printed QR receipt. |
| **2. Personal Device / Home PWA** | Smartphone owners | Waiting hall / at home | Pre-visit intake from home, WhatsApp summary push (`wa.me`), live queue SMS ("How long until my turn"), and multi-generational remote assist. |
| **3. Assisted Mode** | ASHA workers & hospital volunteers | Mobile tablets in rural/triage desks | Caregiver/proxy tagging, joint-family 2-person answering, modesty routing, and confidence-based human escalation to nurse. |
| **4. Physician Dashboard** | Doctors only | Consultation room desktop | Structured FHIR R4 summary with line-by-line accept/reject diffs, herb-drug conflict alerts, visit memory, reverse voice dictation, live hospital pharmacy stock-check, and Nikshay TB prompts. |
| **5. Hospital Admin Dashboard** | CMO & Hospital administrators | Admin portal | Festival/season-aware surge analytics (Diwali smog, Monsoon gastro), epidemic radar, and inventory buffer recommendations. |

---

## 🧠 2. Core Architectural & Integration Pillars

### Module D: FHIR R4 Bundle & ABDM Integration (The Core Deliverable)
- Directly addresses the core mandate of SIH Problem Statement 26047.
- Packages all extracted data into valid **FHIR R4 JSON Bundles**:
  - `Patient`: Demographics, ABHA ID.
  - `Encounter`: OPD visit metadata, chief complaint.
  - `Condition`: Presenting illness formatted in SOCRATES (ICD-10 & SNOMED CT mapped).
  - `Observation`: Ayurvedic Dashavidha Pariksha (Prakriti, Agni, Nidra).
  - `AllergyIntolerance`: Extracted previous drug allergies and herb-drug contraindications.

### Provider-Agnostic Speech & AI Pipeline (Bhashini + Sarvam AI + Groq + NIM)
- **Primary Standard:** Bhashini for Digital India compliance.
- **High-Performance Indic Pipeline:** Sarvam AI (Saaras v3 for streaming STT, Bulbul v3 for sub-250ms TTS, Mayura for dialect translation, Sarvam Vision for messy Indian prescriptions).
- **Ultra-Low Latency Routing:** Groq (Llama 3.3 70B) powering the Floating Autonomous Assistant.
- **Heavy Clinical Extraction:** NVIDIA NIM (Llama 3.1 Nemotron 70B).

### Precise Offline Degradation Boundaries
- **Offline Deterministic (100% local):** Scheme eligibility rules, red-flag triggers, and Dashavidha Pariksha touch UI work completely offline.
- **Offline ML:** Local Tesseract.js for OCR, quantized Whisper for regional ASR, and local rule-based dynamic follow-up chips.
- **Online ML:** Full streaming ASR and large LLM adaptive dialogue.

---

## 🖥️ 3. The 12-Step Primary UI Flow
1. **Welcome & Language Select:** 7 Indian languages with text-to-speech audio greetings and text-only **"Quiet Mode"** for accessibility.
2. **Identification & Single-OTP Privacy Guard:** ABHA QR scan, Aadhaar OTP sandbox, Caregiver toggle, and Single-OTP family batch login with **mandatory per-member consent tap**.
3. **Audio-Verifiable Consent:** Audio narration of DPDP terms paired with a legally required physical tap.
4. **Mode Auto-Select:** Allopathic Emergency vs. Ayurvedic Nidana vs. Integrated Samanvaya.
5. **Conversational History:** Web Audio mic with browser noise suppression, dynamic 4-6 follow-up chips, Visual Symptom Timeline, and real-time **Joint-Family Speaker Switch**.
6. **AYUSH Picture Module:** Dashavidha Pariksha with swipeable icon cards for **Prakriti (Vata/Pitta/Kapha)**, Agni, Nidra, region-adapted Ahara-Vihara (Rice/Sambar vs. Roti/Dal), and audio explainers.
7. **Document Scan & Point-and-Photograph:** Camera guide overlay with OCR extraction, generic savings display, "Not Sure" smudged crop fallback, and **Point-and-Photograph for visible symptoms** (wounds/rashes).
8. **Scheme Eligibility by Rule Type:** Evaluates 8 state/national schemes branching explicitly by rule type (`universal`, `income_threshold`, `ration_card_category`, `secc_deprivation`) with direct `wa.me` WhatsApp trigger.
9. **Red-Flag Interstitial & TB Nikshay Linkage:** Emergency override screen + **TB red-flag linkage** (>2 weeks cough) prompting sputum test & Nikshay portal notification.
10. **Confirm & Submit:** Plain-language audio readback paired with the Green/Red/Back confirmation loop.
11. **Token & Wait Screen:** Queue token (A-142), simple text directions, universal paper print slip, and live queue SMS alerts.
12. **Physician Review Dashboard:** Doctor view with line-by-line accept/reject diffs, herb-drug alerts, visit memory, reverse voice dictation, and **live pharmacy stock-check**.

---

## 🌟 4. The 7 Brand New Game-Changers (Deeply Explained)

1. **Discreet "Something Else is Wrong" Distress Channel:** A quiet, non-obvious option ("I'd like to speak to a nurse privately") for patients accompanied by abusers to signal hospital staff without tipping off their escorts.
2. **TB Red-Flag Linkage to Nikshay:** India mandates TB notification. When symptom intake detects cough >2 weeks, night sweats, and weight loss, the system surfaces a sputum test order and Nikshay portal notification prompt.
3. **Silent Text-Only "Quiet Mode":** 100% touch/text mode with zero audio dependency for deaf and hard-of-hearing patients or noisy shared rooms.
4. **Live Hospital Pharmacy Stock-Check:** Checks government hospital pharmacy inventory in real time, alerting doctors to out-of-stock drugs and suggesting in-stock Jan Aushadhi alternatives before finalizing prescriptions.
5. **Portable Identity for Inter-State Migrant Workers:** Closes the gap for migrant laborers working outside their home states without local ration cards, routing to national portable PM-JAY and emergency coverage.
6. **Postnatal Follow-up & Maternal Care Chain:** Dedicated SMS/IVR scheduled reminder sequence for postnatal mothers to prevent missed checkups and maternal complications.
7. **Point-and-Photograph for Visible Clinical Symptoms:** Patients capture photos of wounds, rashes, or swelling as timestamped visual records for the doctor to inspect directly (zero unvalidated AI diagnostic claims).

---

## 🔒 5. Verified Safety Boundaries for Pitch Integrity
- **Acoustic Biomarkers:** Handled as a simulated placeholder without unvalidated diagnostic claims.
- **Vision-AI Darshana:** Restricted to Point-and-Photograph visual notes for doctors (no AI Prakriti determination to patients).
- **ABHA Creation via FaceAuth:** Implemented in simulated sandbox mode.
- **Audio-Verifiable Consent:** Paired with mandatory physical tap.
- **Nearest Budget Hospital Finder:** Cut entirely.
- **"0% Hallucination" Claim:** Replaced with "Reduced hallucination via retrieval grounding and human confirmation".
- **Complex RAG Stack:** Down-scoped to flat vector search with confidence threshold.