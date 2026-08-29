# Project Samanvaya — Master Feature & Flow Reference

**Framing for the pitch:** Not "we digitize the intake form" — **"we make sure the patient's case doesn't fall through the cracks between walking in and being seen."**

---

## 1. Core Architecture

### 3-Tier NLP / Model Routing
| Tier | Job | Model |
|---|---|---|
| 1 | Sub-second intent routing, UI navigation | Groq (fast Llama-class model) |
| 2 | Emergency keyword safety net — deterministic, not generative, genuinely zero hallucination risk *at this layer* | Rule-based dictionary scan (chest pain, stroke, bleeding, etc.) |
| 3 | Deep clinical structuring — symptoms → SNOMED-CT/FHIR terms | Large model (NVIDIA NIM / Sarvam-105B) + guideline grounding |

### Voice & Language Stack
- **Primary (build on this):** Sarvam — STT (Saaras v3), TTS (Bulbul v3), translation (Mayura), OCR (Sarvam Vision)
- **Named in pitch for Digital India alignment:** Bhashini
- **Offline-capable fallback:** AI4Bharat (self-hosted, only meaningful if actually run on-device — not on a second cloud instance)

### Hybrid Deployment Modes
| Mode | Who | Notes |
|---|---|---|
| Kiosk | Walk-in patients, no smartphone | Full flow must work standalone here |
| Personal Device (PWA/QR handoff) | Smartphone owners | Adds WhatsApp delivery, live queue SMS, remote assist |
| Assisted (ASHA/family) | Zero literacy, joint-family cases | Caregiver/proxy tagging, gender/modesty routing live here |
| Physician Dashboard | Doctor only | Never patient-facing |
| Admin | Hospital management | Aggregate/analytics only |

---

## 2. The 12-Step Patient Flow

1. **Language Selection** — dynamic language buttons; UI and voice switch immediately
2. **Mode Selection** — "I am the Patient" vs. "I am an ASHA Worker/Helper" (adjusts assistant's phrasing)
3. **Identity & ABHA** — scan QR / enter mobile number / skip-anonymous
4. **Consent (DPDP Act)** — audio-read legal terms + mandatory physical tap on "I Consent"
5. **Voice Triage** — mic input, live UI chips confirm what was understood as the patient speaks
6. **Document Upload** — scan old prescription, **or photograph a visible symptom (wound/rash) as a plain visual record for the doctor — never an AI diagnostic claim**, or skip
7. **AYUSH Pariksha** *(if opted in)* — visual cards for Prakriti (Vata/Pitta/Kapha), Agni, Diet
8. **Government Scheme Check** — ⚠️ *fix applied:* select state first; only show ration-card/income fields for schemes whose `type` actually requires them (universal schemes like Chiranjeevi/Swasthya Sathi skip this entirely); ration-card color legend must be looked up per-state, not treated as universal
9. **Processing** — invisible step: routing, translation, red-flag check
10. **Token & Next Action** — print/WhatsApp the token + department, plus a plain "next action" card
11. **Portable Case Summary** — icon-based printout with QR-linked FHIR data, works even at facilities with no ABDM integration
12. **Physician Dashboard** — accept/edit AI summary, herb-drug conflict warnings, pharmacy stock-check before prescribing

---

## 3. Patient-Facing Feature Set

**Accessibility & Inclusion**
Quiet/text-only mode · discreet distress channel ("something else is wrong") · gender/modesty routing (private mode, prefer-female-staff) · region-adapted diet chips · caregiver/proxy answer tagging · joint-family two-person answering · remote assist via family member's phone

**Clinical Intelligence & Safety**
Deterministic red-flag detection · herb-drug interaction checker · TB symptom → Nikshay notification linkage · returning-patient visit memory · low-confidence auto-escalation to human/ASHA review

**AYUSH-Specific**
Full Dashavidha Pariksha coverage (Prakriti, Agni, Ahara-Vihara) via visual card selection, not free text

**Financial & Administrative**
State/national scheme eligibility (type-aware, see Step 8 fix) · WhatsApp document checklist delivery · rough cost estimator · live pharmacy stock-check with generic (Jan Aushadhi) swap suggestion

**Continuity & Follow-Through**
SMS/IVR follow-up reminders · portable case summary (works cross-hospital, ABDM or not) · plain-language "next action" card · discharge instructions translated into icon-based home care guidance

**Communication**
Babel Fish idiom-to-medical-English translation · full audio readback before submission · multilingual STT/TTS throughout

---

## 4. Privacy & Compliance

- Audio-narrated consent **plus** mandatory physical tap (audio alone isn't sufficient proof of consent)
- FHIR R4 structured output for ABDM/HIS interoperability
- Data minimization — raw audio/images purged after extraction
- Per-member consent required even under shared/family login flows
- Caste/community fields (where scheme-relevant) kept private, optional, never shown on shared screens

---

## 5. Verify Before You Present This as Done

- [ ] Confirm actual Sarvam credit balance on your dashboard (published numbers disagree — don't assume the worst or best case)
- [ ] Confirm the scheme engine branches by eligibility `type` (universal / income / ration-card / SECC), not one formula for all schemes
- [ ] Confirm FHIR R4 generation + actual push to a HIS/ABDM endpoint is built and demoable — this is a named module in the original problem statement, not an optional extra
- [ ] Confirm single-OTP family login still requires each member's individual consent before their own record is viewable
- [ ] Confirm what specifically still works when offline — full adaptive voice history, or only the deterministic/touch-based parts
