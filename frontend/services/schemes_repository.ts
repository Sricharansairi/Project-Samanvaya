/**
 * Project Samanvaya - Dynamic All-India Healthcare Schemes Repository
 * Declarative rule-based schema covering Central Govt programs and all 36 States/UTs.
 */

export interface DocumentRequirement {
  id: string;
  name: string;
  category: "Identity" | "Income_Proof" | "Caste_Category" | "Clinical" | "Residency";
  isMandatory: boolean;
  helpText: string;
}

export interface SchemeDefinition {
  id: string;
  name: string;
  shortCode: string;
  authority: "Central" | "State";
  stateCode: string; // "CENTRAL" or state abbreviation: "AP", "MH", "DL", "KA", "TN", "KL", "WB", "RJ", etc.
  stateName: string;
  coverageAmount: number; // in INR
  coverageDisplay: string;
  category: "universal" | "bpl_ration" | "income_tested" | "disease_specific" | "demographic" | "employment";
  
  // Declarative eligibility predicate criteria
  eligibility: {
    minAge?: number;
    maxAge?: number;
    gender?: "Male" | "Female" | "Any";
    maxFamilyIncome?: number; // annual in INR
    allowedRationCards?: string[]; // ["AAY", "PHH", "BPL", "WHITE", "YELLOW", "ORANGE", "ANY", "NONE"]
    allowedCategories?: string[]; // ["SC", "ST", "OBC", "EWS", "GENERAL", "ANY"]
    allowedConditions?: string[]; // ["Cardiology", "Oncology", "Nephrology/Dialysis", "Orthopedics", "Maternity", "Critical_Care", "Rare_Disease", "TB", "ANY"]
    employmentTypes?: string[]; // ["Unorganized", "Organized", "Central_Govt", "State_Govt", "ANY"]
    requiresSenior70?: boolean;
    supportsNationalPortability?: boolean;
  };

  benefits: {
    cashlessInpatient: boolean;
    outpatientCovered: boolean;
    preHospitalizationDays: number;
    postHospitalizationDays: number;
    empaneledNetwork: string; // e.g. "Public & Private Empaneled Hospitals Nationwide"
    keyProcedures: string[];
    specialPerks?: string;
  };

  requiredDocuments: {
    mandatory: DocumentRequirement[];
    conditional: DocumentRequirement[];
    alternatives: Record<string, string>; // e.g. "If Income Certificate unavailable, BPL Ration Card or Tehsildar endorsement accepted"
  };

  applicationProcess: {
    channel: "Hospital Arogya Mitra Desk" | "Common Service Center (CSC)" | "Online Portal" | "Mera PMJAY Kiosk" | "Multiple";
    portalUrl: string;
    timeline: string;
    steps: string[];
  };

  claimProcess: {
    mode: "100% Cashless via Hospital Helpdesk" | "Reimbursement" | "Direct Benefit Transfer";
    approvalSLA: string; // e.g. "2 to 4 hours"
    steps: string[];
  };

  helpline: string;
  officialPortal: string;
}

