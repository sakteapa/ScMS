import React, { useState, useRef, useEffect } from "react";
import {
  Radio, Mic, MicOff, Video, VideoOff, Users, Eye, Heart, MessageSquare,
  Play, Square, Settings, Sliders, Save, CheckCircle2, X, Plus, Calendar,
  Clock, Share2, ScreenShare, ScreenShareOff, Volume2, VolumeX, Zap,
  ChevronRight, Wifi, Globe, Lock, MonitorPlay, Cast, Bell, BellOff
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSchool } from "../context/SchoolContext";

const MOCK_STREAMS = [
  {
    id: "str_001",
    title: "Morning Assembly — Mizoram Model HSS",
    host: "Pu Lalremthanga (Principal)",
    scheduledAt: "2026-09-21T07:45:00",
    viewers: 312,
    status: "live",
    type: "assembly",
    duration: 25,
    thumbnail: null,
  },
  {
    id: "str_002",
    title: "Annual Prize Giving Day — Live Ceremony",
    host: "Pi Lalnunpuii (Vice Principal)",
    scheduledAt: "2026-09-25T10:00:00",
    viewers: 0,
    status: "scheduled",
    type: "event",
    duration: 180,
    thumbnail: null,
  },
  {
    id: "str_003",
    title: "Science Seminar — Class 12 Chemistry Olympiad",
    host: "Pu Vanlalruata (Science HoD)",
    scheduledAt: "2026-09-18T13:00:00",
    viewers: 98,
    status: "ended",
    type: "academic",
    duration: 60,
    thumbnail: null,
  },
];

const INITIAL_BROADCAST_CONFIG = {
  streamQuality: "720p",
  audioBitrate: "128kbps",
  enableChat: true,
  enableReactions: true,
  modOnlyChat: false,
  recordStream: false,
  autoNotifyStudents: true,
  autoNotifyParents: false,
  streamKey: "zxs-live-xk7q29",
  rtmpServer: "rtmp://live.zoxs.school/stream",
  maxViewers: 500,
  lowLatencyMode: true,
  watermarkEnabled: true,
};

const TYPE_COLORS = {
  assembly: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  event: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  academic: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};
const TYPE_LABELS = { assembly: "Morning Assembly", event: "School Event", academic: "Academic Stream" };

