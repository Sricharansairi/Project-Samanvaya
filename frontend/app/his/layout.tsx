"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, ShieldAlert, ArrowLeft, Stethoscope, UserCheck, Sparkles, Building2 } from "lucide-react";
import HISAuthModal from "@/components/HISAuthModal";

export default function HISLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staffInfo, setStaffInfo] = useState<{ role: string; name: string } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const checkAuth = () => {
    try {
      const stored = localStorage.getItem("samanvaya_staff_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isAuthenticated) {
          setIsAuthenticated(true);
          setStaffInfo({ role: parsed.role, name: parsed.name });
          return;
        }
      }
    } catch {
      // ignore parsing error
    }
    setIsAuthenticated(false);
    setStaffInfo(null);
  };

  useEffect(() => {
    setIsMounted(true);
    checkAuth();

    const handleAuthChange = () => checkAuth();
    const handleOpenModal = () => setShowModal(true);

    window.addEventListener("samanvaya:staff-auth-changed", handleAuthChange);
    window.addEventListener("samanvaya:open-his-modal", handleOpenModal);

    return () => {
      window.removeEventListener("samanvaya:staff-auth-changed", handleAuthChange);
      window.removeEventListener("samanvaya:open-his-modal", handleOpenModal);
    };
  }, []);

  // Avoid flash during SSR hydration
  if (!isMounted) {
    return <div className="min-h-screen bg-[#f8fafc]" />;
  }

  // If authenticated as Doctor or Staff, render the protected HIS children
  if (isAuthenticated) {
    return (
      <>
        {children}
        <HISAuthModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => checkAuth()}
        />
      </>
    );
  }

  // If unauthenticated (Patient or anonymous visitor), show restricted gate
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden font-sans">
      {/* Subtle Healthcare Atmospheric Backdrop */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{ backgroundImage: "url('/healthcare-bg.jpg')" }}
      />
      
      {/* Top Banner */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            🏥
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-100 flex items-center gap-2">
              National Health Authority &bull; MoHFW
              <span className="text-[10px] uppercase font-semibold bg-emerald-950 border border-emerald-800/80 text-emerald-300 px-2 py-0.5 rounded">
                ABDM Compliant
              </span>
            </h1>
            <p className="text-xs text-slate-400">Hospital Information System (HIS) Secure Enclave</p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Citizen Portal
        </Link>
      </header>

      {/* Main Centered Gate */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="max-w-xl w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-5">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-block mb-3 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            Clinical Authorization Required
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Hospital & Staff (HIS) Enclave
          </h2>

          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            In accordance with <strong className="text-white">ABDM Security Guidelines</strong> and the{" "}
            <strong className="text-white">DPDP Act 2023</strong>, access to clinical dashboards, prescription writing, 
            and hospital operations is strictly restricted to authenticated hospital personnel and doctors.
          </p>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">Patients & Citizens:</strong> Please access services via the Patient Kiosk, ABHA generation, PM-JAY schemes, and Jan Aushadhi generic search.
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <Stethoscope className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-100">Doctors & Hospital Staff:</strong> Sign in with your NUID or Staff ID to access triage, OPD queues, and AI diagnostics.
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
            >
              <Stethoscope className="w-4 h-4" />
              Sign In as Doctor / Staff
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Patient Portal
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 px-6 py-3 text-center text-xs text-slate-500 z-10">
        Project Samanvaya &bull; National Health Stack (ABDM / NHA) &bull; DPDP 2023 Compliant Zero-Knowledge Clinical Gateway
      </footer>

      {/* Auth Modal */}
      <HISAuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => checkAuth()}
      />
    </div>
  );
}
