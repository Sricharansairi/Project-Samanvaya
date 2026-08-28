"use client";
import React from 'react';
import { FaRegClock, FaUserMd, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';

interface NextActionCardProps {
    type: 'pre-consultation' | 'post-consultation';
    department?: string;
    token?: string;
    doctorType?: string;
    followUpTiming?: string;
    symptomWatch?: string;
}

export default function NextActionCard({
    type,
    department,
    token,
    doctorType,
    followUpTiming,
    symptomWatch
}: NextActionCardProps) {
    
    return (
        <div className="bg-white border-l-4 border-blue-600 shadow-md rounded p-6 max-w-2xl mx-auto my-4 font-sans relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-50 text-blue-800 text-xs px-3 py-1 font-semibold rounded-bl">
                NEXT ACTION
            </div>
            
            <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-700 shrink-0">
                    {type === 'pre-consultation' ? <FaMapMarkerAlt size={24} /> : <FaRegClock size={24} />}
                </div>
                
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {type === 'pre-consultation' ? 'Proceed to Consultation' : 'Discharge & Follow-up'}
                    </h3>
                    
                    {type === 'pre-consultation' && (
                        <div className="space-y-2 text-gray-700">
                            <p className="text-lg">
                                <span className="font-semibold">Next:</span> See <strong>Dr. {doctorType || 'Specialist'}</strong> in the <strong>{department || 'General OPD'}</strong>.
                            </p>
                            <div className="bg-gray-50 border border-gray-200 rounded p-3 mt-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 uppercase tracking-wide">Your Token Number</p>
                                    <p className="text-3xl font-black text-blue-900">{token || 'A-142'}</p>
                                </div>
                                <FaArrowRight className="text-gray-400" size={24} />
                            </div>
                            <p className="text-sm text-gray-500 mt-2 italic">Nothing else needed right now.</p>
                        </div>
                    )}

                    {type === 'post-consultation' && (
                        <div className="space-y-2 text-gray-700">
                            <p className="text-lg">
                                <span className="font-semibold">Next:</span> Return in <strong>{followUpTiming || '7 days'}</strong>.
                            </p>
                            {symptomWatch && (
                                <div className="bg-red-50 border-l-4 border-red-500 rounded p-3 mt-3">
                                    <p className="text-red-800 font-medium text-sm">
                                        🚨 Return sooner if: {symptomWatch}
                                    </p>
                                </div>
                            )}
                            <p className="text-sm text-gray-500 mt-2">Your prescriptions and case summary have been sent to your registered WhatsApp.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
