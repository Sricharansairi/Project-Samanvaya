"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Users, Bell, Clock, CheckCircle2, Phone, Volume2, 
  Send, Sparkles, Filter, ChevronRight, AlertCircle, RefreshCw
} from "lucide-react";
import TrustBanner from "@/components/TrustBanner";

interface QueueToken {
  tokenNumber: number;
  patientName: string;
  abhaId: string;
  phone: string;
  department: string;
  roomNumber: string;
  doctorName: string;
  urgency: "Normal" | "High" | "Emergency";
  status: "WAITING" | "CALLED" | "IN_CONSULT" | "COMPLETED" | "NO_SHOW";
  registrationTime: string;
  estimatedWaitMinutes: number;
}

export default function QueueTrackerPage() {
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [lastCalledToken, setLastCalledToken] = useState<QueueToken | null>(null);
  const [announcementAudio, setAnnouncementAudio] = useState(true);
  const [smsNotificationStatus, setSmsNotificationStatus] = useState<string | null>(null);

  const [tokens, setTokens] = useState<QueueToken[]>([
    {
      tokenNumber: 101,
      patientName: "Suresh Kumar",
      abhaId: "91-4920-1928-3847",
      phone: "9876501234",
      department: "Cardiology",
      roomNumber: "Room 102",
      doctorName: "Dr. Arvind Rao",
      urgency: "High",
      status: "IN_CONSULT",
      registrationTime: "09:30 AM",
      estimatedWaitMinutes: 0
    },
    {
      tokenNumber: 102,
      patientName: "Ananya Sen",
      abhaId: "91-3829-5729-1920",
      phone: "9845012345",
      department: "General Medicine",
      roomNumber: "Room 101",
      doctorName: "Dr. Anita Sengupta",
      urgency: "Normal",
      status: "CALLED",
      registrationTime: "09:42 AM",
      estimatedWaitMinutes: 0
    },
    {
      tokenNumber: 103,
      patientName: "Mohd. Ibrahim",
      abhaId: "91-8492-0192-4829",
      phone: "9912345678",
      department: "General Medicine",
      roomNumber: "Room 101",
      doctorName: "Dr. Anita Sengupta",
      urgency: "Normal",
      status: "WAITING",
      registrationTime: "09:55 AM",
      estimatedWaitMinutes: 8
    },
    {
      tokenNumber: 104,
      patientName: "Kamala Devi",
      abhaId: "91-5839-2910-3847",
      phone: "9876543210",
      department: "Cardiology",
      roomNumber: "Room 102",
      doctorName: "Dr. Arvind Rao",
      urgency: "High",
      status: "WAITING",
      registrationTime: "10:05 AM",
      estimatedWaitMinutes: 14
    },
    {
      tokenNumber: 105,
      patientName: "Rajeshwar Varma",
      abhaId: "91-2849-1029-4820",
      phone: "9123456789",
      department: "AYUSH / Integrative",
      roomNumber: "Room 105",
      doctorName: "Vaidya Shastry",
      urgency: "Normal",
      status: "WAITING",
      registrationTime: "10:12 AM",
      estimatedWaitMinutes: 20
    },
    {
      tokenNumber: 106,
      patientName: "Basheer Ahmed",
      abhaId: "91-7483-9201-3849",
      phone: "9786543210",
      department: "Pulmonology",
      roomNumber: "Room 103",
      doctorName: "Dr. Meenakshi",
      urgency: "High",
      status: "WAITING",
      registrationTime: "10:18 AM",
      estimatedWaitMinutes: 26
    }
  ]);

  const departments = ["All", "General Medicine", "Cardiology", "Pulmonology", "AYUSH / Integrative"];

  const filteredTokens = departmentFilter === "All" 
    ? tokens 
    : tokens.filter(t => t.department === departmentFilter);

  const callingToken = tokens.find(t => t.status === "CALLED") || tokens.find(t => t.status === "IN_CONSULT");
  const waitingTokens = filteredTokens.filter(t => t.status === "WAITING");

  const triggerChime = async (token: QueueToken) => {
    if (!announcementAudio) return;
    try {
      const text = `टोकन नंबर ${token.tokenNumber}। ${token.patientName}, कृपया ${token.roomNumber}, ${token.doctorName} के पास जाएँ। Token number ${token.tokenNumber}, please proceed to ${token.roomNumber}.`;
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          language_code: "hi-IN",
          speaker: "pooja"
        })
      });
      const data = await res.json();
      if (data.base64_audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.base64_audio}`);
        audio.play();
        return;
      }
    } catch (e) {
      console.warn("Sarvam audio callout fallback:", e);
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(`Token number ${token.tokenNumber}. Please proceed to ${token.roomNumber}, ${token.doctorName}.`);
      speech.rate = 0.9;
      speech.pitch = 1.05;
      window.speechSynthesis.speak(speech);
    }
  };

  const handleCallNext = (token: QueueToken) => {
    const updated = tokens.map(t => {
      if (t.tokenNumber === token.tokenNumber) {
        return { ...t, status: "CALLED" as const };
      }
      if (t.roomNumber === token.roomNumber && t.status === "CALLED") {
        return { ...t, status: "IN_CONSULT" as const };
      }
      return t;
    });

    setTokens(updated);
    setLastCalledToken(token);
    triggerChime(token);

    // Simulate SMS dispatch
    setSmsNotificationStatus(`SMS dispatched to +91-${token.phone}: "Samanvaya Alert: Token #${token.tokenNumber} is now called to ${token.roomNumber}."`);
    setTimeout(() => setSmsNotificationStatus(null), 5000);
  };

  // Omnipresent Assistant Action Listener
  useEffect(() => {
    const handleAssistantAction = (e: any) => {
      if (e.detail?.action === "call_next_token") {
        const nextWaiting = tokens.find(t => t.status === "WAITING");
        if (nextWaiting) {
          handleCallNext(nextWaiting);
        }
      }
    };
    window.addEventListener("samanvaya:assistant-action", handleAssistantAction);
    return () => window.removeEventListener("samanvaya:assistant-action", handleAssistantAction);
  }, [tokens]);

  const handleMarkComplete = (tokenNumber: number) => {
    setTokens(tokens.map(t => t.tokenNumber === tokenNumber ? { ...t, status: "COMPLETED" } : t));
  };

  const handleSkip = (tokenNumber: number) => {
    setTokens(tokens.map(t => t.tokenNumber === tokenNumber ? { ...t, status: "NO_SHOW" } : t));
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      <TrustBanner currentTab="his" onTabChange={() => {}} onLanguageChange={() => {}} />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <a href="/his" className="flex items-center text-[#0f4c81] hover:underline font-semibold text-sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to HIS Roles
          </a>
          <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200 font-medium flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Live OPD Queue & SMS Gateway
          </span>
        </div>

        {/* SMS Notification Banner */}
        <AnimatePresence>
          {smsNotificationStatus && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-600 text-white p-3.5 rounded-xl text-xs font-semibold shadow-md mb-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 animate-bounce" />
                <span>{smsNotificationStatus}</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">Gateway 200 OK</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Master Call Board (Hospital TV Display Style) */}
        <div className="bg-gradient-to-r from-[#0f2942] via-[#0f4c81] to-[#1e3a8a] text-white rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">Live Hospital OPD Display Board</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAnnouncementAudio(!announcementAudio)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  announcementAudio ? "bg-white/20 border-white/30 text-white" : "bg-black/30 border-white/10 text-gray-300"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" /> {announcementAudio ? "Voice Chime: ON" : "Voice Chime: MUTE"}
              </button>
              <span className="text-xs font-mono bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                Current Time: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          {callingToken ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1 text-center md:text-left">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-1">
                  NOW CALLING / CURRENT TOKEN
                </span>
                <div className="text-6xl sm:text-7xl font-extrabold tracking-tight text-white font-mono">
                  #{callingToken.tokenNumber}
                </div>
                <span className="inline-block mt-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-bold">
                  {callingToken.urgency.toUpperCase()} PRIORITY
                </span>
              </div>

              <div className="md:col-span-2 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-blue-200 block font-medium">Patient Name</span>
                    <span className="text-lg font-bold text-white">{callingToken.patientName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-blue-200 block font-medium">Assigned Location</span>
                    <span className="text-lg font-bold text-emerald-300">{callingToken.roomNumber}</span>
                  </div>
                  <div>
                    <span className="text-xs text-blue-200 block font-medium">Department</span>
                    <span className="font-semibold text-white">{callingToken.department}</span>
                  </div>
                  <div>
                    <span className="text-xs text-blue-200 block font-medium">Attending Physician</span>
                    <span className="font-semibold text-white">{callingToken.doctorName}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => triggerChime(callingToken)}
                    className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Repeat Chime
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkComplete(callingToken.tokenNumber)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Consultation Done
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSkip(callingToken.tokenNumber)}
                    className="flex items-center gap-1.5 bg-rose-600/80 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> Patient No-Show
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl">☕</span>
              <p className="font-bold text-base mt-2">All called patients have been attended to.</p>
              <p className="text-xs text-blue-200">Call the next patient from the waiting queue below.</p>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter className="w-4 h-4 text-gray-500 shrink-0" />
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setDepartmentFilter(dept)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer whitespace-nowrap ${
                  departmentFilter === dept
                    ? "bg-[#0f4c81] text-white border-[#0f4c81] shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-slate-50"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Waiting in Queue: <span className="font-bold text-gray-900">{waitingTokens.length} patients</span>
          </div>
        </div>

        {/* Queue Table / Grid */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                  <th className="p-4">Token</th>
                  <th className="p-4">Patient Information</th>
                  <th className="p-4">Department & Room</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Wait Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Doctor Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTokens.map((t) => (
                  <tr key={t.tokenNumber} className={`hover:bg-slate-50/80 transition-colors ${t.status === "CALLED" ? "bg-amber-50/50" : ""}`}>
                    <td className="p-4">
                      <span className="font-mono font-extrabold text-base text-[#0f4c81]">#{t.tokenNumber}</span>
                      <div className="text-[10px] text-gray-400 mt-0.5">{t.registrationTime}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-gray-900 text-sm">{t.patientName}</div>
                      <div className="text-[11px] font-mono text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> +91-{t.phone}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{t.department}</div>
                      <div className="text-[11px] text-emerald-700 font-bold">{t.roomNumber} ({t.doctorName})</div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.urgency === "Emergency" 
                          ? "bg-red-100 text-red-800" 
                          : (t.urgency === "High" ? "bg-amber-100 text-amber-800" : "bg-blue-50 text-blue-700")
                      }`}>
                        {t.urgency}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 text-gray-700 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>~{t.estimatedWaitMinutes} mins</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === "CALLED" 
                          ? "bg-amber-100 text-amber-800 animate-pulse" 
                          : (t.status === "IN_CONSULT" 
                              ? "bg-purple-100 text-purple-800" 
                              : (t.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"))
                      }`}>
                        {t.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {t.status === "WAITING" && (
                        <button
                          type="button"
                          onClick={() => handleCallNext(t)}
                          className="bg-[#0f4c81] hover:bg-blue-900 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          Call Token
                        </button>
                      )}
                      {t.status === "CALLED" && (
                        <button
                          type="button"
                          onClick={() => handleMarkComplete(t.tokenNumber)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          Finish
                        </button>
                      )}
                      {t.status === "COMPLETED" && (
                        <span className="text-emerald-600 font-semibold flex items-center justify-end gap-1 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
