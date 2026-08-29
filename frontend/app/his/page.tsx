"use client";

import { motion } from "framer-motion";
import { ClipboardList, Stethoscope, ArrowLeft } from "lucide-react";
import TrustBanner from "@/components/TrustBanner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HisSelectionPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      <TrustBanner currentTab="home" onTabChange={() => {}} onLanguageChange={() => {}} />

      <div className="flex-1 flex flex-col items-center p-4 sm:p-8">
        
        <div className="w-full max-w-4xl mb-6 flex justify-start">
          <a href="/" className="flex items-center text-[#0f4c81] hover:underline font-semibold text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> {t("generic.back")}
          </a>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0f2942] tracking-tight mb-3">
            {t("his.roles.title")}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
          
          {/* Registration Staff Card */}
          <motion.a
            href="/his/registration"
            whileHover={{ y: -4, scale: 1.01 }}
            className="group flex flex-col items-center text-center bg-white border-2 border-gray-100 hover:border-purple-500 rounded-2xl p-10 shadow-sm hover:shadow-xl transition-all cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ClipboardList className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#0f2942] mb-2">
              {t("his.roles.staff")}
            </h2>
            <p className="text-gray-500 font-medium">
              {t("his.roles.staff.desc")}
            </p>
          </motion.a>

          {/* Doctor Card */}
          <motion.a
            href="/his/doctor"
            whileHover={{ y: -4, scale: 1.01 }}
            className="group flex flex-col items-center text-center bg-white border-2 border-gray-100 hover:border-orange-500 rounded-2xl p-10 shadow-sm hover:shadow-xl transition-all cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-6 group-hover:bg-[#f37021] group-hover:text-white transition-colors">
              <Stethoscope className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#0f2942] mb-2">
              {t("his.roles.doctor")}
            </h2>
            <p className="text-gray-500 font-medium">
              {t("his.roles.doctor.desc")}
            </p>
          </motion.a>

        </div>
      </div>
    </main>
  );
}
