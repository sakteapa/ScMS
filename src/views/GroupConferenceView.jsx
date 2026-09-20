import React, { useState, useRef, useEffect } from "react";
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Share2, Users, Settings,
  Plus, Calendar, Clock, Lock, Wifi, Maximize2, MessageSquare, Hand,
  ScreenShare, ScreenShareOff, Copy, Check, ChevronRight, X, Sliders,
  Shield, Globe, Bell, BellOff, Sparkles, UserPlus, Link2, MonitorPlay,
  Radio, PenLine, Save, CheckCircle2, Zap, Coffee
} from "lucide-react";
import { useSchool } from "../context/SchoolContext";
import { useAuth } from "../context/AuthContext";

const MOCK_ROOMS = [
  {
    id: "room_001",
    title: "Staff Academic Review — Term 2",
    host: "Pu Lalremthanga (Principal)",
    scheduledAt: "2026-09-21T10:00:00",
    duration: 60,
    participants: [
      { id: "p1", name: "Pu Lalremthanga", role: "Principal", avatar: "PL", color: "bg-indigo-500", mic: true, video: true },
      { id: "p2", name: "Pi Lalnunpuii", role: "Vice Principal", avatar: "LL", color: "bg-cyan-500", mic: true, video: false },
      { id: "p3", name: "Pu Vanlalruata", role: "Science HoD", avatar: "VR", color: "bg-emerald-500", mic: false, video: true },
      { id: "p4", name: "Pi Lalmuanpuii", role: "Math Teacher", avatar: "LM", color: "bg-rose-500", mic: false, video: false },
      { id: "p5", name: "Pu Zothanzama", role: "English Teacher", avatar: "ZT", color: "bg-amber-500", mic: true, video: true },
    ],
    status: "live",
    roomCode: "ZXS-CONF-7A2F",
    type: "staff_meeting",
    encrypted: true,
  },
  {
    id: "room_002",
    title: "Parent-Teacher Conference — Class 12 Science",
    host: "Pi Lalnunpuii (Vice Principal)",
    scheduledAt: "2026-09-22T14:00:00",
    duration: 90,
    participants: [
      { id: "p1", name: "Pi Lalnunpuii", role: "Vice Principal", avatar: "LL", color: "bg-cyan-500", mic: true, video: true },
      { id: "p2", name: "Pi Lalmuanpuii (Parent)", role: "Parent / Guardian", avatar: "LM", color: "bg-pink-500", mic: false, video: false },
    ],
    status: "scheduled",
    roomCode: "ZXS-PTM-8B3G",
    type: "ptm_group",
    encrypted: true,
  },
  {
    id: "room_003",
    title: "Emergency Crisis Coordination — Hostel Incident",
    host: "Pu Lalremthanga (Principal)",
    scheduledAt: "2026-09-20T08:30:00",
    duration: 30,
    participants: [
      { id: "p1", name: "Pu Lalremthanga", role: "Principal", avatar: "PL", color: "bg-indigo-500", mic: true, video: true },
      { id: "p2", name: "Pu Lalrammawia", role: "Hostel Warden", avatar: "LR", color: "bg-rose-500", mic: true, video: true },
      { id: "p3", name: "Pi Remruatdiki", role: "School Nurse", avatar: "RD", color: "bg-emerald-500", mic: false, video: false },
    ],
    status: "ended",
    roomCode: "ZXS-EMG-5K9Q",
    type: "emergency",
    encrypted: true,
  },
];

const INITIAL_CONF_CONFIG = {
  defaultDuration: 60,
  maxParticipants: 20,
  waitingRoomEnabled: true,
  requireHostApproval: true,
  recordingEnabled: false,
  autoMuteOnJoin: true,
  chatEnabled: true,
  handRaiseEnabled: true,
  encryptionMode: "e2e",
  allowGuests: false,
  breakoutRoomsEnabled: false,
  noiseSuppressionEnabled: true,
  bandwidthMode: "auto",
  defaultVideoQuality: "720p",
};

