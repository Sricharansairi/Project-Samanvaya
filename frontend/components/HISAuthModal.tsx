"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Stethoscope, ShieldCheck, Lock, User, KeyRound, 
  X, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Hospital
} from "lucide-react";

export interface StaffUser {
  isAuthenticated: boolean;
  role: "doctor" | "staff";
  name: string;
  id: string;
  department?: string;
}

interface HISAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: StaffUser) => void;
}

export default function HISAuthModal({ isOpen, onClose, onSuccess }: HISAuthModalProps) {
  const [roleTab, setRoleTab] = useState<"doctor" | "staff">("doctor");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("General Medicine OPD");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!identifier.trim()) {
      setErrorMessage(roleTab === "doctor" ? "Please enter your Doctor Registration / NUID" : "Please enter your Staff Employee ID");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Please enter your PIN or password");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const user: StaffUser = {
        isAuthenticated: true,
        role: roleTab,
        name: roleTab === "doctor" ? `Dr. ${identifier.replace(/[^a-zA-Z]/g, "") || "A. Sharma"}` : `Staff ${identifier}`,
        id: identifier,
        department
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("samanvaya_staff_auth", JSON.stringify(user));
        localStorage.setItem("samanvaya_role_view", "staff");
        window.dispatchEvent(new CustomEvent("samanvaya:staff-auth-changed", { detail: user }));
        window.dispatchEvent(new CustomEvent("samanvaya:role-changed", { detail: { role: "staff" } }));
      }

      setIsSubmitting(false);
      onSuccess(user);
      onClose();
    }, 400);
  };

  const handleQuickDemoDoctor = () => {
    const user: StaffUser = {
      isAuthenticated: true,
      role: "doctor",
      name: "Dr. A. Sharma (Senior Physician)",
      id: "MCI-DMC-49201",
      department: "General Medicine OPD"
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("samanvaya_staff_auth", JSON.stringify(user));
      localStorage.setItem("samanvaya_role_view", "staff");
      window.dispatchEvent(new CustomEvent("samanvaya:staff-auth-changed", { detail: user }));
      window.dispatchEvent(new CustomEvent("samanvaya:role-changed", { detail: { role: "staff" } }));
    }
    onSuccess(user);
    onClose();
  };

  const handleQuickDemoStaff = () => {
    const user: StaffUser = {
      isAuthenticated: true,
      role: "staff",
      name: "Sunita Verma (Triage Nurse)",
      id: "AIIMS-OPD-7702",
      department: "OPD Registration Desk"
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("samanvaya_staff_auth", JSON.stringify(user));
      localStorage.setItem("samanvaya_role_view", "staff");
      window.dispatchEvent(new CustomEvent("samanvaya:staff-auth-changed", { detail: user }));
      window.dispatchEvent(new CustomEvent("samanvaya:role-changed", { detail: { role: "staff" } }));
    }
    onSuccess(user);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden"
        >
          {/* Official MoHFW / HIS Header Banner */}
          <div className="bg-gradient-to-r from-[#0f2942] via-[#0f4c81] to-[#1d2d44] text-white p-6 relative">
            <button 
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xl">
                🏥
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-200 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>National Health Authority • HIS Gateway</span>
                </div>
                <h3 className="font-extrabold text-lg text-white tracking-tight">
                  Hospital & Staff Login (HIS)
                </h3>
              </div>
            </div>
            <p className="text-[11px] text-blue-100/80 leading-relaxed mt-1">
              Restricted portal for verified healthcare practitioners, physicians, and triage intake personnel.
            </p>
          </div>

          {/* Body Container */}
          <div className="p-6">
            
            {/* Quick Demo One-Click Access Badges (For Hackathon Evaluation) */}
            <div className="mb-5 bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3">
              <span className="text-[10px] font-bold text-[#0f4c81] uppercase tracking-wider block mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#f37021]" /> One-Click Fast Sign-In:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleQuickDemoDoctor}
                  className="px-3 py-2 bg-white hover:bg-slate-50 border border-blue-200 text-[#0f4c81] rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Stethoscope className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span className="truncate">Dr. Sharma (Doctor)</span>
                </button>
                <button
                  type="button"
                  onClick={handleQuickDemoStaff}
                  className="px-3 py-2 bg-white hover:bg-slate-50 border border-blue-200 text-[#0f4c81] rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="truncate">Nurse Sunita (Staff)</span>
                </button>
              </div>
            </div>

            {/* Role Tab Switcher: Doctor vs Staff */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => {
                  setRoleTab("doctor");
                  setDepartment("General Medicine OPD");
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  roleTab === "doctor"
                    ? "bg-white text-[#0f4c81] shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                <span>Doctor / Physician</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRoleTab("staff");
                  setDepartment("OPD Registration Desk");
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  roleTab === "staff"
                    ? "bg-white text-[#0f4c81] shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Hospital & Desk Staff</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {roleTab === "doctor" ? "Doctor National Medical Register / NUID" : "Hospital Staff / Operator ID"}
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={roleTab === "doctor" ? "e.g. MCI-2024-8891 / DMC-49201" : "e.g. AIIMS-OPD-7702"}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#0f4c81] outline-none transition-all"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Security Access PIN / Password
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter practitioner password or PIN"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#0f4c81] outline-none transition-all"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Assigned Clinical Unit / Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#0f4c81] outline-none bg-white cursor-pointer"
                >
                  <option value="General Medicine OPD">General Medicine OPD</option>
                  <option value="Emergency & Triage Unit">Emergency & Triage Unit</option>
                  <option value="Cardiology Department">Cardiology Department</option>
                  <option value="Pediatrics Clinic">Pediatrics Clinic</option>
                  <option value="AYUSH Integrative Center">AYUSH Integrative Center</option>
                  <option value="OPD Registration Desk">OPD Registration & Token Desk</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-slate-50 transition-colors text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#0f4c81] hover:bg-[#0b3860] text-white font-bold transition-all shadow-sm hover:shadow text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Verifying Credentials..." : "Authenticate & Enter HIS"}</span>
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <span className="text-[10px] text-gray-400 block">
                Statutory Notice: Non-clinical users must use the Citizen / Patient portal.
              </span>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
