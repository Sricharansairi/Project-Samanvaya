"use client";
import React from 'react';
import { Printer, QrCode, FileText, User, ClipboardList, Stethoscope, Pill } from 'lucide-react';

interface PortableCaseSummaryProps {
    patientName?: string;
    abhaId?: string;
    chiefComplaint?: string;
    vitalsSummary?: string;
    allergies?: string;
    currentMedications?: string;
    knownConditions?: string;
}

export default function PortableCaseSummary({
    patientName = "Patient Record",
    abhaId = "14-XXXX-XXXX-XXXX",
    chiefComplaint = "Acute health condition under physician evaluation.",
    vitalsSummary = "Vitals recorded at triage screening.",
    allergies = "None reported",
    currentMedications = "As per active prescription record",
    knownConditions = "Under clinical evaluation"
}: PortableCaseSummaryProps) {
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
                        <Printer size={24} />
                    </button>
                    <button className="hover:text-blue-600 transition" title="Scan QR">
                        <QrCode size={24} />
                    </button>
                </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded mb-6 border border-gray-100">
                <div className="flex items-center space-x-3">
                    <User className="text-gray-400" />
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Patient Name</p>
                        <p className="font-semibold text-gray-900">{patientName}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <FileText className="text-gray-400" />
                    <div>
                        <p className="text-xs text-gray-500 uppercase">ABHA ID (Linked)</p>
                        <p className="font-semibold text-gray-900">{abhaId}</p>
                    </div>
                </div>
            </div>

            {/* Clinical Content */}
            <div className="space-y-6">
                
                {/* Problem */}
                <section>
                    <div className="flex items-center space-x-2 text-blue-800 mb-2 border-b border-gray-200 pb-1">
                        <ClipboardList />
                        <h2 className="text-lg font-bold uppercase tracking-wide">Chief Complaint</h2>
                    </div>
                    <p className="text-gray-700 pl-6 border-l-2 border-gray-200 ml-2">
                        {chiefComplaint}
                    </p>
                </section>

                {/* History & Vitals */}
                <section>
                    <div className="flex items-center space-x-2 text-blue-800 mb-2 border-b border-gray-200 pb-1">
                        <Stethoscope />
                        <h2 className="text-lg font-bold uppercase tracking-wide">Reported History & Vitals</h2>
                    </div>
                    <ul className="list-disc pl-10 space-y-1 text-gray-700">
                        <li><strong>Known Conditions:</strong> {knownConditions}</li>
                        <li><strong>Allergies:</strong> {allergies}</li>
                        <li><strong>Vitals / Triage Screening:</strong> {vitalsSummary}</li>
                    </ul>
                </section>

                {/* Medications */}
                <section>
                    <div className="flex items-center space-x-2 text-blue-800 mb-2 border-b border-gray-200 pb-1">
                        <Pill />
                        <h2 className="text-lg font-bold uppercase tracking-wide">Current Medications</h2>
                    </div>
                    <p className="text-gray-700 pl-6 border-l-2 border-gray-200 ml-2">
                        {currentMedications}
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
