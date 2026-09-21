import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  Trash2, 
  User, 
  Users, 
  FileText, 
  RefreshCw, 
  AlertCircle,
  Eye,
  ShieldCheck,
  X
} from 'lucide-react';

const DEFAULT_DOC_SLOTS = [
  {
    id: 'student_photo',
    title: 'Student Passport Photo',
    description: 'Recent passport-size photograph with plain background',
    icon: User,
    color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
    mandatory: true
  },
  {
    id: 'parent_photo',
    title: 'Parent / Guardian Photo',
    description: 'Passport photograph of Mother / Father / Legal Guardian',
    icon: Users,
    color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
    mandatory: true
  },
  {
    id: 'aadhaar_id',
    title: 'Aadhaar / Photo ID Proof',
    description: 'Student or Guardian Aadhaar / Voter ID / Govt ID card',
    icon: ShieldCheck,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    mandatory: true
  },
  {
    id: 'birth_cert',
    title: 'Birth Certificate / Prior TC',
    description: 'Official birth certificate or prior school transfer certificate',
    icon: FileText,
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    mandatory: false
  }
];

export default function AdmissionDocumentUploader({ 
  uploadedDocs = [], 
  onDocsChange,
  customRequirements = [],
  slots = null,
  title = "Document Upload & Photo Scanner",
  subtitle = "Attach official documents or use your camera to scan passport photos & Aadhaar cards."
}) {
  const [activeCameraSlot, setActiveCameraSlot] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const videoRef = useRef(null);

  // Combine default slots with dynamic custom requirements from admin or use provided slots
  const allSlots = slots || [
    ...DEFAULT_DOC_SLOTS,
    ...customRequirements
      .filter(req => !DEFAULT_DOC_SLOTS.some(d => d.title.toLowerCase() === req.title.toLowerCase()))
      .map(req => ({
        id: `custom_${req.id}`,
        title: req.title,
        description: req.description || 'Institutional admission requirement',
        icon: FileText,
        color: 'from-slate-800 to-slate-900 text-slate-300 border-slate-700',
        mandatory: req.mandatory
      }))
  ];

  // Start Camera
  const startCamera = async (slotId) => {
    setActiveCameraSlot(slotId);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access unavailable. You can upload a photo file instead.');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setActiveCameraSlot(null);
    setCameraError(null);
  };

  // Capture Photo from Camera
  const capturePhoto = (slot) => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);

    const newDoc = {
      id: `doc-${slot.id}-${Date.now()}`,
      slotId: slot.id,
      title: slot.title,
      fileName: `${slot.title.replace(/\s+/g, '_')}_Camera_Scan.jpg`,
      fileSize: '0.4 MB',
      status: 'pending_review',
      uploadedAt: new Date().toISOString(),
      url: photoDataUrl
    };

    const updated = [...uploadedDocs.filter(d => d.title !== slot.title), newDoc];
    onDocsChange(updated);
    stopCamera();
  };

  // File Upload Handler
  const handleFileUpload = (e, slot) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newDoc = {
        id: `doc-${slot.id}-${Date.now()}`,
        slotId: slot.id,
        title: slot.title,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        status: 'pending_review',
        uploadedAt: new Date().toISOString(),
        url: event.target.result
      };

      const updated = [...uploadedDocs.filter(d => d.title !== slot.title), newDoc];
      onDocsChange(updated);
    };
    reader.readAsDataURL(file);
  };

  // Remove Document
  const handleRemove = (title) => {
    onDocsChange(uploadedDocs.filter(d => d.title !== title));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div>
          <h4 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>{title}</span>
          </h4>
          <p className="text-[11px] text-slate-400">
            {subtitle}
          </p>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
          {uploadedDocs.length} / {allSlots.length} Ready
        </span>
      </div>

      {/* Grid of Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {allSlots.map(slot => {
          const attached = uploadedDocs.find(d => d.title === slot.title);
          const Icon = slot.icon;

          return (
            <div
              key={slot.id}
              className={`p-4 rounded-2xl border transition-all ${
                attached 
                  ? 'bg-slate-950/80 border-cyan-500/40 shadow-sm' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center border ${slot.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs font-bold text-white">{slot.title}</h5>
                      {slot.mandatory && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                          Mandatory
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">{slot.description}</p>
                  </div>
                </div>

                {attached && (
                  <span className="shrink-0 flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Attached</span>
                  </span>
                )}
              </div>

              {/* Action Buttons or Preview */}
              {attached ? (
                <div className="mt-3 p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {attached.url && attached.url.startsWith('data:image') ? (
                      <img 
                        src={attached.url} 
                        alt={attached.title} 
                        className="w-8 h-8 rounded-lg object-cover border border-slate-700" 
                      />
                    ) : (
                      <FileText className="w-6 h-6 text-cyan-400 shrink-0" />
                    )}
                    <div className="truncate">
                      <p className="text-[11px] font-semibold text-slate-200 truncate">{attached.fileName}</p>
                      <span className="text-[9px] text-slate-400 font-mono">{attached.fileSize}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {attached.url && (
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(attached)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(slot.title)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-3">
                  {/* File Upload Button */}
                  <label className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-white text-[11px] font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, slot)}
                    />
                  </label>

                  {/* Camera Scanner Button */}
                  <button
                    type="button"
                    onClick={() => startCamera(slot.id)}
                    className="py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan / Photo</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Camera Modal / Viewfinder */}
      {activeCameraSlot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white">
                <Camera className="w-5 h-5 text-cyan-400" />
                <h4 className="font-bold text-sm">
                  Scan / Photo Capture: {allSlots.find(s => s.id === activeCameraSlot)?.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center space-y-2">
                <AlertCircle className="w-6 h-6 mx-auto" />
                <p>{cameraError}</p>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
                  <video
                    ref={(el) => {
                      videoRef.current = el;
                      if (el && cameraStream && el.srcObject !== cameraStream) {
                        el.srcObject = cameraStream;
                        el.play().catch(() => {});
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Viewfinder crosshair overlay */}
                  <div className="absolute inset-4 border-2 border-dashed border-cyan-400/40 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] text-cyan-300/60 font-mono uppercase bg-slate-950/60 px-2 py-0.5 rounded">
                      Align Photo / Document Here
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const slot = allSlots.find(s => s.id === activeCameraSlot);
                      if (slot) capturePhoto(slot);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Snapshot</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Image Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="font-bold text-white text-sm truncate">{previewDoc.title}</h4>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-h-96 flex items-center justify-center p-4">
              {previewDoc.url && (previewDoc.url.startsWith('data:image') || previewDoc.url.includes('images.unsplash.com') || previewDoc.fileName?.match(/\.(jpg|jpeg|png|webp)$/i)) ? (
                <img 
                  src={previewDoc.url} 
                  alt={previewDoc.title} 
                  className="max-h-80 w-auto object-contain rounded-xl"
                />
              ) : (
                <div className="text-center py-6 px-4 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">{previewDoc.title}</h5>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{previewDoc.fileName}</p>
                  </div>
                  <a
                    href={previewDoc.url}
                    download={previewDoc.fileName || 'document'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition cursor-pointer"
                  >
                    <span>Download / Open Document</span>
                  </a>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
              <span>{previewDoc.fileName} • {previewDoc.fileSize}</span>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