const TYPE_COLORS = {
  staff_meeting: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  ptm_group: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  emergency: "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

const TYPE_LABELS = {
  staff_meeting: "Staff Meeting",
  ptm_group: "PTM Conference",
  emergency: "Emergency Call",
};

export default function GroupConferenceView() {
  const { currentUser } = useAuth();
  const { sendPrivateNotification } = useSchool();

  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [activeTab, setActiveTab] = useState("rooms");
  const [activeRoom, setActiveRoom] = useState(null);
  const [confConfig, setConfConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("zoxs_conf_config");
      return saved ? { ...INITIAL_CONF_CONFIG, ...JSON.parse(saved) } : INITIAL_CONF_CONFIG;
    } catch { return INITIAL_CONF_CONFIG; }
  });

  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "Pi Lalnunpuii", text: "Good morning everyone! Let us begin the review.", time: "10:02 AM" },
    { id: 2, sender: "Pu Vanlalruata", text: "Ready. Science department report is prepared.", time: "10:03 AM" },
  ]);
  const [newMsg, setNewMsg] = useState("");
  const [callSeconds, setCallSeconds] = useState(0);
  const [toast, setToast] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ title: "", type: "staff_meeting", scheduledAt: "", duration: 60 });

  const localVideoRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("zoxs_conf_config", JSON.stringify(confConfig));
  }, [confConfig]);

  useEffect(() => {
    let t = null;
    if (activeTab === "live" && activeRoom) {
      t = setInterval(() => setCallSeconds(p => p + 1), 1000);
    } else {
      setCallSeconds(0);
    }
    return () => { if (t) clearInterval(t); };
  }, [activeTab, activeRoom]);

  useEffect(() => {
    let stream = null;
    const startCam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }
      } catch {}
    };
    if (activeTab === "live") startCam();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [activeTab]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const joinRoom = (room) => {
    setActiveRoom(room);
    setActiveTab("live");
    setIsMicMuted(confConfig.autoMuteOnJoin);
  };

  const leaveCall = () => {
    setActiveTab("rooms");
    setActiveRoom(null);
    setIsChatOpen(false);
  };

  const copyRoomCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendChat = () => {
    if (!newMsg.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: currentUser?.name || "You",
      text: newMsg.trim(),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    }]);
    setNewMsg("");
  };

  const handleScheduleRoom = () => {
    if (!newRoom.title || !newRoom.scheduledAt) return;
    const r = {
      id: `room_${Date.now()}`,
      title: newRoom.title,
      host: currentUser?.name || "Principal",
      scheduledAt: newRoom.scheduledAt,
      duration: newRoom.duration,
      participants: [{ id: "host", name: currentUser?.name || "Principal", role: currentUser?.role || "principal", avatar: "ME", color: "bg-indigo-500", mic: true, video: true }],
      status: "scheduled",
      roomCode: `ZXS-${newRoom.type.slice(0, 3).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      type: newRoom.type,
      encrypted: true,
    };
    setRooms(prev => [r, ...prev]);
    setShowScheduleModal(false);
    setNewRoom({ title: "", type: "staff_meeting", scheduledAt: "", duration: 60 });
    showToast("Conference room scheduled successfully!");
  };

  const fmt = (s) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit'] flex items-center gap-2">
            <span className="text-3xl">📹</span> Group Conference Suite
          </h1>
          <p className="text-sm text-slate-400 mt-1">Multi-participant video conferences, staff meetings & PTM group calls — End-to-End Encrypted.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === "config" ? "rooms" : "config")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${activeTab === "config" ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"}`}
          >
            <Sliders className="w-3.5 h-3.5" /> Configuration
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" /> Schedule Room
          </button>
        </div>
      </div>

      {toast && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

      {(activeTab === "rooms" || activeTab === "config") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={activeTab === "config" ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="space-y-4">
              {rooms.map(room => (
                <div key={room.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-white text-sm font-['Outfit'] truncate">{room.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TYPE_COLORS[room.type]}`}>{TYPE_LABELS[room.type]}</span>
                        {room.status === "live" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> LIVE</span>}
                        {room.status === "scheduled" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Scheduled</span>}
                        {room.status === "ended" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">Ended</span>}
                      </div>
                      <p className="text-xs text-slate-400">Host: {room.host}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-cyan-400" />{new Date(room.scheduledAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-400" />{new Date(room.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · {room.duration} min</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-emerald-400" />{room.participants.length} / {confConfig.maxParticipants} participants</span>
                        <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-amber-400" />E2E Encrypted</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                        {room.participants.map(p => (
                          <div key={p.id} title={`${p.name} (${p.role})`} className={`w-7 h-7 rounded-full ${p.color} flex items-center justify-center text-[10px] font-bold text-white border-2 border-slate-900`}>{p.avatar}</div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="font-mono text-[11px] bg-slate-800 text-cyan-300 px-2.5 py-1 rounded-lg border border-slate-700">{room.roomCode}</span>
                        <button onClick={() => copyRoomCode(room.roomCode)} className="text-slate-400 hover:text-cyan-400 transition" title="Copy room code">
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                      {room.status !== "ended" && (
                        <button onClick={() => joinRoom(room)} className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${room.status === "live" ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30 hover:opacity-90" : "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 hover:opacity-90"}`}>
                          <Video className="w-4 h-4" /> {room.status === "live" ? "Join Live" : "Open Room"}
                        </button>
                      )}
                      <button onClick={() => { navigator.clipboard.writeText(`Join: ${room.roomCode}`).catch(() => {}); showToast("Invite link copied!"); }} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-xs flex items-center gap-1.5 transition">
                        <Link2 className="w-3.5 h-3.5" /> Copy Invite
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {activeTab === "config" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs h-fit">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2"><Sliders className="w-4 h-4 text-indigo-400" /> Conference Settings</h3>
              {[
                { key: "waitingRoomEnabled", label: "Waiting Room / Lobby", desc: "Participants wait for host approval before entering." },
                { key: "requireHostApproval", label: "Host Must Approve Entry", desc: "Each join request needs manual host approval." },
                { key: "autoMuteOnJoin", label: "Auto-Mute on Join", desc: "All participants muted by default when entering." },
                { key: "chatEnabled", label: "In-Conference Chat", desc: "Allow text chat during the conference session." },
                { key: "handRaiseEnabled", label: "Hand Raise Feature", desc: "Allow participants to raise hand to request to speak." },
                { key: "recordingEnabled", label: "Meeting Recording", desc: "Allow conference session to be recorded locally." },
                { key: "allowGuests", label: "Allow External Guests", desc: "Permit non-staff participants to join via invite link." },
                { key: "breakoutRoomsEnabled", label: "Breakout Rooms", desc: "Enable sub-group discussion room feature." },
                { key: "noiseSuppressionEnabled", label: "AI Noise Suppression", desc: "Filter background noise using WebRTC noise gate." },
              ].map(item => (
                <label key={item.key} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-bold text-white text-xs">{item.label}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                  <input type="checkbox" checked={confConfig[item.key]} onChange={e => setConfConfig(p => ({ ...p, [item.key]: e.target.checked }))} className="w-4 h-4 rounded accent-cyan-500 ml-3 flex-shrink-0" />
                </label>
              ))}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-slate-400 text-[11px] font-semibold block mb-1">Max Participants per Room</label>
                  <select value={confConfig.maxParticipants} onChange={e => setConfConfig(p => ({ ...p, maxParticipants: Number(e.target.value) }))} className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400">
                    {[5, 10, 15, 20, 30, 50, 100].map(v => <option key={v} value={v}>{v} participants</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] font-semibold block mb-1">Default Video Quality</label>
                  <select value={confConfig.defaultVideoQuality} onChange={e => setConfConfig(p => ({ ...p, defaultVideoQuality: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400">
                    <option value="360p">360p (Low / 2G)</option>
                    <option value="480p">480p (SD / 3G)</option>
                    <option value="720p">720p HD (Recommended)</option>
                    <option value="1080p">1080p Full HD</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] font-semibold block mb-1">Encryption Mode</label>
                  <select value={confConfig.encryptionMode} onChange={e => setConfConfig(p => ({ ...p, encryptionMode: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400">
                    <option value="e2e">End-to-End Encrypted (E2EE)</option>
                    <option value="tls">TLS / Transport Encryption</option>
                    <option value="none">None (Internal Network Only)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => { showToast("Conference settings saved!"); setActiveTab("rooms"); }} className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "live" && activeRoom && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <div>
                <h3 className="font-bold text-white text-sm font-['Outfit']">{activeRoom.title}</h3>
                <p className="text-[11px] text-slate-400 font-mono">{activeRoom.roomCode} · {fmt(callSeconds)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-xl bg-black/40 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><Lock className="w-3 h-3" /> E2EE</span>
              <span className="text-xs px-2.5 py-1 rounded-xl bg-black/40 text-slate-300 border border-slate-700 flex items-center gap-1"><Users className="w-3 h-3 text-cyan-400" /> {activeRoom.participants.length} joined</span>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row min-h-[520px]">
            <div className="flex-1 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-cyan-500/50 aspect-video">
                  {isVideoOff ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                      <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xl mb-2">{(currentUser?.name || "ME").slice(0, 2).toUpperCase()}</div>
                      <span className="text-[10px]">Camera Off</span>
                    </div>
                  ) : (
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                  )}
                  <div className="absolute bottom-2 left-2"><span className="bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">You</span></div>
                </div>
                {activeRoom.participants.slice(0, 5).map(p => (
                  <div key={p.id} className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 aspect-video flex flex-col items-center justify-center">
                    <div className={`w-14 h-14 rounded-full ${p.color} flex items-center justify-center text-white font-bold text-lg mb-2 shadow-lg`}>{p.avatar}</div>
                    <p className="text-[10px] text-slate-300 font-semibold">{p.name.split(" ")[0]}</p>
                    <p className="text-[9px] text-slate-500">{p.role}</p>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1">
                      {!p.mic && <MicOff className="w-3 h-3 text-rose-400" />}
                      {!p.video && <VideoOff className="w-3 h-3 text-amber-400" />}
                    </div>
                    {p.mic && (
                      <div className="absolute top-2 right-2 flex gap-0.5">
                        {[4, 7, 5, 9, 6].map((h, i) => (
                          <div key={i} className="w-0.5 bg-emerald-400 rounded-full animate-pulse" style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {isChatOpen && (
              <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Conference Chat</h4>
                  <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs max-h-64 lg:max-h-full">
                  {chatMessages.map(m => (
                    <div key={m.id}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-cyan-300">{m.sender.split(" ")[0]}</span>
                        <span className="text-slate-600 text-[10px]">{m.time}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-slate-800 flex gap-2">
                  <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendChat()} placeholder="Type a message..." className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400" />
                  <button onClick={handleSendChat} className="px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setIsMicMuted(p => !p)} className={`p-3 rounded-2xl text-xs transition ${isMicMuted ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}>
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-cyan-400" />}
              </button>
              <button onClick={() => setIsVideoOff(p => !p)} className={`p-3 rounded-2xl text-xs transition ${isVideoOff ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}>
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5 text-cyan-400" />}
              </button>
              <button onClick={() => { setIsScreenSharing(p => !p); showToast(isScreenSharing ? "Screen sharing stopped." : "Screen sharing started."); }} className={`px-3 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition ${isScreenSharing ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                {isScreenSharing ? <ScreenShareOff className="w-4 h-4" /> : <ScreenShare className="w-4 h-4 text-indigo-400" />}
                <span className="hidden sm:inline">{isScreenSharing ? "Stop Share" : "Share Screen"}</span>
              </button>
              <button onClick={() => { setIsHandRaised(p => !p); showToast(isHandRaised ? "Hand lowered." : "Hand raised! Host notified."); }} className={`p-3 rounded-2xl text-xs transition ${isHandRaised ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                <Hand className="w-5 h-5" />
              </button>
              <button onClick={() => setIsChatOpen(p => !p)} className={`p-3 rounded-2xl text-xs transition ${isChatOpen ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                <MessageSquare className="w-5 h-5" />
              </button>
              <button onClick={() => showToast("Invite link copied!")} className="px-3 py-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition">
                <UserPlus className="w-4 h-4 text-emerald-400" /><span className="hidden sm:inline">Invite</span>
              </button>
            </div>
            <button onClick={leaveCall} className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition">
              <PhoneOff className="w-4 h-4" /> Leave Room
            </button>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base font-['Outfit'] flex items-center gap-2"><Plus className="w-5 h-5 text-cyan-400" /> Schedule Conference Room</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">Conference Title *</label>
                <input value={newRoom.title} onChange={e => setNewRoom(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Staff Meeting — Academic Review Term 2" className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-400" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">Conference Type</label>
                <select value={newRoom.type} onChange={e => setNewRoom(p => ({ ...p, type: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-400">
                  <option value="staff_meeting">Staff Meeting</option>
                  <option value="ptm_group">PTM Group Conference</option>
                  <option value="emergency">Emergency Crisis Call</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">Date & Time *</label>
                <input type="datetime-local" value={newRoom.scheduledAt} onChange={e => setNewRoom(p => ({ ...p, scheduledAt: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-400" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">Duration</label>
                <select value={newRoom.duration} onChange={e => setNewRoom(p => ({ ...p, duration: Number(e.target.value) }))} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-400">
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowScheduleModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700 transition">Cancel</button>
              <button onClick={handleScheduleRoom} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-sm hover:opacity-90 transition">Schedule Room</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
