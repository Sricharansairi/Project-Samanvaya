"use client";

import { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, UploadCloud, Camera, FileText, Loader2, 
  CheckCircle2, AlertCircle, RefreshCw, SwitchCamera, Sparkles, HeartPulse,
  Edit3, Save, Plus, Trash2, ChevronDown, ChevronUp, Copy, Check, Clock,
  Sun, ZoomIn, ShieldAlert, Activity
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function OCRScanner() {
  const [activeTab, setActiveTab] = useState<"camera" | "upload">("camera");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rawCapturedImage, setRawCapturedImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  
  // Camera Controls: Zoom, Exposure & Timer
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [exposureMode, setExposureMode] = useState<"normal" | "bright" | "autolevel">("normal");
  const [previewBrightness, setPreviewBrightness] = useState<number>(1.0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(false);

  // Edit / Verification Mode
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showRawOcr, setShowRawOcr] = useState<boolean>(false);
  const [copiedRaw, setCopiedRaw] = useState<boolean>(false);

  // Editable Form State
  const [editClinic, setEditClinic] = useState("");
  const [editDoctor, setEditDoctor] = useState("");
  const [editPatient, setEditPatient] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editBp, setEditBp] = useState("");
  const [editPulse, setEditPulse] = useState("");
  const [editTemp, setEditTemp] = useState("");
  const [editSpo2, setEditSpo2] = useState("");
  const [editDiagnoses, setEditDiagnoses] = useState<string[]>([]);
  const [newDiagnosis, setNewDiagnosis] = useState("");
  const [editMedications, setEditMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync results with edit state
  useEffect(() => {
    if (results) {
      setEditClinic(results.clinic_name || "");
      setEditDoctor(results.doctor_name || "");
      setEditPatient(results.patient_name || "");
      setEditAge(results.patient_age || "");
      setEditGender(results.patient_gender || "");
      setEditBp(results.vitals?.bp || "");
      setEditPulse(results.vitals?.pulse || "");
      setEditTemp(results.vitals?.temp || "");
      setEditSpo2(results.vitals?.spo2 || "");
      setEditDiagnoses(Array.isArray(results.diagnoses) ? [...results.diagnoses] : []);
      setEditMedications(Array.isArray(results.medications) ? [...results.medications] : []);
    }
  }, [results]);

  // Initialize camera stream
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setError(null);
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraActive(false);
      setActiveTab("upload");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === "camera" && !imagePreview) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, cameraFacing, imagePreview]);

  const toggleCameraFacing = () => {
    setCameraFacing(prev => (prev === "environment" ? "user" : "environment"));
  };

  const captureCanvasFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Apply clean natural or boosted filter (NO over-darkening)
      let filter = "none";
      if (exposureMode === "bright") filter = "brightness(1.20) contrast(1.05)";
      else if (exposureMode === "autolevel") filter = "brightness(1.35) contrast(1.10)";
      ctx.filter = filter;

      if (zoomLevel === 1) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else {
        // Digital zoom: center-crop region to maximize prescription resolution
        const cropW = canvas.width / zoomLevel;
        const cropH = canvas.height / zoomLevel;
        const startX = (canvas.width - cropW) / 2;
        const startY = (canvas.height - cropH) / 2;
        ctx.drawImage(video, startX, startY, cropW, cropH, 0, 0, canvas.width, canvas.height);
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      setRawCapturedImage(dataUrl);
      setImagePreview(dataUrl);
      setPreviewBrightness(1.0);
      setBase64Image(dataUrl.split(",")[1]);
      setResults(null);
      setError(null);
      stopCamera();
    }
  };

  // Adjust brightness on the captured photo before scanning
  const adjustPreviewBrightness = (factor: number) => {
    if (!rawCapturedImage || !canvasRef.current) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.filter = factor === 1.0 ? "none" : `brightness(${factor}) contrast(1.06)`;
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        setImagePreview(dataUrl);
        setBase64Image(dataUrl.split(",")[1]);
        setPreviewBrightness(factor);
      }
    };
    img.src = rawCapturedImage;
  };

  const handleCapturePhoto = () => {
    if (timerEnabled) {
      setCountdown(3);
      let count = 3;
      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(interval);
          setCountdown(null);
          captureCanvasFrame();
        }
      }, 1000);
    } else {
      captureCanvasFrame();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setRawCapturedImage(base64);
        setImagePreview(base64);
        setPreviewBrightness(1.0);
        const base64Data = base64.split(",")[1];
        setBase64Image(base64Data);
        setResults(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!base64Image) return;

    setIsScanning(true);
    setError(null);

    try {
      const response = await fetch("/api/vision/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64_image: base64Image }),
      });
      
      if (!response.ok) throw new Error("Failed to scan document with Clinical Digitizer");
      const data = await response.json();
      setResults(data);
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setError("Prescription scan extraction error. Please check image clarity and try again.");
    }
    setIsScanning(false);
  };

  const handleRetake = () => {
    setImagePreview(null);
    setRawCapturedImage(null);
    setBase64Image(null);
    setResults(null);
    setError(null);
    setPreviewBrightness(1.0);
    if (activeTab === "camera") {
      startCamera();
    }
  };

  const saveEdits = () => {
    if (!results) return;
    setResults({
      ...results,
      clinic_name: editClinic,
      doctor_name: editDoctor,
      patient_name: editPatient,
      patient_age: editAge,
      patient_gender: editGender,
      vitals: {
        bp: editBp,
        pulse: editPulse,
        temp: editTemp,
        spo2: editSpo2
      },
      diagnoses: editDiagnoses,
      medications: editMedications
    });
    setIsEditing(false);
  };

  const copyRawOcr = () => {
    if (results?.raw_ocr_lines) {
      navigator.clipboard.writeText(results.raw_ocr_lines.join("\n"));
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-2 -ml-2 rounded-xl text-gray-500 hover:text-[#0f4c81] hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-[#0f2942] text-lg leading-none">Prescription & Clinical Document OCR</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  ABDM Clinical Digitizer
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                High-Precision Optical Medical Transcription & Autonomous Clinical Structuring
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 items-start">
          
          {/* Document Capture / Intake Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-full min-h-[520px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#0f2942] flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#0f4c81]" />
                Document Intake
              </h2>

              {!imagePreview && (
                <div className="flex bg-slate-100 p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab("camera")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "camera" 
                        ? "bg-white text-[#0f4c81] shadow-xs" 
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Live Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("upload")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "upload" 
                        ? "bg-white text-[#0f4c81] shadow-xs" 
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Upload File
                  </button>
                </div>
              )}
            </div>

            {/* If no image captured yet */}
            {!imagePreview ? (
              activeTab === "camera" ? (
                /* Live WebRTC Camera Stream */
                <div className="flex flex-col flex-1">
                  <div className="relative rounded-2xl overflow-hidden bg-black flex-1 min-h-[380px] flex items-center justify-center border border-gray-200">
                    <video
                      ref={videoRef}
                      playsInline
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: zoomLevel > 1 ? `scale(${zoomLevel})` : "none", transformOrigin: "center center" }}
                    />

                    {/* High-Visibility Framing Guidelines Overlay */}
                    <div className="absolute inset-8 border-2 border-dashed border-emerald-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                      <div className="flex justify-between">
                        <div className="w-8 h-8 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-lg" />
                        <div className="w-8 h-8 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-lg" />
                      </div>
                      <div className="text-center">
                        <span className="text-[11px] font-bold text-white bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg inline-flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          Fit prescription flat inside frame
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-8 h-8 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-lg" />
                        <div className="w-8 h-8 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-lg" />
                      </div>
                    </div>

                    {/* Countdown indicator overlay */}
                    {countdown !== null && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-10">
                        <div className="w-24 h-24 rounded-full bg-emerald-500/90 text-white font-extrabold text-5xl flex items-center justify-center shadow-2xl animate-pulse">
                          {countdown}
                        </div>
                      </div>
                    )}

                    {/* Top Viewfinder Bar: Zoom, Lighting & Timer */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      {/* Zoom Controls */}
                      <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/20 text-white text-xs">
                        <ZoomIn className="w-3.5 h-3.5 ml-1 text-slate-300" />
                        {[1, 1.5, 2].map(z => (
                          <button
                            key={z}
                            type="button"
                            onClick={() => setZoomLevel(z)}
                            className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                              zoomLevel === z ? "bg-[#0f4c81] text-white" : "text-white/70 hover:text-white"
                            }`}
                          >
                            {z}x
                          </button>
                        ))}
                      </div>

                      {/* Lighting & Timer Controls */}
                      <div className="flex items-center gap-2">
                        {/* Exposure Mode */}
                        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/20 text-white text-xs">
                          <Sun className="w-3.5 h-3.5 ml-1 text-amber-400" />
                          <button
                            type="button"
                            onClick={() => setExposureMode("normal")}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              exposureMode === "normal" ? "bg-white text-slate-900" : "text-white/70 hover:text-white"
                            }`}
                          >
                            Normal
                          </button>
                          <button
                            type="button"
                            onClick={() => setExposureMode("bright")}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              exposureMode === "bright" ? "bg-amber-400 text-slate-900" : "text-white/70 hover:text-white"
                            }`}
                          >
                            Bright
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setTimerEnabled(prev => !prev)}
                          className={`p-2 rounded-xl backdrop-blur-md transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                            timerEnabled ? "bg-emerald-500 text-white font-bold" : "bg-black/60 border border-white/20 text-white"
                          }`}
                          title="Toggle 3s Timer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={toggleCameraFacing}
                          className="p-2 bg-black/60 border border-white/20 text-white rounded-xl backdrop-blur-md transition-colors cursor-pointer"
                          title="Switch Camera"
                        >
                          <SwitchCamera className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Capture Button */}
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      disabled={countdown !== null}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#0f4c81] hover:bg-blue-900 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    >
                      <Camera className="w-5 h-5" />
                      {timerEnabled ? "Start 3s Capture Timer" : "Capture Prescription Photo"}
                    </button>
                  </div>
                </div>
              ) : (
                /* Drag-and-Drop File Upload */
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-center p-10 flex-1 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 shadow-xs">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-center">Click or Drag to Upload Prescription</h3>
                  <p className="text-xs text-gray-500 text-center mt-2 max-w-xs">
                    Supports high-resolution camera photos, scans, and PDFs (JPG, PNG, WEBP up to 10MB)
                  </p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*,.pdf" 
                    className="hidden" 
                  />
                </div>
              )
            ) : (
              /* Image Captured / Selected Preview */
              <div className="flex flex-col h-full">
                {/* Real-time Preview Lighting Bar */}
                <div className="flex items-center justify-between mb-3 bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" /> Image Lighting:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => adjustPreviewBrightness(1.0)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        previewBrightness === 1.0 ? "bg-[#0f4c81] text-white shadow-xs" : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      Natural (1x)
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustPreviewBrightness(1.25)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        previewBrightness === 1.25 ? "bg-[#0f4c81] text-white shadow-xs" : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      Bright (+25%)
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustPreviewBrightness(1.50)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        previewBrightness === 1.50 ? "bg-[#0f4c81] text-white shadow-xs" : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      Auto-Boost (+50%)
                    </button>
                  </div>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-gray-200 flex-1 min-h-[340px] bg-slate-900 flex items-center justify-center">
                  <img 
                    src={imagePreview} 
                    alt="Captured Prescription Document" 
                    className="max-h-[380px] w-auto max-w-full object-contain shadow-md rounded-lg" 
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button 
                    type="button"
                    onClick={handleRetake}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs"
                  >
                    <RefreshCw className="w-4 h-4" /> Retake / Choose Another
                  </button>
                  <button 
                    type="button"
                    onClick={handleScan}
                    disabled={isScanning}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#0f4c81] text-white font-bold hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer shadow-md text-xs"
                  >
                    {isScanning ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Clinical OCR Processing...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 text-amber-300" /> Extract Prescription</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-700 flex gap-3 text-xs border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
          </section>

          {/* Results & Verification Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col min-h-[520px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#0f2942] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0f4c81]" />
                Structured Medical Extraction
              </h2>
              {results && (
                <button
                  type="button"
                  onClick={() => isEditing ? saveEdits() : setIsEditing(true)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isEditing 
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-xs" 
                      : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {isEditing ? <><Save className="w-3.5 h-3.5" /> Save Changes</> : <><Edit3 className="w-3.5 h-3.5" /> Edit / Verify</>}
                </button>
              )}
            </div>

            {isScanning ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                <Loader2 className="w-12 h-12 text-[#0f4c81] animate-spin mb-4" />
                <h3 className="font-extrabold text-[#0f2942] text-base">Reading Medical Handwriting...</h3>
                <p className="text-xs max-w-xs mt-1 text-slate-600">
                  Optical Vision engine is transcribing handwriting and reasoning clinical entities with Medical RAG.
                </p>
              </div>
            ) : results ? (
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
                {/* Header Badge */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Document Type</span>
                    <span className="font-bold text-[#0f2942] text-sm">{results.document_type || "Doctor Prescription (OPD)"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Clinically Digitized & Verified
                    </span>
                  </div>
                </div>

                {/* Clinic & Doctor Details (Editable) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Clinic / Hospital</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editClinic}
                          onChange={e => setEditClinic(e.target.value)}
                          placeholder="e.g. SAI RAM CLINIC"
                          className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold text-slate-800"
                        />
                      ) : (
                        <span className="font-extrabold text-[#0f4c81] text-xs uppercase tracking-wide">
                          🏥 {results.clinic_name || <span className="text-gray-400 italic">Not detected</span>}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Prescribing Doctor</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editDoctor}
                          onChange={e => setEditDoctor(e.target.value)}
                          placeholder="e.g. Dr. Sachin Patil MBBS"
                          className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 text-right"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-700 font-bold">
                          {results.doctor_name || <span className="text-gray-400 italic">Not detected</span>}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-slate-500 font-semibold">Patient:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editPatient}
                          onChange={e => setEditPatient(e.target.value)}
                          placeholder="Patient name"
                          className="bg-white border border-gray-300 rounded px-2 py-0.5 text-xs font-bold flex-1"
                        />
                      ) : (
                        <strong className="text-slate-800">{results.patient_name || <span className="text-gray-400 italic font-normal">Not detected</span>}</strong>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-semibold">Age/Sex:</span>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={editAge}
                            onChange={e => setEditAge(e.target.value)}
                            placeholder="Age"
                            className="w-12 bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs font-bold text-center"
                          />
                          <input
                            type="text"
                            value={editGender}
                            onChange={e => setEditGender(e.target.value)}
                            placeholder="M/F"
                            className="w-12 bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs font-bold text-center"
                          />
                        </div>
                      ) : (
                        <strong className="text-slate-800">
                          {results.patient_age ? `${results.patient_age}` : "--"} / {results.patient_gender || "--"}
                        </strong>
                      )}
                    </div>
                  </div>
                </div>

                {/* Patient Vitals Grid (Editable) */}
                <div>
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> Recorded Patient Vitals
                  </h3>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-2">
                      <span className="text-[9px] text-slate-500 font-bold block uppercase">BP</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editBp}
                          onChange={e => setEditBp(e.target.value)}
                          placeholder="120/80"
                          className="w-full bg-white border border-blue-300 rounded text-center text-xs font-bold text-blue-900 mt-1 py-0.5"
                        />
                      ) : (
                        <strong className="text-xs text-blue-900">{results.vitals?.bp || "--"}</strong>
                      )}
                    </div>
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-2">
                      <span className="text-[9px] text-slate-500 font-bold block uppercase">Pulse</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editPulse}
                          onChange={e => setEditPulse(e.target.value)}
                          placeholder="72 bpm"
                          className="w-full bg-white border border-rose-300 rounded text-center text-xs font-bold text-rose-900 mt-1 py-0.5"
                        />
                      ) : (
                        <strong className="text-xs text-rose-900">{results.vitals?.pulse || "--"}</strong>
                      )}
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2">
                      <span className="text-[9px] text-slate-500 font-bold block uppercase">Temp</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTemp}
                          onChange={e => setEditTemp(e.target.value)}
                          placeholder="98.6 °F"
                          className="w-full bg-white border border-amber-300 rounded text-center text-xs font-bold text-amber-900 mt-1 py-0.5"
                        />
                      ) : (
                        <strong className="text-xs text-amber-900">{results.vitals?.temp || "--"}</strong>
                      )}
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2">
                      <span className="text-[9px] text-slate-500 font-bold block uppercase">SPO2</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editSpo2}
                          onChange={e => setEditSpo2(e.target.value)}
                          placeholder="98%"
                          className="w-full bg-white border border-emerald-300 rounded text-center text-xs font-bold text-emerald-900 mt-1 py-0.5"
                        />
                      ) : (
                        <strong className="text-xs text-emerald-900">{results.vitals?.spo2 || "--"}</strong>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detected Diagnoses */}
                <div>
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Detected Diagnoses & Clinical Signs
                  </h3>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newDiagnosis}
                          onChange={e => setNewDiagnosis(e.target.value)}
                          placeholder="Add diagnosis (e.g. Bronchial Asthma)"
                          className="flex-1 bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs"
                          onKeyDown={e => {
                            if (e.key === "Enter" && newDiagnosis.trim()) {
                              setEditDiagnoses(prev => [...prev, newDiagnosis.trim()]);
                              setNewDiagnosis("");
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newDiagnosis.trim()) {
                              setEditDiagnoses(prev => [...prev, newDiagnosis.trim()]);
                              setNewDiagnosis("");
                            }
                          }}
                          className="bg-purple-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-purple-700 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editDiagnoses.map((diag, i) => (
                          <span key={i} className="bg-purple-50 text-purple-800 border border-purple-200 text-xs px-2 py-1 rounded-lg font-medium flex items-center gap-1.5">
                            {diag}
                            <button
                              type="button"
                              onClick={() => setEditDiagnoses(prev => prev.filter((_, idx) => idx !== i))}
                              className="text-purple-400 hover:text-purple-700 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : results.diagnoses?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {results.diagnoses.map((diag: string, i: number) => (
                        <span key={i} className="bg-purple-50 text-purple-800 border border-purple-200 text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> {diag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No formal diagnosis noted in document</p>
                  )}
                </div>

                {/* Extracted Medications */}
                <div>
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Extracted Medications & Regimen
                  </h3>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMedication}
                          onChange={e => setNewMedication(e.target.value)}
                          placeholder="Add medication (e.g. T. Epan 400mg 1-0-1)"
                          className="flex-1 bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs"
                          onKeyDown={e => {
                            if (e.key === "Enter" && newMedication.trim()) {
                              setEditMedications(prev => [...prev, newMedication.trim()]);
                              setNewMedication("");
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newMedication.trim()) {
                              setEditMedications(prev => [...prev, newMedication.trim()]);
                              setNewMedication("");
                            }
                          }}
                          className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {editMedications.map((med, i) => (
                          <div key={i} className="p-2.5 bg-slate-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
                            <span className="font-semibold text-gray-800">{med}</span>
                            <button
                              type="button"
                              onClick={() => setEditMedications(prev => prev.filter((_, idx) => idx !== i))}
                              className="text-red-400 hover:text-red-700 cursor-pointer p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : results.medications?.length > 0 ? (
                    <div className="space-y-2">
                      {results.medications.map((med: string, i: number) => (
                        <div key={i} className="p-3 bg-slate-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs hover:bg-blue-50/50 transition-colors shadow-2xs">
                          <span className="font-bold text-gray-800">{med}</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 ml-2">
                            Verified Clinical Entity
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No medications found in document</p>
                  )}
                </div>

                {/* Medical RAG Clinical Decision Support Card */}
                {results.rag_decision_support && (
                  <div className="p-3.5 bg-gradient-to-br from-indigo-50/80 via-blue-50/60 to-white border border-indigo-200 rounded-xl text-xs space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-indigo-950">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Clinical Decision Support & Protocols
                      </span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                        {results.rag_decision_support.urgency} Urgency
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-800">
                      <strong>Matched Protocol:</strong> {results.rag_decision_support.condition}
                    </div>

                    {results.rag_decision_support.contraindications?.length > 0 && (
                      <div className="text-[11px] text-amber-950 bg-amber-50/90 p-2.5 rounded-lg border border-amber-200">
                        <strong className="flex items-center gap-1 text-amber-800 mb-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> Clinical Safety Alert & Contraindications:
                        </strong>
                        <ul className="list-disc ml-4 space-y-0.5 text-amber-900">
                          {results.rag_decision_support.contraindications.slice(0, 2).map((c: string, idx: number) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {results.rag_decision_support.recommendedWorkup?.length > 0 && (
                      <div className="text-[11px] text-blue-950 bg-blue-50/80 p-2 rounded-lg border border-blue-200">
                        <strong className="block text-[#0f4c81] mb-1">Recommended Diagnostic Workup:</strong>
                        <div className="flex flex-wrap gap-1.5">
                          {results.rag_decision_support.recommendedWorkup.slice(0, 3).map((w: string, idx: number) => (
                            <span key={idx} className="bg-white border border-blue-200 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Optical OCR Detections Inspector */}
                {results.raw_ocr_lines && results.raw_ocr_lines.length > 0 && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden mt-1">
                    <button
                      type="button"
                      onClick={() => setShowRawOcr(prev => !prev)}
                      className="w-full bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Raw Optical Detections ({results.raw_ocr_lines.length} lines detected)
                      </span>
                      {showRawOcr ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <AnimatePresence>
                      {showRawOcr && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="p-3 bg-slate-900 text-slate-200 text-[11px] font-mono leading-relaxed max-h-48 overflow-y-auto"
                        >
                          <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-700">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Raw Transcribed Stream</span>
                            <button
                              type="button"
                              onClick={copyRawOcr}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedRaw ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Lines</>}
                            </button>
                          </div>
                          {results.raw_ocr_lines.map((line: string, idx: number) => (
                            <div key={idx} className="py-0.5 border-b border-slate-800/60 last:border-0 flex gap-2">
                              <span className="text-slate-500 w-5 text-right shrink-0">{idx + 1}.</span>
                              <span className="text-emerald-300 font-semibold">{line}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-3 border-t border-gray-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        const verifiedPayload = {
                          ...results,
                          clinic_name: editClinic || results.clinic_name,
                          doctor_name: editDoctor || results.doctor_name,
                          patient_name: editPatient || results.patient_name,
                          patient_age: editAge || results.patient_age,
                          patient_gender: editGender || results.patient_gender,
                          vitals: {
                            bp: editBp || results.vitals?.bp,
                            pulse: editPulse || results.vitals?.pulse,
                            temp: editTemp || results.vitals?.temp,
                            spo2: editSpo2 || results.vitals?.spo2
                          },
                          diagnoses: editDiagnoses.length > 0 ? editDiagnoses : results.diagnoses,
                          medications: editMedications.length > 0 ? editMedications : results.medications
                        };
                        sessionStorage.setItem("samanvaya_ocr_intake", JSON.stringify(verifiedPayload));
                        window.location.href = "/his/registration";
                      }
                    }}
                    className="flex-1 text-center bg-[#0f4c81] hover:bg-blue-900 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Attach Verified Data to New Patient Intake
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                <FileText className="w-12 h-12 stroke-[1.5] mb-2 text-gray-300" />
                <h4 className="font-bold text-gray-700 text-sm">No Document Scanned Yet</h4>
                <p className="text-xs text-gray-500 max-w-xs mt-1">
                  Use the live camera or upload an existing photo or PDF. The optical scanner will detect and transcribe all text in real-time.
                </p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
