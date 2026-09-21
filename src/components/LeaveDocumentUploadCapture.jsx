import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  FileText, 
  Eye, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  SwitchCamera, 
  Maximize2 
} from 'lucide-react';

export default function LeaveDocumentUploadCapture({
  documentName = '',
  documentUrl = '',
  onChange,
  label = "Doctor Lehkha / Prescription / Medical Certificate"
}) {
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewLightboxUrl, setPreviewLightboxUrl] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const mobileCameraInputRef = useRef(null);

  // Start Live Webcam / Mobile Camera Stream
  const startCamera = async (mode = facingMode) => {
    setCameraError(null);
    setIsCapturing(false);

    // Stop any active stream first
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      // Fallback: try default without ideal constraints
      try {
        const streamFallback = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraStream(streamFallback);
        if (videoRef.current) {
          videoRef.current.srcObject = streamFallback;
        }
      } catch (err2) {
        setCameraError(
          'Device camera access not permitted or unavailable. You can use native phone camera or upload a file directly.'
        );
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraModalOpen(false);
    setCameraError(null);
  };

  // Switch between front and rear cameras
  const toggleFacingMode = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // Capture Snapshot from video
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      const generatedName = `Medical_Slip_Camera_${new Date().toISOString().slice(0, 10)}.jpg`;

      onChange({
        documentName: generatedName,
        documentUrl: capturedDataUrl
      });

      stopCamera();
    } catch (err) {
      console.error('Failed to capture snapshot:', err);
      setCameraError('Snapshot failed. Please try again or upload a photo.');
    } finally {
      setIsCapturing(false);
    }
  };

  // File Upload Handler (PDF or Image)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onChange({
        documentName: file.name,
        documentUrl: event.target.result
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  // Remove document
  const handleRemove = () => {
    onChange({
      documentName: '',
      documentUrl: ''
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const isImage = documentUrl && (
    documentUrl.startsWith('data:image') || 
    /\.(jpg|jpeg|png|webp|gif)$/i.test(documentName)
  );

  return (
    <div className="space-y-2">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={mobileCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center justify-between">
        <label className="block text-slate-300 font-bold text-xs">
          {label}
        </label>
        <span className="text-[10px] text-slate-500 font-medium">Optional</span>
      </div>

      {/* Case 1: An attachment is already uploaded/captured */}
      {documentUrl ? (
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {isImage ? (
                <div 
                  onClick={() => setPreviewLightboxUrl(documentUrl)}
                  className="relative w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden shrink-0 cursor-pointer group"
                  title="Click to zoom image"
                >
                  <img 
                    src={documentUrl} 
                    alt="Document preview" 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-white truncate block">
                    {documentName || 'Document Attached'}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold block">
                  Attachment ready for submission
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isImage && (
                <button
                  type="button"
                  onClick={() => setPreviewLightboxUrl(documentUrl)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition"
                  title="Enlarge Photo"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition"
                title="Remove Document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setIsCameraModalOpen(true);
                startCamera();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retake / Re-scan</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Upload className="w-3 h-3" />
              <span>Choose Another File</span>
            </button>
          </div>
        </div>
      ) : (
        /* Case 2: No attachment yet -> Display Upload & Camera buttons */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Option A: Live Camera Capture */}
          <button
            type="button"
            onClick={() => {
              setIsCameraModalOpen(true);
              startCamera();
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 hover:border-cyan-500/50 text-left transition group shadow-sm flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-cyan-300 transition">
                Take Photo with Camera
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight">
                Capture doctor prescription / medical slip
              </span>
            </div>
          </button>

          {/* Option B: Choose File from Device / Gallery */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 hover:border-indigo-500/50 text-left transition group shadow-sm flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-indigo-300 transition">
                Upload File / PDF
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight">
                PDF, JPG, PNG from device storage
              </span>
            </div>
          </button>
        </div>
      )}

      {/* LIVE CAMERA CAPTURE MODAL OVERLAY */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Top Header */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-['Outfit']">
                    Document Camera Scanner
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Hold prescription / doctor slip clearly in front of camera
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs"
                  title="Switch Front / Back Camera"
                >
                  <SwitchCamera className="w-4 h-4" />
                  <span className="text-[10px] font-semibold hidden sm:inline">Flip Camera</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Viewfinder Area */}
            <div className="relative bg-black min-h-[300px] flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center space-y-3 max-w-xs">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-rose-300 leading-relaxed">
                    {cameraError}
                  </p>
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => mobileCameraInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow"
                    >
                      Open Native Phone Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                    >
                      Choose Photo From Gallery
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full max-h-[420px] object-cover"
                  />

                  {/* Document Alignment Frame Guides */}
                  <div className="absolute inset-8 pointer-events-none border-2 border-cyan-400/60 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                    <div className="absolute top-2 left-2 text-[10px] uppercase font-bold text-cyan-300 bg-black/60 px-2 py-0.5 rounded-md border border-cyan-400/30">
                      Medical Certificate Frame
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Bottom Controls */}
            {!cameraError && (
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => mobileCameraInputRef.current?.click()}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
                >
                  <span>Native phone camera</span>
                </button>

                {/* Main Shutter / Capture Button */}
                <button
                  type="button"
                  onClick={takeSnapshot}
                  disabled={isCapturing}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 active:scale-95 transition cursor-pointer"
                >
                  <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
                  <span>Capture Photo</span>
                </button>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL SCREEN LIGHTBOX PREVIEW */}
      {previewLightboxUrl && (
        <div 
          onClick={() => setPreviewLightboxUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[90vh] p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewLightboxUrl(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700 shadow-xl"
            >
              <X className="w-4 h-4" />
            </button>
            <img 
              src={previewLightboxUrl} 
              alt="Medical Document Full View" 
              className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain border border-slate-700 shadow-2xl"
            />
            <div className="text-center mt-2 text-xs text-slate-400">
              {documentName} &bull; Click anywhere outside to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
