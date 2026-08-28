"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Printer, MessageSquare, MapPin, CheckCircle2, Clock, Smartphone, ArrowRight } from "lucide-react";

interface Step11Props {
  onOpenDoctorView: () => void;
  tokenNumber?: string;
  department?: string;
}

export default function Step11_TokenWait({
  onOpenDoctorView,
  tokenNumber = "A-142",
  department = "General Medicine (Room 4, 1st Floor)"
}: Step11Props) {
  const [phoneNumber, setPhoneNumber] = useState("+91 98765 43210");
  const [smsRegistered, setSmsRegistered] = useState(false);

  const handleRegisterSms = () => {
    setSmsRegistered(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center w-full max-w-2xl text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[#C2CD93]/20 border border-[#C2CD93]/40 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(194,205,147,0.3)]">
        <CheckCircle2 className="w-8 h-8 text-[#C2CD93]" />
      </div>

      <h2 className="text-3xl font-light mb-1">Check-in Complete!</h2>
      <p className="text-gray-400 text-xs sm:text-sm mb-6">Your structured anamnesis has been securely routed to the physician desk.</p>

      {/* Main Token Receipt Card */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md mb-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C2CD93]/10 blur-[50px]" />

        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">OPD Queue Token</p>
        <p className="text-6xl font-light text-white tracking-widest mb-6 font-mono">{tokenNumber}</p>

        <div className="bg-black/50 border border-white/10 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-[#C2CD93]">
            <MapPin className="w-4 h-4" />
            <span>{department}</span>
          </div>
          <p className="text-xs text-gray-400 pl-6">
            Take the elevator to Floor 1, turn right past the diagnostic lab.
          </p>
        </div>

        {/* "How long until my turn" Live SMS Registration */}
        <div className="border-t border-white/10 pt-5 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-4 h-4 text-[#C891AA]" />
            <span className="text-xs font-semibold text-white">Live Queue SMS Alerts ("How long until my turn")</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Leave the crowded waiting hall! We'll text you when you are 3 patients away.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1 bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#C891AA]"
              placeholder="Enter mobile number"
            />
            <button
              onClick={handleRegisterSms}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                smsRegistered
                  ? "bg-[#C2CD93]/20 border border-[#C2CD93] text-[#C2CD93]"
                  : "bg-[#C891AA] text-black hover:bg-[#b07b92]"
              }`}
            >
              {smsRegistered ? "Alerts Active ✓" : "Register Mobile"}
            </button>
          </div>
        </div>

        {/* Universal Print Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrint}
          className="w-full mt-6 bg-white/10 hover:bg-white/20 border border-white/20 py-3.5 rounded-xl flex items-center justify-center gap-2 text-white text-xs font-semibold transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Physical Paper Slip (QR Receipt)
        </motion.button>
      </div>

      {/* Switch to Physician Dashboard View */}
      <button
        onClick={onOpenDoctorView}
        className="text-xs text-[#C2CD93] hover:underline flex items-center gap-1.5 transition-colors"
      >
        <span>Open Physician & Doctor Review Screen (Clinician View)</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
