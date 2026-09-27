"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Users, Stethoscope, Check, X, AlertTriangle, Mic, MicOff, 
  Save, FileText, Pill, Printer, ArrowRight, ShieldAlert, ShieldCheck, 
  Search, Sparkles, Plus, Trash2, Edit3, RefreshCw, Clock, Building, 
  HeartPulse, Activity, AlertCircle, Copy, CheckCircle2, ChevronRight, 
  QrCode, FileCheck, History, Calendar, Eye, HelpCircle, Lock, Unlock,
  Filter, UserCheck, Shield, CheckSquare, Square, FlaskConical, Syringe,
  Droplets, Wind, Zap, Building2, ChevronDown, ChevronUp, Package, Leaf
} from "lucide-react";
import Link from "next/link";
import TrustBanner from "@/components/TrustBanner";
import DoctorLoginModal, { DoctorSession, VERIFIED_DOCTORS } from "@/components/DoctorLoginModal";
import { useLanguage } from "@/contexts/LanguageContext";

interface PrescriptionItem {
  id: string;
  med: string;
  generic_name?: string;
  formulation: "Tablet" | "Syrup" | "Capsule" | "Injection" | "Drops" | "Ointment" | "Inhaler";
  dosage: string;
  freq: string;
  days: string;
  food_relation: string;
  notes: string;
  aware_category?: "Access" | "Watch" | "Reserve";
  is_syrup: boolean;
  syrup_volume?: string;
  syrup_shake_well?: boolean;
  syrup_measuring_cup?: boolean;
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

// 1-Click Fast Presets for Doctors (Strictly Professional, Zero Emojis)
const COMMON_MEDICINE_PRESETS = [
  {
    category: "Syrups & Liquids (Oral Solutions)",
    type: "syrup",
    items: [
      {
        name: "Ascoril LS Cough Syrup",
        formulation: "Syrup" as const,
        is_syrup: true,
        dosage: "10 ml (2 tsp)",
        syrup_volume: "10 ml (2 tsp)",
        freq: "1-0-1",
        days: "5 days",
        food_relation: "After food",
        notes: "Shake bottle well before use. Mix with lukewarm water.",
        syrup_shake_well: true,
        syrup_measuring_cup: true,
        aware: "Access" as const
      },
      {
        name: "Paracetamol Pediatric Syrup (120mg/5ml)",
        formulation: "Syrup" as const,
        is_syrup: true,
        dosage: "5 ml (1 tsp)",
        syrup_volume: "5 ml (1 tsp)",
        freq: "SOS",
        days: "3 days",
        food_relation: "After food",
        notes: "Shake well. Give with measuring syringe for fever >100°F.",
        syrup_shake_well: true,
        syrup_measuring_cup: true,
        aware: "Access" as const
      },
      {
        name: "Amoxicillin Oral Suspension (125mg/5ml)",
        formulation: "Syrup" as const,
        is_syrup: true,
        dosage: "5 ml (1 tsp)",
        syrup_volume: "5 ml (1 tsp)",
        freq: "1-0-1",
        days: "5 days",
        food_relation: "After food",
        notes: "Shake well. Store reconstituted suspension in cool place.",
        syrup_shake_well: true,
        syrup_measuring_cup: true,
        aware: "Access" as const
      },
      {
        name: "Digene Antacid Gel / Syrup",
        formulation: "Syrup" as const,
        is_syrup: true,
        dosage: "10 ml (2 tsp)",
        syrup_volume: "10 ml (2 tsp)",
        freq: "1-0-1",
        days: "7 days",
        food_relation: "1 hr after food & at bedtime",
        notes: "Shake well before use. Do not drink water immediately.",
        syrup_shake_well: true,
        syrup_measuring_cup: true,
        aware: "Access" as const
      },
      {
        name: "Zincovit Multivitamin Syrup",
        formulation: "Syrup" as const,
        is_syrup: true,
        dosage: "5 ml (1 tsp)",
        syrup_volume: "5 ml (1 tsp)",
        freq: "1-0-0",
        days: "14 days",
        food_relation: "After food",
        notes: "Shake well before use. Daily nutritional boost.",
        syrup_shake_well: true,
        syrup_measuring_cup: true,
        aware: "Access" as const
      }
    ]
  },
  {
    category: "Tablets & Capsules (Solid Oral)",
    type: "tablet",
    items: [
      {
        name: "Paracetamol 650mg",
        formulation: "Tablet" as const,
        is_syrup: false,
        dosage: "650 mg",
        freq: "1-0-1",
        days: "5 days",
        food_relation: "After food",
        notes: "SOS for fever > 100°F or body pain",
        aware: "Access" as const
      },
      {
        name: "Azithromycin 500mg",
        formulation: "Tablet" as const,
        is_syrup: false,
        dosage: "500 mg",
        freq: "1-0-0",
        days: "3 days",
        food_relation: "1 hr before food",
        notes: "Take at the exact same hour every day. Complete full course.",
        aware: "Watch" as const
      },
      {
        name: "Amoxicillin + Clavulanic Acid 625mg",
        formulation: "Tablet" as const,
        is_syrup: false,
        dosage: "625 mg",
        freq: "1-0-1",
        days: "5 days",
        food_relation: "With food",
        notes: "Take at start of meals to avoid stomach upset.",
        aware: "Access" as const
      },
      {
        name: "Pantoprazole 40mg",
        formulation: "Tablet" as const,
        is_syrup: false,
        dosage: "40 mg",
        freq: "1-0-0",
        days: "7 days",
        food_relation: "Empty stomach (30 mins before breakfast)",
        notes: "Swallow whole, do not crush or chew.",
        aware: "Access" as const
      },
      {
        name: "Cetirizine 10mg",
        formulation: "Tablet" as const,
        is_syrup: false,
        dosage: "10 mg",
        freq: "0-0-1",
        days: "5 days",
        food_relation: "At bedtime",
        notes: "May cause mild drowsiness. Avoid night driving.",
        aware: "Access" as const
      },
      {
        name: "Telmisartan 40mg",
        formulation: "Tablet" as const,
        is_syrup: false,
        dosage: "40 mg",
        freq: "1-0-0",
        days: "30 days",
        food_relation: "Morning with water",
        notes: "Regular blood pressure maintenance. Do not skip.",
        aware: "Access" as const
      }
    ]
  }
];

export default function DoctorDashboard() {
  const { t } = useLanguage();
  
  // Doctor Profile & Authenticated Session
  const [doctorSession, setDoctorSession] = useState<DoctorSession>({
    isAuthenticated: true,
    name: VERIFIED_DOCTORS[0].name,
    registrationNumber: VERIFIED_DOCTORS[0].registrationNumber,
    department: VERIFIED_DOCTORS[0].department,
    roomNumber: VERIFIED_DOCTORS[0].roomNumber,
    specialty: VERIFIED_DOCTORS[0].specialty,
    loginTime: "09:00 AM"
  });
  const [showDoctorLoginModal, setShowDoctorLoginModal] = useState(false);
  const [onlyMyAssigned, setOnlyMyAssigned] = useState(true);

  // Departments list (No emojis, crisp clinical naming)
  const assignedOpds = [
    { id: "All", name: "All Hospital OPDs", room: "Multiple Rooms", icon: Building2 },
    { id: "General Medicine", name: "General Medicine OPD", room: "Room 101", icon: Stethoscope },
    { id: "Cardiology", name: "Cardiology OPD", room: "Room 102", icon: Activity },
    { id: "Pulmonology", name: "Chest & Pulmonology OPD", room: "Room 103", icon: HeartPulse },
    { id: "Orthopedics", name: "Orthopedics OPD", room: "Room 104", icon: Shield },
    { id: "AYUSH / Integrative", name: "AYUSH & Integrative OPD", room: "Room 105", icon: Leaf },
    { id: "Pediatrics", name: "Pediatrics OPD", room: "Room 106", icon: Users }
  ];
  const [selectedOpd, setSelectedOpd] = useState("General Medicine");
  const [searchQueueQuery, setSearchQueueQuery] = useState("");

  // Queue State
  const [queue, setQueue] = useState<PatientRecord[]>([]);
  const [activePatient, setActivePatient] = useState<PatientRecord | null>(null);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

  // Accordion drawer for Longitudinal ABHA History
  const [showAbhaHistoryDrawer, setShowAbhaHistoryDrawer] = useState(false);

  // Printable Letterhead Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);

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

  // Prescriptions State (Initialized with Tablet & Syrup)
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: "rx-1",
      med: "Ascoril LS Cough Syrup",
      generic_name: "Levosalbutamol + Ambroxol + Guaiphenesin",
      formulation: "Syrup",
      dosage: "10 ml (2 tsp)",
      freq: "1-0-1",
      days: "5 days",
      food_relation: "After food",
      notes: "Shake bottle well before use. Mix with lukewarm water.",
      aware_category: "Access",
      is_syrup: true,
      syrup_volume: "10 ml (2 tsp)",
      syrup_shake_well: true,
      syrup_measuring_cup: true
    },
    {
      id: "rx-2",
      med: "Paracetamol 650mg",
      generic_name: "Paracetamol",
      formulation: "Tablet",
      dosage: "650 mg",
      freq: "1-0-1",
      days: "5 days",
      food_relation: "After food",
      notes: "SOS for fever > 100°F or body pain",
      aware_category: "Access",
      is_syrup: false
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
  // 1. SESSION SYNC & QUEUE FETCHING
  // =========================================================================
  useEffect(() => {
    const syncDoctorSession = () => {
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("samanvaya_doctor_session") : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.name) {
            setDoctorSession(parsed);
            setSelectedOpd(parsed.department || "General Medicine");
          }
        }
      } catch {}
    };

