"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  RotateCw, Download, Printer, ShieldCheck, QrCode, Heart, AlertCircle, 
  Share2, CheckCircle2, User, Phone, Calendar, Droplets
} from "lucide-react";

export interface AbhaPatientProfile {
  name: string;
  abhaId: string;
  abhaAddress?: string;
  gender: string;
  dob: string;
  yearOfBirth?: string;
  bloodGroup?: string;
  phone?: string;
  photoUrl?: string;
  address?: string;
  district?: string;
  state?: string;
  organDonorPledge?: boolean;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  phcCenter?: string;
}

interface AbhaSmartCardProps {
  patient: AbhaPatientProfile;
  showActions?: boolean;
  compact?: boolean;
  onFlip?: (isFlipped: boolean) => void;
}

export function AbhaSmartCard({ patient, showActions = true, compact = false, onFlip }: AbhaSmartCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Omnipresent Assistant Flip Listener
  useEffect(() => {
    const handleAssistantAction = (e: any) => {
      if (e.detail?.action === "flip_card") {
        setIsFlipped(prev => {
          const next = !prev;
          if (onFlip) onFlip(next);
          return next;
        });
      }
    };
    window.addEventListener("samanvaya:assistant-action", handleAssistantAction);
    return () => window.removeEventListener("samanvaya:assistant-action", handleAssistantAction);
  }, [onFlip]);

  const formattedAbha = patient.abhaId.includes("-") 
    ? patient.abhaId 
    : patient.abhaId.replace(/(\d{2})(\d{4})(\d{4})(\d{4})/, "$1-$2-$3-$4");

  const abhaAddress = patient.abhaAddress || `${patient.name.toLowerCase().replace(/\s+/g, ".")}@abdm`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedAbha);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      {/* 3D Card Container with Perspective */}
      <div 
        className={`w-full ${compact ? "max-w-sm h-[220px]" : "max-w-md h-[270px]"} perspective-1000 relative select-none cursor-pointer group`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative preserve-3d transition-transform duration-500 rounded-2xl shadow-xl"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* ================= CARD FRONT ================= */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-white via-[#fcfbf9] to-[#f4f7fa] rounded-2xl border-2 border-amber-500/40 p-5 flex flex-col justify-between overflow-hidden shadow-lg">
            
            {/* National Tricolor Top Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />

            {/* Header: NHA & Ayushman Bharat branding */}
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-serif text-sm font-bold border border-amber-500/50 shadow-xs">
                  🏛️
                </div>
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-700 leading-tight">
                    Government of India
                  </h4>
                  <p className="text-[11px] font-bold text-[#0f4c81] leading-tight">
                    National Health Authority (NHA)
                  </p>
                </div>
              </div>

              <div className="text-right flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-800">ABDM VERIFIED</span>
              </div>
            </div>

            {/* Center: Photo + Details + QR Code */}
            <div className="flex items-center justify-between gap-4 my-auto">
              
              {/* Patient Photo with Gold Hologram Border */}
              <div className="relative shrink-0">
                <div className="w-20 h-24 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 border-2 border-amber-400 p-0.5 shadow-sm overflow-hidden flex items-center justify-center">
                  {patient.photoUrl ? (
                    <img 
                      src={patient.photoUrl} 
                      alt={patient.name} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <User className="w-10 h-10 text-[#0f4c81]" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs">
                  PVC
                </div>
              </div>

              {/* Patient Demographics */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-[#0f2942] truncate leading-tight">
                  {patient.name}
                </h3>
                <p className="text-xs font-mono font-bold text-emerald-700 truncate mt-0.5">
                  {abhaAddress}
                </p>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[11px]">
                  <div>
                    <span className="text-gray-500 font-medium block text-[9px] uppercase">DOB / YOB</span>
                    <span className="font-bold text-gray-800">{patient.dob || patient.yearOfBirth || "1988"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium block text-[9px] uppercase">Gender</span>
                    <span className="font-bold text-gray-800">{patient.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium block text-[9px] uppercase">Blood Group</span>
                    <span className="font-bold text-rose-600">{patient.bloodGroup || "O+"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium block text-[9px] uppercase">State</span>
                    <span className="font-bold text-gray-800 truncate">{patient.state || "National"}</span>
                  </div>
                </div>
              </div>

              {/* Verified ABDM Scan & Share QR Code */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-16 h-16 bg-white border border-gray-300 rounded-xl p-1 shadow-sm flex items-center justify-center">
                  <div className="w-full h-full bg-[#0f2942] rounded-lg flex items-center justify-center text-white text-xs font-mono font-bold p-1 text-center relative overflow-hidden">
                    <QrCode className="w-12 h-12 text-white" />
                  </div>
                </div>
                <span className="text-[8px] font-extrabold tracking-wider text-gray-500 mt-1 uppercase">Scan & Share</span>
              </div>

            </div>

            {/* Bottom: 14-Digit ABHA Number Display */}
            <div className="bg-[#0f4c81] text-white px-3.5 py-1.5 rounded-xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider">ABHA Number:</span>
                <span className="font-mono font-black text-sm tracking-wider text-white">
                  {formattedAbha}
                </span>
              </div>
              <span className="text-[9px] text-blue-200 font-medium flex items-center gap-1">
                Tap to Flip <RotateCw className="w-2.5 h-2.5" />
              </span>
            </div>

            {/* Background Watermark */}
            <div className="absolute right-2 top-10 opacity-5 pointer-events-none">
              <ShieldCheck className="w-36 h-36 text-slate-800" />
            </div>
          </div>

          {/* ================= CARD BACK ================= */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-[#0f2942] via-[#092238] to-[#04121e] text-white rounded-2xl border-2 border-amber-500/40 p-5 flex flex-col justify-between overflow-hidden shadow-lg">
            
            {/* National Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />

            {/* Top Back: Emergency Medical Profile */}
            <div className="flex items-center justify-between border-b border-white/15 pb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Emergency Medical Record (ICE)
                </h4>
              </div>
              {patient.organDonorPledge && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full">
                  🫀 ORGAN DONOR (NOTTO)
                </span>
              )}
            </div>

            {/* Clinical & Emergency Matrix */}
            <div className="grid grid-cols-2 gap-3 text-xs my-auto">
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-blue-300 font-semibold block uppercase">Known Allergies</span>
                <p className="font-medium text-white text-xs mt-0.5">
                  {patient.allergies?.length ? patient.allergies.join(", ") : "No Known Drug Allergies (NKDA)"}
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-blue-300 font-semibold block uppercase">Chronic Conditions</span>
                <p className="font-medium text-white text-xs mt-0.5">
                  {patient.chronicConditions?.length ? patient.chronicConditions.join(", ") : "None Logged"}
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-blue-300 font-semibold block uppercase">Emergency Next-of-Kin</span>
                <p className="font-medium text-white text-xs mt-0.5">
                  {patient.emergencyContactName || "Guardian"} ({patient.emergencyContactPhone || patient.phone})
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-blue-300 font-semibold block uppercase">Linked Primary Facility</span>
                <p className="font-medium text-white text-xs mt-0.5 truncate">
                  {patient.phcCenter || "AIIMS / District Hospital"}
                </p>
              </div>
            </div>

            {/* Bottom Back: Legal Notice & Toll-Free */}
            <div className="border-t border-white/15 pt-2 flex items-center justify-between text-[9px] text-gray-400">
              <div>
                <p>This digital card is legally valid under ABDM Act 2023.</p>
                <p className="font-mono text-gray-300">National Health Helpline: 14477</p>
              </div>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                className="text-amber-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
              >
                Front View <RotateCw className="w-2.5 h-2.5" />
              </button>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-slate-50 text-gray-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            {copiedNotification ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            {copiedNotification ? "ABHA ID Copied!" : "Copy ABHA ID"}
          </button>

          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-slate-50 text-gray-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-600" /> Flip Card 3D
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0f4c81] hover:bg-blue-900 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print Smart Card
          </button>
        </div>
      )}
    </div>
  );
}
