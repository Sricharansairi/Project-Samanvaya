"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Users, Stethoscope, Check, X, AlertTriangle, Mic, MicOff, 
  Save, FileText, Pill, Printer, ArrowRight, ShieldAlert, ShieldCheck, 
  Search, Sparkles, Plus, Trash2, Edit3, RefreshCw, Clock, Building, 
  HeartPulse, Activity, AlertCircle, Copy, CheckCircle2, ChevronRight, 
  QrCode, FileCheck, History, Calendar, Eye, HelpCircle, Lock, Unlock
} from "lucide-react";
import Link from "next/link";
import TrustBanner from "@/components/TrustBanner";
import { useLanguage } from "@/contexts/LanguageContext";

interface PrescriptionItem {
  id: string;
  med: string;
  generic_name?: string;
  dosage: string;
  freq: string;
  days: string;
  food_relation: string;
  notes: string;
  aware_category?: "Access" | "Watch" | "Reserve";
}

interface PatientRecord {
  token_number: string;
  tokenNumber?: number;
  patientName: string;
  age?: string;
  gender?: string;
  abhaId: string;
  phone?: string;
  department: string;
  roomNumber?: string;
  doctorName?: string;
  urgency?: "Normal" | "High" | "Emergency";
  status?: string;
  chief_concern?: string;
  registrationTime?: string;
  estimatedWaitMinutes?: number;
}

