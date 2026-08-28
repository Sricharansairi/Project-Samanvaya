"use client";

import { useState } from "react";
import { Printer, MapPin, CheckCircle2, Smartphone, ArrowRight, FileText } from "lucide-react";
import NextActionCard from "./NextActionCard";
import PortableCaseSummary from "./PortableCaseSummary";

interface Step11Props {
  onOpenDoctorView: () => void;
  tokenNumber?: string;
  department?: string;
}

export default function Step11_TokenWait({
  onOpenDoctorView,
  tokenNumber = "A-142",
  department = "General Medicine & AYUSH (Room 4, Floor 1)"
}: Step11Props) {
  const [phoneNumber, setPhoneNumber] = useState("+91 98765 43210");
  const [smsRegistered, setSmsRegistered] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const handleRegisterSms = () => {
    setSmsRegistered(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6 text-center pb-12">
      
      {/* Success Badge */}
      <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-[#0f2942]">Patient Intake Completed!</h3>
        <p className="text-xs text-gray-500 mt-1">Your structured clinical anamnesis has been securely generated as an ABDM FHIR R4 Bundle.</p>
      </div>

      {/* Main Token Receipt Card (Clean White UIDAI Style) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs text-left space-y-5">
        
        {/* Next Action Card replaces old token display */}
        <NextActionCard 
          type="pre-consultation" 
          token={tokenNumber} 
          department={department} 
          doctorType="Specialist" 
        />

        {/* Live SMS Alert Registration */}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#0f4c81]" />
            <span className="text-xs font-bold text-[#0f2942]">Live Queue SMS Updates ("How long until my turn")</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Avoid crowded waiting rooms! We will text you automatically when 3 patients remain before your turn.
          </p>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1 bg-slate-50 border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-[#0f2942] font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-[#0f4c81]"
              placeholder="Enter mobile number"
            />
            <button
              type="button"
              onClick={handleRegisterSms}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                smsRegistered
                  ? "bg-emerald-700 text-white"
                  : "bg-[#0f4c81] hover:bg-blue-900 text-white"
              }`}
            >
              {smsRegistered ? "Alerts Active ✓" : "Register Mobile"}
            </button>
          </div>
        </div>

        {/* Portable Case Summary Toggle */}
        <button
          type="button"
          onClick={() => setShowSummary(!showSummary)}
          className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 py-3 rounded-lg flex items-center justify-center gap-2 text-blue-800 text-xs font-bold transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          {showSummary ? "Hide Portable Case Summary" : "View Portable Case Summary (Non-ABDM Hospitals)"}
        </button>

        {showSummary && (
          <div className="mt-4 border border-gray-200 rounded p-4 bg-gray-50">
             <PortableCaseSummary />
          </div>
        )}

        {/* Universal Print Slip */}
        <button
          type="button"
          onClick={handlePrint}
          className="w-full bg-slate-50 hover:bg-slate-100 border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-2 text-[#0f2942] text-xs font-bold transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-gray-600" />
          Print Physical Paper QR Receipt Slip
        </button>

      </div>

      {/* Doctor Review Screen Link */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenDoctorView}
          className="text-xs font-bold text-[#0f4c81] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>Switch to Physician Consultation Desk (Doctor View)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
