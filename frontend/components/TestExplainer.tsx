"use client";
import React, { useState } from 'react';
import { TestTube, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface TestExplainerProps {
    testName: string;
    description: string;
    whyNeeded: string;
    preparation?: string;
}

export default function TestExplainer({ testName, description, whyNeeded, preparation }: TestExplainerProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded overflow-hidden my-2">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition text-left focus:outline-none"
            >
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                        <TestTube size={16} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">{testName}</h4>
                        <p className="text-xs text-gray-500">Tap to see why the doctor ordered this</p>
                    </div>
                </div>
                <div className="text-gray-400">
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </div>
            </button>

            {isExpanded && (
                <div className="p-4 border-t border-gray-200 bg-white space-y-3">
                    <div>
                        <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">What is it?</p>
                        <p className="text-sm text-gray-800">{description}</p>
                    </div>
                    
                    <div className="bg-blue-50 border-l-2 border-blue-500 p-3 rounded-r">
                        <div className="flex items-center space-x-2 mb-1">
                            <Info className="text-blue-600" size={14} />
                            <p className="text-xs uppercase font-bold text-blue-800 tracking-wider">Why we are doing this</p>
                        </div>
                        <p className="text-sm text-blue-900 leading-relaxed">{whyNeeded}</p>
                    </div>

                    {preparation && (
                        <div>
                            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider mt-2">How to prepare</p>
                            <p className="text-sm text-red-700 bg-red-50 inline-block px-2 py-1 rounded mt-1 font-medium">
                                {preparation}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
