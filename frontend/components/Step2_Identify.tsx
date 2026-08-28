"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, UserCheck, Users, Shield, ArrowRight, UserPlus, CheckCircle2, Info } from "lucide-react";

interface Step2Props {
  onIdentify: (patientData: { abhaId: string; name: string; isCaregiver: boolean; caregiverName?: string; familyMembers?: string[] }) => void;
  onNext: () => void;
}

export default function Step2_Identify({ onIdentify, onNext }: Step2Props) {
  const [authMode, setAuthMode] = useState<"abha_qr" | "aadhaar_otp" | "family_batch" | "new_patient">("aadhaar_otp");
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
    <div className="w-full space-y-6">
      
      {/* Informative Subtext (UIDAI Style) */}
      <div className="text-xs text-gray-600 leading-relaxed bg-slate-50 border border-slate-200 p-3.5 rounded-lg">
        Verify patient identity using National Digital Health Mission (ABDM) standards or register a new walk-in patient. 
        Select your verification method below:
      </div>

      {/* Radio Selector Pills (Exact UIDAI Image 4 Style) */}
      <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#0f2942] py-2 border-b border-gray-200">
        {[
          { id: "aadhaar_otp", label: "Aadhaar / ABHA Number" },
          { id: "abha_qr", label: "Scan ABHA QR Code" },
          { id: "family_batch", label: "Family Batch (Single OTP)" },
          { id: "new_patient", label: "New Walk-in Patient" }
        ].map((item) => (
          <label key={item.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="authMode"
              checked={authMode === item.id}
              onChange={() => setAuthMode(item.id as any)}
              className="accent-[#0f4c81] w-4 h-4 cursor-pointer"
            />
            <span className={authMode === item.id ? "text-[#0f4c81] font-bold" : "text-gray-600"}>
              {item.label}
            </span>
          </label>
        ))}
      </div>

      {/* Auth Input Container */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 shadow-xs">
        
        {authMode === "aadhaar_otp" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#0f2942] block mb-1">
                Enter 14-digit ABHA Number or 12-digit Aadhaar Number *
              </label>
              <input
                type="text"
                value={abhaInput}
                onChange={(e) => setAbhaInput(e.target.value)}
                placeholder="e.g. 91-4820-1934-8291"
                className="w-full bg-slate-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-[#0f2942] font-semibold focus:bg-white focus:ring-2 focus:ring-[#0f4c81] outline-none"
              />
              <p className="text-[11px] text-emerald-700 mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Aadhaar OTP verification simulated sandbox active
              </p>
            </div>
          </div>
        )}

        {authMode === "abha_qr" && (
          <div className="text-center py-6 space-y-3 bg-slate-50 rounded-xl border border-dashed border-gray-300">
            <div className="w-20 h-20 mx-auto rounded-lg bg-white border border-gray-300 flex items-center justify-center shadow-xs">
              <QrCode className="w-10 h-10 text-[#0f4c81]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0f2942]">Hold Ayushman Bharat Card QR Code in Front of Camera</p>
              <p className="text-[11px] text-gray-500">Auto-detected in real-time with zero manual entry</p>
            </div>
          </div>
        )}

        {authMode === "family_batch" && (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-[#0f2942]">
              Select Family Member to Register (Single-OTP Verified):
            </label>
            <div className="space-y-2">
              {familyMembers.map((member) => (
                <button
                  key={member}
                  type="button"
                  onClick={() => setSelectedFamilyMember(member)}
                  className={`w-full p-3 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedFamilyMember === member
                      ? "bg-blue-50 border-[#0f4c81] text-[#0f4c81]"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{member}</span>
                  {selectedFamilyMember === member && <CheckCircle2 className="w-4 h-4 text-[#0f4c81]" />}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <input 
                type="checkbox" 
                id="memberConsent" 
                checked={memberConsentGiven} 
                onChange={(e) => setMemberConsentGiven(e.target.checked)} 
                className="accent-[#0f4c81] w-4 h-4"
              />
              <label htmlFor="memberConsent" className="text-xs text-gray-700 font-medium">
                Patient is physically present and explicitly consents to record case-taking (DPDP Act 2023 Guard)
              </label>
            </div>
          </div>
        )}

        {authMode === "new_patient" && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#0f2942] block mb-1">Patient Full Name *</label>
              <input
                type="text"
                defaultValue="Suresh Patil"
                className="w-full bg-slate-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-[#0f2942] font-semibold focus:bg-white focus:ring-2 focus:ring-[#0f4c81] outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#0f2942] block mb-1">Age</label>
                <input
                  type="number"
                  defaultValue={48}
                  className="w-full bg-slate-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-[#0f2942] font-semibold focus:bg-white focus:ring-2 focus:ring-[#0f4c81] outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#0f2942] block mb-1">Gender</label>
                <select className="w-full bg-slate-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-[#0f2942] font-semibold focus:bg-white focus:ring-2 focus:ring-[#0f4c81] outline-none">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Caregiver & Proxy Mode Accordion */}
        <div className="border-t border-gray-200 pt-4 mt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#0f4c81]" />
              <span className="text-xs font-semibold text-[#0f2942]">
                Is a family escort / caregiver reporting on the patient's behalf?
              </span>
            </div>
            <input
              type="checkbox"
              checked={isCaregiver}
              onChange={(e) => setIsCaregiver(e.target.checked)}
              className="accent-[#0f4c81] w-4 h-4 cursor-pointer"
            />
          </div>

          {isCaregiver && (
            <div className="grid grid-cols-2 gap-3 pt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <input
                type="text"
                placeholder="Caregiver Name (e.g. Amit Patil)"
                value={caregiverName}
                onChange={(e) => setCaregiverName(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-[#0f2942] outline-none"
              />
              <select
                value={caregiverRelation}
                onChange={(e) => setCaregiverRelation(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-[#0f2942] outline-none"
              >
                <option>Son / Daughter</option>
                <option>Spouse</option>
                <option>Parent</option>
                <option>ASHA Worker / Volunteer</option>
              </select>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Family member assisting from home?</span>
            <button
              type="button"
              onClick={() => alert("📱 Remote Assist Link generated!\nSMS sent to relative: https://samanvaya.gov.in/assist/P123?token=abc123xyz\nThey can now fill details on their phone.")}
              className="text-[#0f4c81] font-semibold hover:underline"
            >
              Generate Remote Assist Link →
            </button>
          </div>
        </div>

      </div>

      {/* Action Button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={handleProceed}
          className="bg-[#1d2d44] hover:bg-[#0f2942] text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 text-sm shadow-sm transition-colors cursor-pointer"
        >
          Confirm & Continue to Consent <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
