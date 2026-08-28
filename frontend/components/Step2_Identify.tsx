"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, UserCheck, Users, Shield, ArrowRight, UserPlus, CheckCircle2 } from "lucide-react";

interface Step2Props {
  onIdentify: (patientData: { abhaId: string; name: string; isCaregiver: boolean; caregiverName?: string; familyMembers?: string[] }) => void;
  onNext: () => void;
}

export default function Step2_Identify({ onIdentify, onNext }: Step2Props) {
  const [authMode, setAuthMode] = useState<"abha_qr" | "aadhaar_otp" | "new_patient" | "family_batch">("abha_qr");
  const [abhaInput, setAbhaInput] = useState("91-4820-1934-8291");
  const [isCaregiver, setIsCaregiver] = useState(false);
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverRelation, setCaregiverRelation] = useState("Son");
  const [familyMembers, setFamilyMembers] = useState<string[]>(["Ramesh Kumar (Self)", "Sita Devi (Mother)"]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState("Ramesh Kumar (Self)");
  const [memberConsentGiven, setMemberConsentGiven] = useState(true);

  const handleProceed = () => {
    onIdentify({
      abhaId: abhaInput,
      name: isCaregiver ? `${selectedFamilyMember} (via ${caregiverName || "Caregiver"})` : selectedFamilyMember,
      isCaregiver,
      caregiverName: isCaregiver ? caregiverName : undefined,
      familyMembers: authMode === "family_batch" ? familyMembers : undefined
    });
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center w-full max-w-2xl"
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-light mb-2">Patient Identification</h2>
        <p className="text-gray-400 text-sm">Fast-track verification using National Digital Health Mission (ABHA)</p>
      </div>

      {/* Auth Mode Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mb-6">
        {[
          { id: "abha_qr", label: "Scan ABHA QR", icon: <QrCode className="w-4 h-4" /> },
          { id: "aadhaar_otp", label: "Aadhaar OTP", icon: <Shield className="w-4 h-4" /> },
          { id: "family_batch", label: "Family Batch", icon: <Users className="w-4 h-4" /> },
          { id: "new_patient", label: "New Patient", icon: <UserPlus className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAuthMode(tab.id as any)}
            className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
              authMode === tab.id
                ? "bg-[#C2CD93]/20 border-[#C2CD93] text-[#C2CD93]"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Form Container */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md mb-6 space-y-5">
        {authMode === "abha_qr" && (
          <div className="text-center py-4 space-y-4">
            <div className="w-32 h-32 mx-auto border-2 border-dashed border-[#C2CD93]/50 rounded-xl flex items-center justify-center bg-black/40 relative overflow-hidden">
              <QrCode className="w-16 h-16 text-[#C2CD93]" />
              <motion.div
                animate={{ y: [0, 100, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-0 left-0 w-full h-1 bg-[#C2CD93] shadow-[0_0_10px_#C2CD93]"
              />
            </div>
            <div>
              <p className="text-sm text-gray-300 font-medium">Scan Ayushman Bharat Card QR</p>
              <p className="text-xs text-gray-500">Hold QR code in front of the kiosk camera</p>
            </div>
          </div>
        )}

        {authMode === "aadhaar_otp" && (
          <div className="space-y-3">
            <label className="text-xs text-gray-400">12-Digit Aadhaar / 14-Digit ABHA Number</label>
            <input
              type="text"
              value={abhaInput}
              onChange={(e) => setAbhaInput(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:border-[#C2CD93] outline-none"
            />
            <p className="text-[11px] text-[#C2CD93]/80">OTP sent to Aadhaar-linked mobile (Simulated Sandbox)</p>
          </div>
        )}

        {authMode === "family_batch" && (
          <div className="space-y-3">
            <label className="text-xs text-gray-400">Linked Family Members (Single-OTP Verified)</label>
            <div className="space-y-2">
              {familyMembers.map((member) => (
                <button
                  key={member}
                  onClick={() => setSelectedFamilyMember(member)}
                  className={`w-full p-3 rounded-xl border text-left text-xs flex items-center justify-between transition-all ${
                    selectedFamilyMember === member
                      ? "bg-[#C2CD93]/20 border-[#C2CD93] text-white"
                      : "bg-white/5 border-white/10 text-gray-400"
                  }`}
                >
                  <span>{member}</span>
                  {selectedFamilyMember === member && <CheckCircle2 className="w-4 h-4 text-[#C2CD93]" />}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="memberConsent" 
                checked={memberConsentGiven} 
                onChange={(e) => setMemberConsentGiven(e.target.checked)} 
                className="accent-[#C2CD93]"
              />
              <label htmlFor="memberConsent" className="text-xs text-gray-300">
                Member is present and explicitly consents to record intake (DPDP Privacy Guard)
              </label>
            </div>
          </div>
        )}

        {authMode === "new_patient" && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400">Patient Full Name</label>
              <input
                type="text"
                defaultValue="Suresh Patil"
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:border-[#C2CD93] outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Age</label>
                <input
                  type="number"
                  defaultValue={48}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:border-[#C2CD93] outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Gender</label>
                <select className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:border-[#C2CD93] outline-none">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Caregiver / Proxy Mode Accordion */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#C891AA]" />
              <span className="text-xs font-medium text-gray-200">Is a family member / caregiver answering on patient's behalf?</span>
            </div>
            <input
              type="checkbox"
              checked={isCaregiver}
              onChange={(e) => setIsCaregiver(e.target.checked)}
              className="accent-[#C891AA] w-4 h-4 cursor-pointer"
            />
          </div>

          {isCaregiver && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="grid grid-cols-2 gap-3 pt-2"
            >
              <input
                type="text"
                placeholder="Caregiver Name"
                value={caregiverName}
                onChange={(e) => setCaregiverName(e.target.value)}
                className="bg-black/50 border border-[#C891AA]/40 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <select
                value={caregiverRelation}
                onChange={(e) => setCaregiverRelation(e.target.value)}
                className="bg-black/50 border border-[#C891AA]/40 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option>Son / Daughter</option>
                <option>Spouse</option>
                <option>Parent</option>
                <option>ASHA Worker / Volunteer</option>
              </select>
            </motion.div>
          )}

          {/* Multi-Generational Remote Assist Trigger */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-gray-400">Family member at home / work?</span>
            <button
              onClick={() => alert("📱 Remote Assist Link generated!\nSMS sent to relative: https://samanvaya.gov.in/assist/P123?token=abc123xyz\nThey can now fill details on their phone.")}
              className="text-[#C2CD93] hover:underline font-medium"
            >
              Generate Remote Assist Link →
            </button>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleProceed}
        className="w-full bg-[#C2CD93] hover:bg-[#b0bd82] text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(194,205,147,0.3)] transition-all"
      >
        Confirm & Continue to Consent <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}
