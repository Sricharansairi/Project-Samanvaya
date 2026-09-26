"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, ArrowLeft, Stethoscope, UserCheck, ShieldCheck } from "lucide-react";
import HISAuthModal from "@/components/HISAuthModal";

// Strictly restricted clinical/administrative routes requiring Doctor/Staff auth
const RESTRICTED_CLINICAL_ROUTES = [
  "/his/doctor",
  "/his/registration",
  "/his/rag",
  "/his/antimicrobial",
  "/his/dpdp",
];

export default function HISLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const checkAuth = () => {
    try {
      const stored = localStorage.getItem("samanvaya_staff_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.isAuthenticated) {
          setIsAuthenticated(true);
          return;
        }
      }
    } catch {
      // ignore parsing error
    }
    setIsAuthenticated(false);
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

  // Check if current route is a clinical restricted route
  const isRestricted =
    pathname === "/his" ||
    pathname === "/his/" ||
    RESTRICTED_CLINICAL_ROUTES.some((route) => pathname?.startsWith(route));

  // If the route is a public citizen service (e.g. /his/schemes, /his/ocr, /his/tele-manas, /his/ayush, /his/queue),
  // OR the user is already authenticated as staff, render children directly!
  if (!isRestricted || isAuthenticated) {
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

  // If unauthenticated patient/visitor on a restricted doctor/staff desk, show clean white/light gate matching the rest of the UI
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col relative overflow-hidden font-sans">
      {/* Subtle Healthcare Atmospheric Backdrop */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{ backgroundImage: "url('/healthcare-bg.jpg')" }}
      />
      
      {/* Official Government Top Header */}
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur px-6 py-3.5 flex items-center justify-between z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 p-1 flex items-center justify-center shadow-xs shrink-0">
            <img 
              src="/logo.png" 
              alt="Project Samanvaya Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#f37021] uppercase tracking-wide">MoHFW &bull; AYUSH</span>
              <span className="text-gray-300">|</span>
              <span className="text-[10px] uppercase font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full">
                ABDM Compliant
              </span>
            </div>
            <h1 className="text-sm font-bold text-[#0f2942] tracking-tight">
              Hospital Information System (HIS) &bull; Clinical Gateway
            </h1>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#0f4c81] hover:text-[#0b3860] bg-blue-50/70 hover:bg-blue-100/70 px-3.5 py-2 rounded-xl border border-blue-200 transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Citizen Portal
        </Link>
      </header>

      {/* Main Centered White Gate Card */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="max-w-xl w-full bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mb-5 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-block mb-3 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
            Clinical Authorization Required
          </div>

          <h2 className="text-2xl font-extrabold text-[#0f2942] mb-3 tracking-tight">
            Hospital & Staff (HIS) Enclave
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
            In accordance with <strong className="text-[#0f2942]">ABDM Security Guidelines</strong> and the{" "}
            <strong className="text-[#0f2942]">DPDP Act 2023</strong>, access to clinical dashboards, prescription writing, 
            and hospital operations is strictly restricted to authenticated hospital personnel and doctors.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-7 text-left space-y-2.5">
            <div className="flex items-start gap-2.5 text-xs text-slate-700">
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#0f2942]">Patients & Citizens:</strong> Please access public services via the Citizen Portal (ABHA Card, PM-JAY Schemes, Jan Aushadhi generic savings, and OPD Token Pass).
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-700">
              <Stethoscope className="w-4 h-4 text-[#0f4c81] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#0f2942]">Doctors & Hospital Staff:</strong> Sign in with your NUID or Staff ID to access triage, OPD queues, and AI diagnostics.
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0f4c81] hover:bg-[#0b3860] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-900/20 transition transform active:scale-95 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              Sign In as Doctor / Staff
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm transition shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Patient Portal
            </Link>
          </div>
        </div>
      </main>

      {/* Official Footer Notice */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur px-6 py-3.5 text-center text-xs text-gray-500 z-10">
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
