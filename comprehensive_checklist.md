# Comprehensive Checklist: End-to-End HIS Migration

## Phase 1: The Clean UI Fork (Landing Page)
- [ ] Overhaul `frontend/app/page.tsx` to remove kiosk clutter.
- [ ] Add "I am a Patient" Portal entry point.
- [ ] Add "Hospital Information System (HIS)" entry point.
- [ ] Add Sub-Routing for HIS (Registration Staff vs Doctor).

## Phase 2: Registration Staff Dashboard (Front Desk)
- [ ] Create `RegistrationDashboard.tsx`.
- [ ] Build the Mock ABHA ID Generator (simulate 14-digit generation).
- [ ] Build Vitals Form (Weight, BP, SPO2).
- [ ] Build Chief Concern Input.
- [ ] Integrate existing Groq Triage API to parse Chief Concern into a Department.
- [ ] Build ICQR Token Generation (visual display of the token).

## Phase 3: Doctor Dashboard (Clinic)
- [ ] Refactor `Step12_PhysicianDashboard.tsx` into `DoctorDashboard.tsx`.
- [ ] Add Patient Queue / QR Scanner module.
- [ ] Build UI to display Staff Vitals & Groq Triage Summary.
- [ ] Build e-Prescription Module (Add Medicines, Frequency, Notes).
- [ ] Wire up "Print Prescription" button.

## Phase 4: Patient Portal (Digital History)
- [ ] Create `PatientPortal.tsx`.
- [ ] Build Mock ABHA Login.
- [ ] Migrate the "Upload Document" component into this portal.
- [ ] Fetch and display Digital History (e-Prescriptions written by the doctor).

## Phase 5: Backend & Database (Supabase)
- [ ] Update Supabase tables (`patients`, `visits`, `prescriptions`).
- [ ] Create API route for generating ICQR token IDs.
- [ ] Create API route for saving prescriptions.
- [ ] Create API route for fetching patient history.
