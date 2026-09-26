"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Stethoscope, ShieldCheck, Lock, KeyRound, X, CheckCircle2, 
  AlertCircle, ArrowRight, Sparkles, Building2, Smartphone, RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";

export interface DoctorSession {
  isAuthenticated: boolean;
  name: string;
  registrationNumber: string;
  department: string;
  roomNumber: string;
  specialty: string;
  loginTime: string;
}

export const VERIFIED_DOCTORS: Omit<DoctorSession, "isAuthenticated" | "loginTime">[] = [
  {
    name: "Dr. Arvind Sharma, MBBS, MD",
    registrationNumber: "MCI-84920 / DMC",
    department: "General Medicine",
    roomNumber: "Room 101",
    specialty: "Internal Medicine & Diabetology"
  },
  {
    name: "Dr. Priya Nair, MBBS, MD (Cardio)",
    registrationNumber: "MCI-91244 / KMC",
    department: "Cardiology",
    roomNumber: "Room 102",
    specialty: "Interventional Cardiology"
  },
  {
    name: "Dr. Rajesh Iyer, MBBS, MD (Chest)",
    registrationNumber: "MCI-76319 / MMC",
    department: "Pulmonology",
    roomNumber: "Room 103",
    specialty: "Pulmonology & Critical Care"
  },
  {
    name: "Dr. Meera Kulkarni, MBBS, DCH",
    registrationNumber: "MCI-65481 / APMC",
    department: "Pediatrics",
    roomNumber: "Room 106",
    specialty: "Pediatric & Neonatal Care"
  }
];

interface DoctorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (session: DoctorSession) => void;
}

