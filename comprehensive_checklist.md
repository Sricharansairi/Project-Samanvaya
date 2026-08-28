# Project Samanvaya - Master Execution & Testing Checklist (ULTRA COMPREHENSIVE - 100% COMPLETE & VERIFIED)

This checklist explicitly sequences EVERY SINGLE feature, UI flow step, architectural nuance, and technical specification from the entire conversation (Lines 1 to 1206).

---

## 🏛️ The 5-Way Hybrid Mode Architectural Split

| Mode | Target User | Key Capabilities & Features Included |
|---|---|---|
| **1. Kiosk Mode** | Hospital walk-in patients (no phone) | Complete standalone 12-step flow, touch/voice intake, Dashavidha Pariksha, OCR scan, scheme check, printed QR receipt. |
| **2. Personal Device / Home PWA** | Smartphone owners in waiting room/home | Pre-visit intake, WhatsApp delivery of summary/checklist, live queue SMS ("How long until my turn"), and multi-generational remote assist. |
| **3. Assisted Mode** | ASHA workers & hospital volunteers | Caregiver/proxy tagging, joint-family two-person answering, modesty routing, low-confidence escalation to nurse. |
| **4. Physician Dashboard** | Doctors only (separate login) | Structured FHIR R4 summary with accept/reject diffs, herb-drug warnings, visit memory, reverse voice dictation, live pharmacy stock check. |
| **5. Hospital Admin Dashboard** | Hospital management & CMO | Festival/season-aware surge analytics, epidemic radar, department load tracking. |

---

## 🧠 Phase 1: Core Architecture, ABDM/FHIR & PWA Foundation

### 1. Hybrid PWA Deployment Model
- **Deep Explanation:** Built as a Next.js 16 PWA running in fullscreen Kiosk Mode on hospital tablets, personal device mode via QR scan, and Assisted mode for volunteers.
- **Action Plan:** `[x]` Scaffold Next.js PWA. `[x]` Implement QR code handoff. `[x]` Build mode toggles.

### 2. Module D: FHIR R4 Bundle & ABDM Health Information Exchange (Core Brief)
- **Deep Explanation:** Formats clinical history into compliant FHIR R4 resources (`Patient`, `Encounter`, `Condition`, `Observation`, `AllergyIntolerance`) ready to push to Hospital Information Systems (HIS) and ABDM HIE-CM.
- **Action Plan:** `[x]` Build FHIR R4 bundle builder. `[x]` Validate against Ayushman Bharat Digital Mission (ABDM) schemas.

### 3. Tiered AI & Provider-Agnostic Speech Router (Bhashini + Sarvam AI + Groq + NIM)
- **Deep Explanation:** Provider-agnostic router. Groq for sub-second UI navigation; Bhashini / Sarvam AI (Saaras v3 streaming STT, Bulbul v3 TTS, Mayura translation, Sarvam Vision) for Indic speech; NVIDIA NIM for FHIR extraction.
- **Action Plan:** `[x]` Integrate model router with fallback hierarchy.

### 4. Precise Offline Degradation Stack
- **Deep Explanation:** 
  - *Offline Deterministic (100% local):* Scheme rules, red flags, Dashavidha Pariksha touch UI.
  - *Offline ML:* Local Tesseract.js (OCR), quantized Whisper/Indic ASR, local rule-based dynamic follow-ups.
  - *Online ML:* Full streaming ASR and LLM adaptive dialogue.
- **Action Plan:** `[x]` Build IndexedDB store-and-forward. `[x]` Configure offline rule fallbacks.

### 5. Web Audio Noise-Suppression Stack
- **Deep Explanation:** Browser `getUserMedia({ echoCancellation: true, noiseSuppression: true, autoGainControl: true })` + backend `noisereduce` spectral gating to handle noisy OPD waiting halls.
- **Action Plan:** `[x]` Configure audio constraints. `[x]` Add live transcript for instant human correction.

### 6. DPDP Data Minimization & Privacy
- **Deep Explanation:** Auto-delete raw voice recordings and prescription photos immediately upon patient confirmation of structured text.
- **Action Plan:** `[x]` Implement auto-purge hook post-extraction.

### 7. Doctor-Edit Audit Trail
- **Deep Explanation:** Line-by-line accept/reject diff logging between AI draft and Doctor's final commit, establishing legal demarcation.
- **Action Plan:** `[x]` Build audit logging schema in database.

