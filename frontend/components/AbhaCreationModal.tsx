"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ShieldCheck, QrCode, Smartphone, CreditCard, Sparkles, 
  CheckCircle2, ArrowRight, Loader2, RefreshCw, KeyRound, UserCheck 
} from "lucide-react";
import { AbhaPatientProfile } from "./AbhaSmartCard";

interface AbhaCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: AbhaPatientProfile) => void;
  initialMobile?: string;
}

export function AbhaCreationModal({ isOpen, onClose, onSuccess, initialMobile = "" }: AbhaCreationModalProps) {
  const [activeMode, setActiveMode] = useState<"aadhaar" | "scan_share" | "mobile">("aadhaar");
  const [aadhaarNumber, setAadhaarNumber] = useState("5839-2910-3847");
  const [mobileNumber, setMobileNumber] = useState(initialMobile || "9876543210");
  const [otpStep, setOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedProfile, setVerifiedProfile] = useState<AbhaPatientProfile | null>(null);

  useEffect(() => {
    let timer: any;
    if (otpStep && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpStep, countdown]);

  if (!isOpen) return null;

  const handleSendAadhaarOtp = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setOtpStep(true);
      setCountdown(60);
    }, 800);
  };

  const handleVerifyOtp = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const p1 = Math.floor(1000 + Math.random() * 9000);
      const p2 = Math.floor(1000 + Math.random() * 9000);
      const p3 = Math.floor(1000 + Math.random() * 9000);
      const generatedAbha = `14-${p1}-${p2}-${p3}`;

      const profile: AbhaPatientProfile = {
        name: "Lakshmi Narayana Rao",
        abhaId: generatedAbha,
        abhaAddress: "lakshmi.narayana@abdm",
        gender: "Male",
        dob: "12 August 1984",
        yearOfBirth: "1984",
        bloodGroup: "B+",
        phone: mobileNumber || "9876543210",
        address: "H.No 4-21/A, Gandhi Road",
        district: "Hyderabad",
        state: "Telangana",
        organDonorPledge: true,
        allergies: ["Penicillin"],
        chronicConditions: ["Hypertension"],
        emergencyContactName: "Saraswathi Rao (Wife)",
        emergencyContactPhone: "9876500000",
        phcCenter: "Osmania General Hospital & CHC"
      };

      setVerifiedProfile(profile);
      setIsVerifying(false);
    }, 1200);
  };

  const handleScanShareSimulate = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const profile: AbhaPatientProfile = {
        name: "Ananya Deshmukh",
        abhaId: "91-3829-5729-1920",
        abhaAddress: "ananya.d@abdm",
        gender: "Female",
        dob: "24 April 1992",
        yearOfBirth: "1992",
        bloodGroup: "O+",
        phone: "9845012345",
        address: "Flat 302, Green Acres",
        district: "Pune",
        state: "Maharashtra",
        organDonorPledge: true,
        allergies: [],
        chronicConditions: [],
        emergencyContactName: "Rohit Deshmukh (Husband)",
        emergencyContactPhone: "9845099999",
        phcCenter: "District Hospital Aundh"
      };

      setVerifiedProfile(profile);
      setIsVerifying(false);
    }, 1000);
  };

  const handleConfirmProfile = () => {
    if (verifiedProfile) {
      // Store in localStorage for persistence
      localStorage.setItem("mockAbhaId", verifiedProfile.abhaId);
      onSuccess(verifiedProfile);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col font-sans max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#0f4c81] p-5 text-white flex items-center justify-between relative overflow-hidden">
            <div className="flex items-center gap-2.5 z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">ABDM Ayushman Identity Suite</h3>
                <p className="text-xs text-blue-100">Official National Health Authority (NHA) Sandbox</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-white/5 transform skew-x-12 pointer-events-none" />
          </div>

          {!verifiedProfile ? (
            <div className="p-6 overflow-y-auto flex-1">
              
              {/* Mode Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => { setActiveMode("aadhaar"); setOtpStep(false); }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeMode === "aadhaar" 
                      ? "bg-white text-[#0f4c81] shadow-xs" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> Aadhaar e-KYC
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveMode("scan_share"); setOtpStep(false); }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeMode === "scan_share" 
                      ? "bg-white text-[#0f4c81] shadow-xs" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" /> Scan & Share
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveMode("mobile"); setOtpStep(false); }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeMode === "mobile" 
                      ? "bg-white text-[#0f4c81] shadow-xs" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile OTP
                </button>
              </div>

              {/* Mode 1: Aadhaar e-KYC */}
              {activeMode === "aadhaar" && (
                <div className="space-y-4">
                  {!otpStep ? (
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        12-Digit Aadhaar Number
                      </label>
                      <input
                        type="text"
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value)}
                        placeholder="XXXX-XXXX-XXXX"
                        className="w-full text-base font-mono tracking-widest px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-gray-500">
                          Encrypted 256-bit UIDAI Sandbox connection.
                        </span>
                        <button
                          type="button"
                          onClick={() => setAadhaarNumber("5839-2910-3847")}
                          className="text-[11px] font-bold text-[#0f4c81] hover:underline cursor-pointer"
                        >
                          Auto-fill Demo Aadhaar
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleSendAadhaarOtp}
                        disabled={isVerifying}
                        className="w-full mt-6 bg-[#0f4c81] hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Aadhaar OTP"}
                        {!isVerifying && <ArrowRight className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-xs text-blue-900">
                        OTP sent to Aadhaar-linked mobile: <strong>******3210</strong>. Valid for {countdown}s.
                      </div>

                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Enter 6-Digit OTP
                      </label>
                      <input
                        type="text"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full text-center text-2xl font-mono tracking-widest px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />

                      <div className="flex items-center justify-between mt-2">
                        <button
                          type="button"
                          onClick={() => setOtpValue("123456")}
                          className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                        >
                          ✨ Auto-fill Demo OTP (123456)
                        </button>
                        <span className="text-xs text-gray-400 font-mono">00:{countdown < 10 ? `0${countdown}` : countdown}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={isVerifying}
                        className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Generate ABHA ID"}
                        {!isVerifying && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: ABDM Scan & Share Simulator */}
              {activeMode === "scan_share" && (
                <div className="text-center space-y-4">
                  <div className="w-44 h-44 bg-white border-2 border-dashed border-[#0f4c81] rounded-2xl mx-auto p-3 flex flex-col items-center justify-center shadow-inner">
                    <QrCode className="w-32 h-32 text-[#0f2942]" />
                    <span className="text-[10px] font-mono font-bold text-gray-500 uppercase mt-1">COUNTER-04-OPD</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Hospital Desk Fast Token QR</h4>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                      In real clinics, patients scan this with the ABHA / Aarogya Setu App to share their profile instantly.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleScanShareSimulate}
                    disabled={isVerifying}
                    className="w-full bg-[#0f4c81] hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "📱 Simulate Patient App Scan & Instant Share"}
                  </button>
                </div>
              )}

              {/* Mode 3: Mobile OTP */}
              {activeMode === "mobile" && (
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    10-Digit Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full text-base font-mono px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifying}
                    className="w-full mt-4 bg-[#0f4c81] hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Mobile & Load ABHA"}
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* Verified Success State */
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">ABHA Profile Successfully Verified!</h4>
                  <p className="text-xs text-emerald-800">Demographic e-KYC record retrieved from National Health Authority sandbox.</p>
                </div>
              </div>

              {/* Patient Summary Card */}
              <div className="border border-gray-200 rounded-2xl p-5 space-y-3 text-sm bg-slate-50">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">Full Name:</span>
                  <span className="font-bold text-gray-900">{verifiedProfile.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">14-Digit ABHA ID:</span>
                  <span className="font-mono font-extrabold text-[#0f4c81]">{verifiedProfile.abhaId}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">ABHA Address:</span>
                  <span className="font-mono font-bold text-emerald-700">{verifiedProfile.abhaAddress}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">DOB / Gender:</span>
                  <span className="font-semibold text-gray-800">{verifiedProfile.dob} ({verifiedProfile.gender})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Blood Group:</span>
                  <span className="font-bold text-rose-600">{verifiedProfile.bloodGroup}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setVerifiedProfile(null)}
                  className="px-4 py-3 rounded-xl border border-gray-300 font-semibold text-xs text-gray-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmProfile}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" /> Populate Registration Form
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
