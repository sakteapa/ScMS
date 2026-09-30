import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Camera,
  Check,
  Copy,
  Settings,
  Sparkles,
  ShieldCheck,
  Cloud,
  HardDrive,
  ExternalLink,
  RefreshCw,
  User,
  Users,
  School,
  CheckCircle2,
  AlertCircle,
  Maximize2
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import {
  getCloudStorageConfig,
  saveCloudStorageConfig,
  optimizeImageFile,
  uploadSchoolMedia
} from '../services/cloudStorageService';
import { storage } from '../services/firebase';

export default function CloudPhotoStorageModal({
  isOpen,
  onClose,
  initialTargetType = 'student', // 'student' | 'staff' | 'logo' | 'general'
  initialTargetId = null,
  onSuccess = null
}) {
  const {
    students,
    staff,
    activeSchoolId,
    activeSchoolInfo,
    updateStudentPhoto,
    updateStaffPhoto,
    updateSchoolTenantInfo
  } = useSchool();

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'config' | 'gallery'
  const [targetType, setTargetType] = useState(initialTargetType);
  const [selectedStudentId, setSelectedStudentId] = useState(initialTargetId || students[0]?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState(initialTargetId || staff[0]?.id || '');

  // Upload & File State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [optimizationStats, setOptimizationStats] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Camera Live Capture State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cloud Config State
  const [config, setConfig] = useState(() => getCloudStorageConfig());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Recent uploads history
  const [recentUploads, setRecentUploads] = useState(() => {
    try {
      const saved = localStorage.getItem('zoxs_recent_cloud_uploads');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync initial targets
  useEffect(() => {
    if (initialTargetType) setTargetType(initialTargetType);
    if (initialTargetId) {
      if (initialTargetType === 'student') setSelectedStudentId(initialTargetId);
      if (initialTargetType === 'staff') setSelectedStaffId(initialTargetId);
    }
  }, [initialTargetType, initialTargetId, isOpen]);

  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Clean up camera stream on unmount or close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const startCamera = async () => {
    try {
      setUploadError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      setUploadError('Unable to access camera: ' + err.message);
    }
  };

  const captureCameraSnapshot = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      stopCamera();
      if (blob) {
        const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
        handleProcessFile(file);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleProcessFile = async (file) => {
    setUploadError(null);
    setUploadResult(null);
    setSelectedFile(file);
    setIsCompressing(true);

    try {
      const optimized = await optimizeImageFile(file, config.compression);
      setPreviewDataUrl(optimized.dataUrl || URL.createObjectURL(file));
      setOptimizationStats(optimized);
    } catch (err) {
      console.warn('Optimization warning:', err);
      setPreviewDataUrl(URL.createObjectURL(file));
      setOptimizationStats({
        originalBytes: file.size,
        optimizedBytes: file.size,
        savingsPercent: 0
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(10);
    setUploadError(null);

    try {
      const folder = targetType === 'student' ? 'students' : targetType === 'staff' ? 'staff' : 'branding';
      const result = await uploadSchoolMedia({
        file: selectedFile,
        schoolId: activeSchoolId || 'default',
        folder,
        onProgress: (percent) => setUploadProgress(percent)
      });

      setUploadResult(result);
      setUploadProgress(100);

      // Save to recent uploads list
      const newRecent = [
        {
          id: `up-${Date.now()}`,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          provider: result.provider,
          targetType,
          uploadedAt: new Date().toLocaleTimeString(),
          bytes: result.optimizedBytes || result.bytes
        },
        ...recentUploads.slice(0, 19)
      ];
      setRecentUploads(newRecent);
      try {
        localStorage.setItem('zoxs_recent_cloud_uploads', JSON.stringify(newRecent));
      } catch {}

      // Automatically assign to selected target
      if (targetType === 'student' && selectedStudentId) {
        updateStudentPhoto(selectedStudentId, result.url);
      } else if (targetType === 'staff' && selectedStaffId) {
        updateStaffPhoto(selectedStaffId, result.url);
      } else if (targetType === 'logo') {
        updateSchoolTenantInfo(activeSchoolId, { logoUrl: result.url });
      }

      if (onSuccess) {
        onSuccess(result.url, result);
      }
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please check network connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    saveCloudStorageConfig(config);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0b1329] border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-[#101b38] to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shadow-lg">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-['Outfit']">
                  Cloud Photo &amp; Media Studio
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {config.provider === 'cloudinary' ? 'Cloudinary CDN' : config.provider === 'firebase' ? 'Firebase Storage' : 'Smart Auto'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-tenant image optimization, face-cropping &amp; high-speed cloud distribution
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-5 gap-2">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('upload');
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload &amp; Assign</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('config');
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cloudinary / Firebase Config</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('gallery');
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'gallery'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Recent Uploads ({recentUploads.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'upload' && (
            <>
              {/* Destination Selector */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  1. Select Photo Destination:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetType('student')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      targetType === 'student'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Student Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('staff')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      targetType === 'staff'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-md'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Staff Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('logo')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      targetType === 'logo'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-md'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <School className="w-4 h-4" />
                    <span>School Crest</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('general')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      targetType === 'general'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-md'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>General / Link</span>
                  </button>
                </div>

                {/* Sub-selector based on destination */}
                {targetType === 'student' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Choose Student to update:
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {students.map((stu) => (
                        <option key={stu.id} value={stu.id}>
                          {stu.firstName} {stu.lastName} (Roll #{stu.rollNo} • Adm: {stu.admissionNo})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {targetType === 'staff' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Choose Staff / Teacher to update:
                    </label>
                    <select
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      {staff.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.designation || st.role} • {st.department || 'Academic'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {targetType === 'logo' && (
                  <div className="pt-1 text-xs text-amber-300 flex items-center gap-2">
                    <School className="w-4 h-4 shrink-0" />
                    <span>Updating official crest/logo for <strong>{activeSchoolInfo?.name || activeSchoolId}</strong>.</span>
                  </div>
                )}
              </div>

              {/* Upload Dropzone or Camera View */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  2. Select File or Live Camera:
                </span>

                {isCameraActive ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-400/80 bg-black flex flex-col items-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-h-72 object-cover"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 px-4">
                      <button
                        type="button"
                        onClick={captureCameraSnapshot}
                        className="px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xl transition"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Snap Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-4 py-2.5 rounded-full bg-slate-900/90 text-white font-semibold text-xs border border-slate-700 hover:bg-slate-800 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                      selectedFile
                        ? 'border-cyan-400/80 bg-cyan-950/20'
                        : 'border-slate-700 hover:border-cyan-400/50 bg-slate-900/40 hover:bg-slate-900/70'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {previewDataUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-xl bg-slate-950">
                          <img
                            src={previewDataUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-xs text-cyan-300 font-semibold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>{selectedFile.name}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow">
                          <UploadCloud className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white font-['Outfit']">
                            Click or drag and drop image here
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Supports high-res JPG, PNG, WebP (up to 25MB)
                          </p>
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-3 pt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                      >
                        Browse Files
                      </button>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-xs font-semibold text-cyan-300 border border-cyan-500/40 transition flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Live Camera Capture</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Compression & Optimization Stats Bar */}
              {optimizationStats && (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-emerald-300 block">Smart Auto-Compression Active</span>
                      <span className="text-[11px] text-slate-400">
                        Original: {formatFileSize(optimizationStats.originalBytes)} &rarr; Optimized: {formatFileSize(optimizationStats.optimizedBytes)}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/40">
                    {optimizationStats.savingsPercent}% Data Saved
                  </span>
                </div>
              )}

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cyan-300 font-semibold flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Compressing &amp; uploading to Cloud Storage...
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Notice */}
              {uploadError && (
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Success Result Card */}
              {uploadResult && (
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-400/50 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>Photo uploaded &amp; assigned successfully!</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 uppercase font-mono">
                      {uploadResult.provider}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={uploadResult.url}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(uploadResult.url)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                    <a
                      href={uploadResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Open full resolution"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={!selectedFile || isUploading}
                  onClick={handleUploadSubmit}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading to Cloud...' : 'Upload & Save Photo'}</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-5">
              {/* Provider Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Cloud Storage Engine:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'auto', title: 'Smart Auto', desc: 'Cloudinary → Firebase → Local' },
                    { id: 'cloudinary', title: 'Cloudinary CDN', desc: 'Instant 25GB Free CDN' },
                    { id: 'firebase', title: 'Firebase Storage', desc: 'Google Cloud Bucket' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setConfig({ ...config, provider: p.id })}
                      className={`p-3 rounded-xl border text-left transition ${
                        config.provider === p.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold block text-white">{p.title}</span>
                      <span className="text-[11px] text-slate-400">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cloudinary Config Box */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                    <Cloud className="w-4 h-4 text-cyan-400" />
                    <span>Cloudinary Configuration</span>
                  </div>
                  <a
                    href="https://cloudinary.com/users/register_free"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Get Free 25GB Account</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Cloud Name:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. demo or your-cloud-name"
                      value={config.cloudinary.cloudName || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          cloudinary: { ...config.cloudinary, cloudName: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Unsigned Upload Preset:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. school_unsigned or ml_default"
                      value={config.cloudinary.uploadPreset || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          cloudinary: { ...config.cloudinary, uploadPreset: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200 space-y-1">
                  <p className="font-semibold text-cyan-300">💡 How to create an unsigned preset in Cloudinary:</p>
                  <p>1. Open Cloudinary Dashboard &rarr; Settings &rarr; <strong>Upload</strong> tab.</p>
                  <p>2. Scroll down to <strong>Upload presets</strong> &rarr; Click <strong>Add upload preset</strong>.</p>
                  <p>3. Set Signing Mode to <strong>Unsigned</strong>, name it (e.g. <code className="bg-slate-900 px-1 py-0.5 rounded text-white">school_uploads</code>), and click Save!</p>
                </div>
              </div>

              {/* Firebase Storage Config Box */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                    <HardDrive className="w-4 h-4 text-amber-400" />
                    <span>Firebase Storage Bucket</span>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-semibold border ${
                    storage ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {storage ? 'SDK Ready' : 'Pending Config'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Storage Bucket Domain:
                  </label>
                  <input
                    type="text"
                    value={config.firebase.storageBucket || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        firebase: { ...config.firebase, storageBucket: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Default is linked with your Firebase Project: <code className="text-slate-300">zoxs-sms.firebasestorage.app</code>
                  </p>
                </div>
              </div>

              {/* Compression Slider */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Client-side Auto-Compression</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.compression.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          compression: { ...config.compression, enabled: e.target.checked }
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Max Resolution: <strong>{config.compression.maxWidth} x {config.compression.maxHeight} px</strong></span>
                  <span>Quality: <strong>{Math.round(config.compression.quality * 100)}%</strong></span>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Cloud storage settings saved successfully!</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition"
                >
                  Save Settings
                </button>
              </div>
            </form>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Recently Uploaded Files ({recentUploads.length})
                </span>
                {recentUploads.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Clear recent uploads list?')) {
                        setRecentUploads([]);
                        localStorage.removeItem('zoxs_recent_cloud_uploads');
                      }
                    }}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {recentUploads.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  No cloud uploads yet. Upload student, staff, or school photos to see them here!
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {recentUploads.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 p-2 space-y-2 hover:border-cyan-400/50 transition"
                    >
                      <div className="w-full h-28 rounded-lg overflow-hidden bg-slate-950 relative">
                        <img
                          src={item.thumbnailUrl || item.url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded bg-black/70 backdrop-blur text-cyan-300 font-mono">
                          {item.provider}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{item.targetType}</span>
                        <span>{formatFileSize(item.bytes)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.url)}
                          className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold transition flex items-center justify-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy URL</span>
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