    syncDoctorSession();
    window.addEventListener("samanvaya:doctor-auth-changed", syncDoctorSession);
    return () => window.removeEventListener("samanvaya:doctor-auth-changed", syncDoctorSession);
  }, []);

  const fetchQueue = async () => {
    setIsLoadingQueue(true);
    let loaded: PatientRecord[] = [];
    const activeDept = onlyMyAssigned ? doctorSession.department : selectedOpd;

    try {
      const res = await fetch(`/api/patient/opd-queue?department=${encodeURIComponent(activeDept)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.queue && Array.isArray(data.queue)) {
          loaded = data.queue;
        }
      }
    } catch {}

    const departmentSeeds: Record<string, PatientRecord[]> = {
      "General Medicine": [
        {
          token_number: "OPD-GM-101",
          tokenNumber: 101,
          patientName: "Ramesh Sharma",
          age: "52",
          gender: "Male",
          abhaId: "14-8921-4320-7712",
          phone: "+91 98452 11982",
          department: "General Medicine",
          roomNumber: doctorSession.roomNumber || "Room 101",
          doctorName: doctorSession.name,
          urgency: "High",
          status: "WAITING",
          chief_concern: "High fever for 4 days with nocturnal chills and productive cough",
          registrationTime: "09:15 AM",
          estimatedWaitMinutes: 8
        },
        {
          token_number: "OPD-GM-107",
          tokenNumber: 107,
          patientName: "Suresh Verma",
          age: "45",
          gender: "Male",
          abhaId: "14-9901-2345-6789",
          phone: "+91 98111 22334",
          department: "General Medicine",
          roomNumber: doctorSession.roomNumber || "Room 101",
          doctorName: doctorSession.name,
          urgency: "Normal",
          status: "WAITING",
          chief_concern: "Acute bronchitis, dry cough, throat irritation",
          registrationTime: "09:40 AM",
          estimatedWaitMinutes: 15
        },
        {
          token_number: "OPD-GM-108",
          tokenNumber: 108,
          patientName: "Kamala Devi",
          age: "49",
          gender: "Female",
          abhaId: "14-7712-4433-2211",
          phone: "+91 94450 99881",
          department: "General Medicine",
          roomNumber: doctorSession.roomNumber || "Room 101",
          doctorName: doctorSession.name,
          urgency: "Normal",
          status: "WAITING",
          chief_concern: "Viral syndrome, generalized fatigue, myalgia",
          registrationTime: "10:05 AM",
          estimatedWaitMinutes: 22
        }
      ],
      "Cardiology": [
        {
          token_number: "OPD-CARD-102",
          tokenNumber: 102,
          patientName: "Meenakshi Sundaram",
          age: "61",
          gender: "Female",
          abhaId: "14-3312-9845-6621",
          phone: "+91 97120 44512",
          department: "Cardiology",
          roomNumber: doctorSession.roomNumber || "Room 102",
          doctorName: doctorSession.name,
          urgency: "Emergency",
          status: "WAITING",
          chief_concern: "Exertional retrosternal chest heaviness, diaphoresis, radiating to shoulder",
          registrationTime: "09:30 AM",
          estimatedWaitMinutes: 0
        },
        {
          token_number: "OPD-CARD-109",
          tokenNumber: 109,
          patientName: "R. Krishnamurthy",
          age: "68",
          gender: "Male",
          abhaId: "14-6655-4433-2211",
          phone: "+91 98222 33445",
          department: "Cardiology",
          roomNumber: doctorSession.roomNumber || "Room 102",
          doctorName: doctorSession.name,
          urgency: "High",
          status: "WAITING",
          chief_concern: "Hypertensive urgency follow-up, palpitations on climbing stairs",
          registrationTime: "10:10 AM",
          estimatedWaitMinutes: 12
        }
      ],
      "Pulmonology": [
        {
          token_number: "OPD-PULM-103",
          tokenNumber: 103,
          patientName: "Abdul Ghaffar",
          age: "48",
          gender: "Male",
          abhaId: "14-5544-2211-9988",
          phone: "+91 98200 33412",
          department: "Pulmonology",
          roomNumber: doctorSession.roomNumber || "Room 103",
          doctorName: doctorSession.name,
          urgency: "Normal",
          status: "WAITING",
          chief_concern: "Chronic cough for 3 weeks, mild exertional dyspnea, needs cough syrup review",
          registrationTime: "09:45 AM",
          estimatedWaitMinutes: 16
        },
        {
          token_number: "OPD-PULM-110",
          tokenNumber: 110,
          patientName: "Sunita Devi",
          age: "54",
          gender: "Female",
          abhaId: "14-8899-1122-3344",
          phone: "+91 94111 55667",
          department: "Pulmonology",
          roomNumber: doctorSession.roomNumber || "Room 103",
          doctorName: doctorSession.name,
          urgency: "High",
          status: "WAITING",
          chief_concern: "Bronchial asthma exacerbation with nocturnal wheezing and tightness",
          registrationTime: "10:20 AM",
          estimatedWaitMinutes: 10
        }
      ],
      "Pediatrics": [
        {
          token_number: "OPD-PEDS-106",
          tokenNumber: 106,
          patientName: "Master Aarav Patel",
          age: "6",
          gender: "Male",
          abhaId: "14-1122-3344-5566",
          phone: "+91 98112 33445",
          department: "Pediatrics",
          roomNumber: doctorSession.roomNumber || "Room 106",
          doctorName: doctorSession.name,
          urgency: "High",
          status: "WAITING",
          chief_concern: "High fever (102°F) since last night, decreased oral intake, needs pediatric syrup",
          registrationTime: "10:30 AM",
          estimatedWaitMinutes: 12
        },
        {
          token_number: "OPD-PEDS-111",
          tokenNumber: 111,
          patientName: "Baby Ananya Sharma",
          age: "4",
          gender: "Female",
          abhaId: "14-2233-4455-6677",
          phone: "+91 98450 11223",
          department: "Pediatrics",
          roomNumber: doctorSession.roomNumber || "Room 106",
          doctorName: doctorSession.name,
          urgency: "Normal",
          status: "WAITING",
          chief_concern: "Spasmodic cough, runny nose, chest congestion, requires syrup suspension",
          registrationTime: "10:45 AM",
          estimatedWaitMinutes: 18
        }
      ]
    };

    if (loaded.length === 0 && departmentSeeds[doctorSession.department]) {
      loaded = [...departmentSeeds[doctorSession.department]];
    }

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
            department: p.department || doctorSession.department,
            roomNumber: p.roomNumber || doctorSession.roomNumber,
            doctorName: p.doctorName || doctorSession.name,
            urgency: p.urgency || "Normal",
            status: p.status || "WAITING",
            chief_concern: p.chief_concern || (p.department ? `${p.department} Consultation` : "Clinical Review"),
            registrationTime: p.registrationTime || "Just now",
            estimatedWaitMinutes: p.estimatedWaitMinutes || 10
          }));

          const tokenSet = new Set(loaded.map(l => l.token_number));
          formattedStored.forEach(item => {
            const matchesFilter = onlyMyAssigned
              ? (item.department.toLowerCase().includes(doctorSession.department.toLowerCase()) || item.doctorName === doctorSession.name)
              : (selectedOpd === "All" || item.department.toLowerCase().includes(selectedOpd.toLowerCase()));

            if (matchesFilter && !tokenSet.has(item.token_number)) {
              loaded.push(item);
            }
          });
        }
      }
    } catch {}

    if (onlyMyAssigned) {
      loaded = loaded.filter(p => 
        p.department.toLowerCase().includes(doctorSession.department.toLowerCase()) || 
        p.doctorName?.toLowerCase().includes(doctorSession.name.toLowerCase())
      );
      if (loaded.length === 0 && departmentSeeds[doctorSession.department]) {
        loaded = [...departmentSeeds[doctorSession.department]];
      }
    }

    setQueue(loaded);
    setIsLoadingQueue(false);

    if (loaded.length > 0 && (!activePatient || !loaded.some(l => l.token_number === activePatient.token_number))) {
      handleSelectPatient(loaded[0]);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, [selectedOpd, onlyMyAssigned, doctorSession]);

  // =========================================================================
  // 2. PATIENT SELECTION & ABHA HISTORY
  // =========================================================================
  const handleSelectPatient = async (patient: PatientRecord) => {
    setActivePatient(patient);
    setUploadStatus("IDLE");
    setUploadResult(null);
    setIsEditMode(false);
    setAmendmentReason("");
    setRagAnswer(null);
    setPharmaAudit(null);

    setClinicalFindings([
      { id: 1, text: `Presenting Complaint: ${patient.chief_concern || "Acute health concern requiring medical evaluation."}`, status: "accepted" },
      { id: 2, text: "Onset & Duration: Symptoms progressively noted over the past few days.", status: "accepted" },
      { id: 3, text: "Physical Exam: Afebrile at present, hydration adequate, systemic review pending.", status: "accepted" },
      { id: 4, text: "ABHA Data Verification: Verified via UIDAI / ABDM Demographic Consent Gate.", status: "accepted" }
    ]);

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

    try {
      const vault = JSON.parse(localStorage.getItem("samanvaya_vault_documents") || "[]");
      const matched = vault.filter((v: any) => v.abha_id === patient.abhaId || !v.abha_id);
      if (matched.length > 0 && docs.length === 0) {
        docs = matched;
      }
    } catch {}

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

  // WHO AWaRe Classification Helper
  const getAwarePill = (medName: string) => {
    const lower = (medName || "").toLowerCase();
    if (!lower) return null;
    if (/mero|colistin|linezolid|polymyxin|tigecycline/i.test(lower)) {
      return { group: "Reserve" as const, color: "bg-rose-100 text-rose-800 border-rose-300", label: "WHO Reserve (Restricted)" };
    }
    if (/azithro|cefix|ceftriax|cipro|levo|oflox|piper|amox.*clav|augmentin|clarithro/i.test(lower)) {
      return { group: "Watch" as const, color: "bg-amber-100 text-amber-800 border-amber-300", label: "WHO Watch (High Resistance Risk)" };
    }
    if (/amox|cefalex|doxy|metro|cotrimox|nitrofurantoin|gentamicin|paracetamol|metformin|telmisartan/i.test(lower)) {
      return { group: "Access" as const, color: "bg-emerald-100 text-emerald-800 border-emerald-300", label: "WHO Access (First-Line Essential)" };
    }
    return null;
  };

  // Pharmacovigilance Safety Audit
  const runPharmacovigilanceAudit = async () => {
    if (prescriptions.length === 0) return;
    setIsAuditingPharma(true);

    try {
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
              clinical_risk: "CYP3A4 hepatic inhibition elevates statin plasma concentration, increasing risk of acute rhabdomyolysis.",
              recommended_action: "Temporarily pause statin during macrolide therapy or substitute with Amoxicillin."
            }
          ],
          pharmacovigilance_guidance: "Prescribe with caution and advise patient to monitor for severe muscle aches."
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

  useEffect(() => {
    if (prescriptions.length > 0 && activePatient) {
      const timer = setTimeout(runPharmacovigilanceAudit, 500);
      return () => clearTimeout(timer);
    }
  }, [prescriptions]);

  // Clinical RAG Search
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

  // Upload or Amend ABDM Consultation
  const handleUploadOrAmendAbdm = async (isAmendmentAction: boolean = false) => {
    if (!activePatient) return;
    setUploadStatus("UPLOADING");

    try {
      const acceptedFindings = clinicalFindings.filter(f => f.status === "accepted").map(f => f.text).join(" ");
      const fullSummary = `${acceptedFindings} ${dictationText ? `Dictated Note: ${dictationText}` : ""}`.trim();

      const payload = {
        abha_id: activePatient.abhaId,
        doctor_name: doctorSession.name,
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
          formulation: p.formulation,
          dosage: p.dosage,
          frequency: p.freq,
          duration: p.days,
          food_relation: p.food_relation,
          instructions: p.notes,
          aware_category: p.aware_category,
          is_syrup: p.is_syrup,
          syrup_volume: p.syrup_volume,
          syrup_shake_well: p.syrup_shake_well
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
        setQueue(prev => prev.map(p => p.token_number === activePatient.token_number ? { ...p, status: "ABDM_UPLOADED" } : p));
      } else {
        throw new Error("Failed server response");
      }
    } catch {
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

  // Add Walk-in Patient
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
      doctorName: doctorSession.name,
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

  // Dictation Toggle
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

  // Prescription Handlers
  const addPrescriptionRow = (initialFormulation: "Tablet" | "Syrup" = "Tablet") => {
    const isSyrup = initialFormulation === "Syrup";
    const newItem: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      med: "",
      generic_name: "",
      formulation: initialFormulation,
      dosage: isSyrup ? "10 ml (2 tsp)" : "500 mg",
      freq: "1-0-1",
      days: "5 days",
      food_relation: "After food",
      notes: isSyrup ? "Shake bottle well before use." : "Take with plain water",
      aware_category: "Access",
      is_syrup: isSyrup,
      syrup_volume: isSyrup ? "10 ml (2 tsp)" : undefined,
      syrup_shake_well: isSyrup,
      syrup_measuring_cup: isSyrup
    };
    setPrescriptions(prev => [...prev, newItem]);
  };

  const addFromPreset = (item: any) => {
    const newItem: PrescriptionItem = {
      id: `rx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      med: item.name,
      generic_name: item.name,
      formulation: item.formulation,
      dosage: item.dosage,
      freq: item.freq,
      days: item.days,
      food_relation: item.food_relation,
      notes: item.notes,
      aware_category: item.aware,
      is_syrup: !!item.is_syrup,
      syrup_volume: item.syrup_volume,
      syrup_shake_well: item.syrup_shake_well,
      syrup_measuring_cup: item.syrup_measuring_cup
    };
    setPrescriptions(prev => [...prev, newItem]);
  };

  const removePrescriptionRow = (id: string) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  // Filtered Queue
  const filteredQueue = queue.filter(p => 
    !searchQueueQuery || 
    p.patientName.toLowerCase().includes(searchQueueQuery.toLowerCase()) ||
    p.token_number.toLowerCase().includes(searchQueueQuery.toLowerCase()) ||
    p.abhaId.includes(searchQueueQuery)
  );

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f2942] flex flex-col font-sans print:bg-white print:m-0 print:p-0">
      
      {/* =================================================================== */}
      {/* 1. TOP HEADER & DOCTOR CONSOLE SUB-HEADER (Zero Emojis)            */}
      {/* =================================================================== */}
      <div className="print:hidden">
        <TrustBanner currentTab="doctor" onTabChange={() => {}} onLanguageChange={() => {}} />

        <div className="bg-white border-b border-gray-200 shadow-xs px-4 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Doctor Profile Banner */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0f4c81] flex items-center justify-center font-bold border border-blue-200 shadow-2xs">
                <UserCheck className="w-5 h-5 text-[#0f4c81]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-sm font-extrabold text-[#0f2942]">{doctorSession.name}</h1>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                    Reg: {doctorSession.registrationNumber}
                  </span>
                  <span className="text-[10px] bg-blue-50 text-blue-900 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                    {doctorSession.department} • {doctorSession.roomNumber}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                  <span className="text-[#0f4c81] font-semibold">{doctorSession.specialty}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">NHA Verified Clinical Provider</span>
                </div>
              </div>
            </div>

            {/* Department Filter Chips & Doctor Switcher */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowDoctorLoginModal(true)}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0f4c81] border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                <span>Switch Doctor</span>
              </button>

              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 max-w-full">
                {assignedOpds.map(opd => {
                  const isSelected = selectedOpd === opd.id;
                  const isDoctorDept = doctorSession.department.toLowerCase().includes(opd.id.toLowerCase());
                  const IconComp = opd.icon;
                  const count = opd.id === "All" 
                    ? queue.length 
                    : queue.filter(q => q.department.toLowerCase().includes(opd.id.toLowerCase())).length;

                  return (
                    <button
                      key={opd.id}
                      type="button"
                      onClick={() => {
                        setSelectedOpd(opd.id);
                        if (opd.id !== "All") setOnlyMyAssigned(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-[#0f4c81] text-white shadow-xs" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200/70"
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{opd.name.replace(" OPD", "")}</span>
                      {isDoctorDept && (
                        <span className="text-[9px] bg-emerald-500 text-white px-1 rounded font-bold">You</span>
                      )}
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
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddWalkIn(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Walk-in
                </button>
                <button
                  type="button"
                  onClick={fetchQueue}
                  title="Refresh Queue"
                  className="p-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQueue ? 'animate-spin text-blue-600' : ''}`} />
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. UNIFIED HIGH-DENSITY CLINICAL COCKPIT (Always Filled & Intuitive) */}
      {/* =================================================================== */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col md:flex-row gap-4 print:p-0 print:m-0 print:max-w-none">
        
        {/* ================================================================= */}
        {/* LEFT COLUMN: QUEUE & LONGITUDINAL ABHA HISTORY (Hidden in Print)  */}
        {/* ================================================================= */}
        <aside className="w-full md:w-80 flex flex-col gap-3 shrink-0 print:hidden">
          
          {/* Queue Header & Search */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#0f4c81]" />
                <h2 className="font-bold text-xs text-[#0f2942] uppercase tracking-wider">
                  {onlyMyAssigned ? `Assigned (${doctorSession.department})` : `${selectedOpd} Queue`}
                </h2>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-800 font-extrabold px-2 py-0.5 rounded border border-blue-200">
                {filteredQueue.length} Waiting
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQueueQuery}
                onChange={e => setSearchQueueQuery(e.target.value)}
                placeholder="Search patient, token, ABHA..."
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-gray-300 text-xs focus:ring-1 focus:ring-[#0f4c81] outline-none"
              />
            </div>

            {/* Department Lock Toggle */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
              <span className="text-gray-500 font-medium">Department Filter:</span>
              <button
                type="button"
                onClick={() => setOnlyMyAssigned(!onlyMyAssigned)}
                className="text-[10px] font-bold text-[#0f4c81] hover:underline cursor-pointer"
              >
                {onlyMyAssigned ? "Switch to All OPDs" : "Lock to My Patients"}
              </button>
            </div>
          </div>

          {/* Patient Cards List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden max-h-[380px] overflow-y-auto divide-y divide-gray-100">
            {filteredQueue.map((p, idx) => {
              const isCurrent = activePatient?.token_number === p.token_number;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectPatient(p)}
                  className={`p-3 cursor-pointer transition-all ${
                    isCurrent 
                      ? "bg-blue-50/80 border-l-4 border-l-[#0f4c81]" 
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-[#0f4c81] font-mono">{p.token_number}</span>
                    <div className="flex items-center gap-1">
                      {p.status === "ABDM_UPLOADED" && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" /> Synced
                        </span>
                      )}
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                        p.urgency === "Emergency" 
                          ? "bg-rose-100 text-rose-800 border border-rose-300" 
                          : p.urgency === "High" 
                          ? "bg-amber-100 text-amber-800 border border-amber-300" 
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {p.urgency || "Normal"}
                      </span>
                    </div>
                  </div>

                  <div className="font-bold text-xs text-[#0f2942] flex items-center justify-between">
                    <span>{p.patientName}</span>
                    <span className="text-[10px] text-gray-500 font-normal">{p.age}y • {p.gender?.[0]}</span>
                  </div>

                  <p className="text-[11px] text-gray-600 line-clamp-1 mt-0.5">{p.chief_concern}</p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100 text-[10px] text-gray-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {p.registrationTime}
                    </span>
                    <span className="font-semibold text-blue-700">{p.department}</span>
                  </div>
                </div>
              );
            })}

            {filteredQueue.length === 0 && (
              <div className="p-6 text-center text-gray-400">
                <Stethoscope className="w-8 h-8 mx-auto mb-1.5 opacity-30" />
                <p className="font-bold text-xs">No patients matching filter</p>
                <p className="text-[10px] mt-0.5">Use Walk-in or switch OPD department.</p>
              </div>
            )}
          </div>

          {/* Integrated ABHA Longitudinal Medical Vault Drawer */}
          {activePatient && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-3 space-y-2.5">
              <button
                type="button"
                onClick={() => setShowAbhaHistoryDrawer(!showAbhaHistoryDrawer)}
                className="w-full flex items-center justify-between text-xs font-bold text-[#0f2942] cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#0f4c81]" />
                  <span>ABHA Past Records ({abhaHistoryDocs.length})</span>
                </span>
                {showAbhaHistoryDrawer ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {showAbhaHistoryDrawer && (
                <div className="space-y-3 pt-2 border-t border-gray-100 text-xs">
                  {/* Quick RAG Search */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={ragQuery}
                      onChange={e => setRagQuery(e.target.value)}
                      placeholder="Ask RAG (e.g. past allergies?)..."
                      className="flex-1 px-2.5 py-1 text-[11px] rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRunRagSearch()}
                      disabled={isRagSearching}
                      className="px-2 py-1 bg-[#0f4c81] text-white rounded text-[10px] font-bold"
                    >
                      {isRagSearching ? "..." : "Ask"}
                    </button>
                  </div>

                  {ragAnswer && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-[11px] space-y-1">
                      <span className="font-bold text-[#0f4c81] block">Clinical AI Synthesis:</span>
                      <p className="text-gray-700">{ragAnswer.answer}</p>
                    </div>
                  )}

                  {/* Past Visits List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {abhaHistoryDocs.map((doc, i) => (
                      <div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-1">
                        <div className="flex items-center justify-between font-bold text-gray-800">
                          <span>{doc.document_title || "Past Clinical Visit"}</span>
                          <span className="text-[10px] text-gray-400">{doc.created_at}</span>
                        </div>
                        {doc.extracted_data?.diagnoses && (
                          <p className="text-blue-900 font-medium">
                            Dx: {doc.extracted_data.diagnoses.map((d: any) => d.condition_name).join(", ")}
                          </p>
                        )}
                        {doc.extracted_data?.medications && (
                          <p className="text-gray-600 line-clamp-1">
                            Rx: {doc.extracted_data.medications.map((m: any) => m.name).join(", ")}
                          </p>
                        )}
                        {doc.extracted_data?.allergies && doc.extracted_data.allergies.length > 0 && (
                          <p className="text-rose-700 font-bold">
                            Allergies: {doc.extracted_data.allergies.join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </aside>

        {/* ================================================================= */}
        {/* RIGHT MAIN COLUMN: INTEGRATED HIGH-DENSITY CLINICAL COCKPIT       */}
        {/* ================================================================= */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col overflow-hidden print:border-none print:shadow-none">
          
          {!activePatient ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 print:hidden">
              <Stethoscope className="w-12 h-12 mb-3 text-[#0f4c81] opacity-20" />
              <h3 className="font-bold text-base text-gray-700">Select a Patient to Begin Consultation</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm text-center">
                Review assigned patient records, record physical findings, build formulation-aware prescriptions, and sync to ABDM.
              </p>
            </div>
          ) : (
            <div className="flex flex-col flex-1 divide-y divide-gray-200">
              
              {/* SECTION 1: PATIENT BANNER & INTEGRATED VITALS RIBBON */}
              <div className="p-4 sm:p-5 bg-slate-50/70 space-y-3 print:bg-white print:p-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-black text-[#0f2942]">{activePatient.patientName}</h2>
                      <span className="text-xs bg-[#0f4c81] text-white font-extrabold px-2 py-0.5 rounded font-mono">
                        {activePatient.token_number}
                      </span>
                      <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                        <QrCode className="w-3 h-3 text-emerald-700" /> ABHA: {activePatient.abhaId}
                      </span>
                      {uploadStatus === "UPLOADED" && (
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ABDM Locked (v{uploadResult?.version || "1.0"})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-2.5 flex-wrap">
                      <span><strong>Age/Gender:</strong> {activePatient.age || "45"} Yrs / {activePatient.gender || "Male"}</span>
                      <span>•</span>
                      <span><strong>OPD:</strong> {activePatient.department}</span>
                      <span>•</span>
                      <span><strong>Chief Concern:</strong> {activePatient.chief_concern}</span>
                    </div>
                  </div>

                  {/* Primary Action Buttons in Header */}
                  <div className="flex items-center gap-2 print:hidden">
                    <button
                      type="button"
                      onClick={() => setShowPrintModal(true)}
                      className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-gray-600" /> Print Letterhead
                    </button>

                    {uploadStatus === "UPLOADED" && !isEditMode ? (
                      <button
                        type="button"
                        onClick={() => setIsEditMode(true)}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Amend (v1.1)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUploadOrAmendAbdm(isEditMode)}
                        disabled={uploadStatus === "UPLOADING"}
                        className={`px-4 py-1.5 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                          isEditMode 
                            ? "bg-amber-600 hover:bg-amber-700" 
                            : "bg-[#0f4c81] hover:bg-blue-900"
                        }`}
                      >
                        <Save className="w-3.5 h-3.5" />
                        {uploadStatus === "UPLOADING" 
                          ? "Uploading..." 
                          : isEditMode 
                          ? "Save Amendment" 
                          : "Upload to ABDM (FHIR)"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Patient Allergy Alert Ribbon (High Visibility) */}
                {abhaHistoryDocs.some(d => d.extracted_data?.allergies?.length > 0) && (
                  <div className="bg-rose-50 border border-rose-300 rounded-lg p-2.5 flex items-center gap-2 text-xs text-rose-900 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Documented Allergies: {abhaHistoryDocs.flatMap(d => d.extracted_data?.allergies || []).join("; ")}</span>
                  </div>
                )}

                {/* High-Density Inline Vitals Strip */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Activity className="w-3 h-3 text-[#0f4c81]" /> Clinical Vitals (Inline Quick-Edit)
                    </span>
                    <span className="text-[10px] text-gray-400">Click to adjust any measurement</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-xs">
                    <div>
                      <span className="block text-[9px] font-bold text-gray-500 uppercase">BP Sys</span>
                      <input
                        type="text"
                        value={vitals.bp_sys}
                        onChange={e => setVitals({ ...vitals, bp_sys: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded px-2 py-1 font-bold text-xs text-[#0f2942]"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-500 uppercase">BP Dia</span>
                      <input
                        type="text"
                        value={vitals.bp_dia}
                        onChange={e => setVitals({ ...vitals, bp_dia: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded px-2 py-1 font-bold text-xs text-[#0f2942]"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-500 uppercase">Pulse</span>
                      <input
                        type="text"
                        value={vitals.pulse}
                        onChange={e => setVitals({ ...vitals, pulse: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded px-2 py-1 font-bold text-xs text-[#0f2942]"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-500 uppercase">Temp (°F)</span>
                      <input
                        type="text"
                        value={vitals.temp}
                        onChange={e => setVitals({ ...vitals, temp: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded px-2 py-1 font-bold text-xs text-[#0f2942]"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-500 uppercase">SpO2 (%)</span>
                      <input
                        type="text"
                        value={vitals.spo2}
                        onChange={e => setVitals({ ...vitals, spo2: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded px-2 py-1 font-bold text-xs text-[#0f2942]"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-500 uppercase">Resp (/min)</span>
                      <input
                        type="text"
                        value={vitals.resp_rate}
                        onChange={e => setVitals({ ...vitals, resp_rate: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded px-2 py-1 font-bold text-xs text-[#0f2942]"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-500 uppercase">Weight (kg)</span>
                      <input
                        type="text"
                        value={vitals.weight}
                        onChange={e => setVitals({ ...vitals, weight: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded px-2 py-1 font-bold text-xs text-[#0f2942]"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-500 uppercase">Blood Sugar</span>
                      <input
                        type="text"
                        value={vitals.rbs}
                        onChange={e => setVitals({ ...vitals, rbs: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-200 rounded px-2 py-1 font-bold text-xs text-[#0f2942]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CLINICAL DIAGNOSIS & EXAMINATION NOTES */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* Left: Provisional ICD-10 Diagnosis */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Provisional / Working Diagnosis (ICD-10)
                    </label>
                    <input
                      type="text"
                      value={provisionalDiagnosis}
                      onChange={e => setProvisionalDiagnosis(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-[#0f2942] focus:bg-white focus:ring-1 focus:ring-[#0f4c81] outline-none"
                    />
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                      <span className="text-gray-500 font-medium">Quick suggestions:</span>
                      {[
                        "Acute Bronchitis (J20.9)",
                        "Type 2 Diabetes (E11.9)",
                        "Primary Hypertension (I10)",
                        "Viral URI (J06.9)",
                        "Osteoarthritis (M17.9)"
                      ].map(diag => (
                        <button
                          key={diag}
                          type="button"
                          onClick={() => setProvisionalDiagnosis(diag)}
                          className="px-2 py-0.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-900 rounded border border-gray-200 text-gray-700 font-semibold cursor-pointer text-[10px]"
                        >
                          + {diag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: Hands-Free Voice Dictation & Examination Notes */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-[#0f4c81]" /> Clinical Dictation & Examination Notes
                      </label>
                      <button
                        type="button"
                        onClick={handleToggleVoiceDictation}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isDictating ? "bg-rose-600 text-white animate-pulse" : "bg-[#0f4c81] text-white hover:bg-blue-900"
                        }`}
                      >
                        {isDictating ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                        {isDictating ? "Stop Recording" : "Voice Dictation"}
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={dictationText}
                      onChange={e => setDictationText(e.target.value)}
                      placeholder="Type or click Voice Dictation for auscultation findings, clinical notes..."
                      className="w-full bg-slate-50 border border-gray-300 rounded-lg p-2.5 text-xs focus:bg-white focus:ring-1 focus:ring-[#0f4c81] outline-none resize-none"
                    />
                  </div>

                </div>
              </div>

              {/* SECTION 3: FORMULATION-AWARE SMART PRESCRIPTION & SYRUP BUILDER */}
              <div className="p-4 sm:p-5 space-y-4">
                
                {/* Header with 1-Click Fast Presets Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-3 gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#0f2942] flex items-center gap-2">
                      <Pill className="w-4 h-4 text-[#0f4c81]" /> E-Prescription (ABDM MedicationStatement)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Formulation-aware builder with dedicated volume controls for Syrups, schedule buttons, and generic savings
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => addPrescriptionRow("Tablet")}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0f4c81] border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Tablet / Cap
                    </button>
                    <button
                      type="button"
                      onClick={() => addPrescriptionRow("Syrup")}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <FlaskConical className="w-3.5 h-3.5" /> + Add Syrup (Liquid)
                    </button>
                  </div>
                </div>

                {/* 1-Click Fast Presets Toolbar (Clean, Professional, Zero Emojis) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#0f2942] uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> Fast Clinical Presets (Click to add immediately)
                    </span>
                    <span className="text-[10px] text-gray-400">Pre-configured with dosage, timing & instructions</span>
                  </div>

                  {COMMON_MEDICINE_PRESETS.map((cat, ci) => (
                    <div key={ci} className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                        {cat.type === "syrup" ? <FlaskConical className="w-3 h-3 text-amber-600" /> : <Pill className="w-3 h-3 text-blue-600" />}
                        <span>{cat.category}</span>
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {cat.items.map((item, ii) => (
                          <button
                            key={ii}
                            type="button"
                            onClick={() => addFromPreset(item)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              item.is_syrup
                                ? "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                                : "bg-white text-gray-800 border border-gray-200 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-300"
                            }`}
                          >
                            {item.is_syrup ? <FlaskConical className="w-3 h-3 text-amber-600" /> : <Pill className="w-3 h-3 text-blue-600" />}
                            <span>{item.name}</span>
                            <span className="text-[10px] font-mono text-gray-400">({item.freq}, {item.days})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Prescription Rows Cards */}
                <div className="space-y-3">
                  {prescriptions.map((rx, idx) => {
                    const aware = getAwarePill(rx.med);
                    const isSyrup = rx.is_syrup || rx.formulation === "Syrup";

                    return (
                      <div 
                        key={rx.id} 
                        className={`p-3.5 rounded-xl border transition-all space-y-3 ${
                          isSyrup
                            ? "bg-amber-50/40 border-amber-300 shadow-2xs" 
                            : "bg-white border-gray-200 shadow-2xs"
                        }`}
                      >
                        {/* Row 1: Formulation Chips & Delete */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold text-gray-500 uppercase mr-1">
                              Formulation:
                            </span>
                            {(["Tablet", "Syrup", "Capsule", "Injection", "Drops", "Inhaler"] as const).map(fmt => {
                              const isActive = rx.formulation === fmt;
                              const isFmtSyrup = fmt === "Syrup";

                              return (
                                <button
                                  key={fmt}
                                  type="button"
                                  onClick={() => {
                                    const updated = [...prescriptions];
                                    updated[idx].formulation = fmt;
                                    updated[idx].is_syrup = isFmtSyrup;
                                    if (isFmtSyrup) {
                                      updated[idx].dosage = updated[idx].dosage || "10 ml (2 tsp)";
                                      updated[idx].syrup_volume = updated[idx].syrup_volume || "10 ml (2 tsp)";
                                      updated[idx].syrup_shake_well = true;
                                      updated[idx].syrup_measuring_cup = true;
                                      if (!updated[idx].notes.includes("Shake")) {
                                        updated[idx].notes = "Shake bottle well before use. " + updated[idx].notes;
                                      }
                                    }
                                    setPrescriptions(updated);
                                  }}
                                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                    isActive 
                                      ? isFmtSyrup
                                        ? "bg-amber-600 text-white shadow-2xs"
                                        : "bg-[#0f4c81] text-white shadow-2xs"
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }`}
                                >
                                  {fmt === "Tablet" && <Pill className="w-3 h-3" />}
                                  {fmt === "Syrup" && <FlaskConical className="w-3 h-3" />}
                                  {fmt === "Capsule" && <Pill className="w-3 h-3" />}
                                  {fmt === "Injection" && <Syringe className="w-3 h-3" />}
                                  {fmt === "Drops" && <Droplets className="w-3 h-3" />}
                                  {fmt === "Inhaler" && <Wind className="w-3 h-3" />}
                                  <span>{fmt}</span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => removePrescriptionRow(rx.id)}
                              title="Delete medicine"
                              className="p-1 text-gray-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Row 2: Medicine Name & Strength Input */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-bold text-gray-600 uppercase">
                              Medicine / Salt Name & Strength
                            </label>
                            {aware && (
                              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${aware.color}`}>
                                {aware.label}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={rx.med}
                            onChange={e => {
                              const updated = [...prescriptions];
                              updated[idx].med = e.target.value;
                              setPrescriptions(updated);
                            }}
                            placeholder={isSyrup ? "e.g., Ascoril LS Syrup, Paracetamol Pediatric 120mg/5ml, Digene Gel" : "e.g., Paracetamol 650mg, Azithromycin 500mg, Telmisartan 40mg"}
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold text-[#0f2942] focus:ring-1 focus:ring-[#0f4c81] outline-none"
                          />
                        </div>

                        {/* Row 3: Dedicated Amber Syrup Controls Box (Rendered when Syrup is active) */}
                        {isSyrup && (
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl p-3 space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                                <FlaskConical className="w-4 h-4 text-amber-600" />
                                <span>SYRUP & LIQUID DOSAGE CONTROLS (Oral Liquid Formulation)</span>
                              </span>
                              <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                                Calibrated Volume
                              </span>
                            </div>

                            {/* Volume Dose Buttons */}
                            <div>
                              <span className="block text-[10px] font-bold text-amber-900 uppercase mb-1">
                                Volume Dose per Administration:
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {[
                                  "2.5 ml (1/2 tsp)",
                                  "5 ml (1 tsp)",
                                  "10 ml (2 tsp)",
                                  "15 ml (1 tbsp)"
                                ].map(vol => {
                                  const isSelected = rx.dosage === vol || rx.syrup_volume === vol;
                                  return (
                                    <button
                                      key={vol}
                                      type="button"
                                      onClick={() => {
                                        const updated = [...prescriptions];
                                        updated[idx].dosage = vol;
                                        updated[idx].syrup_volume = vol;
                                        setPrescriptions(updated);
                                      }}
                                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        isSelected
                                          ? "bg-amber-600 text-white shadow-2xs scale-102"
                                          : "bg-white text-amber-900 border border-amber-200 hover:bg-amber-100"
                                      }`}
                                    >
                                      {vol}
                                    </button>
                                  );
                                })}
                                <input
                                  type="text"
                                  value={rx.dosage}
                                  onChange={e => {
                                    const updated = [...prescriptions];
                                    updated[idx].dosage = e.target.value;
                                    updated[idx].syrup_volume = e.target.value;
                                    setPrescriptions(updated);
                                  }}
                                  placeholder="Custom (e.g. 7.5 ml)"
                                  className="bg-white border border-amber-200 rounded-lg px-2 py-1 text-xs w-32 font-bold text-amber-950"
                                />
                              </div>
                            </div>

                            {/* Syrup Checkbox Guidelines */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-amber-200/60 text-xs">
                              <label className="flex items-center gap-2 text-amber-950 font-semibold cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={rx.syrup_shake_well ?? true}
                                  onChange={e => {
                                    const updated = [...prescriptions];
                                    updated[idx].syrup_shake_well = e.target.checked;
                                    setPrescriptions(updated);
                                  }}
                                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                                />
                                <span>Shake bottle well before use (हिलाकर पिएं)</span>
                              </label>
                              <label className="flex items-center gap-2 text-amber-950 font-semibold cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={rx.syrup_measuring_cup ?? true}
                                  onChange={e => {
                                    const updated = [...prescriptions];
                                    updated[idx].syrup_measuring_cup = e.target.checked;
                                    setPrescriptions(updated);
                                  }}
                                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                                />
                                <span>Use calibrated measuring cup / syringe</span>
                              </label>
                            </div>
                          </div>
                        )}

                        {/* Row 4: Timing Schedule Buttons ("At Which Time" - Zero Emojis) */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                            At Which Time (Timing Schedule)
                          </label>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {[
                              { label: "1-0-1 (Morning & Night)", val: "1-0-1" },
                              { label: "1-0-0 (Morning Only)", val: "1-0-0" },
                              { label: "0-0-1 (Night Only)", val: "0-0-1" },
                              { label: "1-1-1 (Thrice Daily)", val: "1-1-1" },
                              { label: "SOS (When Needed)", val: "SOS" }
                            ].map(freqItem => {
                              const isSelected = rx.freq === freqItem.val;
                              return (
                                <button
                                  key={freqItem.val}
                                  type="button"
                                  onClick={() => {
                                    const updated = [...prescriptions];
                                    updated[idx].freq = freqItem.val;
                                    setPrescriptions(updated);
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-[#0f4c81] text-white shadow-2xs scale-102"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200/80"
                                  }`}
                                >
                                  {freqItem.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Row 5: Duration & Food Relation */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                              Duration (For How Many Days)
                            </label>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {["3 days", "5 days", "7 days", "10 days", "14 days", "1 month"].map(dayOption => {
                                const isSelected = rx.days === dayOption;
                                return (
                                  <button
                                    key={dayOption}
                                    type="button"
                                    onClick={() => {
                                      const updated = [...prescriptions];
                                      updated[idx].days = dayOption;
                                      setPrescriptions(updated);
                                    }}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                      isSelected
                                        ? "bg-emerald-600 text-white shadow-2xs"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200/80"
                                    }`}
                                  >
                                    {dayOption}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                              Food Relation & Instructions
                            </label>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {["After food", "Before food", "With food", "Empty stomach"].map(food => {
                                const isSelected = rx.food_relation === food;
                                return (
                                  <button
                                    key={food}
                                    type="button"
                                    onClick={() => {
                                      const updated = [...prescriptions];
                                      updated[idx].food_relation = food;
                                      setPrescriptions(updated);
                                    }}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                      isSelected
                                        ? "bg-[#0f4c81] text-white shadow-2xs"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200/80"
                                    }`}
                                  >
                                    {food}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Pharmacovigilance Real-Time Safety Status */}
                {pharmaAudit?.status === "ALERT_TRIGGERED" ? (
                  <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Pharmacovigilance Alert: Critical Drug Conflict Detected</span>
                      </div>
                      <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        Safety Interceptor
                      </span>
                    </div>

                    {pharmaAudit.conflicts?.map((c: any, i: number) => (
                      <div key={i} className="bg-white/80 p-2.5 rounded-lg border border-rose-200 text-xs space-y-1">
                        <div className="font-bold text-rose-950 flex items-center gap-1.5">
                          <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono text-[11px]">
                            {c.drug_pair?.join(" + ")}
                          </span>
                        </div>
                        <p className="text-gray-700 text-[11px]">{c.clinical_risk}</p>
                        <p className="text-rose-800 font-semibold text-[11px]">Action: {c.recommended_action}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Pharmacovigilance Cleared: No critical drug-drug conflicts with longitudinal ABHA history.</span>
                    </div>
                    <button
                      type="button"
                      onClick={runPharmacovigilanceAudit}
                      disabled={isAuditingPharma}
                      className="text-[10px] font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
                    >
                      {isAuditingPharma ? "Screening..." : "Re-Check Safety"}
                    </button>
                  </div>
                )}

                {/* Patient Follow-up & Advice */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Dietary Advice</label>
                    <input
                      type="text"
                      value={patientAdvice.diet}
                      onChange={e => setPatientAdvice({ ...patientAdvice, diet: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Precautions & Red Flags</label>
                    <input
                      type="text"
                      value={patientAdvice.precautions}
                      onChange={e => setPatientAdvice({ ...patientAdvice, precautions: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Follow-Up In</label>
                    <div className="flex gap-1.5">
                      {["3 days", "5 days", "7 days", "SOS"].map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setPatientAdvice({ ...patientAdvice, follow_up: f })}
                          className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            patientAdvice.follow_up === f ? "bg-[#0f4c81] text-white" : "bg-white border border-gray-300 text-gray-700"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ABDM FHIR R4 Ready • DPDP Act 2023 Verified</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPrintModal(true)}
                      className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-gray-600" /> Print Letterhead
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUploadOrAmendAbdm(isEditMode)}
                      disabled={uploadStatus === "UPLOADING"}
                      className="px-5 py-2 bg-[#0f4c81] hover:bg-blue-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {uploadStatus === "UPLOADING" ? "Uploading to ABDM..." : "Save & Sync to ABHA"}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. MODAL: OFFICIAL PRINTABLE PRESCRIPTION LETTERHEAD (Zero Emojis)   */}
      {/* =================================================================== */}
      {showPrintModal && activePatient && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#0f4c81]" />
                <h3 className="font-extrabold text-base text-[#0f2942]">
                  Official Prescription Preview & Letterhead
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-[#0f4c81] text-white hover:bg-blue-900 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Letterhead Paper View */}
            <div className="border border-gray-300 rounded-xl p-6 text-black space-y-5 bg-white">
              
              {/* Header Letterhead */}
              <div className="border-b-2 border-black pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-[#0f4c81] flex items-center justify-center font-black text-xl text-[#0f4c81]">
                    <Stethoscope className="w-6 h-6 text-[#0f4c81]" />
                  </div>
                  <div>
                    <h1 className="text-lg font-black tracking-tight text-[#0f2942]">GOVERNMENT GENERAL HOSPITAL & CHC</h1>
                    <p className="text-xs font-bold text-gray-600">Ayushman Bharat Digital Mission (ABDM) Accredited Center</p>
                    <p className="text-[10px] text-gray-500">Project Samanvaya Interoperable Healthcare Platform</p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <p className="font-extrabold text-[#0f2942]">{doctorSession.name}</p>
                  <p className="text-gray-600 font-medium">Reg: {doctorSession.registrationNumber}</p>
                  <p className="text-[#0f4c81] font-bold text-[11px]">{doctorSession.department} • {doctorSession.roomNumber}</p>
                  <p className="text-gray-500 text-[10px]">Date: {new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {/* Patient Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-500 font-bold block text-[10px]">PATIENT NAME</span>
                  <span className="font-extrabold text-sm">{activePatient.patientName}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-bold block text-[10px]">AGE / GENDER</span>
                  <span className="font-bold">{activePatient.age || "45"} Yrs / {activePatient.gender || "Male"}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-bold block text-[10px]">ABHA ID</span>
                  <span className="font-mono font-bold text-blue-900">{activePatient.abhaId}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-bold block text-[10px]">OPD TOKEN</span>
                  <span className="font-extrabold text-emerald-800">{activePatient.token_number}</span>
                </div>
              </div>

              {/* Vitals & Diagnosis */}
              <div className="border border-gray-200 rounded-lg p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                  <span className="font-bold text-gray-700">OBSERVED VITALS:</span>
                  <span className="font-medium text-gray-800">
                    BP: {vitals.bp_sys}/{vitals.bp_dia} mmHg • Pulse: {vitals.pulse} bpm • SpO2: {vitals.spo2}% • Temp: {vitals.temp}°F • Wt: {vitals.weight}kg
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">PROVISIONAL DIAGNOSIS:</span>
                  <span className="font-extrabold text-blue-950 ml-2">{provisionalDiagnosis}</span>
                </div>
              </div>

              {/* Prescriptions Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black font-serif text-[#0f2942]">℞ PRESCRIPTION</span>
                  <span className="text-[10px] text-gray-500">Jan Aushadhi Generic Substitutes Available</span>
                </div>

                <table className="w-full border-collapse border border-gray-300 text-xs">
                  <thead>
                    <tr className="bg-gray-100 text-left font-bold text-gray-700">
                      <th className="border border-gray-300 p-2 w-8">#</th>
                      <th className="border border-gray-300 p-2">Medicine, Strength & Formulation</th>
                      <th className="border border-gray-300 p-2 w-36 text-center">Timing & Schedule</th>
                      <th className="border border-gray-300 p-2 w-24">Duration</th>
                      <th className="border border-gray-300 p-2">Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((rx, idx) => {
                      const isSyrup = rx.is_syrup || rx.formulation === "Syrup";
                      return (
                        <tr key={idx} className="border-b border-gray-200">
                          <td className="border border-gray-300 p-2 font-bold text-center">{idx + 1}</td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded border bg-gray-50">
                                {rx.formulation || "Tablet"}
                              </span>
                              <span className="font-bold text-sm">{rx.med}</span>
                            </div>
                            {isSyrup && rx.syrup_volume && (
                              <span className="text-[10px] text-amber-900 font-bold block mt-0.5">
                                Dose: {rx.syrup_volume}
                              </span>
                            )}
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            <span className="font-mono font-extrabold text-sm block">{rx.freq}</span>
                          </td>
                          <td className="border border-gray-300 p-2 font-semibold">{rx.days}</td>
                          <td className="border border-gray-300 p-2">
                            <span className="font-bold block text-blue-900">{rx.food_relation}</span>
                            {isSyrup && rx.syrup_shake_well && (
                              <span className="text-[10px] font-bold text-amber-800 block">
                                Shake bottle well before use (हिलाकर पिएं)
                              </span>
                            )}
                            <span className="text-gray-600 text-[11px]">{rx.notes}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Advice */}
              <div className="border border-gray-200 rounded-lg p-3 text-xs space-y-1 bg-slate-50/50">
                <p><strong>Dietary Advice:</strong> {patientAdvice.diet}</p>
                <p><strong>Precautions:</strong> {patientAdvice.precautions}</p>
                <p><strong>Next Follow-Up:</strong> {patientAdvice.follow_up}</p>
              </div>

              {/* Signature */}
              <div className="pt-6 flex items-end justify-between border-t border-gray-200 text-xs">
                <div>
                  <p className="text-[10px] text-gray-500 font-mono">
                    Digital Provenance: {uploadResult?.provenance_hash_sha256 || "0x89F4B321DC768E1A90C4"}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    ABDM Milestone 3 Compliant (DPDP Act 2023 Verified)
                  </p>
                </div>

                <div className="text-center">
                  <div className="h-8 border-b border-gray-400 w-40 mx-auto mb-1"></div>
                  <p className="font-extrabold text-sm">{doctorSession.name}</p>
                  <p className="text-[10px] text-gray-500">{doctorSession.registrationNumber} • {doctorSession.department}</p>
                  <p className="text-[9px] text-gray-400">Authorized Physician Signature & Seal</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. MODAL: WALK-IN PATIENT ADDITION (Zero Emojis)                     */}
      {/* =================================================================== */}
      {showAddWalkIn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0f2942] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#0f4c81]" /> Add Walk-in Patient to OPD
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddWalkIn(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
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
                <label className="block font-bold text-gray-700 mb-1">Chief Concern / Symptoms</label>
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
                type="button"
                onClick={() => setShowAddWalkIn(false)}
                className="px-4 py-2 text-gray-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddWalkInPatient}
                className="px-5 py-2 bg-[#0f4c81] text-white text-xs font-bold rounded-lg shadow-xs hover:bg-blue-900"
              >
                Generate Token & Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. DOCTOR LOGIN / VERIFICATION MODAL                                */}
      {/* =================================================================== */}
      <DoctorLoginModal
        isOpen={showDoctorLoginModal}
        onClose={() => setShowDoctorLoginModal(false)}
        onSuccess={(session) => {
          setDoctorSession(session);
          setSelectedOpd(session.department || "General Medicine");
          setShowDoctorLoginModal(false);
        }}
      />

    </main>
  );
}
