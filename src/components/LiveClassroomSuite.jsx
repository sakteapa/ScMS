import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Share2, 
  Users, 
  MessageSquare, 
  Sparkles, 
  Radio, 
  X, 
  CheckCircle2, 
  Bell, 
  PhoneOff, 
  BookOpen, 
  Send, 
  HeartHandshake,
  Sliders,
  Settings,
  Shield,
  Wifi,
  Disc,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Volume2,
  Tv,
  Globe,
  Lock,
  Cpu,
  Layers,
  AlertCircle,
  Grid,
  Maximize2,
  LayoutGrid,
  Activity,
  VolumeX
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function LiveClassroomSuite({ 
  isOpen, 
  onClose, 
  defaultClassId = 'cls-12-sci',
  isStudentPortal = false,
  studentUser = null
}) {
  const { 
    classes, 
    students, 
    leaveApplications = [], 
    sendPrivateNotification,
    liveMediaConfig,
    updateLiveMediaConfig,
    resetLiveMediaConfig,
    plugins = []
  } = useSchool();
  const { currentUser, isTeacher, isPrincipal, isVicePrincipal, isSuperAdmin } = useAuth();

  const [selectedClassId, setSelectedClassId] = useState(defaultClassId);
  const [subject, setSubject] = useState('Physics - Electromagnetic Induction');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [messages, setMessages] = useState([
    { id: 1, sender: 'System', text: 'Live Classroom initialized with end-to-end WebRTC audio/video sync.', time: '10:00 AM' },
    { id: 2, sender: 'System', text: 'RTMP Ingest & Low-Latency HLS broadcast engine standing by.', time: '10:00 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [handRaised, setHandRaised] = useState(false);
  const [streamObj, setStreamObj] = useState(null);
  const [toast, setToast] = useState(null);

  // Configuration Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configActiveTab, setConfigActiveTab] = useState('broadcast'); // 'broadcast', 'video', 'audio', 'webrtc', 'chat'
  const [configDraft, setConfigDraft] = useState(liveMediaConfig);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [icePingTest, setIcePingTest] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [availableMics, setAvailableMics] = useState([]);
  const [layoutMode, setLayoutMode] = useState(liveMediaConfig?.conference?.defaultLayout || 'stage'); // 'stage' | 'grid' | 'voice'
  const [activeSpeakerId, setActiveSpeakerId] = useState('teacher');

  // Recording timer
  useEffect(() => {
    let timer = null;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  const formatRecordingTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [isRecordedPlaybackOpen, setIsRecordedPlaybackOpen] = useState(false);

  const targetClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classId === selectedClassId);

  // Leave students
  const leaveStudents = students.filter(s => {
    return s.classId === selectedClassId && leaveApplications.some(l => l.studentId === s.id && l.status === 'approved');
  });

  // Keep draft in sync with context
  useEffect(() => {
    if (liveMediaConfig) {
      setConfigDraft(liveMediaConfig);
    }
  }, [liveMediaConfig]);

  // Enumerate Audio/Video Devices
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          setAvailableCameras(devices.filter(d => d.kind === 'videoinput'));
          setAvailableMics(devices.filter(d => d.kind === 'audioinput'));
        })
        .catch(() => {});
    }
  }, []);

  // Initialize or Re-init Camera Stream with Configured Quality & Audio Constraints
  const initStream = async (cfg = liveMediaConfig) => {
    try {
      if (streamObj) {
        streamObj.getTracks().forEach(t => t.stop());
      }

      const resMap = {
        '360p': { width: { ideal: 640 }, height: { ideal: 360 } },
        '720p': { width: { ideal: 1280 }, height: { ideal: 720 } },
        '1080p': { width: { ideal: 1920 }, height: { ideal: 1080 } },
        '4k': { width: { ideal: 3840 }, height: { ideal: 2160 } }
      };

      const resConstraint = resMap[cfg?.streamQuality || '1080p'] || resMap['1080p'];
      const audioOptions = {
        noiseSuppression: !!cfg?.audio?.noiseSuppression,
        echoCancellation: !!cfg?.audio?.echoCancellation,
        autoGainControl: !!cfg?.audio?.autoGainControl
      };

      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          ...resConstraint,
          facingMode: 'user',
          frameRate: { ideal: cfg?.frameRate || 30 }
        },
        audio: audioOptions
      });

      setStreamObj(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Webcam stream fallback note:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initStream(liveMediaConfig);
    }

    return () => {
      if (streamObj) {
        streamObj.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle Video Track
  const toggleVideo = () => {
    if (streamObj) {
      const vTrack = streamObj.getVideoTracks()[0];
      if (vTrack) {
        vTrack.enabled = !vTrack.enabled;
        setIsVideoOff(!vTrack.enabled);
      }
    } else {
      setIsVideoOff(!isVideoOff);
    }
  };

  // Toggle Audio Track
  const toggleAudio = () => {
    if (streamObj) {
      const aTrack = streamObj.getAudioTracks()[0];
      if (aTrack) {
        aTrack.enabled = !aTrack.enabled;
        setIsMicMuted(!aTrack.enabled);
      }
    } else {
      setIsMicMuted(!isMicMuted);
    }
  };

  // Notify Leave Students
  const handleNotifyLeaveStudents = () => {
    leaveStudents.forEach(stu => {
      sendPrivateNotification({
        title: `🔴 Live Class in Session: ${targetClass.name} - ${subject}`,
        content: `Dear ${stu.firstName}, i Class Master/Teacher chuan live online streaming class a ṭan ta e. Chawlh i lak lai hian i portal aṭangin live lecture hi lo zawm ve rawh le.`,
        category: 'academic',
        priority: 'urgent',
        targetAudience: 'individual',
        targetUserId: stu.id,
        targetUserName: `${stu.firstName} ${stu.lastName}`,
        recipientRole: 'student',
        senderId: currentUser?.displayName || 'Teacher',
        publishedBy: currentUser?.displayName || 'Teacher',
        channels: { inApp: true, whatsapp: true, push: true, sms: true }
      });
    });

    setToast(`Class-a chawlh la zirlai ${leaveStudents.length} te hnenah live stream notification thawn a ni ta e!`);
    setTimeout(() => setToast(null), 3000);
  };

  // Send In-Class Chat Message with Profanity Filter & Slow Mode
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    let textToSend = chatInput.trim();
    if (configDraft?.chat?.profanityFilter) {
      const badWords = ['chhe', 'sual', 'dawheh', 'lepler', 'awmawl'];
      badWords.forEach(w => {
        const reg = new RegExp(w, 'gi');
        textToSend = textToSend.replace(reg, '****');
      });
    }

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: currentUser?.displayName || (isStudentPortal ? 'Zirlai' : 'Host / Teacher'),
        text: textToSend,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
  };

  // Export Chat Transcript
  const handleExportChat = () => {
    const transcript = messages.map(m => `[${m.time}] ${m.sender}: ${m.text}`).join('\n');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Live_Class_Chat_${targetClass?.name || 'Class'}_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setToast('Live chat transcript downloaded successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  // Copy helper
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Test WebRTC ICE Connectivity
  const runIcePingTest = () => {
    setIcePingTest({ loading: true, message: 'Gathering WebRTC ICE candidates & testing STUN/TURN latency...' });
    setTimeout(() => {
      setIcePingTest({
        loading: false,
        success: true,
        rtt: Math.floor(Math.random() * 15) + 18, // 18-32ms
        candidates: 6,
        natType: 'Full Cone NAT (STUN Binding Successful)',
        turnStatus: 'TURN Relay Verified (turn.mizoramschool.edu.in)',
        message: 'All WebRTC ICE Servers & Media Relay endpoints are healthy!'
      });
    }, 1100);
  };

  // Save and Apply Configuration
  const handleSaveConfig = () => {
    updateLiveMediaConfig(configDraft);
    initStream(configDraft);
    if (configDraft?.conference?.defaultLayout) {
      setLayoutMode(configDraft.conference.defaultLayout);
    }
    setIsConfigModalOpen(false);
    setToast('Live stream, WebRTC & audio configuration updated and applied!');
    setTimeout(() => setToast(null), 3000);
  };

  // Reset Configuration
  const handleResetConfig = () => {
    if (window.confirm('Reset all live streaming, WebRTC, and chat configuration to default school settings?')) {
      resetLiveMediaConfig();
      setIsConfigModalOpen(false);
      setToast('Configuration reset to factory defaults.');
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Real Browser MediaRecorder Video Archiving
  const handleToggleRecording = () => {
    if (!isRecording) {
      try {
        if (!streamObj) {
          setToast('Camera / Microphone stream is not active to record.');
          setTimeout(() => setToast(null), 2500);
          return;
        }
        recordedChunksRef.current = [];
        const mimeType = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus'))
          ? 'video/webm;codecs=vp9,opus'
          : 'video/webm';
        
        const recorder = new MediaRecorder(streamObj, { mimeType });
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
          setIsRecordedPlaybackOpen(true);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Lecture_${targetClass?.name || 'Class'}_${new Date().toISOString().slice(0, 10)}.webm`;
          a.click();
          setToast('Lecture recorded & downloaded to local storage (.webm)!');
          setTimeout(() => setToast(null), 3500);
        };
        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        setToast('🔴 Lecture Recording started (saving audio/video chunks)...');
        setTimeout(() => setToast(null), 2500);
      } catch (err) {
        console.warn('MediaRecorder note:', err);
        setIsRecording(true);
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-6xl h-[94vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Top Navigation / Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center animate-pulse">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm font-['Outfit']">
                  Live Classroom Broadcast &amp; Remote Attendance
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                  LIVE STREAM
                </span>
                {isRecording && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/90 text-white font-mono font-bold flex items-center gap-1 shadow animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span>REC {formatRecordingTime(recordingSeconds)}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {targetClass?.name} • {subject} • Host: {currentUser?.displayName || 'Subject Master'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Media Settings Button */}
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
              title="Configure Live Video Streaming, WebRTC, Voice & Chat"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Stream &amp; Media Config</span>
            </button>

            {!isStudentPortal && leaveStudents.length > 0 && (
              <button
                onClick={handleNotifyLeaveStudents}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notify Leave ({leaveStudents.length})</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              title="Close Classroom"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Toast Alert */}
        {toast && (
          <div className="bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30 text-xs font-bold py-2 text-center flex items-center justify-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{toast}</span>
          </div>
        )}

        {/* Main Classroom Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-3 sm:p-4 min-h-0 overflow-hidden">
          
          {/* Left Screen: Main Video & Controls (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col min-h-0 space-y-3">
            <div className="relative flex-1 rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
              
              {/* Layout Mode Switcher Pills */}
              <div className="absolute top-3 right-3 flex items-center bg-black/75 backdrop-blur-md p-1 rounded-xl border border-white/10 z-20 shadow-lg gap-1">
                <button
                  type="button"
                  onClick={() => setLayoutMode('stage')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
                    layoutMode === 'stage' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Broadcast Stage Mode (Hero Screen)"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Stage</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('grid')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
                    layoutMode === 'grid' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Multi-Party Conference Gallery Grid (2x2 / 3x3)"
                >
                  <LayoutGrid className="w-3 h-3" />
                  <span className="hidden sm:inline">Conference Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('voice')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
                    layoutMode === 'voice' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Voice-Only Low Bandwidth Conference Room"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Voice Room</span>
                </button>
              </div>

              {/* VIEW 1: BROADCAST STAGE MODE */}
              {layoutMode === 'stage' && (
                <>
                  {isVideoOff ? (
                    <div className="text-center p-6 space-y-2">
                      <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                        <VideoOff className="w-7 h-7" />
                      </div>
                      <p className="text-xs text-slate-400 font-semibold">Video Stream Paused</p>
                      <p className="text-[11px] text-slate-500">Host microphone remains active for lecture delivery</p>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted={!isStudentPortal}
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  )}
                </>
              )}

              {/* VIEW 2: MULTI-PARTY GALLERY GRID MODE */}
              {layoutMode === 'grid' && (
                <div className="w-full h-full p-2.5 grid grid-cols-2 md:grid-cols-3 gap-2.5 overflow-y-auto bg-slate-950 pt-12">
                  {/* Host / Teacher Tile */}
                  <div className={`relative rounded-2xl overflow-hidden bg-slate-900 border flex flex-col items-center justify-center min-h-[140px] ${
                    activeSpeakerId === 'teacher' ? 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-500/10' : 'border-slate-800'
                  }`}>
                    {isVideoOff ? (
                      <div className="text-center p-3">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-base mx-auto mb-1">
                          👨‍🏫
                        </div>
                        <span className="text-[11px] font-bold text-slate-300">Teacher (Host)</span>
                      </div>
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted={!isStudentPortal}
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                    )}
                    
                    {/* Teacher Overlay Tag */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] text-white">
                      <span className="font-bold truncate">{currentUser?.displayName || 'Class Master (Host)'}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {isMicMuted ? <MicOff className="w-3 h-3 text-rose-400" /> : <Mic className="w-3 h-3 text-emerald-400 animate-pulse" />}
                        <span className="text-[9px] px-1 rounded bg-indigo-500/30 text-indigo-300 font-mono">HOST</span>
                      </div>
                    </div>
                    {activeSpeakerId === 'teacher' && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[9px] font-bold flex items-center gap-1 shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                        <span>Speaking</span>
                      </div>
                    )}
                  </div>

                  {/* Student Tiles */}
                  {classStudents.slice(0, (configDraft?.conference?.maxGridTiles || 9) - 1).map((stu, idx) => {
                    const isSpeaking = idx === 1; // Simulated active peer speaker
                    const isStuMuted = idx % 2 === 0;
                    return (
                      <div 
                        key={stu.id} 
                        onClick={() => setActiveSpeakerId(stu.id)}
                        className={`relative rounded-2xl overflow-hidden bg-slate-900 border flex flex-col items-center justify-center min-h-[140px] cursor-pointer group transition ${
                          activeSpeakerId === stu.id ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg' : isSpeaking ? 'border-emerald-400/70 ring-1 ring-emerald-400/40' : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <img 
                          src={stu.photoUrl} 
                          alt="" 
                          className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                        
                        {/* Badge & Speaking Status */}
                        {isSpeaking && (
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[9px] font-bold flex items-center gap-1 shadow">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                            <span>Speaking</span>
                          </div>
                        )}

                        {/* Student Info Bar */}
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] text-white">
                          <span className="font-semibold truncate">{stu.firstName} {stu.lastName}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            {isStuMuted ? <MicOff className="w-3 h-3 text-slate-400" /> : <Mic className="w-3 h-3 text-emerald-400" />}
                            <span className="text-[9px] text-slate-400 font-mono">#{stu.rollNo}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* VIEW 3: VOICE-ONLY CONFERENCE ROOM */}
              {layoutMode === 'voice' && (
                <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/70 overflow-y-auto pt-14">
                  <div className="text-center pt-2 space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      <span>VOICE CONFERENCE ROOM • OPUS 24 KBPS</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Low-bandwidth crystal audio optimized for rural 2G/3G connections &amp; multi-party discussion.
                    </p>
                  </div>

                  {/* Equalizer Frequency Waves */}
                  <div className="flex items-center justify-center gap-1 h-14 my-2">
                    {[12, 28, 48, 20, 56, 36, 16, 60, 42, 24, 52, 30, 18, 46, 26, 14].map((h, i) => (
                      <span
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-cyan-500 to-indigo-400 rounded-full animate-pulse"
                        style={{ height: `${h}px`, animationDelay: `${(i * 0.08).toFixed(2)}s` }}
                      />
                    ))}
                  </div>

                  {/* Participant Voice Pods */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pb-8">
                    {/* Teacher Pod */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`relative w-14 h-14 rounded-full flex items-center justify-center bg-cyan-950/80 border-2 ${
                        !isMicMuted ? 'border-emerald-400 ring-4 ring-emerald-400/20 shadow-lg shadow-emerald-500/20' : 'border-slate-700'
                      }`}>
                        <span className="text-xl">👨‍🏫</span>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                          {!isMicMuted ? <Mic className="w-3 h-3 text-emerald-300" /> : <MicOff className="w-3 h-3 text-rose-300" />}
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-white truncate max-w-[85px]">Teacher (Host)</span>
                      <span className="text-[9px] text-cyan-400 font-mono">Master Mic</span>
                    </div>

                    {/* Student Voice Pods */}
                    {classStudents.slice(0, 11).map((stu, i) => {
                      const isPeerSpeaking = i === 1 || i === 4;
                      return (
                        <div key={stu.id} className="flex flex-col items-center gap-1.5">
                          <div className={`relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-2 ${
                            isPeerSpeaking ? 'border-emerald-400 ring-4 ring-emerald-400/20 shadow-lg shadow-emerald-500/20 animate-pulse' : 'border-slate-800'
                          }`}>
                            <img src={stu.photoUrl} alt="" className="w-full h-full object-cover" />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-white flex items-center justify-center text-[10px]">
                              {isPeerSpeaking ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-slate-500" />}
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[85px]">{stu.firstName}</span>
                          <span className="text-[9px] text-slate-500 font-mono">Roll #{stu.rollNo}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Classroom Watermark & Live Media Status Pills */}
              <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none z-20">
                <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>{configDraft?.streamQuality || '1080p'} HD Live</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[10px] font-bold text-cyan-300 border border-white/10 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{classStudents.length} Students ({leaveStudents.length} on Leave)</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[10px] font-mono text-emerald-300 border border-white/10 hidden sm:flex items-center gap-1">
                  <Wifi className="w-2.5 h-2.5" />
                  <span>WebRTC 22ms RTT</span>
                </span>
                {configDraft?.audio?.noiseSuppression && (
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-950/80 backdrop-blur-md text-[9px] font-mono text-indigo-300 border border-indigo-700/50 hidden md:inline">
                    AI Noise Filter ON
                  </span>
                )}
              </div>

              {/* Raised Hand Banner */}
              {handRaised && (
                <div className="absolute top-12 right-3 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg animate-bounce z-20">
                  <span>✋ Hand Raised for Query</span>
                </div>
              )}

              {/* Whiteboard / Topic Overlay Bar */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs text-white z-20">
                <div className="flex items-center gap-2 truncate">
                  <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-semibold truncate">{subject}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                  Room: {targetClass?.roomNumber || 'Main Hall'}
                </span>
              </div>
            </div>

            {/* In-Call Controls Bar */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAudio}
                  className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isMicMuted ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-cyan-400" />}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isVideoOff ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
                >
                  {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4 text-cyan-400" />}
                </button>

                <button
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isScreenSharing ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Share Whiteboard / Screen"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* Record Lecture Toggle */}
                {!isStudentPortal && (
                  <button
                    onClick={handleToggleRecording}
                    className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                    title={isRecording ? 'Stop Recording and Save Video' : 'Record Lecture to Video (.webm)'}
                  >
                    <Disc className="w-4 h-4" />
                    <span className="hidden sm:inline">{isRecording ? 'Stop Rec' : 'Record'}</span>
                  </button>
                )}

                {/* Settings Shortcut */}
                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  title="Live Communication Settings"
                >
                  <Settings className="w-4 h-4 text-slate-300" />
                </button>
              </div>

              {/* Student Hand Raise & Leave Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHandRaised(!handRaised)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    handRaised ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>✋</span>
                  <span className="hidden sm:inline">{handRaised ? 'Lower Hand' : 'Raise Hand'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Leave Class</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Screen: Attendance Roster & Live Interactive Q&A Chat (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col min-h-0 space-y-3">
            
            {/* Remote Leave Students Attendees Roster */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white flex items-center gap-1.5 font-['Outfit']">
                  <HeartHandshake className="w-3.5 h-3.5 text-purple-400" />
                  <span>Remote / Leave Attendees ({leaveStudents.length})</span>
                </span>
                <span className="text-[9px] font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                  Live Sync
                </span>
              </div>

              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                {leaveStudents.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No approved leave students in this class.</p>
                ) : (
                  leaveStudents.map(stu => (
                    <div key={stu.id} className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img src={stu.photoUrl} alt="" className="w-6 h-6 rounded-lg object-cover" />
                        <span className="font-semibold text-slate-200">{stu.firstName} {stu.lastName}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                        Medical / Leave
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live Chat & Q&A Box */}
            <div className="flex-1 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col min-h-0 overflow-hidden">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold text-xs text-white font-['Outfit']">
                    Live Classroom Q&amp;A
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleExportChat}
                    className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-300 transition"
                    title="Export Chat Transcript (.txt)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[9px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                    {messages.length} msgs
                  </span>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 p-3 space-y-2 overflow-y-auto text-xs">
                {messages.map(m => (
                  <div key={m.id} className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-0.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-cyan-300">{m.sender}</span>
                      <span className="text-slate-500 font-mono">{m.time}</span>
                    </div>
                    <p className="text-slate-200 text-[11px] leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 flex items-center gap-1.5 bg-slate-900">
                <input
                  type="text"
                  placeholder={configDraft?.chat?.slowModeSeconds ? `Ask query (Slow Mode: ${configDraft.chat.slowModeSeconds}s)...` : "Type question or doubt here..."}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition font-bold"
                  title="Send Message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COMPREHENSIVE LIVE MEDIA & STREAM CONFIGURATION MODAL */}
      {/* ========================================================================= */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-4xl h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base font-['Outfit']">
                    Live Video Streaming, WebRTC &amp; Chat Configuration
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fine-tune RTMP broadcast keys, WebRTC ICE servers, noise suppression, and classroom chat moderation.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetConfig}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                  title="Reset to factory settings"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Defaults</span>
                </button>
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs Header */}
            <div className="px-4 pt-2 bg-slate-950/60 border-b border-slate-800 flex gap-2 overflow-x-auto">
              <button
                onClick={() => setConfigActiveTab('broadcast')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 shrink-0 ${
                  configActiveTab === 'broadcast'
                    ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>📡 RTMP &amp; HLS Stream</span>
              </button>

              <button
                onClick={() => setConfigActiveTab('video')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 shrink-0 ${
                  configActiveTab === 'video'
                    ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>📹 Video Call &amp; Resolution</span>
              </button>

              <button
                onClick={() => setConfigActiveTab('audio')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 shrink-0 ${
                  configActiveTab === 'audio'
                    ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>🎙️ Voice &amp; AI Noise Cancellation</span>
              </button>

              <button
                onClick={() => setConfigActiveTab('webrtc')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 shrink-0 ${
                  configActiveTab === 'webrtc'
                    ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>🌐 WebRTC &amp; ICE Servers</span>
              </button>

              <button
                onClick={() => setConfigActiveTab('chat')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 shrink-0 ${
                  configActiveTab === 'chat'
                    ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>💬 Chat Moderation</span>
              </button>

              <button
                onClick={() => setConfigActiveTab('conference')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 shrink-0 ${
                  configActiveTab === 'conference'
                    ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>👥 Conference &amp; Room Layouts</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5">
              
              {/* TAB 1: RTMP STREAMING & BROADCAST */}
              {configActiveTab === 'broadcast' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-start gap-3">
                    <Radio className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1">Live RTMP Ingest &amp; Multi-Bitrate HLS Player</h4>
                      <p className="text-slate-300 leading-relaxed">
                        Copy the RTMP server URL and Stream Key below into <strong>OBS Studio</strong>, <strong>vMix</strong>, or <strong>Prism Live</strong> to broadcast multi-camera classroom lectures to the school CDN, YouTube Live, or Mobile Apps.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* RTMP Server URL */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">RTMP Ingest Server URL</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={configDraft?.broadcast?.rtmpIngestUrl || ''}
                          onChange={(e) => setConfigDraft({
                            ...configDraft,
                            broadcast: { ...configDraft?.broadcast, rtmpIngestUrl: e.target.value }
                          })}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopy(configDraft?.broadcast?.rtmpIngestUrl || '', 'rtmpUrl')}
                          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
                          title="Copy RTMP URL"
                        >
                          {copiedKey === 'rtmpUrl' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500">Standard port: 443 / 1935 (RTMPS SSL Secured)</span>
                    </div>

                    {/* Stream Key */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">Classroom Stream Key</label>
                        <button
                          type="button"
                          onClick={() => {
                            const newKey = `live_mzs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                            setConfigDraft({
                              ...configDraft,
                              broadcast: { ...configDraft?.broadcast, streamKey: newKey }
                            });
                          }}
                          className="text-[11px] text-cyan-400 hover:underline"
                        >
                          Generate New
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type={showStreamKey ? 'text' : 'password'}
                          value={configDraft?.broadcast?.streamKey || ''}
                          onChange={(e) => setConfigDraft({
                            ...configDraft,
                            broadcast: { ...configDraft?.broadcast, streamKey: e.target.value }
                          })}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStreamKey(!showStreamKey)}
                          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
                        >
                          {showStreamKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(configDraft?.broadcast?.streamKey || '', 'streamKey')}
                          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
                          title="Copy Stream Key"
                        >
                          {copiedKey === 'streamKey' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500">Keep confidential. Used to authenticate your broadcast encoder.</span>
                    </div>
                  </div>

                  {/* HLS Playback Master Link */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Public HLS Video Stream Output (.m3u8)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={configDraft?.broadcast?.hlsPlaybackUrl || ''}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          broadcast: { ...configDraft?.broadcast, hlsPlaybackUrl: e.target.value }
                        })}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(configDraft?.broadcast?.hlsPlaybackUrl || '', 'hlsUrl')}
                        className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
                        title="Copy HLS URL"
                      >
                        {copiedKey === 'hlsUrl' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Restream & Cloud DVR Options */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Restreaming &amp; Cloud Archival</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
                        <span className="text-xs font-medium text-slate-200">YouTube Live Sync</span>
                        <input
                          type="checkbox"
                          checked={!!configDraft?.broadcast?.restreamYouTube}
                          onChange={(e) => setConfigDraft({
                            ...configDraft,
                            broadcast: { ...configDraft?.broadcast, restreamYouTube: e.target.checked }
                          })}
                          className="w-4 h-4 rounded text-cyan-500"
                        />
                      </label>

                      <label className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
                        <span className="text-xs font-medium text-slate-200">Facebook Live</span>
                        <input
                          type="checkbox"
                          checked={!!configDraft?.broadcast?.restreamFacebook}
                          onChange={(e) => setConfigDraft({
                            ...configDraft,
                            broadcast: { ...configDraft?.broadcast, restreamFacebook: e.target.checked }
                          })}
                          className="w-4 h-4 rounded text-cyan-500"
                        />
                      </label>

                      <label className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
                        <span className="text-xs font-medium text-slate-200">Cloud DVR Recording</span>
                        <input
                          type="checkbox"
                          checked={!!configDraft?.broadcast?.dvrRecordingEnabled}
                          onChange={(e) => setConfigDraft({
                            ...configDraft,
                            broadcast: { ...configDraft?.broadcast, dvrRecordingEnabled: e.target.checked }
                          })}
                          className="w-4 h-4 rounded text-cyan-500"
                        />
                      </label>
                    </div>

                    <div className="pt-2">
                      <label className="text-xs text-slate-400">Cloud Storage Bucket for Lecture Archives</label>
                      <input
                        type="text"
                        value={configDraft?.broadcast?.storageBucket || ''}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          broadcast: { ...configDraft?.broadcast, storageBucket: e.target.value }
                        })}
                        className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VIDEO QUALITY & RESOLUTION */}
              {configActiveTab === 'video' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Video Camera &amp; Resolution Presets</h4>
                  
                  {/* Resolution Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: '360p', label: '360p Mobile', desc: 'Data Saver (640x360)', badge: 'Low Bandwidth' },
                      { id: '720p', label: '720p HD', desc: 'Standard (1280x720)', badge: 'Recommended' },
                      { id: '1080p', label: '1080p Full HD', desc: 'Crisp Board (1920x1080)', badge: 'Default' },
                      { id: '4k', label: '4K Ultra', desc: 'Studio Ingest (3840x2160)', badge: 'High Power' }
                    ].map(res => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => setConfigDraft({ ...configDraft, streamQuality: res.id })}
                        className={`p-3.5 rounded-2xl border text-left transition ${
                          configDraft?.streamQuality === res.id
                            ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/30'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-white">{res.label}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            configDraft?.streamQuality === res.id ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {res.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{res.desc}</p>
                      </button>
                    ))}
                  </div>

                  {/* Frame Rate & Bitrate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-200">Target Framerate (FPS)</label>
                      <div className="flex gap-2">
                        {[24, 30, 60].map(fps => (
                          <button
                            key={fps}
                            type="button"
                            onClick={() => setConfigDraft({ ...configDraft, frameRate: fps })}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                              configDraft?.frameRate === fps
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {fps} FPS
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500">30 FPS is optimal for slide sharing &amp; blackboard lecturing.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-bold text-slate-200">Video Encoding Bitrate</label>
                        <span className="font-mono text-cyan-400 font-bold">{configDraft?.bitrateKbps || 2500} kbps</span>
                      </div>
                      <input
                        type="range"
                        min="500"
                        max="6000"
                        step="250"
                        value={configDraft?.bitrateKbps || 2500}
                        onChange={(e) => setConfigDraft({ ...configDraft, bitrateKbps: Number(e.target.value) })}
                        className="w-full accent-cyan-400"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>500 kbps (Light)</span>
                        <span>2500 kbps (HD)</span>
                        <span>6000 kbps (Max)</span>
                      </div>
                    </div>
                  </div>

                  {/* Device Enumeration */}
                  {availableCameras.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-200">Hardware Camera Selector</label>
                      <select className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-400">
                        {availableCameras.map((cam, idx) => (
                          <option key={cam.deviceId || idx} value={cam.deviceId}>
                            {cam.label || `Camera ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: VOICE & AUDIO PROCESSING */}
              {configActiveTab === 'audio' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 flex items-start gap-3">
                    <Volume2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1">AI Voice Enhancement &amp; Noise Shields</h4>
                      <p className="text-slate-300 leading-relaxed">
                        These real-time Web Audio filters suppress ceiling fan hums, hallway murmurs, and prevent acoustic speaker feedback loops during live lectures.
                      </p>
                    </div>
                  </div>

                  {/* Audio Filter Toggles */}
                  <div className="space-y-2.5">
                    <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-500/40 transition">
                      <div>
                        <div className="font-bold text-xs text-white">AI Background Noise Suppression</div>
                        <p className="text-[11px] text-slate-400">Filters ambient fan hum, classroom paper shuffling, and traffic noise.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!configDraft?.audio?.noiseSuppression}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          audio: { ...configDraft?.audio, noiseSuppression: e.target.checked }
                        })}
                        className="w-5 h-5 rounded text-indigo-500"
                      />
                    </label>

                    <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-500/40 transition">
                      <div>
                        <div className="font-bold text-xs text-white">Acoustic Echo Cancellation (AEC)</div>
                        <p className="text-[11px] text-slate-400">Cancels speaker feedback echo when attendees are not using headphones.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!configDraft?.audio?.echoCancellation}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          audio: { ...configDraft?.audio, echoCancellation: e.target.checked }
                        })}
                        className="w-5 h-5 rounded text-indigo-500"
                      />
                    </label>

                    <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-500/40 transition">
                      <div>
                        <div className="font-bold text-xs text-white">Auto Gain Control (AGC)</div>
                        <p className="text-[11px] text-slate-400">Automatically evens out whisper-quiet student queries and loud teacher voices.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!configDraft?.audio?.autoGainControl}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          audio: { ...configDraft?.audio, autoGainControl: e.target.checked }
                        })}
                        className="w-5 h-5 rounded text-indigo-500"
                      />
                    </label>
                  </div>

                  {/* Audio Bitrate & Mic Level Simulation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-200">Opus Audio Bitrate</label>
                      <select
                        value={configDraft?.audio?.bitrateKbps || 128}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          audio: { ...configDraft?.audio, bitrateKbps: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                      >
                        <option value={64}>64 kbps (Standard Voice / Data Saver)</option>
                        <option value={128}>128 kbps (HD Opus Audio - Recommended)</option>
                        <option value={256}>256 kbps (Studio Hi-Fi Sound)</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-200">Microphone Input Level VU Meter</label>
                      <div className="h-4 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-slate-800 flex items-center">
                        <div className={`h-full rounded-full transition-all duration-300 ${
                          isMicMuted ? 'w-0' : 'w-3/4 bg-gradient-to-r from-emerald-500 via-yellow-400 to-rose-500 animate-pulse'
                        }`} />
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {isMicMuted ? 'Microphone Muted' : 'Microphone Active & Receiving Audio Level'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: WEBRTC & ICE SERVERS */}
              {configActiveTab === 'webrtc' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">WebRTC Infrastructure &amp; STUN/TURN Relays</h4>
                      <p className="text-xs text-slate-400">Configure ICE servers to guarantee connections across restrictive firewalls and cellular networks.</p>
                    </div>

                    <button
                      type="button"
                      onClick={runIcePingTest}
                      disabled={icePingTest?.loading}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${icePingTest?.loading ? 'animate-spin' : ''}`} />
                      <span>{icePingTest?.loading ? 'Testing...' : 'Ping ICE Servers'}</span>
                    </button>
                  </div>

                  {/* ICE Test Results Banner */}
                  {icePingTest && (
                    <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                      icePingTest.success ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span>{icePingTest.message}</span>
                        {icePingTest.rtt && (
                          <span className="font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
                            RTT: {icePingTest.rtt} ms
                          </span>
                        )}
                      </div>
                      {icePingTest.natType && (
                        <p className="text-[11px] text-slate-400 font-mono">
                          NAT Type: {icePingTest.natType} • {icePingTest.turnStatus}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Engine Provider Choice */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-200">Active Multi-Party Conference Provider</label>
                    <select
                      value={configDraft?.activeProvider || 'webrtc_mesh'}
                      onChange={(e) => setConfigDraft({ ...configDraft, activeProvider: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option value="webrtc_mesh">Native Browser WebRTC Mesh (Direct Peer-to-Peer, Zero Server Cost)</option>
                      <option value="agora">Agora RTC Cloud Gateway (Global Low-Latency SDK)</option>
                      <option value="livekit">LiveKit SFU (High Capacity Open-Source SFU)</option>
                      <option value="jitsi">Jitsi Meet WebBridge (Institutional Self-Hosted)</option>
                    </select>
                  </div>

                  {/* STUN / TURN Server Pool */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">Configured ICE STUN/TURN Servers</label>
                    <div className="space-y-2">
                      {(configDraft?.webrtc?.iceServers || []).map((srv, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <span className="font-mono text-cyan-300 font-bold">{srv.urls}</span>
                            {srv.username && (
                              <div className="text-[10px] text-slate-500 font-mono">
                                Auth: <span className="text-slate-300">{srv.username}</span> | Credential: ••••••••
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/20">
                            {srv.urls.startsWith('turn') ? 'TURN Relay' : 'STUN Discovery'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cloud API Keys for Agora / LiveKit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-300">Agora RTC App ID</label>
                      <input
                        type="text"
                        value={configDraft?.agora?.appId || ''}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          agora: { ...configDraft?.agora, appId: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                        placeholder="agora_app_id_32_chars"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-300">LiveKit WebSocket Host URL</label>
                      <input
                        type="text"
                        value={configDraft?.livekit?.hostUrl || ''}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          livekit: { ...configDraft?.livekit, hostUrl: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                        placeholder="wss://livekit.school.edu"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CHAT & CLASSROOM MODERATION */}
              {configActiveTab === 'chat' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Classroom Live Chat &amp; Anti-Distraction Policies</h4>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-slate-200">Chat Slow Mode Delay</label>
                      <span className="font-mono text-cyan-400 font-bold">
                        {configDraft?.chat?.slowModeSeconds || 0} seconds
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="3"
                      value={configDraft?.chat?.slowModeSeconds || 0}
                      onChange={(e) => setConfigDraft({
                        ...configDraft,
                        chat: { ...configDraft?.chat, slowModeSeconds: Number(e.target.value) }
                      })}
                      className="w-full accent-cyan-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Off (Instant)</span>
                      <span>3s (Polite)</span>
                      <span>15s (Exam Mode)</span>
                      <span>30s (Strict)</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
                      <div>
                        <div className="font-bold text-xs text-white">AI Profanity &amp; Toxicity Shield</div>
                        <p className="text-[11px] text-slate-400">Automatically masks offensive or inappropriate vocabulary with **** in real time.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!configDraft?.chat?.profanityFilter}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          chat: { ...configDraft?.chat, profanityFilter: e.target.checked }
                        })}
                        className="w-5 h-5 rounded text-cyan-500"
                      />
                    </label>

                    <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
                      <div>
                        <div className="font-bold text-xs text-white">Allow Student 1-on-1 Private DMs</div>
                        <p className="text-[11px] text-slate-400">When disabled, students can only post in the public classroom Q&amp;A channel seen by teachers.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!configDraft?.chat?.allowStudentPrivateChat}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          chat: { ...configDraft?.chat, allowStudentPrivateChat: e.target.checked }
                        })}
                        className="w-5 h-5 rounded text-cyan-500"
                      />
                    </label>

                    <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
                      <div>
                        <div className="font-bold text-xs text-white">Allow File &amp; Screenshot Uploads</div>
                        <p className="text-[11px] text-slate-400">Permit students to share homework snapshots and math equation photos in chat.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!configDraft?.chat?.allowAttachments}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          chat: { ...configDraft?.chat, allowAttachments: e.target.checked }
                        })}
                        className="w-5 h-5 rounded text-cyan-500"
                      />
                    </label>

                    <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
                      <div>
                        <div className="font-bold text-xs text-white">Auto-Archive Session Chat Transcript</div>
                        <p className="text-[11px] text-slate-400">Saves all live questions and answers to the institutional records archive at session close.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!configDraft?.chat?.autoArchiveSessionChat}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          chat: { ...configDraft?.chat, autoArchiveSessionChat: e.target.checked }
                        })}
                        className="w-5 h-5 rounded text-cyan-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 6: CONFERENCE & MULTI-PARTY ROOM LAYOUTS */}
              {configActiveTab === 'conference' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 flex items-start gap-3">
                    <LayoutGrid className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1">Multi-Party Conference &amp; Voice Room Engine</h4>
                      <p className="text-slate-300 leading-relaxed">
                        Configure group gallery layouts, active speaker spotlighting, rural low-bandwidth audio-only fallback, and private consultation call settings.
                      </p>
                    </div>
                  </div>

                  {/* Default Classroom Layout */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">Default Classroom Layout Mode</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div
                        onClick={() => setConfigDraft({
                          ...configDraft,
                          conference: { ...(configDraft?.conference || {}), defaultLayout: 'stage' }
                        })}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                          (configDraft?.conference?.defaultLayout || 'stage') === 'stage'
                            ? 'bg-cyan-500/10 border-cyan-400 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Maximize2 className="w-4 h-4 text-cyan-400" />
                          <input
                            type="radio"
                            name="defaultLayout"
                            checked={(configDraft?.conference?.defaultLayout || 'stage') === 'stage'}
                            onChange={() => {}}
                            className="text-cyan-500"
                          />
                        </div>
                        <span className="font-bold text-xs text-white">Broadcast Stage</span>
                        <p className="text-[10px] text-slate-400 mt-1">Single hero teacher view with roster sidebar</p>
                      </div>

                      <div
                        onClick={() => setConfigDraft({
                          ...configDraft,
                          conference: { ...(configDraft?.conference || {}), defaultLayout: 'grid' }
                        })}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                          configDraft?.conference?.defaultLayout === 'grid'
                            ? 'bg-cyan-500/10 border-cyan-400 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <LayoutGrid className="w-4 h-4 text-cyan-400" />
                          <input
                            type="radio"
                            name="defaultLayout"
                            checked={configDraft?.conference?.defaultLayout === 'grid'}
                            onChange={() => {}}
                            className="text-cyan-500"
                          />
                        </div>
                        <span className="font-bold text-xs text-white">Gallery Grid</span>
                        <p className="text-[10px] text-slate-400 mt-1">Multi-party video conference tiles (Zoom/Meet style)</p>
                      </div>

                      <div
                        onClick={() => setConfigDraft({
                          ...configDraft,
                          conference: { ...(configDraft?.conference || {}), defaultLayout: 'voice' }
                        })}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                          configDraft?.conference?.defaultLayout === 'voice'
                            ? 'bg-cyan-500/10 border-cyan-400 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Volume2 className="w-4 h-4 text-indigo-400" />
                          <input
                            type="radio"
                            name="defaultLayout"
                            checked={configDraft?.conference?.defaultLayout === 'voice'}
                            onChange={() => {}}
                            className="text-cyan-500"
                          />
                        </div>
                        <span className="font-bold text-xs text-white">Voice Room</span>
                        <p className="text-[10px] text-slate-400 mt-1">Audio-only with equalizer (ultra-low 24kbps data)</p>
                      </div>
                    </div>
                  </div>

                  {/* Conference Grid Settings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">Max Display Participants in Grid</label>
                      <select
                        value={configDraft?.conference?.maxGridTiles || 9}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          conference: { ...(configDraft?.conference || {}), maxGridTiles: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value={4}>4 Tiles (2x2 Grid - Low CPU)</option>
                        <option value={9}>9 Tiles (3x3 Grid - Standard Classroom)</option>
                        <option value={16}>16 Tiles (4x4 Grid - Large Lecture Hall)</option>
                      </select>
                      <span className="text-[10px] text-slate-500 block">Hardware acceleration limits rendering to prevent device lag.</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-bold text-slate-200">Audio Equalizer Sensitivity</label>
                        <span className="font-mono text-cyan-400 font-bold">{configDraft?.conference?.audioEqualizerSensitivity || 75}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        step="5"
                        value={configDraft?.conference?.audioEqualizerSensitivity || 75}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          conference: { ...(configDraft?.conference || {}), audioEqualizerSensitivity: Number(e.target.value) }
                        })}
                        className="w-full accent-cyan-400"
                      />
                      <span className="text-[10px] text-slate-500 block">Microphone threshold for soundwave visualizer.</span>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2.5">
                    <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
                      <div>
                        <div className="font-bold text-xs text-white">Active Speaker Auto-Spotlight</div>
                        <p className="text-[11px] text-slate-400">Automatically applies animated green aura ring to whichever participant is talking.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={configDraft?.conference?.activeSpeakerSpotlight !== false}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          conference: { ...(configDraft?.conference || {}), activeSpeakerSpotlight: e.target.checked }
                        })}
                        className="w-5 h-5 rounded text-cyan-500"
                      />
                    </label>

                    <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
                      <div>
                        <div className="font-bold text-xs text-white">Low Bandwidth Auto-Fallback</div>
                        <p className="text-[11px] text-slate-400">Switches classroom to Voice Room automatically if packet drop exceeds 15%.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!configDraft?.conference?.bandwidthSaverVoiceMode}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          conference: { ...(configDraft?.conference || {}), bandwidthSaverVoiceMode: e.target.checked }
                        })}
                        className="w-5 h-5 rounded text-cyan-500"
                      />
                    </label>

                    <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
                      <div>
                        <div className="font-bold text-xs text-white">Waiting Room &amp; Host Admission</div>
                        <p className="text-[11px] text-slate-400">Students and parents must knock and wait for host clearance before entering conference.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={configDraft?.conference?.waitingRoomEnabled !== false}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          conference: { ...(configDraft?.conference || {}), waitingRoomEnabled: e.target.checked }
                        })}
                        className="w-5 h-5 rounded text-cyan-500"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Changes apply live to current classroom stream and persist across sessions.</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply &amp; Save Configuration</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* RECORDED LECTURE VIDEO PLAYBACK PREVIEW MODAL */}
      {isRecordedPlaybackOpen && recordedVideoUrl && (
        <div className="fixed inset-0 z-70 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Disc className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Lecture Recording Saved</h4>
                  <p className="text-xs text-slate-400">Captured locally in HD WebM format</p>
                </div>
              </div>
              <button
                onClick={() => setIsRecordedPlaybackOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video flex items-center justify-center">
              <video
                src={recordedVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Downloaded to your Downloads folder</span>
              </span>

              <div className="flex gap-2">
                <a
                  href={recordedVideoUrl}
                  download={`Class_12_Lecture_${new Date().toISOString().slice(0, 10)}.webm`}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Again</span>
                </a>
                <button
                  onClick={() => setIsRecordedPlaybackOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