export default function DoctorLoginModal({ isOpen, onClose, onSuccess }: DoctorLoginModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [regNumber, setRegNumber] = useState("");
  const [doctorNameInput, setDoctorNameInput] = useState("");
  const [department, setDepartment] = useState("General Medicine");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected quick doctor
  const [selectedQuickDoc, setSelectedQuickDoc] = useState<typeof VERIFIED_DOCTORS[0] | null>(null);

  const handleSelectQuickDoctor = (doc: typeof VERIFIED_DOCTORS[0]) => {
    setSelectedQuickDoc(doc);
    setRegNumber(doc.registrationNumber);
    setDoctorNameInput(doc.name);
    setDepartment(doc.department);
    setPin("123456");
    setErrorMsg("");
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!regNumber.trim()) {
      setErrorMsg("Please enter your Doctor Registration Number (MCI / NUID / State Council).");
      return;
    }
    if (!pin.trim()) {
      setErrorMsg("Please enter your 4-6 digit Doctor PIN.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("otp");
      // Pre-fill demo OTP 482910 for convenience
      setOtp(["4", "8", "2", "9", "1", "0"]);
    }, 450);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otp];
    updated[index] = val;
    setOtp(updated);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`doctor-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setErrorMsg("Please enter the complete 6-digit OTP.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const chosenDoc = selectedQuickDoc || VERIFIED_DOCTORS.find(d => d.department === department) || {
        name: doctorNameInput.trim() || `Dr. Physician (${regNumber})`,
        registrationNumber: regNumber.trim(),
        department,
        roomNumber: "Room 101",
        specialty: `${department} Clinical Specialist`
      };

      const session: DoctorSession = {
        isAuthenticated: true,
        name: chosenDoc.name,
        registrationNumber: chosenDoc.registrationNumber,
        department: chosenDoc.department,
        roomNumber: chosenDoc.roomNumber,
        specialty: chosenDoc.specialty,
        loginTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("samanvaya_doctor_session", JSON.stringify(session));
        localStorage.setItem("samanvaya_staff_auth", JSON.stringify({
          isAuthenticated: true,
          role: "doctor",
          name: session.name,
          id: session.registrationNumber,
          department: session.department
        }));
        window.dispatchEvent(new CustomEvent("samanvaya:doctor-auth-changed", { detail: session }));
        window.dispatchEvent(new CustomEvent("samanvaya:staff-auth-changed", { detail: { isAuthenticated: true, role: "doctor", name: session.name } }));
      }

      setIsSubmitting(false);
      if (onSuccess) onSuccess(session);
      onClose();
      router.push("/his/doctor");
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0f2942] via-[#0f4c81] to-[#1e3a8a] text-white p-6 relative">
            <button 
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-inner">
                👨‍⚕️
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-200 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>National Medical Commission (NMC) • Provider Gateway</span>
                </div>
                <h3 className="font-extrabold text-xl text-white tracking-tight">
                  Doctor Clinic Login (HIS)
                </h3>
              </div>
            </div>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              Restricted to verified medical practitioners with active National Unique Identity (NUID) or State Medical Council Registration.
            </p>
          </div>

          <div className="p-6">
            {/* Step 1: Registration Number & PIN */}
            {step === "credentials" && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                
                {/* One-Click Demo Doctor Profiles */}
                <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-3.5 mb-2">
                  <span className="text-[11px] font-bold text-[#0f4c81] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#f37021]" /> Select Doctor Profile for Instant Evaluation:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {VERIFIED_DOCTORS.map((doc) => {
                      const isSelected = selectedQuickDoc?.registrationNumber === doc.registrationNumber;
                      return (
                        <button
                          key={doc.registrationNumber}
                          type="button"
                          onClick={() => handleSelectQuickDoctor(doc)}
                          className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col ${
                            isSelected 
                              ? "bg-[#0f4c81] text-white border-[#0f4c81] shadow-xs" 
                              : "bg-white hover:bg-slate-50 text-gray-800 border-gray-200"
                          }`}
                        >
                          <span className="font-bold truncate">{doc.name}</span>
                          <span className={`text-[10px] ${isSelected ? "text-blue-100" : "text-gray-500"}`}>
                            {doc.department} • {doc.roomNumber}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form fields */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Doctor Registration (MCI / NUID / SMC)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={regNumber}
                      onChange={e => setRegNumber(e.target.value)}
                      placeholder="e.g., MCI-84920 or NUID-98412"
                      className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0f2942] focus:bg-white focus:ring-2 focus:ring-[#0f4c81] outline-none font-mono"
                    />
                    <Stethoscope className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Assigned Department / OPD
                    </label>
                    <select
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-bold text-[#0f2942] focus:bg-white focus:ring-2 focus:ring-[#0f4c81] outline-none"
                    >
                      <option value="General Medicine">General Medicine OPD</option>
                      <option value="Cardiology">Cardiology OPD</option>
                      <option value="Pulmonology">Pulmonology OPD</option>
                      <option value="Pediatrics">Pediatrics OPD</option>
                      <option value="Orthopedics">Orthopedics OPD</option>
                      <option value="AYUSH / Integrative">AYUSH / Integrative OPD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Doctor Security PIN
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        placeholder="••••••"
                        maxLength={6}
                        className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0f2942] focus:bg-white focus:ring-2 focus:ring-[#0f4c81] outline-none font-mono tracking-widest"
                      />
                      <KeyRound className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#0f4c81] hover:bg-blue-900 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Verify Credentials & Send OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: 2-Step OTP Authentication */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <Smartphone className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                  <h4 className="text-sm font-extrabold text-[#0f2942]">2-Factor Doctor Verification</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    A secure 6-digit OTP was dispatched to the mobile number registered with <strong>{regNumber}</strong>.
                  </p>
                  <span className="inline-block mt-2 px-2.5 py-1 bg-white text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-300">
                    Demo OTP: 482910
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2 text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`doctor-otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        className="w-11 h-12 text-center text-lg font-extrabold border-2 border-gray-300 rounded-xl bg-slate-50 focus:bg-white focus:border-[#0f4c81] focus:ring-1 focus:ring-[#0f4c81] outline-none font-mono transition-all"
                      />
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("credentials");
                      setErrorMsg("");
                    }}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorize & Open Doctor Desk</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
