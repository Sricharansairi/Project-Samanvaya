"use client";
import React from 'react';
import { FaPrint, FaQrcode, FaFileMedical, FaUser, FaNotesMedical, FaStethoscope, FaPills } from 'react-icons/fa';

export default function PortableCaseSummary() {
    return (
        <div className="bg-white border border-gray-200 shadow-sm p-8 max-w-3xl mx-auto font-sans text-gray-800">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wider">Portable Case Summary</h1>
                    <p className="text-sm text-gray-500 mt-1">Samanvaya Triage System • Government of India</p>
                </div>
                <div className="flex space-x-3 text-gray-400">
                    <button className="hover:text-blue-600 transition" title="Print Summary" onClick={() => window.print()}>
                        <FaPrint size={24} />
                    </button>
                    <button className="hover:text-blue-600 transition" title="Scan QR">
                        <FaQrcode size={24} />
                    </button>
                </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded mb-6 border border-gray-100">
                <div className="flex items-center space-x-3">
                    <FaUser className="text-gray-400" />
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Patient Name</p>
                        <p className="font-semibold text-gray-900">Ramesh Kumar (42/M)</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <FaFileMedical className="text-gray-400" />
                    <div>
                        <p className="text-xs text-gray-500 uppercase">ABHA ID (Linked)</p>
                        <p className="font-semibold text-gray-900">14-2234-9981-0021</p>
                    </div>
                </div>
            </div>

            {/* Clinical Content */}
            <div className="space-y-6">
                
                {/* Problem */}
                <section>
                    <div className="flex items-center space-x-2 text-blue-800 mb-2 border-b border-gray-200 pb-1">
                        <FaNotesMedical />
                        <h2 className="text-lg font-bold uppercase tracking-wide">Chief Complaint</h2>
                    </div>
                    <p className="text-gray-700 pl-6 border-l-2 border-gray-200 ml-2">
                        Severe chest heaviness and generalized body ache for the past 3 days. Occasional dizziness when standing up.
                    </p>
                </section>

                {/* History & Vitals */}
                <section>
                    <div className="flex items-center space-x-2 text-blue-800 mb-2 border-b border-gray-200 pb-1">
                        <FaStethoscope />
                        <h2 className="text-lg font-bold uppercase tracking-wide">Reported History & Vitals</h2>
                    </div>
                    <ul className="list-disc pl-10 space-y-1 text-gray-700">
                        <li><strong>Known Diabetic:</strong> Yes, currently on Metformin 500mg.</li>
                        <li><strong>Recent Travel:</strong> None.</li>
                        <li><strong>Allergies:</strong> Penicillin.</li>
                        <li><strong>Vitals (ASHA screened):</strong> BP 140/90, Random Sugar 160 mg/dL.</li>
                    </ul>
                </section>

                {/* Medications */}
                <section>
                    <div className="flex items-center space-x-2 text-blue-800 mb-2 border-b border-gray-200 pb-1">
                        <FaPills />
                        <h2 className="text-lg font-bold uppercase tracking-wide">Current Medications</h2>
                    </div>
                    <p className="text-gray-700 pl-6 border-l-2 border-gray-200 ml-2">
                        Glycomet 500 (Metformin) - 1-0-1.
                    </p>
                </section>

            </div>

            {/* Footer / QR / Barcode */}
            <div className="mt-12 pt-6 border-t border-gray-200 flex justify-between items-end">
                <p className="text-xs text-gray-400 max-w-sm">
                    This document contains a structured FHIR R4 summary. Present this at any OPD counter, even if they do not have ABDM integration.
                </p>
                <div className="bg-gray-100 p-2 rounded">
                    {/* Placeholder for QR Code */}
                    <div className="w-20 h-20 bg-gray-300 flex items-center justify-center text-gray-500 text-xs text-center border border-gray-400 border-dashed">
                        Scan for<br/>FHIR JSON
                    </div>
                </div>
            </div>
        </div>
    );
}
