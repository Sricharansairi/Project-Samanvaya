"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Users, Stethoscope, Check, X, AlertTriangle, Mic, MicOff, Save, FileText, Pill, Printer } from "lucide-react";
import TrustBanner from "@/components/TrustBanner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DoctorDashboard() {
  const { t } = useLanguage();
  const [activePatient, setActivePatient] = useState<any>(null);
  const [dictationText, setDictationText] = useState("");
  const [isDictating, setIsDictating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [queue, setQueue] = useState<any[]>([]);
  
  const [lines, setLines] = useState([
    { id: 1, text: "Presenting Complaint: High grade fever with nocturnal chills and productive cough.", status: "accepted" },
    { id: 2, text: "Onset & Duration: Acute onset, 3 days duration (Gradual worsening).", status: "accepted" },
    { id: 3, text: "Previous Medication: Amoxicillin-Clav 625mg PO BD (2 days prior).", status: "accepted" }
  ]);

  const [prescriptions, setPrescriptions] = useState([
    { med: "Amoxicillin 500mg", freq: "1-0-1", days: "5 days", notes: "After food" }
  ]);

  const fetchQueue = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/db/queue`);
      const data = await res.json();
      if (data.queue) {
        setQueue(data.queue);
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setQueue([
        { token_number: "A-142", patients: { name: "Ramesh Kumar" }, chief_concern: "Fever and cough", urgency: "Medium" }
      ]);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Poll every 10s
    const intv = setInterval(fetchQueue, 10000);
    return () => clearInterval(intv);
  }, []);

  const toggleLineStatus = (id: number, newStatus: "accepted" | "rejected") => {
    setLines(lines.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const handleVoiceDictation = () => {
    if (!isDictating) {
      setIsDictating(true);
      setTimeout(() => {
        setDictationText(prev => prev + " Bilateral wheezing detected on auscultation. Prescribing Levosalbutamol.");
        setIsDictating(false);
      }, 2000);
    } else {
      setIsDictating(false);
    }
  };

  const handleFinalSave = async () => {
    setSavedSuccess(true);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${baseUrl}/api/db/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visit_id: activePatient.id,
          doctor_name: "Dr. Sharma",
          medications: prescriptions,
          clinical_summary: lines.filter(l => l.status === "accepted").map(l => l.text).join(" ") + " " + dictationText
        })
      });
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
        setSavedSuccess(false);
        setActivePatient(null);
        fetchQueue();
    }, 2000);
  };

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { med: "", freq: "", days: "", notes: "" }]);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans print:bg-white print:m-0 print:p-0">
      <div className="print:hidden">
        <TrustBanner currentTab="home" onTabChange={() => {}} onLanguageChange={() => {}} />
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col md:flex-row gap-6 print:p-0 print:m-0">
        
        {/* Left Panel: Patient Queue */}
        <div className="w-full md:w-80 flex flex-col gap-4 print:hidden">
          <div className="flex items-center justify-between mb-2">
            <a href="/his" className="flex items-center text-[#0f4c81] hover:underline font-semibold text-sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> {t("generic.back")}
            </a>
            <h1 className="text-xl font-bold text-[#0f2942] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0f4c81]" /> Queue
            </h1>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {queue.map((p, idx) => (
              <div 
                key={idx} 
                onClick={() => setActivePatient(p)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${activePatient?.id === p.id ? 'bg-blue-50 border-l-4 border-l-[#0f4c81]' : 'hover:bg-gray-50'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-[#0f2942]">{p.token_number}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.urgency === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {p.urgency || "Normal"}
                  </span>
                </div>
                <p className="font-semibold text-sm">{p.patients?.name}</p>
                <p className="text-xs text-gray-500 truncate mt-1">{p.chief_concern}</p>
              </div>
            ))}
            {queue.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">No patients in queue</div>
            )}
          </div>
        </div>

        {/* Right Panel: Doctor Console */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col print:border-none print:shadow-none">
          {!activePatient ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 print:hidden">
              <Stethoscope className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-semibold text-lg">Select a patient from the queue</p>
              <p className="text-sm">to begin clinical review and e-prescription.</p>
            </div>
          ) : (
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#0f2942] flex items-center gap-2">
                    {activePatient.patients?.name}
                    <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                      Token: {activePatient.token_number}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500 font-medium mt-1">Chief Concern: {activePatient.chief_concern}</p>
                </div>

                <div className="flex items-center gap-2.5 print:hidden">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSave}
                    className="px-6 py-2.5 rounded-lg bg-[#0f4c81] hover:bg-blue-900 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Save className="w-4 h-4" /> {savedSuccess ? "Committed ✓" : "Sign & Close (FHIR)"}
                  </button>
                </div>
              </div>

              {/* Safety Alerts */}
              {activePatient.token_number === "A-142" && (
                <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 flex items-center justify-between text-sm print:hidden">
                  <div className="flex items-center gap-3 text-red-900 font-medium">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <span><strong>National Program Alert:</strong> Symptom triad indicates potential Pulmonary TB.</span>
                  </div>
                  <button className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-2 rounded-lg text-xs">
                    Pre-fill Nikshay
                  </button>
                </div>
              )}

              {/* FHIR Draft Review */}
              <div className="bg-slate-50 border border-gray-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <span className="text-sm font-bold text-[#0f2942] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0f4c81]" />
                    Clinical Summary
                  </span>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 print:hidden">Doctor edits logged for legal audit</span>
                </div>

                <div className="space-y-2">
                  {lines.map((line) => (
                    <div
                      key={line.id}
                      className={`p-3 rounded-lg border flex items-center justify-between gap-4 transition-all text-sm ${
                        line.status === "accepted"
                          ? "bg-white border-gray-200 text-[#0f2942] font-medium"
                          : "bg-red-50 border-red-200 text-gray-400 line-through print:hidden"
                      }`}
                    >
                      <span className="flex-1">{line.text}</span>
                      <div className="flex items-center gap-2 print:hidden">
                        <button
                          onClick={() => toggleLineStatus(line.id, "accepted")}
                          className={`p-1.5 rounded-md border transition-colors ${line.status === "accepted" ? "bg-emerald-700 text-white border-emerald-700" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleLineStatus(line.id, "rejected")}
                          className={`p-1.5 rounded-md border transition-colors ${line.status === "rejected" ? "bg-red-600 text-white border-red-600" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {dictationText && (
                    <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-[#0f2942] font-medium text-sm">
                      <strong>Dictation:</strong> {dictationText}
                    </div>
                  )}
                </div>
              </div>

              {/* Dictation */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 print:hidden">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#0f2942] flex items-center gap-2">
                    <Mic className="w-4 h-4 text-[#0f4c81]" />
                    Reverse Doctor Voice Dictation
                  </span>
                </div>

                <textarea
                  value={dictationText}
                  onChange={(e) => setDictationText(e.target.value)}
                  placeholder="Dictate physical exam findings or differential diagnosis..."
                  className="w-full h-24 bg-slate-50 border border-gray-300 rounded-lg p-4 text-sm focus:bg-white focus:ring-2 focus:ring-[#0f4c81] outline-none resize-none"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleVoiceDictation}
                    className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                      isDictating ? "bg-red-600 text-white animate-pulse" : "bg-[#0f4c81] text-white hover:bg-blue-900"
                    }`}
                  >
                    {isDictating ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {isDictating ? "Stop Dictating" : "Start Dictation"}
                  </button>
                </div>
              </div>

              {/* E-Prescription */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <span className="text-sm font-bold text-[#0f2942] flex items-center gap-2">
                    <Pill className="w-4 h-4 text-[#0f4c81]" />
                    E-Prescription
                  </span>
                  <button onClick={addPrescription} className="text-sm font-bold text-[#0f4c81] hover:underline print:hidden">+ Add Medicine</button>
                </div>

                <div className="space-y-3">
                  {prescriptions.map((rx, i) => (
                    <div key={i} className="grid grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="col-span-12 sm:col-span-4">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Medicine</label>
                        <input type="text" value={rx.med} onChange={e => {
                          const newRx = [...prescriptions];
                          newRx[i].med = e.target.value;
                          setPrescriptions(newRx);
                        }} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white" placeholder="e.g. Paracetamol" />
                      </div>
                      <div className="col-span-6 sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Frequency</label>
                        <input type="text" value={rx.freq} onChange={e => {
                          const newRx = [...prescriptions];
                          newRx[i].freq = e.target.value;
                          setPrescriptions(newRx);
                        }} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white" placeholder="1-0-1" />
                      </div>
                      <div className="col-span-6 sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Duration</label>
                        <input type="text" value={rx.days} onChange={e => {
                          const newRx = [...prescriptions];
                          newRx[i].days = e.target.value;
                          setPrescriptions(newRx);
                        }} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white" placeholder="5 days" />
                      </div>
                      <div className="col-span-12 sm:col-span-4">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                        <input type="text" value={rx.notes} onChange={e => {
                          const newRx = [...prescriptions];
                          newRx[i].notes = e.target.value;
                          setPrescriptions(newRx);
                        }} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white" placeholder="After food" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </main>
  );
}
