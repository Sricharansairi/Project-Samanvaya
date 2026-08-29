# Project Samanvaya — Master Feature & Architecture Analysis

## 1. The Core Pivot: From Kiosk to HIS
Project Samanvaya has evolved from a standalone self-service patient kiosk into a **Lightweight Hospital Information System (HIS)**. 
Instead of forcing patients to navigate complex UI menus themselves, the system forks into role-based dashboards, placing the triage and data-entry burden on trained hospital staff and doctors, while giving patients a clean portal to view their records.

---

## 2. The Clean UI Fork Architecture
The application now begins at a **Landing Page** with two distinct paths:

### Path A: Patient Portal
Designed for the end-user (the patient) to manage their own healthcare journey.
- **Login:** Mock ABHA ID or Mobile Number.
- **Features:** 
  - Upload old prescriptions / past medical documents.
  - View digital history (e-prescriptions written by the doctor during the current or past visits).
  - View active ICQR tokens for the current hospital visit.

### Path B: Hospital Information System (HIS)
Designed for hospital operations. This path requires a role selection:
- **Role 1: Registration Staff (Front Desk)**
  - Responsible for patient intake.
  - **Features:** Create Mock ABHA ID, enter vitals (BP, Weight), and log the Chief Concern. The system's NLP layer triages the concern, assigns a department, and generates a beautiful **ICQR Token**.
- **Role 2: Physician/Doctor (Clinic)**
  - Responsible for diagnosis and prescribing.
  - **Features:** View patient queue, scan ICQR token, review AI-triaged vitals/notes, write an e-prescription (medicines, dosage), and sync it digitally to the patient's record. Prints a physical copy if needed.

---

## 3. Technology Stack & Integrations
- **AI Triage (NLP Layer):** Groq (Llama-3) is used at the registration desk to instantly parse the "Chief Concern" text into structured departments and urgency levels.
- **Identity (Mock ABDM):** Because the real ABDM sandbox is highly unstable (403 Forbidden errors), we use a highly realistic Mock ABHA Simulator that generates 14-digit IDs and mimics the OTP flow.
- **Tokens (ICQR):** Tokens are visually enhanced using `ICQR.com` aesthetic tree generators (or similar aesthetic QR libraries) for a premium look.
- **Database:** Supabase handles relational data linking `Patients` (ABHA) ➔ `Visits` (Tokens/Vitals) ➔ `Prescriptions` (Medicines).