export const ALL_INDIA_SCHEMES: SchemeDefinition[] = [
  // ==========================================
  // CENTRAL GOVERNMENT SCHEMES
  // ==========================================
  {
    id: "central-pmjay",
    name: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB PM-JAY)",
    shortCode: "PM-JAY",
    authority: "Central",
    stateCode: "CENTRAL",
    stateName: "National / All States",
    coverageAmount: 500000,
    coverageDisplay: "₹5,00,000 / family / year",
    category: "bpl_ration",
    eligibility: {
      gender: "Any",
      allowedRationCards: ["AAY", "PHH", "BPL", "WHITE", "YELLOW"],
      supportsNationalPortability: true,
      allowedConditions: ["ANY"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: false,
      preHospitalizationDays: 3,
      postHospitalizationDays: 15,
      empaneledNetwork: "28,000+ Empaneled Public & Private Hospitals Nationwide",
      keyProcedures: ["Cardiac surgeries", "Knee replacements", "Chemotherapy", "Neuro-trauma", "ICU care"],
      specialPerks: "100% National Portability: Treatment eligible in any state across India."
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-aadhaar", name: "Aadhaar Card (or biometric verification)", category: "Identity", isMandatory: true, helpText: "Used for instant e-KYC on the NHA portal." },
        { id: "doc-ration", name: "NFSA Ration Card / Family ID", category: "Income_Proof", isMandatory: true, helpText: "Antyodaya (AAY) or Priority Household (PHH) card containing member name." }
      ],
      conditional: [
        { id: "doc-pmjay-letter", name: "PM-JAY Family Entitlement Letter", category: "Identity", isMandatory: false, helpText: "Letter from PM with QR code (if received previously)." }
      ],
      alternatives: {
        "doc-ration": "If physical ration card is missing, electronic e-Ration slip or SECC HHID slip from Gram Panchayat is accepted."
      }
    },
    applicationProcess: {
      channel: "Multiple",
      portalUrl: "https://beneficiary.nha.gov.in",
      timeline: "Instant to 24 Hours",
      steps: [
        "Check name eligibility on beneficiary.nha.gov.in or visit Hospital Arogya Mitra desk.",
        "Provide Aadhaar number for OTP or biometric fingerprint verification.",
        "Hospital staff verifies family matching in NFSA/SECC database.",
        "Instant Ayushman Card (PVC/Digital PDF) issued on the spot."
      ]
    },
    claimProcess: {
      mode: "100% Cashless via Hospital Helpdesk",
      approvalSLA: "2 to 4 Hours",
      steps: [
        "Present Ayushman Card or Aadhaar at the Hospital Arogya Mitra Helpdesk upon admission.",
        "Arogya Mitra generates Pre-Authorization request in the Transaction Management System (TMS).",
        "State Health Agency (SHA) medical team reviews clinical reports and issues Pre-Auth approval.",
        "Patient undergoes surgery/treatment with zero cash deposit or upfront payments.",
        "At discharge, 15 days of take-home medications and diet summary provided at ₹0 cost."
      ]
    },
    helpline: "14555 / 1800-111-565",
    officialPortal: "https://nha.gov.in"
  },

  {
    id: "central-vay-vandana",
    name: "Ayushman Bharat Vay Vandana Yojana (Senior Citizens 70+)",
    shortCode: "VAY-VANDANA",
    authority: "Central",
    stateCode: "CENTRAL",
    stateName: "National / All States",
    coverageAmount: 500000,
    coverageDisplay: "₹5,00,000 exclusive top-up / year",
    category: "demographic",
    eligibility: {
      minAge: 70,
      gender: "Any",
      requiresSenior70: true,
      allowedRationCards: ["ANY"],
      supportsNationalPortability: true,
      allowedConditions: ["ANY"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: false,
      preHospitalizationDays: 3,
      postHospitalizationDays: 15,
      empaneledNetwork: "All PM-JAY Empaneled Hospitals Nationwide",
      keyProcedures: ["Geriatric inpatient care", "Cardiology", "Joint replacement", "Stroke management", "Oncology"],
      specialPerks: "Universal Coverage: No income ceiling or ration card requirement. Every Indian citizen aged 70+ is eligible."
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-aadhaar-senior", name: "Aadhaar Card (Proof of Age >= 70)", category: "Identity", isMandatory: true, helpText: "Must show date of birth proving age 70 or above." }
      ],
      conditional: [],
      alternatives: {
        "doc-aadhaar-senior": "Voter ID or Passport can be used to update Aadhaar DOB if discrepancy exists."
      }
    },
    applicationProcess: {
      channel: "Online Portal",
      portalUrl: "https://beneficiary.nha.gov.in",
      timeline: "Instant (5 Minutes)",
      steps: [
        "Open Ayushman App or beneficiary.nha.gov.in and select 'Ayushman Vay Vandana'.",
        "Enter Senior Citizen Aadhaar number and verify via Aadhaar OTP.",
        "Confirm family declaration and capture live selfie for face authentication.",
        "Download distinct Yellow-bordered Ayushman Vay Vandana Golden Card immediately."
      ]
    },
    claimProcess: {
      mode: "100% Cashless via Hospital Helpdesk",
      approvalSLA: "Within 2 Hours (Priority Senior Channel)",
      steps: [
        "Walk into any empaneled hospital and approach the Senior Citizen Ayushman Mitra desk.",
        "Biometric verification confirms active Vay Vandana top-up.",
        "Immediate priority pre-authorization initiated without family coverage deductions.",
        "Cashless hospitalization, surgery, and geriatric care administered.",
        "Discharge package with medicines provided with zero out-of-pocket expenses."
      ]
    },
    helpline: "14555",
    officialPortal: "https://beneficiary.nha.gov.in"
  },

  {
    id: "central-ran",
    name: "Rashtriya Arogya Nidhi (RAN) & Health Minister's Cancer Fund",
    shortCode: "RAN-HMCPF",
    authority: "Central",
    stateCode: "CENTRAL",
    stateName: "National / Central Govt Hospitals",
    coverageAmount: 1500000,
    coverageDisplay: "Up to ₹15,00,000 one-time financial aid",
    category: "disease_specific",
    eligibility: {
      maxFamilyIncome: 150000,
      allowedRationCards: ["AAY", "PHH", "BPL"],
      allowedConditions: ["Oncology", "Cardiology", "Nephrology/Dialysis", "Rare_Disease", "Critical_Care"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: false,
      preHospitalizationDays: 7,
      postHospitalizationDays: 30,
      empaneledNetwork: "All AIIMS & 27 Central Super-Specialty Hospitals (PGI, JIPMER, Tata Memorial, etc.)",
      keyProcedures: ["Bone Marrow Transplant", "Organ Transplants", "Advanced Cancer Chemotherapy/Radiation", "Complex Neuro-Surgery"],
      specialPerks: "Covers ultra-expensive life-saving tertiary interventions exceeding standard insurance limits."
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-ran-form", name: "RAN Application Form signed by Medical Superintendent", category: "Clinical", isMandatory: true, helpText: "Prescribed proforma detailing diagnosis and cost estimate." },
        { id: "doc-income-ran", name: "Income Certificate issued by Revenue Authority / Tehsildar", category: "Income_Proof", isMandatory: true, helpText: "Showing family income below state poverty line." },
        { id: "doc-clinical-est", name: "Detailed Hospital Cost Estimate & Diagnostic Reports", category: "Clinical", isMandatory: true, helpText: "Biopsy, CT/PET scan, and surgeon estimate breakdown." }
      ],
      conditional: [
        { id: "doc-bpl-cert", name: "BPL Ration Card / Antyodaya Card", category: "Income_Proof", isMandatory: false, helpText: "Accelerates clearance without secondary income inspection." }
      ],
      alternatives: {
        "doc-income-ran": "BPL Ration Card attested by Gazetted Officer can substitute standard income certificate."
      }
    },
    applicationProcess: {
      channel: "Hospital Arogya Mitra Desk",
      portalUrl: "https://mohfw.gov.in/schemes/ran",
      timeline: "3 to 7 Days (Emergency green channel: 24h)",
      steps: [
        "Treating doctor at AIIMS or Central Govt hospital prepares the RAN cost estimate.",
        "Hospital Medical Superintendent forwards the signed dossier to MoHFW RAN technical committee.",
        "Ministry sanctions financial allocation directly into the patient's hospital ledger.",
        "Hospital procures implants/chemo drugs using the sanctioned revolving fund."
      ]
    },
    claimProcess: {
      mode: "Direct Benefit Transfer",
      approvalSLA: "Direct Hospital Ledger Credit",
      steps: [
        "Grant released directly to treating hospital treasury (zero cash given to patient).",
        "Surgical interventions and pharmaceuticals billed directly to the RAN credit account.",
        "Patient discharged with no financial liability."
      ]
    },
    helpline: "011-23061980 (MoHFW RAN Cell)",
    officialPortal: "https://mohfw.gov.in"
  },

  {
    id: "central-jssk",
    name: "Janani Shishu Suraksha Karyakram (JSSK) & PMSMA",
    shortCode: "JSSK",
    authority: "Central",
    stateCode: "CENTRAL",
    stateName: "National / All States",
    coverageAmount: 100000,
    coverageDisplay: "100% Free & Cashless Delivery & Sick Newborn Care",
    category: "disease_specific",
    eligibility: {
      gender: "Female",
      allowedConditions: ["Maternity", "Critical_Care"],
      allowedRationCards: ["ANY"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: true,
      preHospitalizationDays: 30,
      postHospitalizationDays: 42,
      empaneledNetwork: "All Government Primary Health Centres (PHC), CHCs, District Hospitals & Medical Colleges",
      keyProcedures: ["Normal delivery", "Caesarean section (C-Section)", "Free blood transfusion", "Sick newborn care up to 1 year"],
      specialPerks: "Includes ₹0 user charges for diagnostics, free nutritious diet during hospital stay, and free drop-back ambulance transport."
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-mcp-card", name: "Mother & Child Protection (MCP) Card / RCH ID", category: "Clinical", isMandatory: true, helpText: "Issued by ASHA or ANM during antenatal checkups." }
      ],
      conditional: [
        { id: "doc-aadhaar-mother", name: "Mother's Aadhaar Card", category: "Identity", isMandatory: false, helpText: "Required for Direct Benefit Transfer (JSY incentive)." }
      ],
      alternatives: {
        "doc-mcp-card": "If MCP card forgotten during emergency labor, patient is admitted immediately with zero paperwork."
      }
    },
    applicationProcess: {
      channel: "Hospital Arogya Mitra Desk",
      portalUrl: "https://nhm.gov.in",
      timeline: "Instant Admission",
      steps: [
        "Pregnant mother presents at labor room of any public healthcare facility.",
        "Nursing staff logs MCP card / RCH Portal registration ID.",
        "Zero-fee admission slip generated instantly with food and diagnostic tokens."
      ]
    },
    claimProcess: {
      mode: "100% Cashless via Hospital Helpdesk",
      approvalSLA: "Instant / Real-time",
      steps: [
        "Zero user charges charged for bed, delivery, surgeries, anesthesia, or blood.",
        "Free drugs and consumables dispensed from hospital in-house pharmacy.",
        "Free post-delivery meals provided to mother.",
        "Free 102/108 ambulance takes mother and newborn back home after 48 hours."
      ]
    },
    helpline: "104 (National Health Helpline) / 102 (Ambulance)",
    officialPortal: "https://nhm.gov.in"
  },

  {
    id: "central-dialysis",
    name: "Pradhan Mantri National Dialysis Programme (PMNDP)",
    shortCode: "PMNDP",
    authority: "Central",
    stateCode: "CENTRAL",
    stateName: "National / District Hospitals",
    coverageAmount: 300000,
    coverageDisplay: "100% Free Hemodialysis & Peritoneal Dialysis for BPL",
    category: "disease_specific",
    eligibility: {
      allowedConditions: ["Nephrology/Dialysis"],
      allowedRationCards: ["AAY", "PHH", "BPL", "WHITE", "YELLOW"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: true,
      preHospitalizationDays: 0,
      postHospitalizationDays: 0,
      empaneledNetwork: "600+ District Hospital Dialysis Centres across India",
      keyProcedures: ["Hemodialysis cycles", "Peritoneal Dialysis kit supply", "EPO injections", "AV Fistula monitoring"],
      specialPerks: "Zero cost for life-long maintenance dialysis for below-poverty-line end-stage renal disease (ESRD) patients."
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-dialysis-aadhaar", name: "Aadhaar Card", category: "Identity", isMandatory: true, helpText: "To establish ABHA biometric record." },
        { id: "doc-dialysis-nephro", name: "Nephrologist Prescription / ESRD Diagnosis", category: "Clinical", isMandatory: true, helpText: "Showing CKD Stage 5 / need for regular hemodialysis." },
        { id: "doc-dialysis-bpl", name: "BPL Ration Card / Income Certificate", category: "Income_Proof", isMandatory: true, helpText: "Proving BPL status for zero-cost slot allocation." }
      ],
      conditional: [],
      alternatives: {
        "doc-dialysis-bpl": "APL patients can also receive dialysis at subsidized rates (e.g. ₹1,100 per cycle vs ₹3,500 private)."
      }
    },
    applicationProcess: {
      channel: "Hospital Arogya Mitra Desk",
      portalUrl: "https://pmndp.mohfw.gov.in",
      timeline: "Same Day Registration",
      steps: [
        "Visit the District Hospital Dialysis Unit with nephrologist recommendation.",
        "Unit coordinator enters patient details into PMNDP National Dialysis Portal.",
        "Patient is assigned a recurring weekly dialysis schedule (e.g. Tuesdays & Fridays)."
      ]
    },
    claimProcess: {
      mode: "100% Cashless via Hospital Helpdesk",
      approvalSLA: "Instant Slot Validation",
      steps: [
        "Biometric punch at dialysis console before each session.",
        "Dialyzer, tubing lines, heparin, and dialysate fluid provided at ₹0 charge.",
        "Patient returns home immediately post-treatment."
      ]
    },
    helpline: "104",
    officialPortal: "https://pmndp.mohfw.gov.in"
  },

  {
    id: "central-nikshay",
    name: "Ni-kshay Poshan Yojana (National TB Elimination Program)",
    shortCode: "NIKSHAY",
    authority: "Central",
    stateCode: "CENTRAL",
    stateName: "National / All States",
    coverageAmount: 15000,
    coverageDisplay: "Free DOTS Treatment + ₹500/month Direct Bank Transfer",
    category: "disease_specific",
    eligibility: {
      allowedConditions: ["TB"],
      allowedRationCards: ["ANY"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: true,
      preHospitalizationDays: 0,
      postHospitalizationDays: 0,
      empaneledNetwork: "All Public & Private Clinics reporting to Ni-kshay",
      keyProcedures: ["GeneXpert / CB-NAAT molecular diagnostics", "First & Second line anti-TB drugs", "Monthly nutritional cash allowance"],
      specialPerks: "Universal for all verified TB patients, irrespective of income or treatment in public or private sector."
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-tb-aadhaar", name: "Aadhaar Card", category: "Identity", isMandatory: true, helpText: "Mandatory for DBT linkage under Ni-kshay." },
        { id: "doc-tb-bank", name: "Bank Account Passbook / Cancelled Cheque", category: "Income_Proof", isMandatory: true, helpText: "Aadhaar-seeded bank account for ₹500/month DBT." },
        { id: "doc-tb-report", name: "Sputum / CB-NAAT Positive Lab Report", category: "Clinical", isMandatory: true, helpText: "Confirmatory TB diagnostic test." }
      ],
      conditional: [],
      alternatives: {
        "doc-tb-bank": "Post Office Savings Account or Jan Dhan account can be linked."
      }
    },
    applicationProcess: {
      channel: "Multiple",
      portalUrl: "https://nikshay.in",
      timeline: "Within 48 Hours",
      steps: [
        "Lab or clinic registers positive test on Ni-kshay portal.",
        "TB Health Visitor (TBHV) validates patient address and bank details.",
        "Patient receives unique Ni-kshay ID and monthly DBT activation SMS."
      ]
    },
    claimProcess: {
      mode: "Direct Benefit Transfer",
      approvalSLA: "Monthly DBT Cycle",
      steps: [
        "Daily/weekly medication tracking through 99DOTS or MERM box.",
        "₹500 credited to bank account on the 1st of every month during active treatment.",
        "Free follow-up sputum tests at months 2, 4, and 6."
      ]
    },
    helpline: "1800-11-6666",
    officialPortal: "https://nikshay.in"
  },

  {
    id: "central-rare-disease",
    name: "National Policy for Rare Diseases (NPRD Financial Support)",
    shortCode: "NPRD",
    authority: "Central",
    stateCode: "CENTRAL",
    stateName: "National / Centers of Excellence",
    coverageAmount: 5000000,
    coverageDisplay: "Up to ₹50,00,000 for Rare Disease Therapy",
    category: "disease_specific",
    eligibility: {
      allowedConditions: ["Rare_Disease"],
      allowedRationCards: ["ANY"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: true,
      preHospitalizationDays: 15,
      postHospitalizationDays: 60,
      empaneledNetwork: "11 Centers of Excellence (AIIMS Delhi, PGIMER, CMC Vellore, etc.)",
      keyProcedures: ["Enzyme Replacement Therapy", "Gene Therapy", "Specialized Biologics for Gaucher/Pompe/SMA"],
      specialPerks: "Available to any Indian citizen diagnosed with rare diseases classified under Group 1, 2, or 3."
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-nprd-genetic", name: "Confirmatory Genetic / Molecular Diagnostic Report", category: "Clinical", isMandatory: true, helpText: "From accredited national genomic laboratory." },
        { id: "doc-nprd-coe", name: "Center of Excellence (CoE) Rare Disease Board Recommendation", category: "Clinical", isMandatory: true, helpText: "Clinical protocol formulated by the multidisciplinary board." }
      ],
      conditional: [],
      alternatives: {}
    },
    applicationProcess: {
      channel: "Hospital Arogya Mitra Desk",
      portalUrl: "https://rarediseases.mohfw.gov.in",
      timeline: "2 to 3 Weeks",
      steps: [
        "Patient examined at designated Center of Excellence (CoE).",
        "CoE Rare Disease Committee approves therapeutic plan and submits portal requisition.",
        "MoHFW approves fund allocation up to ₹50 Lakh directly to the CoE pharmacy."
      ]
    },
    claimProcess: {
      mode: "Direct Benefit Transfer",
      approvalSLA: "Direct Institutional Procurement",
      steps: [
        "Imported/orphan drugs procured duty-free by CoE.",
        "Therapy administered in specialized infusion day-care units at ₹0 patient expense."
      ]
    },
    helpline: "011-23061483",
    officialPortal: "https://rarediseases.mohfw.gov.in"
  },

  // ==========================================
  // STATE-SPECIFIC HEALTHCARE SCHEMES
  // ==========================================

  // ANDHRA PRADESH
  {
    id: "state-ap-aarogyasri",
    name: "Dr. YSR Aarogyasri Health Insurance Scheme",
    shortCode: "AAROGYASRI-AP",
    authority: "State",
    stateCode: "AP",
    stateName: "Andhra Pradesh",
    coverageAmount: 2500000,
    coverageDisplay: "Up to ₹25,00,000 / family / year",
    category: "bpl_ration",
    eligibility: {
      allowedRationCards: ["WHITE", "BPL", "AAY", "PHH"],
      maxFamilyIncome: 500000,
      allowedConditions: ["ANY"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: false,
      preHospitalizationDays: 7,
      postHospitalizationDays: 10,
      empaneledNetwork: "2,400+ Network Hospitals in AP, Hyderabad, Bangalore & Chennai",
      keyProcedures: ["3,257 Covered Procedures: Oncology, Cardiac Bypass, Knee/Hip, Pediatric Surgeries"],
      specialPerks: "YSR Aarogya Asara: Post-operative daily wage compensation of ₹225/day (up to ₹5,000/month) transferred directly to patient's bank account during recovery!"
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-ap-rice-card", name: "AP YSR Rice Card / White Ration Card", category: "Income_Proof", isMandatory: true, helpText: "Proves BPL residency in Andhra Pradesh." },
        { id: "doc-ap-aadhaar", name: "Aadhaar Card of Patient", category: "Identity", isMandatory: true, helpText: "For biometric validation with Dr. YSR Aarogyasri Trust." }
      ],
      conditional: [],
      alternatives: {
        "doc-ap-rice-card": "Aarogyasri Card with QR code or Grama Ward Sachivalayam income certificate is accepted."
      }
    },
    applicationProcess: {
      channel: "Multiple",
      portalUrl: "https://ysraarogyasri.ap.gov.in",
      timeline: "Instant via Ward Sachivalayam",
      steps: [
        "Automatic enrollment upon Rice Card issuance via Grama/Ward Sachivalayam.",
        "Carry Rice Card or Aadhaar to any network hospital.",
        "YSR Aarogyamithra verifies eligibility in trust database within 2 minutes."
      ]
    },
    claimProcess: {
      mode: "100% Cashless via Hospital Helpdesk",
      approvalSLA: "Within 2 Hours",
      steps: [
        "Aarogyamithra scans Rice Card and registers pre-authorization in trust portal.",
        "Trust Medical Officer clears pre-auth electronically.",
        "Cashless surgery performed; food and free transport allowance provided.",
        "Aarogya Asara daily wage allowance credited to bank account at discharge."
      ]
    },
    helpline: "104 / 1800-599-1111",
    officialPortal: "https://ysraarogyasri.ap.gov.in"
  },

  // TELANGANA
  {
    id: "state-tg-aarogyasri",
    name: "Telangana Aarogyasri / Rajiv Aarogyasri Health Scheme",
    shortCode: "AAROGYASRI-TG",
    authority: "State",
    stateCode: "TG",
    stateName: "Telangana",
    coverageAmount: 1000000,
    coverageDisplay: "Up to ₹10,00,000 / family / year",
    category: "bpl_ration",
    eligibility: {
      allowedRationCards: ["WHITE", "BPL", "AAY", "PHH"],
      maxFamilyIncome: 200000,
      allowedConditions: ["ANY"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: false,
      preHospitalizationDays: 5,
      postHospitalizationDays: 10,
      empaneledNetwork: "1,100+ Network Hospitals across Telangana",
      keyProcedures: ["1,672 Medical & Surgical Procedures including Neuro, Cardiology, Nephrology, Cancer"],
      specialPerks: "Integrated with PM-JAY; covers high-end Cochlear Implants and Paediatric interventions."
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-tg-food-security", name: "Telangana Food Security Card (FSC) / White Card", category: "Income_Proof", isMandatory: true, helpText: "Proves low-income status in Telangana." },
        { id: "doc-tg-aadhaar", name: "Aadhaar Card", category: "Identity", isMandatory: true, helpText: "Linked to FSC family database." }
      ],
      conditional: [],
      alternatives: {
        "doc-tg-food-security": "MeeSeva Income Certificate (< ₹2 Lakhs) accepted for select emergency procedures."
      }
    },
    applicationProcess: {
      channel: "Hospital Arogya Mitra Desk",
      portalUrl: "https://aarogyasri.telangana.gov.in",
      timeline: "Instant at Hospital Desk",
      steps: [
        "Present FSC card at the Aarogyasri kiosk located in any network hospital.",
        "Aarogya Mithra validates family tree on Telangana health trust portal.",
        "Instant patient token generated."
      ]
    },
    claimProcess: {
      mode: "100% Cashless via Hospital Helpdesk",
      approvalSLA: "Within 2 Hours",
      steps: [
        "Pre-auth submitted with clinical lab reports.",
        "Aarogyasri Trust approves cashless treatment package.",
        "Discharge with 10 days of free take-home drugs and follow-up consultation voucher."
      ]
    },
    helpline: "104 / 1800-599-4455",
    officialPortal: "https://aarogyasri.telangana.gov.in"
  },

  // MAHARASHTRA
  {
    id: "state-mh-mjpjay",
    name: "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)",
    shortCode: "MJPJAY",
    authority: "State",
    stateCode: "MH",
    stateName: "Maharashtra",
    coverageAmount: 500000,
    coverageDisplay: "₹5,00,000 / family / year",
    category: "universal",
    eligibility: {
      allowedRationCards: ["ANY", "YELLOW", "ORANGE", "WHITE"],
      allowedConditions: ["ANY"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: false,
      preHospitalizationDays: 3,
      postHospitalizationDays: 10,
      empaneledNetwork: "1,000+ Empaneled Hospitals across all 36 districts of Maharashtra",
      keyProcedures: ["1,356 Medical Procedures: Angioplasty, Cancer, Renal Transplant, Pediatric Surgery"],
      specialPerks: "Universal Coverage expanded in 2023 to ALL 12.5 Crore citizens holding ANY ration card in Maharashtra."
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-mh-ration", name: "Ration Card (Yellow, Orange, or White)", category: "Income_Proof", isMandatory: true, helpText: "Any official ration card issued by Food & Civil Supplies Dept Maharashtra." },
        { id: "doc-mh-aadhaar", name: "Aadhaar Card / Voter ID", category: "Identity", isMandatory: true, helpText: "Must match name on ration card." }
      ],
      conditional: [],
      alternatives: {
        "doc-mh-ration": "Farmers from 14 suicide-prone districts can present 7/12 land extract or Tahsildar certificate."
      }
    },
    applicationProcess: {
      channel: "Hospital Arogya Mitra Desk",
      portalUrl: "https://www.jeevandayee.gov.in",
      timeline: "Instant at Arogyamitra Kiosk",
      steps: [
        "Meet Arogyamitra stationed at network hospital reception.",
        "Present Ration card and Aadhaar for instant eligibility verification.",
        "System creates electronic admission e-card on the spot."
      ]
    },
    claimProcess: {
      mode: "100% Cashless via Hospital Helpdesk",
      approvalSLA: "Within 2 Hours",
      steps: [
        "Network hospital submits diagnostic proofs to State Health Assurance Society (SHAS).",
        "Pre-auth approved online by panel doctor.",
        "100% cashless hospitalization, implants, diagnostics, and 10 days post-discharge meds."
      ]
    },
    helpline: "155388 / 1800-233-2200",
    officialPortal: "https://www.jeevandayee.gov.in"
  },

  // KARNATAKA
  {
    id: "state-ka-ab-ark",
    name: "Ayushman Bharat - Arogya Karnataka (AB-ArK)",
    shortCode: "AB-ARK",
    authority: "State",
    stateCode: "KA",
    stateName: "Karnataka",
    coverageAmount: 500000,
    coverageDisplay: "₹5,00,000 (Eligible BPL) / Subsidized 30% (APL)",
    category: "bpl_ration",
    eligibility: {
      allowedRationCards: ["BPL", "AAY", "PHH", "ANY"],
      allowedConditions: ["ANY"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: false,
      preHospitalizationDays: 3,
      postHospitalizationDays: 7,
      empaneledNetwork: "All Karnataka District Hospitals & 600+ Private Super-Specialty Hospitals",
      keyProcedures: ["1,650 Procedures. Complex tertiary care requires referral from public hospital first."],
      specialPerks: "APL families receive 30% financial copayment subsidy up to ₹1.5 Lakh if not BPL."
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-ka-aadhaar", name: "Aadhaar Card", category: "Identity", isMandatory: true, helpText: "Mandatory for Biometric validation." },
        { id: "doc-ka-bpl-card", name: "Karnataka BPL Ration Card (Ahara Portal)", category: "Income_Proof", isMandatory: true, helpText: "Confirms 'Eligible Category' for 100% cashless care." }
      ],
      conditional: [
        { id: "doc-ka-referral", name: "Public Hospital Referral Letter", category: "Clinical", isMandatory: false, helpText: "Required for private hospital admission under non-emergency tertiary care." }
      ],
      alternatives: {
        "doc-ka-bpl-card": "Without BPL card, patient categorized as General/APL with 30% subsidy package."
      }
    },
    applicationProcess: {
      channel: "Multiple",
      portalUrl: "https://arogya.karnataka.gov.in",
      timeline: "Instant at Arogya Mitra Desk",
      steps: [
        "Visit Arogya Mitra desk at any Taluk or District Hospital.",
        "Biometric authentication generates unified ArK Patient ID.",
        "If procedure requires private care, public hospital issues electronic referral slip."
      ]
    },
    claimProcess: {
      mode: "100% Cashless via Hospital Helpdesk",
      approvalSLA: "Within 3 Hours",
      steps: [
        "Hospital uploads electronic referral and clinical diagnostic reports.",
        "Suvarna Arogya Suraksha Trust (SAST) approves pre-auth.",
        "Zero cash payment for BPL patients; 30% package cap for APL patients."
      ]
    },
    helpline: "104 / 1800-425-8330",
    officialPortal: "https://arogya.karnataka.gov.in"
  },

  // TAMIL NADU
  {
    id: "state-tn-cmchis",
    name: "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)",
    shortCode: "CMCHIS",
    authority: "State",
    stateCode: "TN",
    stateName: "Tamil Nadu",
    coverageAmount: 500000,
    coverageDisplay: "₹5,00,000 / family / year",
    category: "income_tested",
    eligibility: {
      maxFamilyIncome: 120000,
      allowedRationCards: ["ANY", "BPL", "AAY", "PHH"],
      allowedConditions: ["ANY"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: false,
      preHospitalizationDays: 3,
      postHospitalizationDays: 5,
      empaneledNetwork: "1,600+ Public & Private Empaneled Hospitals across Tamil Nadu",
      keyProcedures: ["1,513 Medical/Surgical Procedures + 8 High-End Procedures up to ₹25 Lakhs (Liver/Heart Transplants)"],
      specialPerks: "Covers special diagnostic tests up to ₹10,000/year even without hospital admission."
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-tn-smart-card", name: "Tamil Nadu Smart Family Card (Ration Card)", category: "Income_Proof", isMandatory: true, helpText: "Proves family residence in Tamil Nadu." },
        { id: "doc-tn-income", name: "Village Administrative Officer (VAO) Income Certificate (< ₹1.2L)", category: "Income_Proof", isMandatory: true, helpText: "Issued via e-Seva portal." }
      ],
      conditional: [],
      alternatives: {
        "doc-tn-income": "If smart card indicates BPL/AAY status, separate VAO certificate may be waived."
      }
    },
    applicationProcess: {
      channel: "Multiple",
      portalUrl: "https://www.cmchistn.com",
      timeline: "Same day at District Kiosk",
      steps: [
        "Take Smart Card and VAO income certificate to District Collectorate CMCHIS kiosk.",
        "Biometric photo and fingerprint captured for all family members.",
        "Smart CMCHIS plastic card issued on the spot."
      ]
    },
    claimProcess: {
      mode: "100% Cashless via Hospital Helpdesk",
      approvalSLA: "Within 2 Hours",
      steps: [
        "Present CMCHIS card at network hospital insurance desk.",
        "Liaison officer submits pre-auth to United India Insurance TPA.",
        "Treatment conducted with zero deposit.",
        "Transport allowance of ₹1,000 paid to patient at discharge."
      ]
    },
    helpline: "1800-425-3993",
    officialPortal: "https://www.cmchistn.com"
  },

  // KERALA
  {
    id: "state-kl-kasp",
    name: "Karunya Arogya Suraksha Padhathi (KASP)",
    shortCode: "KASP",
    authority: "State",
    stateCode: "KL",
    stateName: "Kerala",
    coverageAmount: 500000,
    coverageDisplay: "₹5,00,000 / family / year",
    category: "bpl_ration",
    eligibility: {
      allowedRationCards: ["YELLOW", "PINK", "BPL", "AAY", "PHH"],
      allowedConditions: ["ANY"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: false,
      preHospitalizationDays: 3,
      postHospitalizationDays: 15,
      empaneledNetwork: "650+ Empaneled Hospitals across Kerala",
      keyProcedures: ["1,573 Procedures: Oncology, Cardiac care, Dialysis, Neurology, Emergency Trauma"],
      specialPerks: "Karunya Benevolent Fund (KBF) supplemental grant up to ₹2 Lakh for catastrophic kidney/cancer treatments exceeding limits."
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-kl-ration", name: "Kerala Yellow (AAY) or Pink (PHH) Ration Card", category: "Income_Proof", isMandatory: true, helpText: "Verifies BPL classification in Kerala." },
        { id: "doc-kl-aadhaar", name: "Aadhaar Card", category: "Identity", isMandatory: true, helpText: "Linked to KASP beneficiary database." }
      ],
      conditional: [],
      alternatives: {
        "doc-kl-ration": "Non-BPL families with annual income < ₹3 Lakh can apply for KBF assistance via District Lotteries Office."
      }
    },
    applicationProcess: {
      channel: "Multiple",
      portalUrl: "https://sha.kerala.gov.in",
      timeline: "Instant at Akshaya Centers",
      steps: [
        "Visit Akshaya Center or Empaneled Hospital KASP desk with Yellow/Pink card.",
        "Operator registers e-KYC using Aadhaar OTP or Biometrics.",
        "KASP Golden Card generated immediately."
      ]
    },
    claimProcess: {
      mode: "100% Cashless via Hospital Helpdesk",
      approvalSLA: "Within 2 Hours",
      steps: [
        "KASP Helpdesk at hospital submits online pre-authorization.",
        "State Health Agency (SHA) Kerala clears pre-authorization.",
        "Zero cash deposit required for admission, medicines, surgery, or discharge."
      ]
    },
    helpline: "1056 (Disha Helpline) / 1800-200-1134",
    officialPortal: "https://sha.kerala.gov.in"
  },

  // WEST BENGAL
  {
    id: "state-wb-swasthya-sathi",
    name: "Swasthya Sathi Scheme",
    shortCode: "SWASTHYA-SATHI",
    authority: "State",
    stateCode: "WB",
    stateName: "West Bengal",
    coverageAmount: 500000,
    coverageDisplay: "₹5,00,000 / family / year",
    category: "universal",
    eligibility: {
      allowedRationCards: ["ANY"],
      allowedConditions: ["ANY"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: false,
      preHospitalizationDays: 1,
      postHospitalizationDays: 5,
      empaneledNetwork: "1,500+ Empaneled Hospitals in West Bengal, plus select hospitals in Bangalore & Delhi",
      keyProcedures: ["2,000+ Treatment Packages including Organ Transplant, Cancer, Cardiac, Ortho"],
      specialPerks: "Universal Coverage: Issued strictly in the name of the eldest female member of the household for women empowerment."
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-wb-smart-card", name: "Swasthya Sathi Smart Card (with Female Head of Family)", category: "Identity", isMandatory: true, helpText: "Biometric smart card containing family balance." },
        { id: "doc-wb-aadhaar", name: "Aadhaar Card of Admitted Member", category: "Identity", isMandatory: true, helpText: "Verifies member listed on the card." }
      ],
      conditional: [],
      alternatives: {
        "doc-wb-smart-card": "Duare Sarkar acknowledgment slip with Aadhaar can be verified if physical card not yet delivered."
      }
    },
    applicationProcess: {
      channel: "Multiple",
      portalUrl: "https://swasthayasathi.gov.in",
      timeline: "Via Duare Sarkar Camps",
      steps: [
        "Fill Form-B at local Gram Panchayat / Municipality Duare Sarkar camp.",
        "Eldest female family member photographed and biometrics recorded.",
        "Smart Card printed with chip and issued to the family."
      ]
    },
    claimProcess: {
      mode: "100% Cashless via Hospital Helpdesk",
      approvalSLA: "Within 2 Hours",
      steps: [
        "Hospital Swasthya Sathi desk inserts Smart Card into POS reader.",
        "Electronic pre-auth approved by TPA/State nodal agency.",
        "Zero payment by patient; ₹200-400 travel allowance provided to patient at discharge."
      ]
    },
    helpline: "1800-345-5384",
    officialPortal: "https://swasthayasathi.gov.in"
  },

  // RAJASTHAN
  {
    id: "state-rj-chiranjeevi",
    name: "Mukhyamantri Ayushman Arogya Yojana (MAAY - Formerly Chiranjeevi)",
    shortCode: "MAAY-RJ",
    authority: "State",
    stateCode: "RJ",
    stateName: "Rajasthan",
    coverageAmount: 2500000,
    coverageDisplay: "Up to ₹25,00,000 / family / year",
    category: "universal",
    eligibility: {
      allowedRationCards: ["ANY"],
      allowedConditions: ["ANY"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: false,
      preHospitalizationDays: 5,
      postHospitalizationDays: 15,
      empaneledNetwork: "All Rajasthan Public Hospitals & 1,000+ Empaneled Private Hospitals",
      keyProcedures: ["1,800+ Packages: Organ Transplants, Cochlear Implants, Cancer, Cardiac Surgeries"],
      specialPerks: "Highest basic coverage in India (₹25 Lakhs) covering almost all resident families in Rajasthan."
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-rj-jan-aadhaar", name: "Rajasthan Jan Aadhaar Card / Receipt", category: "Identity", isMandatory: true, helpText: "Universal citizen identification document in Rajasthan." }
      ],
      conditional: [],
      alternatives: {
        "doc-rj-jan-aadhaar": "Jan Aadhaar enrollment receipt slip with Aadhaar numbers of all members accepted."
      }
    },
    applicationProcess: {
      channel: "Multiple",
      portalUrl: "https://chiranjeevi.rajasthan.gov.in",
      timeline: "Instant via SSO / e-Mitra",
      steps: [
        "NFSA, SECC, small farmers, and COVID victims enrolled for ₹0 premium.",
        "Other families can register at any e-Mitra kiosk by paying ₹850/year premium.",
        "Linked automatically to Jan Aadhaar database."
      ]
    },
    claimProcess: {
      mode: "100% Cashless via Hospital Helpdesk",
      approvalSLA: "Within 1 Hour",
      steps: [
        "Provide Jan Aadhaar number at hospital Help Desk.",
        "Biometric validation confirms active coverage.",
        "Instant cashless pre-authorization issued."
      ]
    },
    helpline: "181 / 1800-180-6127",
    officialPortal: "https://chiranjeevi.rajasthan.gov.in"
  },

  // DELHI
  {
    id: "state-dl-dak",
    name: "Delhi Arogya Kosh (DAK) & Free Surgery Scheme",
    shortCode: "DAK-DELHI",
    authority: "State",
    stateCode: "DL",
    stateName: "Delhi (NCT)",
    coverageAmount: 500000,
    coverageDisplay: "Up to ₹5,00,000 financial assistance + Free Surgeries",
    category: "income_tested",
    eligibility: {
      maxFamilyIncome: 300000,
      allowedConditions: ["ANY"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: true,
      preHospitalizationDays: 0,
      postHospitalizationDays: 0,
      empaneledNetwork: "All Delhi Govt Hospitals + 70+ Empaneled Private Hospitals/Labs",
      keyProcedures: ["Cashless surgery in private hospital if waiting time in Delhi Govt Hospital > 30 days. Free high-end diagnostics (MRI, PET, CT) at private imaging centers."],
      specialPerks: "Delhi Road Accident Victims (Farishtey Scheme): 100% cashless emergency trauma care in private hospitals with zero eligibility questions."
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-dl-voter", name: "Delhi Voter ID Card / Proof of 3-Year Residency", category: "Residency", isMandatory: true, helpText: "Proves domicile in National Capital Territory of Delhi." },
        { id: "doc-dl-referral", name: "Delhi Govt Hospital Referral / Doctor Estimate", category: "Clinical", isMandatory: true, helpText: "Indicating surgical date or diagnostic requisition." }
      ],
      conditional: [
        { id: "doc-dl-income", name: "SDM Income Certificate (< ₹3 Lakhs)", category: "Income_Proof", isMandatory: false, helpText: "Required for financial grant cases under DAK." }
      ],
      alternatives: {
        "doc-dl-referral": "For Farishtey accident scheme, NO documents required at the time of emergency admission."
      }
    },
    applicationProcess: {
      channel: "Hospital Arogya Mitra Desk",
      portalUrl: "https://health.delhi.gov.in",
      timeline: "Within 24 to 48 Hours",
      steps: [
        "Patient attends Delhi Govt Hospital (e.g. LNJP, GTB, GB Pant).",
        "If surgical date is beyond 30 days, hospital issues Referral Letter for private empanelled hospital.",
        "Patient walks into private hospital with referral letter and Delhi Voter ID for immediate cashless surgery."
      ]
    },
    claimProcess: {
      mode: "100% Cashless via Hospital Helpdesk",
      approvalSLA: "Instant via Delhi Govt Health Portal",
      steps: [
        "Private hospital logs referral code on Delhi Health portal.",
        "Cashless surgery performed with zero deposit or medicine charges.",
        "Delhi Govt reimburses the private hospital directly."
      ]
    },
    helpline: "1031 (Delhi Health Helpline)",
    officialPortal: "https://health.delhi.gov.in"
  },

  // ODISHA
  {
    id: "state-or-bsky",
    name: "Biju Swasthya Kalyan Yojana (BSKY)",
    shortCode: "BSKY-ODISHA",
    authority: "State",
    stateCode: "OR",
    stateName: "Odisha",
    coverageAmount: 1000000,
    coverageDisplay: "₹5,00,000 (Male) / ₹10,00,000 (Female) per family",
    category: "bpl_ration",
    eligibility: {
      allowedRationCards: ["AAY", "PHH", "BPL", "ANY"],
      allowedConditions: ["ANY"]
    },
    benefits: {
      cashlessInpatient: true,
      outpatientCovered: true,
      preHospitalizationDays: 5,
      postHospitalizationDays: 15,
      empaneledNetwork: "All Odisha Govt Facilities (Universal) + 800+ Empaneled Private Hospitals",
      keyProcedures: ["All tertiary surgeries, cardiology, oncology, pediatric heart surgery"],
      specialPerks: "Higher ₹10 Lakh limit automatically reserved for female members of the family."
    },
    requiredDocuments: {
      mandatory: [
        { id: "doc-or-bsky-card", name: "BSKY Smart Health Card / NFSA Ration Card", category: "Income_Proof", isMandatory: true, helpText: "Issued by Food Supplies & Consumer Welfare Dept Odisha." }
      ],
      conditional: [],
      alternatives: {}
    },
    applicationProcess: {
      channel: "Multiple",
      portalUrl: "https://bsky.odisha.gov.in",
      timeline: "Automatic with Ration Card",
      steps: [
        "Card distributed at Gram Panchayat level to all NFSA cardholders.",
        "Cardholder approaches Swasthya Mitra at any private or government empaneled hospital."
      ]
    },
    claimProcess: {
      mode: "100% Cashless via Hospital Helpdesk",
      approvalSLA: "Within 1 Hour",
      steps: [
        "Swasthya Mitra swipes BSKY Smart Health Card.",
        "Biometric validation unlocks cashless credit.",
        "Treatment completed without any out-of-pocket charges."
      ]
    },
    helpline: "104 / 155369",
    officialPortal: "https://bsky.odisha.gov.in"
  }
];

export const STATES_AND_UTS = [
  { code: "CENTRAL", name: "National / Central Govt Schemes" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CG", name: "Chhattisgarh" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OR", name: "Odisha" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TG", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UT", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
  { code: "AN", name: "Andaman & Nicobar Islands" },
  { code: "CH", name: "Chandigarh" },
  { code: "DN", name: "Dadra & Nagar Haveli and Daman & Diu" },
  { code: "DL", name: "Delhi (NCT)" },
  { code: "JK", name: "Jammu & Kashmir" },
  { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" },
  { code: "PY", name: "Puducherry" }
];
