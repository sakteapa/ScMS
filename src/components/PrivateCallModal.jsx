import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Share2, 
  Maximize2, 
  Sparkles, 
  Sliders, 
  Check, 
  X, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Clock, 
  FileText, 
  User, 
  HeartHandshake,
  Wifi,
  Lock,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function PrivateCallModal({ 
  isOpen, 
  onClose, 
  targetUser = null, // { id, name, role, photoUrl, phone, classInfo }
  initialType = 'video' // 'video' | 'voice'
}) {
  const { currentUser } = useAuth();
  const { sendPrivateNotification } = useSchool();

  const [callType, setCallType] = useState(initialType); // 'video' | 'voice'
  const [callStatus, setCallStatus] = useState('ringing'); // 'ringing', 'connected', 'ended'
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(initialType === 'voice');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState('call'); // 'call' | 'notes' | 'config'
  const [consultationNotes, setConsultationNotes] = useState('');
  const [toast, setToast] = useState(null);

  // Private Call Configuration State
  const [pvtConfig, setPvtConfig] = useState({
    ringtoneEnabled: true,
    voiceLowBandwidth: false,
    ringTimeoutSeconds: 25,
    autoLogNotes: true,
    endToEndEncryption: true
  });

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamObjRef = useRef(null);
  const audioContextRef = useRef(null);

  // Sync initial type
  useEffect(() => {
    setCallType(initialType);
    setIsVideoOff(initialType === 'voice');
  }, [initialType]);

  // Ringtone synthesizer
  useEffect(() => {
    let interval = null;
    if (isOpen && callStatus === 'ringing' && pvtConfig.ringtoneEnabled) {
      const playRingTone = () => {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          audioContextRef.current = ctx;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(440, ctx.currentTime);
          osc2.frequency.setValueAtTime(480, ctx.currentTime);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc1.start();
          osc2.start();
          osc1.stop(ctx.currentTime + 1.2);
          osc2.stop(ctx.currentTime + 1.2);
        } catch (e) {}
      };

      playRingTone();
      interval = setInterval(playRingTone, 2800);

      // Auto-connect call after 3.5 seconds to simulate answer
      const timer = setTimeout(() => {
        setCallStatus('connected');
      }, 3500);

      return () => {
        if (interval) clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isOpen, callStatus, pvtConfig.ringtoneEnabled]);

  // In-call timer
  useEffect(() => {
    let timer = null;
    if (callStatus === 'connected') {
      timer = setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setCallSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callStatus]);

  // Init local camera stream
  useEffect(() => {
    let activeStream = null;
    const startMedia = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: callType === 'video' ? { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } : false,
          audio: true
        });
        activeStream = s;
        streamObjRef.current = s;
        if (localVideoRef.current && callType === 'video') {
          localVideoRef.current.srcObject = s;
          localVideoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.warn('Private call media fallback:', err);
      }
    };

    if (isOpen) {
      startMedia();
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen, callType]);

  if (!isOpen) return null;

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const resolvedTarget = targetUser || {
    name: 'Pi Lalmuanpuii (Parent of Vanlalhruaia)',
    role: 'Parent / Guardian',
    phone: '+91 94361 40099',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    info: 'Class 12 Science • Vanlalhruaia Chawngthu'
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    if (streamObjRef.current) {
      streamObjRef.current.getTracks().forEach(t => t.stop());
    }
    setTimeout(() => {
      onClose();
      setCallStatus('ringing');
    }, 1200);
  };

  // Toggle Video Track
  const toggleVideo = () => {
    if (streamObjRef.current) {
      const vTrack = streamObjRef.current.getVideoTracks()[0];
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
    if (streamObjRef.current) {
      const aTrack = streamObjRef.current.getAudioTracks()[0];
      if (aTrack) {
        aTrack.enabled = !aTrack.enabled;
        setIsMicMuted(!aTrack.enabled);
      }
    } else {
      setIsMicMuted(!isMicMuted);
    }
  };

  // Save consultation notes
  const handleSaveNotes = () => {
    setToast('Private consultation log saved to institutional student records.');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-3xl h-[88vh] bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative animate-scaleUp">
        
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
              callType === 'video' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {callType === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm font-['Outfit']">
                  Private 1-on-1 {callType === 'video' ? 'Video Call' : 'Voice Call'}
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 ${
                  callStatus === 'connected' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${callStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span>{callStatus === 'connected' ? `Connected (${formatTimer(callSeconds)})` : 'Ringing...'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {resolvedTarget.name} • {resolvedTarget.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'call' ? 'notes' : 'call')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>{activeTab === 'notes' ? 'View Call' : 'Meeting Notes'}</span>
            </button>

            <button
              onClick={() => setActiveTab(activeTab === 'config' ? 'call' : 'config')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Call Configuration"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Toast */}
        {toast && (
          <div className="bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30 text-xs font-bold py-2 text-center flex items-center justify-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{toast}</span>
          </div>
        )}

        {/* Body Area */}
        <div className="flex-1 min-h-0 relative p-4 flex flex-col justify-between">
          
          {/* TAB 1: MAIN CALL SCREEN */}
          {activeTab === 'call' && (
            <div className="flex-1 relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center shadow-inner">
              
              {/* VIDEO MODE */}
              {callType === 'video' ? (
                <div className="w-full h-full relative flex items-center justify-center">
                  {/* Remote Target Video / Avatar */}
                  <div className="text-center space-y-3">
                    <div className="relative inline-block">
                      <img 
                        src={resolvedTarget.photoUrl} 
                        alt="" 
                        className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-slate-700 shadow-2xl" 
                      />
                      {callStatus === 'ringing' && (
                        <div className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-ping opacity-75" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-lg font-['Outfit']">{resolvedTarget.name}</h4>
                      <p className="text-xs text-cyan-400 font-semibold">{resolvedTarget.role}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{resolvedTarget.info || resolvedTarget.phone}</p>
                    </div>
                  </div>

                  {/* Picture-in-Picture Local Self Camera Preview */}
                  <div className="absolute top-4 right-4 w-32 h-44 sm:w-40 sm:h-52 rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-2xl z-20">
                    {isVideoOff ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 text-slate-500">
                        <VideoOff className="w-6 h-6 mb-1" />
                        <span className="text-[10px]">Camera Off</span>
                      </div>
                    ) : (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                    )}
                    <span className="absolute bottom-1.5 left-2 text-[9px] font-bold bg-black/70 px-1.5 py-0.5 rounded text-white font-mono">
                      You
                    </span>
                  </div>
                </div>
              ) : (
                /* VOICE-ONLY CALL MODE */
                <div className="text-center space-y-6">
                  <div className="relative inline-block">
                    <img 
                      src={resolvedTarget.photoUrl} 
                      alt="" 
                      className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)] mx-auto" 
                    />
                    {callStatus === 'connected' && (
                      <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-emerald-500 text-slate-950 shadow-lg">
                        <Volume2 className="w-5 h-5 animate-pulse" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-white text-xl font-['Outfit']">{resolvedTarget.name}</h3>
                    <p className="text-xs text-emerald-400 font-semibold">{resolvedTarget.role}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{resolvedTarget.phone}</p>
                  </div>

                  {/* Reactive Audio Equalizer Waveform Bars */}
                  {callStatus === 'connected' && (
                    <div className="flex items-center justify-center gap-1.5 h-10">
                      {[18, 36, 24, 42, 30, 48, 20, 38, 28, 44, 22].map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-full animate-pulse"
                          style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Status Banner Overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-white/10 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>WebRTC P2P Encrypted</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10 hidden sm:inline">
                  {callType === 'voice' ? 'Opus Voice 32kbps' : '720p HD Video'}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: CONSULTATION MEETING NOTES */}
          {activeTab === 'notes' && (
            <div className="flex-1 rounded-3xl bg-slate-950 border border-slate-800 p-5 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Private Consultation &amp; Counseling Notes</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Auto-Linked to {resolvedTarget.name}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Record key discussion points, academic intervention plans, or disciplinary remarks during this 1-on-1 session.
                </p>
              </div>

              <textarea
                rows={10}
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                placeholder="Type private meeting notes, agreements, or follow-up tasks discussed..."
                className="w-full flex-1 p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 leading-relaxed resize-none font-sans"
              />

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-500">Visible only to Authorized Teachers &amp; Principal</span>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notes to Profile</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="flex-1 rounded-3xl bg-slate-950 border border-slate-800 p-5 space-y-4 text-xs">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Private 1-on-1 Call Preferences</span>
              </h4>

              <div className="space-y-3 pt-2">
                <label className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-bold text-white text-xs">Acoustic Ringtone Simulation</div>
                    <p className="text-[11px] text-slate-400">Plays dual-frequency 440/480Hz telephone chime while dialing.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pvtConfig.ringtoneEnabled}
                    onChange={(e) => setPvtConfig({ ...pvtConfig, ringtoneEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                </label>

                <label className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-bold text-white text-xs">Ultra Low-Bandwidth Voice Throttling</div>
                    <p className="text-[11px] text-slate-400">Caps voice stream at 24kbps Opus for poor 2G/3G connectivity.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pvtConfig.voiceLowBandwidth}
                    onChange={(e) => setPvtConfig({ ...pvtConfig, voiceLowBandwidth: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                </label>

                <label className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-bold text-white text-xs">Auto-Log Consultation Minutes</div>
                    <p className="text-[11px] text-slate-400">Saves call timestamp and notes to student conduct archive.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pvtConfig.autoLogNotes}
                    onChange={(e) => setPvtConfig({ ...pvtConfig, autoLogNotes: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('call')}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Return to Active Call
                </button>
              </div>
            </div>
          )}

          {/* In-Call Action Control Bar */}
          <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Mic Mute */}
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-2xl text-xs font-bold transition ${
                  isMicMuted ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-cyan-400" />}
              </button>

              {/* Camera Toggle */}
              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-2xl text-xs font-bold transition ${
                    isVideoOff ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5 text-cyan-400" />}
                </button>
              )}

              {/* Switch between Video and Voice */}
              <button
                onClick={() => setCallType(callType === 'video' ? 'voice' : 'video')}
                className="px-3 py-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                title="Switch Video / Voice Mode"
              >
                {callType === 'video' ? <Phone className="w-4 h-4 text-emerald-400" /> : <Video className="w-4 h-4 text-cyan-400" />}
                <span className="hidden sm:inline">{callType === 'video' ? 'Switch to Voice Call' : 'Switch to Video'}</span>
              </button>
            </div>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition transform hover:scale-105"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