### 8. Toll-Free IVR Fallback
- **Deep Explanation:** Pure voice telephony intake over phone calls for patients who cannot interact with touchscreens.
- **Action Plan:** `[x]` Implement webhook handler for telephony stream.

---

## 🖥️ Phase 2: The 12-Step Explicit UI / Screen Flow

### 9. Welcome & Language Select (Step 1)
- **Deep Explanation:** Regional language grid (Hindi, Telugu, Tamil, Bengali, Marathi, Kannada, English) with speech synthesis greetings. Includes "Quiet Mode" toggle.
- **Action Plan:** `[x]` Build Welcome Screen with audio greetings and language swapper.

### 10. Identification & Single-OTP Privacy Guard (Step 2)
- **Deep Explanation:** ABHA QR scan, Aadhaar OTP (Simulated Sandbox), Caregiver toggle, Single-OTP family login with **mandatory per-member explicit consent tap** to access individual records.
- **Action Plan:** `[x]` Build Login UI with per-member individual consent lock.

### 11. Audio-Verifiable Consent (Step 3)
- **Deep Explanation:** Audio narration of DPDP terms paired with a legally enforceable physical tap requirement.
- **Action Plan:** `[x]` Build Consent UI with audio narration + tap confirmation.

### 12. Mode Auto-Select (Step 4)
- **Deep Explanation:** Branching between Integrated Samanvaya, Allopathic Emergency, and Ayurvedic Nidana.
- **Action Plan:** `[x]` Build Branching Router.

### 13. Conversational History & Joint-Family Switch (Step 5)
- **Deep Explanation:** Web Audio mic, dynamic 4-6 follow-up chips, Visual Symptom Timeline ("Today / Few Days / Weeks / Months"), and real-time speaker toggle (Patient vs. Family Escort).
- **Action Plan:** `[x]` Build Chat UI with timeline slider and speaker switch.

### 14. AYUSH Picture Module & Prakriti Assessment (Step 6)
- **Deep Explanation:** Dashavidha Pariksha with swipeable icon cards for **Prakriti (Vata/Pitta/Kapha)**, Agni (digestion), Nidra (sleep), and region-adapted Ahara-Vihara (Rice/Sambar vs. Roti/Dal) + audio tooltips.
- **Action Plan:** `[x]` Build Icon Carousel with explicit Prakriti assessment.

### 15. Document Scan & Visible Symptom Photo (Step 7)
- **Deep Explanation:** Camera guide overlay with OCR extraction, audio playback of prescriptions, Jan Aushadhi generic savings, "Not Sure" smudged crop fallback, and **Point-and-Photograph for visible symptoms** (rashes/wounds).
- **Action Plan:** `[x]` Build Camera component with visible symptom photo capture.

### 16. Scheme Eligibility by Rule Type (Step 8)
- **Deep Explanation:** Evaluates 8 state/national schemes branching explicitly by rule type (`universal`, `income_threshold`, `ration_card_category`, `secc_deprivation`) with direct `wa.me` WhatsApp checklist trigger.
- **Action Plan:** `[x]` Build Scheme UI Card with type-based evaluation and WhatsApp deep links.

### 17. Red-Flag Interstitial & TB Nikshay Linkage (Step 9)
- **Deep Explanation:** Emergency override screen for acute symptoms + **TB red-flag linkage** (cough >2 weeks, night sweats) prompting sputum test & Nikshay portal notification.
- **Action Plan:** `[x]` Build Red-Flag Override UI with TB Nikshay detector.

### 18. Confirm & Submit (Step 10)
- **Deep Explanation:** Full plain-language audio readback paired with the Green/Red/Back confirmation loop (Readback -> Confirm / Relisten / Non-destructive Back).
- **Action Plan:** `[x]` Build Summary UI with Green/Red/Back confirm loop.

### 19. Token & Wait Screen (Step 11)
- **Deep Explanation:** Queue token (A-142), department assignment, simple text directions, universal paper print slip, and live queue SMS alerts.
- **Action Plan:** `[x]` Build Token Screen with print styles and SMS registration.

### 20. Physician Review Dashboard (Step 12)
- **Deep Explanation:** Clinician dashboard with line-by-line accept/reject diffs, herb-drug conflict alerts, visit memory, reverse voice dictation, and live hospital pharmacy stock-check.
- **Action Plan:** `[x]` Build Doctor Dashboard with live stock check.

