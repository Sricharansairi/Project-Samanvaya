"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Check, AlertTriangle, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export interface ChipOption {
  label: string;
  value: string | number;
  isRedFlag?: boolean;
}

export interface ParamConfig {
  key: string;
  question: string;
  label?: string;
  options: ChipOption[];
}

interface ChipParameterModalProps {
  isOpen: boolean;
  onClose: () => void;
  conditionName?: string;
  parameterConfigs: ParamConfig[];
  currentStep: number;
  totalSteps: number;
  onNext: (stepAnswer: any) => void;
  onPrevious: () => void;
  onComplete: (allAnswers: Record<string, any>) => void;
  currentAnswers: Record<string, any>;
}

export function ChipParameterModal({
  isOpen,
  onClose,
  conditionName = "Clinical Evaluation",
  parameterConfigs,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onComplete,
  currentAnswers,
}: ChipParameterModalProps) {
  const [answers, setAnswers] = useState<Record<string, any>>(currentAnswers || {});
  const [selectedVal, setSelectedVal] = useState<any>(null);
  const [freeText, setFreeText] = useState("");

  // Sync with parent's currentAnswers on open
  useEffect(() => {
    if (isOpen) {
      setAnswers(currentAnswers || {});
    }
  }, [isOpen]);

  // When step changes, load previously selected answer if present
  useEffect(() => {
    const cfg = parameterConfigs[currentStep - 1];
    if (!cfg) return;

    const existing = answers[cfg.key];
    if (existing !== undefined && existing !== null) {
      const match = cfg.options.find(o => String(o.value) === String(existing));
      if (match) {
        setSelectedVal(match.value);
        setFreeText("");
      } else {
        setSelectedVal(null);
        setFreeText(String(existing));
      }
    } else {
      setSelectedVal(null);
      setFreeText("");
    }
  }, [currentStep, parameterConfigs]);

  const cfg = parameterConfigs[currentStep - 1];
  const isLast = currentStep === totalSteps;
  const progressPercent = totalSteps > 0 ? ((currentStep - 1) / totalSteps) * 100 : 0;

  if (!isOpen || !cfg) return null;

  const handleSelectChip = (opt: ChipOption) => {
    setSelectedVal(opt.value);
    setFreeText("");
    const updated = { ...answers, [cfg.key]: opt.value };
    setAnswers(updated);
  };

  const handleFreeTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFreeText(val);
    if (val.trim()) {
      setSelectedVal(null);
      setAnswers({ ...answers, [cfg.key]: val });
    }
  };

  const handleForward = () => {
    const finalValue = selectedVal !== null ? selectedVal : (freeText.trim() ? freeText : "Not specified");
    const updated = { ...answers, [cfg.key]: finalValue };
    setAnswers(updated);

    if (isLast) {
      onComplete(updated);
    } else {
      onNext(finalValue);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col font-sans"
        >
          {/* Header */}
          <div className="bg-[#0f4c81] p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">AI Clinical Interrogator</h3>
                <p className="text-xs text-blue-100">{conditionName} • Question {currentStep} of {totalSteps}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 h-1.5 overflow-hidden">
            <motion.div
              className="bg-amber-400 h-full"
              initial={{ width: `${progressPercent}%` }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Question Body */}
          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f4c81] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Diagnostic Parameter
              </span>
              <h4 className="text-lg font-bold text-gray-900 mt-2">
                {cfg.question}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Select the chip that best describes the patient’s symptom, or type a custom note.
              </p>
            </div>

            {/* Chips Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {cfg.options.map((opt, idx) => {
                const isSelected = selectedVal === opt.value;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectChip(opt)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-sm font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0f4c81] text-white border-[#0f4c81] shadow-md scale-[1.01]"
                        : "bg-white hover:bg-slate-50 border-gray-200 text-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {opt.isRedFlag && (
                        <AlertTriangle className={`w-4 h-4 shrink-0 ${isSelected ? "text-amber-300" : "text-amber-500"}`} />
                      )}
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 shrink-0 text-white" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Free Text Input */}
            <div className="mt-auto">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Or describe specific details (optional):
              </label>
              <input
                type="text"
                value={freeText}
                onChange={handleFreeTextChange}
                placeholder="Type additional clinical observation..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f4c81] focus:border-transparent bg-slate-50 text-gray-800"
              />
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              type="button"
              disabled={currentStep <= 1}
              onClick={onPrevious}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                currentStep <= 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                Skip Details
              </button>

              <button
                type="button"
                onClick={handleForward}
                className="flex items-center gap-1.5 bg-[#0f4c81] hover:bg-blue-900 text-white px-5 py-2 text-sm font-semibold rounded-lg shadow-md transition-colors cursor-pointer"
              >
                {isLast ? "Complete & Triage" : "Next Parameter"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