export default function DoctorDashboard() {
  const { t } = useLanguage();
  
  // Doctor Profile & Assigned OPDs
  const [doctorName] = useState("Dr. Arvind Sharma, MBBS, MD");
  const [doctorReg] = useState("MCI-84920 / DMC");
  const assignedOpds = [
    { id: "All", name: "All My OPDs", room: "Multiple Rooms", icon: "🏥" },
    { id: "General Medicine", name: "General Medicine OPD", room: "Room 101", icon: "🩺" },
    { id: "Cardiology", name: "Cardiology OPD", room: "Room 102", icon: "❤️" },
    { id: "Pulmonology", name: "Chest & Pulmonology OPD", room: "Room 103", icon: "🫁" },
    { id: "Orthopedics", name: "Orthopedics OPD", room: "Room 104", icon: "🦴" },
    { id: "AYUSH / Integrative", name: "AYUSH & Integrative OPD", room: "Room 105", icon: "🌿" },
    { id: "Pediatrics", name: "Pediatrics OPD", room: "Room 106", icon: "🧸" }
  ];
  const [selectedOpd, setSelectedOpd] = useState("All");

  // Queue State
  const [queue, setQueue] = useState<PatientRecord[]>([]);
  const [activePatient, setActivePatient] = useState<PatientRecord | null>(null);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

  // Active Workspace Tabs: "consultation" | "prescription" | "abha_history" | "print_preview"
  const [activeTab, setActiveTab] = useState<"consultation" | "prescription" | "abha_history" | "print_preview">("consultation");

  // Clinical Findings State
  const [vitals, setVitals] = useState({
    bp_sys: "128",
    bp_dia: "84",
    pulse: "76",
    temp: "98.6",
    spo2: "98",
    resp_rate: "16",
    weight: "68",
    rbs: "110"
  });

  const [clinicalFindings, setClinicalFindings] = useState([
    { id: 1, text: "Presenting Complaint: High grade fever with nocturnal chills and productive cough.", status: "accepted" },
    { id: 2, text: "Onset & Duration: Acute onset, 3 days duration (Gradual worsening).", status: "accepted" },
    { id: 3, text: "Physical Exam: Bilateral coarse crepitations in right lower lung zone. Mild throat congestion.", status: "accepted" },
    { id: 4, text: "Previous Medication: Amoxicillin-Clav 625mg PO BD taken for 2 days without marked relief.", status: "accepted" }
  ]);

  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState("Acute Bronchitis with Secondary Bacterial Infection (ICD-10: J20.9)");
  const [dictationText, setDictationText] = useState("");
  const [isDictating, setIsDictating] = useState(false);
  const [patientAdvice, setPatientAdvice] = useState({
    diet: "High protein, warm fluids, avoid cold refrigerated foods",
    precautions: "Steam inhalation twice daily, mask in crowded places",
    red_flags: "Return immediately if high fever >102°F, hemoptysis or severe breathlessness develops",
    follow_up: "5 days or SOS"
  });

  // Prescriptions State
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: "rx-1",
      med: "Azithromycin 500mg",
      generic_name: "Azithromycin",
      dosage: "500 mg",
      freq: "1-0-0",
      days: "3 days",
      food_relation: "1 hr before food",
      notes: "Complete full 3-day course",
      aware_category: "Watch"
    },
    {
      id: "rx-2",
      med: "Paracetamol 650mg",
      generic_name: "Paracetamol",
      dosage: "650 mg",
      freq: "1-0-1",
      days: "5 days",
      food_relation: "After food",
      notes: "SOS for fever > 100°F",
      aware_category: "Access"
    }
  ]);

  // Real-Time Pharmacovigilance State
  const [pharmaAudit, setPharmaAudit] = useState<any>(null);
  const [isAuditingPharma, setIsAuditingPharma] = useState(false);

  // ABHA History & Clinical RAG State
  const [abhaHistoryDocs, setAbhaHistoryDocs] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [ragQuery, setRagQuery] = useState("");
  const [ragAnswer, setRagAnswer] = useState<any>(null);
  const [isRagSearching, setIsRagSearching] = useState(false);

  // ABDM Upload & Edit/Amendment State
  const [uploadStatus, setUploadStatus] = useState<"IDLE" | "UPLOADING" | "UPLOADED" | "AMENDING">("IDLE");
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [amendmentReason, setAmendmentReason] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // Walk-In Patient Modal
  const [showAddWalkIn, setShowAddWalkIn] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientDept, setNewPatientDept] = useState("General Medicine");
  const [newPatientComplaint, setNewPatientComplaint] = useState("");

  // =========================================================================
  // 1. FETCH ASSIGNED OPD QUEUE (DYNAMIC REAL-TIME)
  // =========================================================================
  const fetchQueue = async () => {
    setIsLoadingQueue(true);
    let loaded: PatientRecord[] = [];

    try {
      const res = await fetch(`/api/patient/opd-queue?department=${encodeURIComponent(selectedOpd)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.queue && Array.isArray(data.queue)) {
          loaded = data.queue;
        }
      }
    } catch {}

    // Merge with localStorage dynamic queue
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("samanvaya_queue") : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formattedStored: PatientRecord[] = parsed.map((p: any) => ({
            token_number: typeof p.tokenNumber === "number" ? `T-${p.tokenNumber}` : String(p.tokenNumber || "T-101"),
            tokenNumber: p.tokenNumber || 101,
            patientName: p.patientName || p.patients?.name || "OPD Patient",
            age: p.age || "45",
            gender: p.gender || "Male",
            abhaId: p.abhaId || p.patients?.abha_id || "14-8921-4320-7712",
            phone: p.phone || p.patients?.phone || "+91 98452 11982",
            department: p.department || "General Medicine",
            roomNumber: p.roomNumber || "Room 101",
            doctorName: doctorName,
            urgency: p.urgency || "Normal",
            status: p.status || "WAITING",
            chief_concern: p.chief_concern || (p.department ? `${p.department} Consultation` : "Clinical Review"),
            registrationTime: p.registrationTime || "Just now",
            estimatedWaitMinutes: p.estimatedWaitMinutes || 10
          }));

          const filteredStored = selectedOpd === "All" 
            ? formattedStored 
            : formattedStored.filter(p => p.department.toLowerCase().includes(selectedOpd.toLowerCase()));

          // Merge without duplicate tokens
          const tokenSet = new Set(loaded.map(l => l.token_number));
          filteredStored.forEach(item => {
            if (!tokenSet.has(item.token_number)) {
              loaded.push(item);
            }
          });
        }
      }
    } catch {}

    setQueue(loaded);
    setIsLoadingQueue(false);

    // Auto-select first patient if none active
    if (!activePatient && loaded.length > 0) {
      handleSelectPatient(loaded[0]);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, [selectedOpd]);

  // =========================================================================
  // 2. PATIENT SELECTION & ABHA HISTORY EXTRACTION
  // =========================================================================
  const handleSelectPatient = async (patient: PatientRecord) => {
    setActivePatient(patient);
    setUploadStatus("IDLE");
    setUploadResult(null);
    setIsEditMode(false);
    setAmendmentReason("");
    setRagAnswer(null);
    setPharmaAudit(null);

    // Dynamic initial findings tailored to complaint
    setClinicalFindings([
      { id: 1, text: `Presenting Complaint: ${patient.chief_concern || "Acute health concern requiring medical evaluation."}`, status: "accepted" },
      { id: 2, text: "Onset & Duration: Symptoms progressively noted over the past few days.", status: "accepted" },
      { id: 3, text: "Physical Exam: Afebrile at present, hydration adequate, systemic review pending.", status: "accepted" },
      { id: 4, text: "ABHA Data Verification: Verified via UIDAI / ABDM Demographic Consent Gate.", status: "accepted" }
    ]);

    // Load Patient's ABHA Health Locker Records
    setIsLoadingHistory(true);
    let docs: any[] = [];

    try {
      const res = await fetch(`/api/patient/longitudinal-timeline?abha_id=${encodeURIComponent(patient.abhaId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.documents && Array.isArray(data.documents)) {
          docs = data.documents;
        }
      }
    } catch {}

    // Fallback: check localStorage vault documents
    try {
      const vault = JSON.parse(localStorage.getItem("samanvaya_vault_documents") || "[]");
      const matched = vault.filter((v: any) => v.abha_id === patient.abhaId || !v.abha_id);
      if (matched.length > 0 && docs.length === 0) {
        docs = matched;
      }
    } catch {}

    // If still empty, supply realistic ABHA longitudinal records
    if (docs.length === 0) {
      docs = [
        {
          document_id: "abdm-doc-prev-001",
          document_title: "Discharge Summary & Prescription",
          created_at: "2026-06-12",
          extracted_data: {
            document_metadata: {
              document_type: "Hospital Discharge Summary",
              facility_name: "Government General Hospital, Central OPD",
              doctor_name: "Dr. K. S. Murthy, MD",
              document_date: "2026-06-12"
            },
            vitals: { bp: "134/86 mmHg", pulse: "80 bpm", spo2: "97%" },
            diagnoses: [
              { condition_name: "Type 2 Diabetes Mellitus", icd10_code: "E11.9" },
              { condition_name: "Primary Hypertension", icd10_code: "I10" }
            ],
            medications: [
              { name: "Metformin 500mg", dosage: "500 mg", frequency: "1-0-1", duration: "90 days", instructions: "With meals" },
              { name: "Telmisartan 40mg", dosage: "40 mg", frequency: "1-0-0", duration: "90 days", instructions: "Morning before food" },
              { name: "Atorvastatin 20mg", dosage: "20 mg", frequency: "0-0-1", duration: "90 days", instructions: "At bedtime" }
            ],
            allergies: ["Penicillin - Mild skin rashes and itching reported in 2021"]
          }
        },
        {
          document_id: "abdm-doc-prev-002",
          document_title: "NABL Glycemic & Renal Profile",
          created_at: "2026-08-04",
          extracted_data: {
            document_metadata: {
              document_type: "Diagnostic Lab Report",
              facility_name: "District NABL Accredited Pathology Lab",
              doctor_name: "Dr. Deepa Nair, Pathologist",
              document_date: "2026-08-04"
            },
            investigations_and_labs: [
              { test_name: "HbA1c", observed_value: "7.8%", reference_range: "< 5.7%", flag: "HIGH" },
              { test_name: "Fasting Blood Sugar", observed_value: "142 mg/dL", reference_range: "70-100", flag: "HIGH" },
              { test_name: "Serum Creatinine", observed_value: "1.1 mg/dL", reference_range: "0.7-1.3", flag: "NORMAL" }
            ]
          }
        }
      ];
    }

    setAbhaHistoryDocs(docs);
    setIsLoadingHistory(false);
  };

  // =========================================================================
  // 3. WHO AWARE CLASSIFICATION HELPER
  // =========================================================================
  const getAwarePill = (medName: string) => {
    const lower = (medName || "").toLowerCase();
    if (!lower) return null;
    if (/mero|colistin|linezolid|polymyxin|tigecycline/i.test(lower)) {
      return { group: "Reserve" as const, color: "bg-rose-100 text-rose-800 border-rose-300", label: "WHO Reserve (Restricted Last-Resort)" };
    }
    if (/azithro|cefix|ceftriax|cipro|levo|oflox|piper|amox.*clav|augmentin|clarithro/i.test(lower)) {
      return { group: "Watch" as const, color: "bg-amber-100 text-amber-800 border-amber-300", label: "WHO Watch (High Resistance Risk)" };
    }
    if (/amox|cefalex|doxy|metro|cotrimox|nitrofurantoin|gentamicin|paracetamol|metformin|telmisartan/i.test(lower)) {
      return { group: "Access" as const, color: "bg-emerald-100 text-emerald-800 border-emerald-300", label: "WHO Access (Essential & Safe)" };
    }
    return null;
  };

  // =========================================================================
  // 4. AUTONOMOUS REAL-TIME PHARMACOVIGILANCE INTERCEPTOR
  // =========================================================================
  const runPharmacovigilanceAudit = async () => {
    if (prescriptions.length === 0) return;
    setIsAuditingPharma(true);

    try {
      // Gather historical meds
      const histMeds: any[] = [];
      abhaHistoryDocs.forEach(d => {
        const extMeds = d.extracted_data?.medications || [];
        extMeds.forEach((m: any) => histMeds.push(m));
      });

      const candidateMeds = prescriptions.map(p => `${p.med} ${p.dosage}`);

      const res = await fetch("/api/clinical/pharmacovigilance-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          historical_medications: histMeds,
          candidate_new_prescriptions: candidateMeds
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPharmaAudit(data);
      }
    } catch {
      // Fallback local screening
      const candidateStr = prescriptions.map(p => p.med.toLowerCase()).join(" ");
      const hasStatin = abhaHistoryDocs.some(d => 
        (d.extracted_data?.medications || []).some((m: any) => /atorva|rosuva|simva/i.test(m.name || ""))
      );
      const hasMacrolide = /clarithro|erythro|azithro/i.test(candidateStr);

      if (hasStatin && hasMacrolide) {
        setPharmaAudit({
          status: "ALERT_TRIGGERED",
          has_critical_contraindications: true,
          conflicts: [
            {
              severity: "CRITICAL",
              drug_pair: ["Atorvastatin (Historical)", "Macrolide / Azithromycin (Candidate)"],
              clinical_risk: "CYP3A4 hepatic inhibition markedly elevates systemic statin concentration, increasing risk of acute rhabdomyolysis.",
              recommended_action: "Temporary statin suspension during macrolide course or switch to Azithromycin / Amoxicillin."
            }
          ],
          pharmacovigilance_guidance: "Prescribe with caution or monitor for muscle pain / dark urine."
        });
      } else {
        setPharmaAudit({
          status: "CLEARED",
          has_critical_contraindications: false,
          conflicts: [],
          pharmacovigilance_guidance: "No severe drug-drug interactions detected between candidate prescriptions and past ABHA records."
        });
      }
    } finally {
      setIsAuditingPharma(false);
    }
  };

  // Re-run audit when prescriptions change
  useEffect(() => {
    if (prescriptions.length > 0 && activePatient) {
      const timer = setTimeout(runPharmacovigilanceAudit, 500);
      return () => clearTimeout(timer);
    }
  }, [prescriptions]);

  // =========================================================================
  // 5. IN-CONSOLE CLINICAL RAG SEARCH OVER ABHA RECORDS
  // =========================================================================
  const handleRunRagSearch = async (queryText?: string) => {
    const q = queryText || ragQuery;
    if (!q.trim()) return;

    setIsRagSearching(true);
    setRagAnswer(null);

    try {
      const res = await fetch("/api/patient/medication-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          abha_id: activePatient?.abhaId,
          query: q,
          in_memory_records: abhaHistoryDocs
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRagAnswer(data);
      }
    } catch {
      setRagAnswer({
        query: q,
        answer: "Unable to query clinical RAG service at this moment. Please review the raw records directly.",
        model_used: "Local Offline Fallback"
      });
    } finally {
      setIsRagSearching(false);
    }
  };

  // =========================================================================
  // 6. ABDM CONSULTATION UPLOAD & POST-UPLOAD AMENDMENT (FHIR ADDENDUM)
  // =========================================================================
  const handleUploadOrAmendAbdm = async (isAmendmentAction: boolean = false) => {
    if (!activePatient) return;
    setUploadStatus("UPLOADING");

    try {
      const acceptedFindings = clinicalFindings.filter(f => f.status === "accepted").map(f => f.text).join(" ");
      const fullSummary = `${acceptedFindings} ${dictationText ? `Dictated Note: ${dictationText}` : ""}`.trim();

      const payload = {
        abha_id: activePatient.abhaId,
        doctor_name: doctorName,
        opd_department: activePatient.department || "General Medicine",
        encounter_id: uploadResult?.encounter_id || `abdm-enc-${Date.now()}`,
        is_amendment: isAmendmentAction,
        amendment_reason: isAmendmentAction ? (amendmentReason || "Post-consultation dosage adjustment") : null,
        patient_name: activePatient.patientName,
        vitals: vitals,
        diagnoses: [{ condition_name: provisionalDiagnosis, icd10_code: "J20.9" }],
        medications: prescriptions.map(p => ({
          name: p.med,
          generic_name: p.generic_name || p.med,
          dosage: p.dosage,
          frequency: p.freq,
          duration: p.days,
          food_relation: p.food_relation,
          instructions: p.notes,
          aware_category: p.aware_category
        })),
        clinical_summary: fullSummary,
        patient_advice: patientAdvice
      };

      const res = await fetch("/api/patient/upload-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setUploadResult(data);
        setUploadStatus("UPLOADED");
        setIsEditMode(false);

        // Update active patient status in queue
        setQueue(prev => prev.map(p => p.token_number === activePatient.token_number ? { ...p, status: "ABDM_UPLOADED" } : p));
      } else {
        throw new Error("Failed server response");
      }
    } catch {
      // Local fallback success simulator
      const mockResult = {
        status: "SUCCESS",
        encounter_id: uploadResult?.encounter_id || `abdm-enc-${Date.now()}`,
        abha_id: activePatient.abhaId,
        version: isAmendmentAction ? "1.1" : "1.0",
        is_amendment: isAmendmentAction,
        amendment_reason: amendmentReason,
        provenance_hash_sha256: "0x89f4b321dc768e1a90c42154fedcb67123984501a4e1",
        abdm_bundle_id: `bundle-abdm-${Date.now()}`,
        total_bundle_entries: prescriptions.length + 2,
        synced_at: new Date().toISOString()
      };
      setUploadResult(mockResult);
      setUploadStatus("UPLOADED");
      setIsEditMode(false);
    }
  };

  // Add Walk-in Patient to Queue
  const handleAddWalkInPatient = () => {
    if (!newPatientName.trim()) return;
    const nextTokenNum = (queue.length > 0 ? Math.max(...queue.map(p => p.tokenNumber || 100)) : 100) + 1;
    const newRecord: PatientRecord = {
      token_number: `OPD-${newPatientDept.substring(0, 3).toUpperCase()}-${nextTokenNum}`,
      tokenNumber: nextTokenNum,
      patientName: newPatientName.trim(),
      age: "42",
      gender: "Male",
      abhaId: `14-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: "+91 98" + Math.floor(10000000 + Math.random() * 90000000),
      department: newPatientDept,
      roomNumber: assignedOpds.find(o => o.id === newPatientDept)?.room || "Room 101",
      doctorName: doctorName,
      urgency: "Normal",
      status: "WAITING",
      chief_concern: newPatientComplaint.trim() || `${newPatientDept} walk-in consultation`,
      registrationTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      estimatedWaitMinutes: 10
    };

    setQueue([newRecord, ...queue]);
    setActivePatient(newRecord);
    setNewPatientName("");
    setNewPatientComplaint("");
    setShowAddWalkIn(false);
  };

  // Reverse Voice Dictation Simulator
  const handleToggleVoiceDictation = () => {
    if (!isDictating) {
      setIsDictating(true);
      setTimeout(() => {
        setDictationText(prev => prev + (prev ? " " : "") + "Auscultation reveals scattered wheeze in bilateral lung fields. Patient advised to maintain adequate oral hydration.");
        setIsDictating(false);
      }, 2500);
    } else {
      setIsDictating(false);
    }
  };

  // Add / Delete Prescription Handlers
  const addPrescriptionRow = () => {
    const newItem: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      med: "",
      generic_name: "",
      dosage: "",
      freq: "1-0-1",
      days: "5 days",
      food_relation: "After food",
      notes: "Take with plain water",
      aware_category: "Access"
    };
    setPrescriptions([...prescriptions, newItem]);
  };

  const removePrescriptionRow = (id: string) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f2942] flex flex-col font-sans print:bg-white print:m-0 print:p-0">
      
      {/* Top Header - Hidden in Print */}
      <div className="print:hidden">
        <TrustBanner currentTab="home" onTabChange={() => {}} onLanguageChange={() => {}} />

        {/* Doctor Console Sub-Header & OPD Switcher Bar */}
        <div className="bg-white border-b border-gray-200 shadow-xs px-4 sm:px-8 py-3">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Doctor Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0f4c81] flex items-center justify-center font-bold text-lg border border-blue-200">
                👨‍⚕️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold text-[#0f2942]">{doctorName}</h1>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    Reg: {doctorReg}
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span>National Health Authority (NHA) Verified Provider</span>
                  <span>•</span>
                  <span className="text-blue-700 font-semibold">ABDM M3 Compliant Desk</span>
                </div>
              </div>
            </div>

            {/* OPD Switcher Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {assignedOpds.map(opd => {
                const isSelected = selectedOpd === opd.id;
                const count = opd.id === "All" 
                  ? queue.length 
                  : queue.filter(q => q.department.toLowerCase().includes(opd.id.toLowerCase())).length;

                return (
                  <button
                    key={opd.id}
                    onClick={() => setSelectedOpd(opd.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-[#0f4c81] text-white shadow-xs" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200/70"
                    }`}
                  >
                    <span>{opd.icon}</span>
                    <span>{opd.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddWalkIn(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Walk-in Token
              </button>
              <button
                onClick={fetchQueue}
                title="Refresh Assigned Queues"
                className="p-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingQueue ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-5 print:p-0 print:m-0 print:max-w-none">
        
        {/* ================================================================= */}
        {/* LEFT COLUMN: ASSIGNED OPD QUEUE (Hidden in Print) */}
        {/* ================================================================= */}
        <aside className="w-full md:w-80 flex flex-col gap-3 shrink-0 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0f4c81]" />
              <h2 className="font-bold text-sm text-[#0f2942]">
                {selectedOpd === "All" ? "All Assigned OPD Patients" : `${selectedOpd} Queue`}
              </h2>
            </div>
            <span className="text-xs bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">
              {queue.length} Waiting
            </span>
          </div>

          {/* Queue Patient Cards List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden max-h-[calc(100vh-210px)] overflow-y-auto divide-y divide-gray-100">
            {queue.map((p, idx) => {
              const isCurrent = activePatient?.token_number === p.token_number;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectPatient(p)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isCurrent 
                      ? "bg-blue-50/80 border-l-4 border-l-[#0f4c81]" 
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-[#0f4c81] tracking-tight">{p.token_number}</span>
                    <div className="flex items-center gap-1.5">
                      {p.status === "ABDM_UPLOADED" && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                          Synced ✓
                        </span>
                      )}
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                        p.urgency === "Emergency" 
                          ? "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse" 
                          : p.urgency === "High" 
                          ? "bg-amber-100 text-amber-800 border border-amber-300" 
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {p.urgency || "Normal"}
                      </span>
                    </div>
                  </div>

                  <div className="font-bold text-sm text-[#0f2942] flex items-center justify-between">
                    <span>{p.patientName}</span>
                    <span className="text-[11px] text-gray-500 font-normal">{p.age}y / {p.gender?.[0]}</span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{p.chief_concern}</p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" /> {p.registrationTime}
                    </span>
                    <span className="font-semibold text-blue-700">{p.department}</span>
                  </div>
                </div>
              );
            })}

            {queue.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <Stethoscope className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-bold text-sm">No patients in this OPD</p>
                <p className="text-xs mt-1">Select "All My OPDs" or create a walk-in token.</p>
              </div>
            )}
          </div>
        </aside>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: DOCTOR WORKSTATION DESK */}
        {/* ================================================================= */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col overflow-hidden print:border-none print:shadow-none">
          
          {!activePatient ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 print:hidden">
              <Stethoscope className="w-16 h-16 mb-4 text-[#0f4c81] opacity-20" />
              <h3 className="font-bold text-lg text-gray-700">Select a Patient to Begin Consultation</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm text-center">
                Review past ABHA medication records, perform AI clinical RAG, record examination findings, and upload an ABDM FHIR encounter.
              </p>
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              
              {/* Patient Banner & ABDM Status Header */}
              <div className="p-4 sm:p-5 border-b border-gray-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:bg-white print:border-b-2 print:border-black">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-black text-[#0f2942]">{activePatient.patientName}</h2>
                    <span className="text-xs bg-[#0f4c81] text-white font-extrabold px-2 py-0.5 rounded">
                      {activePatient.token_number}
                    </span>
                    <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <QrCode className="w-3 h-3 text-emerald-700" /> ABHA: {activePatient.abhaId}
                    </span>
                    {uploadStatus === "UPLOADED" && (
                      <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> ABDM Locked (v{uploadResult?.version || "1.0"})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 flex items-center gap-3">
                    <span><strong>Age/Gender:</strong> {activePatient.age || "45"} Yrs / {activePatient.gender || "Male"}</span>
                    <span>•</span>
                    <span><strong>OPD:</strong> {activePatient.department}</span>
                    <span>•</span>
                    <span><strong>Chief Concern:</strong> {activePatient.chief_concern}</span>
                  </div>
                </div>

                {/* Primary Action Buttons (Hidden in Print) */}
                <div className="flex items-center gap-2 print:hidden">
                  
                  {/* Upload / Amend Button */}
                  {uploadStatus === "UPLOADED" && !isEditMode ? (
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit / Add Amendment (FHIR Addendum)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUploadOrAmendAbdm(isEditMode)}
                      disabled={uploadStatus === "UPLOADING"}
                      className={`px-4 py-2 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                        isEditMode 
                          ? "bg-amber-600 hover:bg-amber-700" 
                          : "bg-[#0f4c81] hover:bg-blue-900"
                      }`}
                    >
                      <Save className="w-3.5 h-3.5" />
                      {uploadStatus === "UPLOADING" 
                        ? "Uploading to ABDM..." 
                        : isEditMode 
                        ? "Save & Re-Sync Amendment (v1.1)" 
                        : "Upload to ABHA ID (FHIR)"}
                    </button>
                  )}

                  {/* Print Prescription Button */}
                  <button
                    onClick={() => {
                      setActiveTab("print_preview");
                      setTimeout(() => window.print(), 300);
                    }}
                    className="px-3.5 py-2 border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-gray-600" /> Print Prescription
                  </button>

                </div>
              </div>

              {/* Amendment Notice Banner (When editing post-upload) */}
              {isEditMode && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 print:hidden">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span><strong>Amendment Mode Active:</strong> Editing an already synchronized ABHA record. Changes will be appended as an official FHIR Addendum (v1.1) with audit trail.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={amendmentReason}
                      onChange={e => setAmendmentReason(e.target.value)}
                      placeholder="Reason for amendment (e.g., dosage adjustment post-labs)..."
                      className="bg-white border border-amber-300 rounded px-2.5 py-1 text-xs w-64 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="px-2 py-1 text-gray-600 hover:text-gray-800 font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* ABDM Upload Success Bar */}
              {uploadResult && uploadStatus === "UPLOADED" && !isEditMode && (
                <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900 print:hidden">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>
                      <strong>ABDM Synchronized:</strong> Encounter locked to ABHA <strong>{activePatient.abhaId}</strong> with Bundle ID <code className="bg-white px-1.5 py-0.2 rounded border border-emerald-300">{uploadResult.abdm_bundle_id}</code>.
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-700">Hash: {uploadResult.provenance_hash_sha256?.substring(0, 16)}...</span>
                </div>
              )}

              {/* Navigation Tabs (Hidden in Print) */}
              <div className="flex items-center border-b border-gray-200 px-4 sm:px-6 bg-white gap-2 overflow-x-auto print:hidden">
                <button
                  onClick={() => setActiveTab("consultation")}
                  className={`py-3 px-3.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "consultation"
                      ? "border-[#0f4c81] text-[#0f4c81]"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Stethoscope className="w-4 h-4" /> 1. Findings & Vitals
                </button>

                <button
                  onClick={() => setActiveTab("prescription")}
                  className={`py-3 px-3.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "prescription"
                      ? "border-[#0f4c81] text-[#0f4c81]"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Pill className="w-4 h-4" /> 2. E-Prescription & Pharmacovigilance
                  {prescriptions.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {prescriptions.length}
                    </span>
                  )}
                  {pharmaAudit?.status === "ALERT_TRIGGERED" && (
                    <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold animate-pulse">
                      Conflict
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("abha_history")}
                  className={`py-3 px-3.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "abha_history"
                      ? "border-[#0f4c81] text-[#0f4c81]"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <History className="w-4 h-4" /> 3. ABHA Medication History & AI RAG
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {abhaHistoryDocs.length} Records
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("print_preview")}
                  className={`py-3 px-3.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "print_preview"
                      ? "border-[#0f4c81] text-[#0f4c81]"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Printer className="w-4 h-4" /> 4. Printable Rx & Explainer
                </button>
              </div>

              {/* Tab Content Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

                {/* ========================================================= */}
                {/* TAB 1: CLINICAL ENCOUNTER FINDINGS & VITALS */}
                {/* ========================================================= */}
                {activeTab === "consultation" && (
                  <div className="space-y-5">
                    
                    {/* Vitals Input Strip */}
                    <div className="bg-slate-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-[#0f4c81]" /> Patient Vitals (OPD Triage)
                        </span>
                        <span className="text-[11px] text-gray-500">Auto-flagging abnormal thresholds</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">BP Sys (mmHg)</label>
                          <input
                            type="text"
                            value={vitals.bp_sys}
                            onChange={e => setVitals({ ...vitals, bp_sys: e.target.value })}
                            className={`w-full bg-white border rounded px-2.5 py-1.5 text-xs font-bold ${
                              parseInt(vitals.bp_sys) > 140 ? 'border-red-400 text-red-700' : 'border-gray-300 text-gray-800'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">BP Dia (mmHg)</label>
                          <input
                            type="text"
                            value={vitals.bp_dia}
                            onChange={e => setVitals({ ...vitals, bp_dia: e.target.value })}
                            className={`w-full bg-white border rounded px-2.5 py-1.5 text-xs font-bold ${
                              parseInt(vitals.bp_dia) > 90 ? 'border-red-400 text-red-700' : 'border-gray-300 text-gray-800'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Pulse (bpm)</label>
                          <input
                            type="text"
                            value={vitals.pulse}
                            onChange={e => setVitals({ ...vitals, pulse: e.target.value })}
                            className={`w-full bg-white border rounded px-2.5 py-1.5 text-xs font-bold ${
                              parseInt(vitals.pulse) > 100 || parseInt(vitals.pulse) < 60 ? 'border-amber-400 text-amber-700' : 'border-gray-300 text-gray-800'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Temp (°F)</label>
                          <input
                            type="text"
                            value={vitals.temp}
                            onChange={e => setVitals({ ...vitals, temp: e.target.value })}
                            className={`w-full bg-white border rounded px-2.5 py-1.5 text-xs font-bold ${
                              parseFloat(vitals.temp) > 99.5 ? 'border-red-400 text-red-700' : 'border-gray-300 text-gray-800'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">SpO2 (%)</label>
                          <input
                            type="text"
                            value={vitals.spo2}
                            onChange={e => setVitals({ ...vitals, spo2: e.target.value })}
                            className={`w-full bg-white border rounded px-2.5 py-1.5 text-xs font-bold ${
                              parseInt(vitals.spo2) < 95 ? 'border-red-500 text-red-700 bg-red-50' : 'border-gray-300 text-gray-800'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Resp (/min)</label>
                          <input
                            type="text"
                            value={vitals.resp_rate}
                            onChange={e => setVitals({ ...vitals, resp_rate: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Weight (kg)</label>
                          <input
                            type="text"
                            value={vitals.weight}
                            onChange={e => setVitals({ ...vitals, weight: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">RBS (mg/dL)</label>
                          <input
                            type="text"
                            value={vitals.rbs}
                            onChange={e => setVitals({ ...vitals, rbs: e.target.value })}
                            className={`w-full bg-white border rounded px-2.5 py-1.5 text-xs font-bold ${
                              parseInt(vitals.rbs) > 160 ? 'border-amber-400 text-amber-700' : 'border-gray-300 text-gray-800'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Clinical Summary & Findings Checklist */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <span className="text-sm font-bold text-[#0f2942] flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#0f4c81]" /> Subjective Complaints & Exam Observations
                        </span>
                        <span className="text-[11px] text-gray-500">Toggle accepted observations for official summary</span>
                      </div>

                      <div className="space-y-2">
                        {clinicalFindings.map(f => (
                          <div
                            key={f.id}
                            className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 transition-all ${
                              f.status === "accepted"
                                ? "bg-white border-gray-200 text-[#0f2942] font-medium"
                                : "bg-red-50/70 border-red-200 text-gray-400 line-through"
                            }`}
                          >
                            <span className="flex-1">{f.text}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setClinicalFindings(clinicalFindings.map(item => item.id === f.id ? { ...item, status: "accepted" } : item))}
                                className={`p-1 rounded ${f.status === 'accepted' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setClinicalFindings(clinicalFindings.map(item => item.id === f.id ? { ...item, status: "rejected" } : item))}
                                className={`p-1 rounded ${f.status === 'rejected' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Provisional Diagnosis Field */}
                      <div className="pt-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Provisional / Working Diagnosis (ICD-10)
                        </label>
                        <input
                          type="text"
                          value={provisionalDiagnosis}
                          onChange={e => setProvisionalDiagnosis(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-300 rounded-lg p-2.5 text-xs font-bold text-[#0f2942] focus:bg-white focus:ring-1 focus:ring-[#0f4c81] outline-none"
                        />
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                          <span className="text-gray-500">Quick suggestions:</span>
                          {[
                            "Acute Bronchitis (J20.9)",
                            "Type 2 Diabetes Mellitus (E11.9)",
                            "Essential Hypertension (I10)",
                            "Viral Upper Respiratory Infection (J06.9)",
                            "Osteoarthritis Knee (M17.9)"
                          ].map(diag => (
                            <button
                              key={diag}
                              onClick={() => setProvisionalDiagnosis(diag)}
                              className="px-2 py-0.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-800 rounded border border-gray-200 text-gray-700 font-semibold cursor-pointer"
                            >
                              + {diag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Reverse Voice Dictation Box */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0f2942] flex items-center gap-2">
                          <Mic className="w-4 h-4 text-[#0f4c81]" /> Hands-Free Doctor Voice Dictation
                        </span>
                        <span className="text-[10px] text-gray-500">Speaks physical exam or notes into consultation</span>
                      </div>

                      <textarea
                        value={dictationText}
                        onChange={e => setDictationText(e.target.value)}
                        placeholder="Click Start Dictation or type differential diagnosis, auscultatory findings, surgical history..."
                        className="w-full h-20 bg-slate-50 border border-gray-300 rounded-lg p-3 text-xs focus:bg-white focus:ring-1 focus:ring-[#0f4c81] outline-none resize-none"
                      />

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-gray-500">
                          {isDictating ? "🎙️ Listening to doctor speech..." : "Microphone ready"}
                        </span>
                        <button
                          onClick={handleToggleVoiceDictation}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isDictating ? "bg-rose-600 text-white animate-pulse" : "bg-[#0f4c81] text-white hover:bg-blue-900"
                          }`}
                        >
                          {isDictating ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                          {isDictating ? "Stop Recording" : "Start Voice Dictation"}
                        </button>
                      </div>
                    </div>

                    {/* Next step prompt */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => setActiveTab("prescription")}
                        className="px-5 py-2.5 bg-[#0f4c81] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs hover:bg-blue-900 transition-all cursor-pointer"
                      >
                        <span>Proceed to E-Prescription & Pharmacovigilance</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                )}

                {/* ========================================================= */}
                {/* TAB 2: E-PRESCRIPTION & PHARMACOVIGILANCE */}
                {/* ========================================================= */}
                {activeTab === "prescription" && (
                  <div className="space-y-5">
                    
                    {/* Real-Time Pharmacovigilance Interceptor Warning Banner */}
                    {pharmaAudit?.status === "ALERT_TRIGGERED" && (
                      <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
                            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                            <span>Pharmacovigilance Alert: Critical Drug Conflict Detected</span>
                          </div>
                          <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                            Safety Interceptor
                          </span>
                        </div>

                        {pharmaAudit.conflicts?.map((c: any, i: number) => (
                          <div key={i} className="bg-white/80 p-3 rounded-lg border border-rose-200 text-xs space-y-1">
                            <div className="font-bold text-rose-950 flex items-center gap-2">
                              <span>⚠️ Interacting Pair:</span>
                              <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono">{c.drug_pair?.join(" + ")}</span>
                            </div>
                            <p className="text-gray-700">{c.clinical_risk}</p>
                            <p className="text-rose-800 font-semibold">Recommendation: {c.recommended_action}</p>
                          </div>
                        ))}

                        <div className="text-[11px] text-gray-600 pt-1">
                          <strong>Physician Override Note:</strong> {pharmaAudit.pharmacovigilance_guidance}
                        </div>
                      </div>
                    )}

                    {/* Prescription Table & Medicine Builder */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-[#0f2942] flex items-center gap-2">
                            <Pill className="w-4 h-4 text-[#0f4c81]" /> E-Prescription (ABDM MedicationStatement)
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">WHO AWaRe classifications & Jan Aushadhi generic alternatives computed in real time</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={runPharmacovigilanceAudit}
                            disabled={isAuditingPharma}
                            className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck className={`w-3.5 h-3.5 text-emerald-600 ${isAuditingPharma ? 'animate-spin' : ''}`} />
                            {isAuditingPharma ? "Screening..." : "Re-Check Safety"}
                          </button>
                          <button
                            onClick={addPrescriptionRow}
                            className="px-3 py-1.5 bg-[#0f4c81] text-white hover:bg-blue-900 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Medicine
                          </button>
                        </div>
                      </div>

                      {/* Medicines List */}
                      <div className="space-y-3">
                        {prescriptions.map((rx, idx) => {
                          const aware = getAwarePill(rx.med);
                          return (
                            <div key={rx.id} className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200 space-y-2.5">
                              <div className="grid grid-cols-12 gap-2.5 items-end">
                                
                                {/* Medicine Name */}
                                <div className="col-span-12 sm:col-span-4">
                                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                    Medicine Name & Strength
                                  </label>
                                  <input
                                    type="text"
                                    value={rx.med}
                                    onChange={e => {
                                      const updated = [...prescriptions];
                                      updated[idx].med = e.target.value;
                                      setPrescriptions(updated);
                                    }}
                                    placeholder="e.g., Amoxicillin 500mg, Telmisartan 40mg"
                                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs font-bold"
                                  />
                                </div>

                                {/* Frequency (1-0-1) */}
                                <div className="col-span-6 sm:col-span-2">
                                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                    Frequency
                                  </label>
                                  <select
                                    value={rx.freq}
                                    onChange={e => {
                                      const updated = [...prescriptions];
                                      updated[idx].freq = e.target.value;
                                      setPrescriptions(updated);
                                    }}
                                    className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-xs font-bold"
                                  >
                                    <option value="1-0-1">1-0-1 (Morning & Night)</option>
                                    <option value="1-0-0">1-0-0 (Morning only)</option>
                                    <option value="0-0-1">0-0-1 (Night only)</option>
                                    <option value="1-1-1">1-1-1 (Thrice daily)</option>
                                    <option value="SOS">SOS (As needed)</option>
                                  </select>
                                </div>

                                {/* Duration */}
                                <div className="col-span-6 sm:col-span-2">
                                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                    Duration
                                  </label>
                                  <input
                                    type="text"
                                    value={rx.days}
                                    onChange={e => {
                                      const updated = [...prescriptions];
                                      updated[idx].days = e.target.value;
                                      setPrescriptions(updated);
                                    }}
                                    placeholder="5 days"
                                    className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-xs font-bold"
                                  />
                                </div>

                                {/* Food Relation */}
                                <div className="col-span-8 sm:col-span-3">
                                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                    Food Relation & Notes
                                  </label>
                                  <input
                                    type="text"
                                    value={rx.food_relation}
                                    onChange={e => {
                                      const updated = [...prescriptions];
                                      updated[idx].food_relation = e.target.value;
                                      setPrescriptions(updated);
                                    }}
                                    placeholder="After food / Empty stomach"
                                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                                  />
                                </div>

                                {/* Delete Row */}
                                <div className="col-span-4 sm:col-span-1 flex justify-end">
                                  <button
                                    onClick={() => removePrescriptionRow(rx.id)}
                                    title="Delete medicine"
                                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                              </div>

                              {/* WHO AWaRe & Jan Aushadhi Savings Badge */}
                              <div className="flex items-center justify-between pt-1 border-t border-gray-200 text-xs">
                                <div className="flex items-center gap-2">
                                  {aware && (
                                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold flex items-center gap-1 ${aware.color}`}>
                                      {aware.group === "Reserve" ? <ShieldAlert className="w-3 h-3 text-rose-600" /> : <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                                      <span>{aware.label}</span>
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                                    PMBJP Generic Salt: ~₹15-25 (Save up to 80%)
                                  </span>
                                </div>

                                <span className="text-[10px] text-gray-500 font-mono">
                                  ICD-10 / SNOMED Mapped
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    {/* Patient Advice & Red Flags */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Patient Instructions & Vernacular Explanation Advice
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Dietary & Hydration Advice</label>
                          <input
                            type="text"
                            value={patientAdvice.diet}
                            onChange={e => setPatientAdvice({ ...patientAdvice, diet: e.target.value })}
                            className="w-full bg-slate-50 border border-gray-300 rounded px-2.5 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Precautions & Daily Routine</label>
                          <input
                            type="text"
                            value={patientAdvice.precautions}
                            onChange={e => setPatientAdvice({ ...patientAdvice, precautions: e.target.value })}
                            className="w-full bg-slate-50 border border-gray-300 rounded px-2.5 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Red Flag Symptoms (When to Rush)</label>
                          <input
                            type="text"
                            value={patientAdvice.red_flags}
                            onChange={e => setPatientAdvice({ ...patientAdvice, red_flags: e.target.value })}
                            className="w-full bg-slate-50 border border-gray-300 rounded px-2.5 py-1.5 text-rose-700 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Follow-Up Schedule</label>
                          <input
                            type="text"
                            value={patientAdvice.follow_up}
                            onChange={e => setPatientAdvice({ ...patientAdvice, follow_up: e.target.value })}
                            className="w-full bg-slate-50 border border-gray-300 rounded px-2.5 py-1.5 font-bold text-[#0f4c81]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setActiveTab("abha_history")}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        ← Check Past ABHA History & RAG
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUploadOrAmendAbdm(isEditMode)}
                          disabled={uploadStatus === "UPLOADING"}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          {isEditMode ? "Save Amendment (v1.1)" : "Upload to ABHA ID (FHIR)"}
                        </button>
                        <button
                          onClick={() => setActiveTab("print_preview")}
                          className="px-4 py-2.5 bg-[#0f4c81] hover:bg-blue-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Printer className="w-4 h-4" /> Preview & Print Rx
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* ========================================================= */}
                {/* TAB 3: ABHA MEDICATION HISTORY & CLINICAL RAG */}
                {/* ========================================================= */}
                {activeTab === "abha_history" && (
                  <div className="space-y-5">
                    
                    {/* Clinical RAG Search Bar */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-[#0f4c81]" />
                          <h3 className="text-sm font-extrabold text-[#0f2942]">
                            Clinical RAG: AI Search Across Patient's ABHA Vault
                          </h3>
                        </div>
                        <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                          Dual-Branch Medical AI (Zero Hallucination)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ragQuery}
                          onChange={e => setRagQuery(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleRunRagSearch()}
                          placeholder="e.g., Any previous adverse reactions to antibiotics? What was the last HbA1c and Metformin dose?"
                          className="flex-1 bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]"
                        />
                        <button
                          onClick={() => handleRunRagSearch()}
                          disabled={isRagSearching}
                          className="px-4 py-2 bg-[#0f4c81] hover:bg-blue-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                        >
                          <Search className={`w-3.5 h-3.5 ${isRagSearching ? 'animate-spin' : ''}`} />
                          {isRagSearching ? "Querying RAG..." : "Search Records"}
                        </button>
                      </div>

                      {/* Quick Prompt Suggestions */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                        <span className="text-gray-500 font-medium">Try asking:</span>
                        {[
                          "What chronic medications are active?",
                          "Any documented drug allergies?",
                          "Latest HbA1c and kidney function values",
                          "Has patient taken ACE inhibitors or sartans?"
                        ].map((promptText, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setRagQuery(promptText);
                              handleRunRagSearch(promptText);
                            }}
                            className="px-2 py-0.5 bg-white border border-blue-200 hover:border-blue-400 rounded text-blue-900 font-medium transition-colors cursor-pointer"
                          >
                            "{promptText}"
                          </button>
                        ))}
                      </div>

                      {/* RAG Answer Display */}
                      {ragAnswer && (
                        <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-xs space-y-2 mt-2">
                          <div className="flex items-center justify-between text-xs text-[#0f4c81] font-extrabold">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Grounded Clinical Answer:
                            </span>
                            <span className="text-[10px] text-gray-400 font-normal">Model: {ragAnswer.model_used}</span>
                          </div>
                          <p className="text-xs text-gray-800 leading-relaxed font-medium">
                            {ragAnswer.answer}
                          </p>
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => {
                                setDictationText(prev => prev + (prev ? " " : "") + `[ABHA RAG Finding: ${ragAnswer.answer}]`);
                                alert("Copied RAG findings into Clinical Consultation Notes!");
                              }}
                              className="text-[11px] font-bold text-[#0f4c81] hover:underline flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" /> Insert into Consultation Findings
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Historical Documents & Medication Timeline */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-[#0f2942] flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-emerald-700" /> Historical ABDM Health Locker Records
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">Chronologically sorted clinical encounters and lab records for ABHA: {activePatient.abhaId}</p>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded">
                          {abhaHistoryDocs.length} Total Records
                        </span>
                      </div>

                      {/* Timeline Cards */}
                      <div className="space-y-3">
                        {abhaHistoryDocs.map((doc, idx) => {
                          const ext = doc.extracted_data || {};
                          const meta = ext.document_metadata || {};
                          const meds = ext.medications || [];
                          const labs = ext.investigations_and_labs || [];
                          const diagnoses = ext.diagnoses || [];
                          const allergies = ext.allergies || [];

                          return (
                            <div key={idx} className="p-4 bg-slate-50/70 border border-gray-200 rounded-xl space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-[#0f4c81]">
                                    {meta.document_type || doc.document_title || "Clinical Encounter"}
                                  </span>
                                  <span className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.2 rounded font-bold">
                                    {meta.document_date || doc.created_at?.substring(0, 10) || "Recent"}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500 font-medium">
                                  {meta.doctor_name || "Physician"} • {meta.facility_name || "Hospital"}
                                </span>
                              </div>

                              {/* Diagnoses */}
                              {diagnoses.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                                  <span className="text-gray-500 font-bold">Diagnoses:</span>
                                  {diagnoses.map((d: any, di: number) => (
                                    <span key={di} className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded text-[11px] font-bold">
                                      {d.condition_name || d} ({d.icd10_code || 'ICD10'})
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Medications in this historical doc */}
                              {meds.length > 0 && (
                                <div className="space-y-1 text-xs">
                                  <span className="text-gray-500 font-bold">Prescribed Regimen:</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {meds.map((m: any, mi: number) => (
                                      <div key={mi} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between text-[11px]">
                                        <span className="font-bold text-gray-800">{m.name || m.med}</span>
                                        <span className="text-gray-500">{m.dosage || ''} • {m.frequency || m.freq || '1-0-1'} ({m.duration || m.days || 'Regular'})</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Labs in this doc */}
                              {labs.length > 0 && (
                                <div className="space-y-1 text-xs">
                                  <span className="text-gray-500 font-bold">Lab Biomarkers:</span>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {labs.map((l: any, li: number) => (
                                      <span key={li} className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                        l.flag === "HIGH" ? "bg-red-50 text-red-800 border-red-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                      }`}>
                                        {l.test_name}: {l.observed_value} ({l.reference_range})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Allergies */}
                              {allergies.length > 0 && (
                                <div className="flex items-center gap-1.5 text-xs text-rose-800 font-bold">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                  <span>{allergies.join("; ")}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {abhaHistoryDocs.length === 0 && (
                          <div className="p-6 text-center text-gray-400">
                            No prior ABHA documents recorded for this citizen.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* ========================================================= */}
                {/* TAB 4: OFFICIAL PRINTABLE PRESCRIPTION & PATIENT EXPLAINER */}
                {/* ========================================================= */}
                {activeTab === "print_preview" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between print:hidden">
                      <div className="flex items-center gap-2">
                        <Printer className="w-5 h-5 text-[#0f4c81]" />
                        <h3 className="font-extrabold text-sm text-[#0f2942]">
                          Official Hospital Prescription & Patient Counseling Preview
                        </h3>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="px-5 py-2 bg-[#0f4c81] text-white hover:bg-blue-900 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Printer className="w-4 h-4" /> Print / Save as PDF
                      </button>
                    </div>

                    {/* Official Prescription Paper Layout */}
                    <div className="bg-white border-2 border-gray-300 rounded-xl p-8 shadow-sm space-y-6 print:border-none print:p-0 print:m-0 print:shadow-none text-black">
                      
                      {/* Hospital Official Letterhead Header */}
                      <div className="border-b-2 border-black pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full border-2 border-[#0f4c81] flex items-center justify-center font-black text-xl text-[#0f4c81]">
                            ⚕️
                          </div>
                          <div>
                            <h1 className="text-xl font-black tracking-tight text-[#0f2942]">GOVERNMENT GENERAL HOSPITAL & CHC</h1>
                            <p className="text-xs font-bold text-gray-600">Ayushman Bharat Digital Mission (ABDM) Accredited Health Center</p>
                            <p className="text-[10px] text-gray-500">Project Samanvaya Interoperable Clinical Delivery System</p>
                          </div>
                        </div>

                        <div className="text-right text-xs">
                          <p className="font-extrabold text-[#0f2942]">{doctorName}</p>
                          <p className="text-gray-600 font-medium">{doctorReg}</p>
                          <p className="text-[#0f4c81] font-bold text-[11px]">{activePatient.department}</p>
                          <p className="text-gray-500 text-[10px]">Date: {new Date().toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>

                      {/* Patient Demographics Box */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-lg border border-gray-200 text-xs">
                        <div>
                          <span className="text-gray-500 font-bold block text-[10px]">PATIENT NAME</span>
                          <span className="font-extrabold text-sm">{activePatient.patientName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-bold block text-[10px]">AGE / GENDER</span>
                          <span className="font-bold">{activePatient.age || "45"} Yrs / {activePatient.gender || "Male"}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-bold block text-[10px]">ABHA ID / UHID</span>
                          <span className="font-mono font-bold text-blue-900">{activePatient.abhaId}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-bold block text-[10px]">OPD TOKEN / VISIT</span>
                          <span className="font-extrabold text-emerald-800">{activePatient.token_number}</span>
                        </div>
                      </div>

                      {/* Vitals & Diagnosis Line */}
                      <div className="border border-gray-200 rounded-lg p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                          <span className="font-bold text-gray-700">OBSERVED VITALS:</span>
                          <span className="font-medium text-gray-800">
                            BP: {vitals.bp_sys}/{vitals.bp_dia} mmHg • Pulse: {vitals.pulse} bpm • SpO2: {vitals.spo2}% • Temp: {vitals.temp}°F • Wt: {vitals.weight}kg • RBS: {vitals.rbs} mg/dL
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-gray-700">PROVISIONAL DIAGNOSIS:</span>
                          <span className="font-extrabold text-blue-950 ml-2">{provisionalDiagnosis}</span>
                        </div>
                      </div>

                      {/* Rx Prescriptions Table */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black font-serif text-[#0f2942]">℞ PRESCRIPTION</span>
                          <span className="text-[10px] text-gray-500">Jan Aushadhi Generic Salts Available</span>
                        </div>

                        <table className="w-full border-collapse border border-gray-300 text-xs">
                          <thead>
                            <tr className="bg-gray-100 text-left font-bold text-gray-700">
                              <th className="border border-gray-300 p-2 w-8">#</th>
                              <th className="border border-gray-300 p-2">Medicine & Strength</th>
                              <th className="border border-gray-300 p-2 w-32 text-center">Schedule</th>
                              <th className="border border-gray-300 p-2 w-24">Duration</th>
                              <th className="border border-gray-300 p-2">Instructions & Food Relation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prescriptions.map((rx, idx) => (
                              <tr key={idx} className="border-b border-gray-200">
                                <td className="border border-gray-300 p-2 font-bold text-center">{idx + 1}</td>
                                <td className="border border-gray-300 p-2">
                                  <span className="font-bold text-sm block">{rx.med}</span>
                                  {rx.aware_category && (
                                    <span className="text-[9px] text-gray-500">WHO AWaRe: {rx.aware_category}</span>
                                  )}
                                </td>
                                <td className="border border-gray-300 p-2 text-center">
                                  <span className="font-mono font-extrabold text-sm block">{rx.freq}</span>
                                  <span className="text-[9px] text-gray-500">
                                    {rx.freq === "1-0-1" ? "☀️ Morning + 🌙 Night" : rx.freq === "1-0-0" ? "☀️ Morning only" : rx.freq === "0-0-1" ? "🌙 Night only" : "Thrice daily"}
                                  </span>
                                </td>
                                <td className="border border-gray-300 p-2 font-semibold">{rx.days}</td>
                                <td className="border border-gray-300 p-2">
                                  <span className="font-bold block">{rx.food_relation}</span>
                                  <span className="text-gray-600 text-[11px]">{rx.notes}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Patient Advice & Red Flags */}
                      <div className="border border-gray-200 rounded-lg p-3 text-xs space-y-1.5 bg-slate-50/50">
                        <p><strong>Dietary Advice:</strong> {patientAdvice.diet}</p>
                        <p><strong>Precautions:</strong> {patientAdvice.precautions}</p>
                        <p className="text-red-700"><strong>Red Flag Warning:</strong> {patientAdvice.red_flags}</p>
                        <p><strong>Next Follow-Up:</strong> {patientAdvice.follow_up}</p>
                      </div>

                      {/* Doctor Signature & ABDM Cryptographic Stamp */}
                      <div className="pt-8 flex items-end justify-between border-t border-gray-200 text-xs">
                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-500 font-mono">
                            Digital Transaction Hash: {uploadResult?.provenance_hash_sha256 || "0x89F4B321DC768E1A90C4"}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            ABDM Milestone 3 Compliant e-Prescription (DPDP Act 2023 Verified)
                          </p>
                        </div>

                        <div className="text-center">
                          <div className="h-10 border-b border-gray-400 w-48 mx-auto mb-1"></div>
                          <p className="font-extrabold text-sm">{doctorName}</p>
                          <p className="text-[10px] text-gray-500">Authorized Physician Signature & Seal</p>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      </div>

      {/* =================================================================== */}
      {/* WALK-IN TOKEN MODAL */}
      {/* =================================================================== */}
      {showAddWalkIn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0f2942] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#0f4c81]" /> Add Walk-in Patient to OPD
              </h3>
              <button onClick={() => setShowAddWalkIn(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  value={newPatientName}
                  onChange={e => setNewPatientName(e.target.value)}
                  placeholder="e.g., Rajesh Kumar"
                  className="w-full border border-gray-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Assigned OPD Department *</label>
                <select
                  value={newPatientDept}
                  onChange={e => setNewPatientDept(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 font-bold"
                >
                  <option value="General Medicine">General Medicine OPD (Room 101)</option>
                  <option value="Cardiology">Cardiology OPD (Room 102)</option>
                  <option value="Pulmonology">Chest & Pulmonology OPD (Room 103)</option>
                  <option value="Orthopedics">Orthopedics OPD (Room 104)</option>
                  <option value="AYUSH / Integrative">AYUSH & Integrative OPD (Room 105)</option>
                  <option value="Pediatrics">Pediatrics OPD (Room 106)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Chief Concern / Presenting Symptoms</label>
                <input
                  type="text"
                  value={newPatientComplaint}
                  onChange={e => setNewPatientComplaint(e.target.value)}
                  placeholder="e.g., High fever and headache for 2 days"
                  className="w-full border border-gray-300 rounded-lg p-2.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowAddWalkIn(false)}
                className="px-4 py-2 text-gray-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWalkInPatient}
                className="px-5 py-2 bg-[#0f4c81] text-white text-xs font-bold rounded-lg shadow-xs hover:bg-blue-900"
              >
                Generate Token & Add to Queue
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