---

## ⚙️ Phase 3: Smart Automations & Data Engines

- `[x]` **21. Deterministic State Scheme Engine:** 8 seeded state/national schemes (PM-JAY, CGHS, Chiranjeevi [RJ], Swasthya Sathi [WB], Aarogyasri [AP], MJPJAY [MH], CMCHIS [TN], Arogya Bhagya [KA]).
- `[x]` **22. Herb-Drug Conflict Checker:** Cross-checks Allopathic drugs with Ayurvedic herbs (e.g. Metformin + Karela hypoglycemic risk).
- `[x]` **23. Babel Fish Translation Layer:** Translates local idioms ("chhati pe patthar", "ang-ang toot raha hai") into SOCRATES Medical English.
- `[x]` **24. Brand-to-Generic Rupee Savings:** Displays exact savings (e.g. Save ₹175) for Jan Aushadhi generic equivalents.

---

## 🧪 Phase 4: The 40+ Extraordinary Differentiators & New Game-Changers

### Intelligent Medical Intake & Accessibility
- `[x]` **25. Floating Autonomous Assistant:** Groq function-calling orb active from Screen 1 for hands-free navigation.
- `[x]` **26. Green/Red/Back Confirm Loop:** Scoped to clinical writes (Audio readback -> Confirm / Retry / Non-destructive Back).
- `[x]` **27. Voice-Driven Chip Parameters:** Speaking auto-highlights corresponding UI chips visually.
- `[x]` **28. Dynamic Per-Complaint Questioning:** Generates exactly 4-6 relevant follow-up questions from initial complaint.
- `[x]` **29. Visual Symptom-Timeline:** "Today / Few Days / Weeks / Months" visual tap scale.
- `[x]` **30. Low-Confidence Triage Flag:** Routes ambiguous cases to General Medicine.
- `[x]` **31. Confidence-based Human Escalation:** Transfers session to ASHA worker if ASR confidence is low.
- `[x]` **32. Returning-Patient Fast Path (Visit Memory):** Ingests previous visit data to follow up on past symptoms.
- `[x]` **33. ASHA Record Continuity:** Pre-fills session from village health worker screening records.
- `[x]` **34. Reverse Doctor Dictation:** Hands-free voice dictation on physician screen appends directly to FHIR.
- `[x]` **35. Silent Text-Only "Quiet Mode":** 100% touch/text mode for deaf/hard-of-hearing patients or noisy shared halls.

### Cultural & Demographic Sensitivity & Safety
- `[x]` **36. Discreet "Something Else is Wrong" Distress Channel:** Quiet option ("Speak to nurse privately") for victims of abuse accompanied by harmers.
- `[x]` **37. Gender & Modesty Routing:** Private Mode (headphones only) & discreet "Prefer Female Staff" toggle.
- `[x]` **38. Joint-Family Decision Dynamics:** Two individuals can answer different sections without restarting.
- `[x]` **39. Caregiver/Proxy Mode:** Tags medical records as caregiver-reported vs. patient-reported.
- `[x]` **40. Fasting & Religious Awareness:** Captures Ramzan/Navratri/Ekadashi fasting to adjust medication and diet guidance.
- `[x]` **41. Trust Building Banner:** Persistent "A nurse reviews everything you say" banner across all screens.
- `[x]` **42. Multi-Generational Remote Assist:** Sends OTP link to remote family member's phone to complete intake remotely.
- `[x]` **43. Caste/Community Sensitivity:** PM-JAY demographic flow is private, optional, and never displayed on shared screens.
- `[x]` **44. Portable Identity for Migrant Workers:** Support for inter-state laborers without local address/ration cards, routing to national PM-JAY.
- `[x]` **45. "Why am I being asked this?" Explainer:** Audio/text tooltips explaining medical relevance of AYUSH questions.
- `[x]` **46. Region-Adapted Diet Chips:** Localized food icons in Ahara-Vihara (Rice/Sambar for South, Roti/Dal for North).
- `[x]` **47. Family Batch Sessions:** One consent flow branches into multiple linked patient profiles with per-member consent.

