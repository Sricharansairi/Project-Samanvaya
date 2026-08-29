export const translations = {
  en: {
    // Landing Page
    "landing.title": "Welcome to Project Samanvaya",
    "landing.subtitle": "Select your role to proceed",
    "landing.patient": "I am a Patient",
    "landing.patient.desc": "View your digital history and prescriptions",
    "landing.his": "Hospital Login (HIS)",
    "landing.his.desc": "For authorized medical staff and doctors only",
    "landing.select_language": "Language / भाषा / భాష",
    
    // Patient Portal
    "patient.portal.title": "Patient Portal",
    "patient.portal.login": "Login with ABHA ID or Mobile",
    "patient.portal.history": "Digital History",
    
    // HIS Roles
    "his.roles.title": "Select Hospital Role",
    "his.roles.staff": "Registration Staff",
    "his.roles.staff.desc": "Patient triage and token generation",
    "his.roles.doctor": "Physician",
    "his.roles.doctor.desc": "Queue management and e-Prescriptions",
    
    // Generic
    "generic.back": "Back",
    "generic.submit": "Submit",
    "generic.loading": "Loading...",
  },
  hi: {
    // Landing Page
    "landing.title": "प्रोजेक्ट समन्वय में आपका स्वागत है",
    "landing.subtitle": "आगे बढ़ने के लिए अपनी भूमिका चुनें",
    "landing.patient": "मैं एक मरीज हूँ",
    "landing.patient.desc": "अपना डिजिटल इतिहास और नुस्खे देखें",
    "landing.his": "अस्पताल लॉगिन (HIS)",
    "landing.his.desc": "केवल अधिकृत अस्पताल कर्मचारियों और चिकित्सकों के लिए",
    "landing.select_language": "Select Language / भाषा चुनें",
    
    // Patient Portal
    "patient.portal.title": "रोगी पोर्टल",
    "patient.portal.login": "आभा (ABHA) आईडी या मोबाइल से लॉगिन करें",
    "patient.portal.history": "डिजिटल इतिहास",
    
    // HIS Roles
    "his.roles.title": "अस्पताल लॉगिन",
    "his.roles.staff": "पंजीकरण कर्मचारी",
    "his.roles.staff.desc": "फ्रंट डेस्क रोगी ऑनबोर्डिंग, वाइटल्स और ABHA पंजीकरण",
    "his.roles.doctor": "चिकित्सक सांत्वना",
    "his.roles.doctor.desc": "ट्राइएज किए गए रोगियों, FHIR रिकॉर्ड की समीक्षा करें और दवाएं लिखें",
    
    // Generic
    "generic.back": "वापस जाएँ",
    "generic.submit": "जमा करें",
    "generic.loading": "लोड हो रहा है...",
  },
  te: {
    // Landing Page
    "landing.title": "ప్రాజెక్ట్ సమన్వయకు స్వాగతం",
    "landing.subtitle": "కొనసాగడానికి మీ పాత్రను ఎంచుకోండి",
    "landing.patient": "నేను రోగిని",
    "landing.patient.desc": "మీ డిజిటల్ చరిత్ర మరియు ప్రిస్క్రిప్షన్‌లను యాక్సెస్ చేయండి",
    "landing.his": "ఆసుపత్రి లాగిన్ (HIS)",
    "landing.his.desc": "అధికృత వైద్య సిబ్బంది మరియు వైద్యులకు మాత్రమే",
    "landing.select_language": "భాషను ఎంచుకోండి / Select Language",
    
    // Patient Portal
    "patient.portal.title": "రోగి పోర్టల్",
    "patient.portal.login": "ABHA ID లేదా మొబైల్ తో లాగిన్ చేయండి",
    "patient.portal.history": "డిజిటల్ చరిత్ర",
    
    // HIS Roles
    "his.roles.title": "ఆసుపత్రి పాత్రను ఎంచుకోండి",
    "his.roles.staff": "రిజిస్ట్రేషన్ సిబ్బంది",
    "his.roles.staff.desc": "రోగి ఎంపిక మరియు టోకెన్ జారీ",
    "his.roles.doctor": "వైద్యుడు",
    "his.roles.doctor.desc": "క్యూ నిర్వహణ మరియు ఇ-ప్రిస్క్రిప్షన్",
    
    // Generic
    "generic.back": "వెనుకకు",
    "generic.submit": "సమర్పించండి",
    "generic.loading": "లోడ్ అవుతోంది...",
  }
};

export type Language = 'en' | 'hi' | 'te';
export type TranslationKey = keyof typeof translations.en;