export default function LiveBroadcastView() {
  const { currentUser } = useAuth();
  const { sendPrivateNotification } = useSchool();

  const [streams, setStreams] = useState(MOCK_STREAMS);
  const [activeTab, setActiveTab] = useState("streams");
  const [broadcastConfig, setBroadcastConfig] = useState(() => {
    try { const s = localStorage.getItem("zoxs_broadcast_config"); return s ? { ...INITIAL_BROADCAST_CONFIG, ...JSON.parse(s) } : INITIAL_BROADCAST_CONFIG; }
    catch { return INITIAL_BROADCAST_CONFIG; }
  });

  const [isLive, setIsLive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [liveViewers, setLiveViewers] = useState(0);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "Vanlalhruaia", text: "Assembly started! Ka la insawn loh a.", time: "07:45 AM" },
    { id: 2, sender: "Lalmuanpuii Parent", text: "Thank you for the livestream!", time: "07:46 AM" },
  ]);
  const [newMsg, setNewMsg] = useState("");
  const [toast, setToast] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newStream, setNewStream] = useState({ title: "", type: "assembly", scheduledAt: "", duration: 30 });

  const localVideoRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("zoxs_broadcast_config", JSON.stringify(broadcastConfig));
  }, [broadcastConfig]);

  useEffect(() => {
    let t = null;
    if (isLive) {
      t = setInterval(() => {
        setLiveSeconds(p => p + 1);
        setLiveViewers(p => Math.max(0, p + Math.floor(Math.random() * 5) - 1));
      }, 1000);
    } else {
      setLiveSeconds(0);
      setLiveViewers(0);
    }
    return () => { if (t) clearInterval(t); };
  }, [isLive]);

  useEffect(() => {
    let stream = null;
    const startCam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) { localVideoRef.current.srcObject = stream; localVideoRef.current.play().catch(() => {}); }
      } catch {}
    };
    if (activeTab === "studio") startCam();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [activeTab]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleGoLive = () => {
    setIsLive(true);
    setActiveTab("studio");
    setLiveViewers(12);
    showToast("You are now LIVE! Students and staff are notified.");
  };

  const handleEndBroadcast = () => {
    setIsLive(false);
    showToast("Broadcast ended. Recording saved.");
  };

  const handleSendChat = () => {
    if (!newMsg.trim()) return;
    setChatMessages(prev => [...prev, { id: Date.now(), sender: currentUser?.name || "Host", text: newMsg.trim(), time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }]);
    setNewMsg("");
  };

  const handleScheduleStream = () => {
    if (!newStream.title || !newStream.scheduledAt) return;
    const s = {
      id: `str_${Date.now()}`, title: newStream.title, host: currentUser?.name || "Principal",
      scheduledAt: newStream.scheduledAt, viewers: 0, status: "scheduled",
      type: newStream.type, duration: newStream.duration, thumbnail: null,
    };
    setStreams(prev => [s, ...prev]);
    setShowScheduleModal(false);
    setNewStream({ title: "", type: "assembly", scheduledAt: "", duration: 30 });
    showToast("Stream scheduled! Notifications will be sent 30 minutes before.");
  };

  const fmt = (s) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit'] flex items-center gap-2">
            <span className="text-3xl">📡</span> Live Broadcast Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">Stream assemblies, events & academic sessions live to students, parents & staff.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTab(activeTab === "config" ? "streams" : "config")} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${activeTab === "config" ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"}`}>
            <Sliders className="w-3.5 h-3.5" /> Stream Settings
          </button>
          <button onClick={() => setShowScheduleModal(true)} className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5 transition">
            <Plus className="w-3.5 h-3.5" /> Schedule
          </button>
          {!isLive ? (
            <button onClick={handleGoLive} className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/30 hover:opacity-90 transition animate-pulse">
              <Radio className="w-4 h-4" /> Go Live
            </button>
          ) : (
            <button onClick={handleEndBroadcast} className="px-5 py-2 rounded-xl bg-slate-800 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-2 hover:bg-rose-500/10 transition">
              <Square className="w-4 h-4" /> End Broadcast
            </button>
          )}
        </div>
      </div>

      {isLive && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-bold animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          LIVE · {fmt(liveSeconds)} · <Eye className="w-3.5 h-3.5 inline ml-1" /> {liveViewers} watching now
        </div>
      )}

      {toast && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* STREAMS LIST */}
      {(activeTab === "streams" || activeTab === "config") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={activeTab === "config" ? "lg:col-span-2" : "lg:col-span-3"}>
            {/* Studio Preview Card */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden mb-4">
              <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
                {isLive && !isVideoOff ? (
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-indigo-600 mx-auto flex items-center justify-center shadow-2xl">
                      <Cast className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-slate-400 text-sm font-semibold">{isLive ? "Camera paused" : "Studio Preview — Press Go Live to start broadcasting"}</p>
                  </div>
                )}
                {isLive && (
                  <>
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg"><span className="w-2 h-2 rounded-full bg-white animate-pulse" /> LIVE</span>
                      <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full font-mono">{fmt(liveSeconds)}</span>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" /> {liveViewers}
                    </div>
                  </>
                )}
              </div>
              {isLive && (
                <div className="p-3 bg-slate-900/80 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsMicMuted(p => !p)} className={`p-2.5 rounded-xl text-xs transition ${isMicMuted ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}>
                      {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-cyan-400" />}
                    </button>
                    <button onClick={() => setIsVideoOff(p => !p)} className={`p-2.5 rounded-xl text-xs transition ${isVideoOff ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}>
                      {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4 text-cyan-400" />}
                    </button>
                    <button onClick={() => { setIsScreenSharing(p => !p); showToast(isScreenSharing ? "Screen share stopped." : "Now sharing screen to viewers!"); }} className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${isScreenSharing ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                      {isScreenSharing ? <ScreenShareOff className="w-4 h-4" /> : <ScreenShare className="w-4 h-4 text-indigo-400" />}
                      <span className="hidden sm:inline">{isScreenSharing ? "Stop Share" : "Share Screen"}</span>
                    </button>
                  </div>
                  <button onClick={handleEndBroadcast} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition">
                    <Square className="w-3.5 h-3.5" /> End Broadcast
                  </button>
                </div>
              )}
            </div>

            {/* Stream History */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Broadcasts</h3>
              {streams.map(stream => (
                <div key={stream.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-bold text-white text-sm truncate">{stream.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TYPE_COLORS[stream.type]}`}>{TYPE_LABELS[stream.type]}</span>
                        {stream.status === "live" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" /> LIVE</span>}
                        {stream.status === "scheduled" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Scheduled</span>}
                        {stream.status === "ended" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">Recorded</span>}
                      </div>
                      <p className="text-xs text-slate-400">{stream.host}</p>
                      <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-cyan-400" />{new Date(stream.scheduledAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-indigo-400" />{new Date(stream.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · {stream.duration} min</span>
                        {stream.status !== "scheduled" && <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-rose-400" />{stream.viewers} viewers</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {stream.status === "live" && (
                        <button onClick={() => { setIsLive(true); setActiveTab("studio"); }} className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 hover:bg-rose-500/30 transition">
                          <Radio className="w-3.5 h-3.5" /> Join Live
                        </button>
                      )}
                      {stream.status === "ended" && (
                        <button onClick={() => showToast("Opening recording playback...")} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-700 transition">
                          <Play className="w-3.5 h-3.5 text-cyan-400" /> Replay
                        </button>
                      )}
                      {stream.status === "scheduled" && (
                        <button onClick={() => { showToast("Notification sent to all students & staff!"); }} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-700 transition">
                          <Bell className="w-3.5 h-3.5 text-amber-400" /> Notify
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Config Panel */}
          {activeTab === "config" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs h-fit">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2"><Sliders className="w-4 h-4 text-rose-400" /> Broadcast Settings</h3>
              {[
                { key: "enableChat", label: "Live Chat for Viewers", desc: "Students and parents can send chat messages during the stream." },
                { key: "enableReactions", label: "Reactions (Emoji)", desc: "Allow viewers to send live emoji reactions." },
                { key: "modOnlyChat", label: "Moderated Chat Only", desc: "Only moderator-approved messages appear in chat." },
                { key: "recordStream", label: "Auto-Record Stream", desc: "Automatically save the broadcast to school media archive." },
                { key: "autoNotifyStudents", label: "Auto-Notify Students", desc: "Push notification sent to all students when going live." },
                { key: "autoNotifyParents", label: "Auto-Notify Parents", desc: "Push notification sent to all parents when going live." },
                { key: "lowLatencyMode", label: "Low Latency Mode", desc: "Ultra-low delay streaming (increases server load)." },
                { key: "watermarkEnabled", label: "School Watermark Overlay", desc: "Embed school logo and name watermark on stream." },
              ].map(item => (
                <label key={item.key} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-bold text-white text-xs">{item.label}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                  <input type="checkbox" checked={broadcastConfig[item.key]} onChange={e => setBroadcastConfig(p => ({ ...p, [item.key]: e.target.checked }))} className="w-4 h-4 rounded accent-rose-500 ml-3 flex-shrink-0" />
                </label>
              ))}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-slate-400 text-[11px] font-semibold block mb-1">Stream Quality</label>
                  <select value={broadcastConfig.streamQuality} onChange={e => setBroadcastConfig(p => ({ ...p, streamQuality: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400">
                    <option value="360p">360p (Bandwidth Saving)</option>
                    <option value="480p">480p (SD)</option>
                    <option value="720p">720p HD (Recommended)</option>
                    <option value="1080p">1080p Full HD</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] font-semibold block mb-1">Max Concurrent Viewers</label>
                  <select value={broadcastConfig.maxViewers} onChange={e => setBroadcastConfig(p => ({ ...p, maxViewers: Number(e.target.value) }))} className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400">
                    {[100, 200, 500, 1000, 2000].map(v => <option key={v} value={v}>{v} viewers</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] font-semibold block mb-1">RTMP Stream Key</label>
                  <input value={broadcastConfig.streamKey} onChange={e => setBroadcastConfig(p => ({ ...p, streamKey: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 font-mono" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => { showToast("Broadcast settings saved!"); setActiveTab("streams"); }} className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-rose-400 transition">
                  <Save className="w-3.5 h-3.5" /> Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base font-['Outfit'] flex items-center gap-2"><Radio className="w-5 h-5 text-rose-400" /> Schedule Broadcast</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">Broadcast Title *</label>
                <input value={newStream.title} onChange={e => setNewStream(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Annual Prize Giving Day 2026" className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-400" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">Stream Type</label>
                <select value={newStream.type} onChange={e => setNewStream(p => ({ ...p, type: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-400">
                  <option value="assembly">Morning Assembly</option>
                  <option value="event">School Event / Ceremony</option>
                  <option value="academic">Academic Seminar</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">Date & Time *</label>
                <input type="datetime-local" value={newStream.scheduledAt} onChange={e => setNewStream(p => ({ ...p, scheduledAt: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-400" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">Expected Duration (mins)</label>
                <select value={newStream.duration} onChange={e => setNewStream(p => ({ ...p, duration: Number(e.target.value) }))} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-400">
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowScheduleModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700 transition">Cancel</button>
              <button onClick={handleScheduleStream} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold text-sm hover:opacity-90 transition">Schedule Stream</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
