"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, FileText, AlertTriangle, Volume2, ArrowRight, Check, Image as ImageIcon } from "lucide-react";

interface Step7Props {
  onScanComplete: (scannedData: {
    extractedMeds: { name: string; dosage: string; generic: string; savings: string; isLowConfidence?: boolean }[];
  }) => void;
  onNext: () => void;
}

export default function Step7_DocumentScan({ onScanComplete, onNext }: Step7Props) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(true);
  const [scannedMeds, setScannedMeds] = useState([
    {
      name: "Augmentin 625",
      dosage: "1 tab twice daily",
      generic: "Amoxicillin + Clavulanic Acid 625mg",
      savings: "Save ₹175 at Jan Aushadhi (₹220 vs ₹45)",
      isLowConfidence: false
    },
    {
      name: "Pan-40 (Pantoprazole)",
      dosage: "1 tab before breakfast",
      generic: "Pantoprazole 40mg",
      savings: "Save ₹92 at Jan Aushadhi (₹110 vs ₹18)",
      isLowConfidence: false
    },
    {
      name: "Glycomet-500 (Smudged)",
      dosage: "1 tab after dinner",
      generic: "Metformin 500mg",
      savings: "Save ₹50 (₹60 vs ₹10)",
      isLowConfidence: true // Triggers the "Not Sure" crop fallback!
    }
  ]);

  const triggerCameraScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 1800);
  };

  const playAudioPrescription = (medName: string, dosage: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = `This medicine is ${medName}. Take ${dosage}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleProceed = () => {
    onScanComplete({ extractedMeds: scannedMeds });
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center w-full max-w-3xl"
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-light mb-2">Prescription & Lab OCR Scanner</h2>
        <p className="text-gray-400 text-xs sm:text-sm max-w-md">
          Capture previous prescriptions. AI extracts active salts, alerts doctors to allergies, and suggests generic savings.
        </p>
      </div>

      {/* Camera Capture Zone */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md mb-6 relative overflow-hidden">
        <div className="border-2 border-dashed border-[#C2CD93]/40 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-black/40 relative">
          <Camera className="w-12 h-12 text-[#C2CD93] mb-3" />
          <p className="text-sm font-medium text-white mb-1">Hold Document Inside the Frame</p>
          <p className="text-xs text-gray-500 mb-4">Auto-crop and edge detection active</p>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={triggerCameraScan}
              className="bg-[#C2CD93]/20 hover:bg-[#C2CD93]/30 border border-[#C2CD93]/50 text-[#C2CD93] text-xs font-semibold px-5 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(194,205,147,0.2)]"
            >
              {isScanning ? "Processing OCR..." : "Capture Prescription"}
            </motion.button>

            <button
              onClick={() => alert("📸 Visible Symptom Photo Saved!\nTimestamped visual note attached for Doctor inspection (wound/rash). Zero unvalidated AI diagnostic claims.")}
              className="bg-[#C891AA]/20 hover:bg-[#C891AA]/30 border border-[#C891AA]/50 text-[#C891AA] text-xs font-semibold px-4 py-2.5 rounded-full flex items-center gap-2 transition-all"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Photograph Wound / Rash
            </button>
          </div>
        </div>
      </div>

      {/* Extracted Medications with "Not Sure" Flags */}
      {hasScanned && (
        <div className="w-full space-y-3 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C2CD93]" />
              Extracted Medications & Generic Equivalents
            </span>
            <span className="text-[11px] text-[#C2CD93]">3 Medicines Detected</span>
          </div>

          {scannedMeds.map((med, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${
                med.isLowConfidence
                  ? "bg-amber-500/10 border-amber-500/40"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{med.name}</p>
                    {med.isLowConfidence && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> "Not Sure" Flag
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{med.dosage}</p>
                </div>

                <button
                  onClick={() => playAudioPrescription(med.name, med.dosage)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#C2CD93] transition-colors"
                  title="Audio Playback of Prescription"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Rupee Savings Badge */}
              <div className="flex items-center justify-between bg-black/40 rounded-xl p-2.5 text-xs">
                <span className="text-gray-300">Generic: <span className="text-white font-medium">{med.generic}</span></span>
                <span className="text-[#C2CD93] font-bold">{med.savings}</span>
              </div>

              {/* Low-confidence raw image crop fallback */}
              {med.isLowConfidence && (
                <div className="mt-3 p-2.5 bg-black/60 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Smudged Doctor Handwriting. Raw crop preserved for Physician review.</span>
                  </div>
                  <span className="font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded">Crop #OCR-3</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleProceed}
        className="w-full bg-[#C2CD93] hover:bg-[#b0bd82] text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(194,205,147,0.3)] transition-all"
      >
        Check Scheme Eligibility & Subsidies <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}
