"use client";

import { useState } from "react";
import { Camera, FileText, AlertTriangle, Volume2, ArrowRight, Image as ImageIcon, CheckCircle2 } from "lucide-react";

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
      isLowConfidence: true
    }
  ]);

  const triggerCameraScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 1500);
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
    <div className="w-full space-y-5">
      
      {/* Camera Capture Box */}
      <div className="bg-slate-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#0f4c81] mx-auto flex items-center justify-center border border-blue-100">
          <Camera className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#0f2942]">Hold Physical Prescription Inside the Camera Frame</p>
          <p className="text-[11px] text-gray-500">Auto-crop active • Instant extraction of generic salts</p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={triggerCameraScan}
            className="bg-[#0f4c81] hover:bg-blue-900 text-white font-semibold text-xs py-2 px-5 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {isScanning ? "Processing OCR..." : "Capture Prescription"}
          </button>
          <button
            type="button"
            onClick={() => alert("📸 Visible Symptom Photo Saved!\nTimestamped visual note attached for Doctor inspection (wound/rash). Zero unvalidated AI diagnostic claims.")}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-[#0f2942] font-semibold text-xs py-2 px-4 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-gray-600" />
            Photograph Wound / Rash
          </button>
        </div>
      </div>

      {/* Extracted Medications List */}
      {hasScanned && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#0f2942]">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#0f4c81]" />
              Extracted Active Salts & Jan Aushadhi Savings
            </span>
            <span className="text-[#0f4c81] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              3 Medicines Extracted
            </span>
          </div>

          <div className="space-y-2.5">
            {scannedMeds.map((med, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  med.isLowConfidence
                    ? "bg-amber-50/60 border-amber-300"
                    : "bg-white border-gray-200 shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0f2942]">{med.name}</span>
                      {med.isLowConfidence && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> "Not Sure" Smudged OCR
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{med.dosage}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => playAudioPrescription(med.name, med.dosage)}
                    className="p-1.5 rounded-md hover:bg-slate-100 text-[#0f4c81] transition-colors"
                    title="Audio Readback"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-medium">Salt: <strong>{med.generic}</strong></span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {med.savings}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={handleProceed}
          className="bg-[#1d2d44] hover:bg-[#0f2942] text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 text-sm shadow-sm transition-colors cursor-pointer"
        >
          Proceed to Welfare Scheme Check <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