### Operational, Output & Clinical Integrations
- `[x]` **48. TB Red-Flag Linkage to Nikshay:** Flags TB triad (>2 weeks cough) -> sputum test order & Nikshay notification prompt.
- `[x]` **49. Live Hospital Pharmacy Stock-Check:** Checks government pharmacy stock before prescription commit, suggesting in-stock alternatives.
- `[x]` **50. Point-and-Photograph Visible Symptoms:** Patient captures photos of wounds/rashes as timestamped visual notes for doctors (zero pseudo-diagnosis).
- `[x]` **51. Postnatal Follow-up & Maternal Chain:** Dedicated SMS/IVR sequence for postnatal mothers to prevent complications.
- `[x]` **52. Visible "Not Sure" OCR Flags:** Displays raw image crops next to low-confidence OCR guesses instead of hallucinating.
- `[x]` **53. Audio Playback of Old Prescriptions:** TTS reads digitized prescription contents back in plain language.
- `[x]` **54. Closed-loop Discharge Translator:** Converts discharge prescription into icon-based home-care guidance (sun/moon).
- `[x]` **55. SMS/IVR Follow-up Reminders:** Automated adherence calls and SMS reminders post-visit.
- `[x]` **56. Optional Attendant Phone Capture:** Records accompanying caregiver's phone for reminders.
- `[x]` **57. Festival-Aware Analytics:** Hospital admin dashboard predicting OPD surges tied to Indian festival calendars.
- `[x]` **58. Universal Print Option:** Physical printed QR receipts, summaries, and tokens for every output.
- `[x]` **59. Live Queue SMS Updates:** "How long until my turn" SMS alerts when 3-5 patients away.
- `[x]` **60. Rough Cost Estimator:** Displays approximate treatment cost ranges with vs. without scheme coverage.
- `[x]` **61. WhatsApp Delivery:** Delivers summary and scheme checklist directly to patient's WhatsApp via `wa.me` instant deep links and sandbox API.

---

## 🚩 Phase 5: Mocks & Safety Boundaries (Verified)
- `[x]` **Acoustic Biomarkers:** Handled as a simulated placeholder without unvalidated diagnostic claims.
- `[x]` **Vision-AI Darshana:** Restricted to Point-and-Photograph visual notes for doctors (no AI Prakriti determination to patients).
- `[x]` **ABHA Creation via FaceAuth:** Implemented in simulated sandbox mode.
- `[x]` **Audio-Verifiable Consent:** Paired with mandatory physical tap.
- `[x]` **Nearest Budget Hospital Finder:** Cut entirely.
- `[x]` **Complex RAG Stack:** Down-scoped to flat vector search with confidence threshold.

---

## 🚀 Phase 6: Advanced Case Management & NLP Enhancements (New from Analysis)
- `[x]` **62. Semantic-Similarity Routing Layer:** Integrate embeddings (Sarvam/NIM) for robust intent routing instead of strict string matching.
- `[x]` **63. Controlled-Vocabulary Mapping:** Expand Babel Fish into a dialect-to-standard-term dictionary (SNOMED-CT style) for FHIR readiness.
- `[x]` **64. Confidence-Gated Confirmation Loop:** Wire the Green/Red/Back loop to trigger automatically on low-confidence semantic matches.
- `[x]` **65. Full Context Cross-Referencing:** Pass entire conversation history to LLM to connect related symptoms (e.g., diabetes & numbness) and generate a "connections flag".
- `[x]` **66. The "Next Action" Card:** Build a persistent UI card showing unified pre-consultation routing (token/department) and post-consultation discharge instructions.
- `[x]` **67. Portable Case Summary:** Generate a clean, printable/QR one-pager (problem -> history -> medications -> findings -> actions) for non-ABDM hospitals.
- `[x]` **68. "Why are we doing this test" Explainer:** Add short, doctor-approved template explainers for each prescribed test in the summary.
- `[x]` **69. Self-Scoped "Stalled Case" Flag:** Implement an internal flag for un-consulted histories or neglected scheme checklists.

---

## 📢 Phase 7: Pitch Narrative & Scope Guardrails
*These items are specifically for pitch framing and preventing over-engineering, extracted from the final analysis.*
- `[x]` **70. The "Case Manager" Frame:** Reposition project as ensuring patients don't fall through cracks (Narrative only; do not build a human-staffed coordination desk).
- `[x]` **71. Indoor Navigation Scope Check:** Stick to the simple token + text directions. Do not promise or build live facility mapping/wayfinding.
- `[x]` **72. Core Value Proposition Pivot:** Update pitch deck/README: *"We make sure the patient's case doesn't fall through the cracks between the moment they walk in and the moment they're actually seen."*
