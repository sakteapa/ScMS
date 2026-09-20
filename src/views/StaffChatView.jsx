import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare, Send, Search, Plus, Settings, Sliders, Save, CheckCircle2,
  X, Phone, Video, Users, MoreVertical, Paperclip, Smile, Check, Clock,
  Bell, BellOff, Pin, Trash2, Edit3, Hash, Lock, Globe, ChevronRight,
  UserPlus, Archive, Filter, Circle, CheckCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSchool } from "../context/SchoolContext";
import { db, collection, addDoc, onSnapshot, query, orderBy } from "../services/firebase";

const INITIAL_CHANNELS = [
  {
    id: "ch_001", name: "general-staff", type: "channel", icon: "Hash",
    description: "General announcements for all staff",
    pinned: true, muted: false, unread: 2,
    members: ["Principal", "Vice Principal", "All Teachers"],
    messages: [
      { id: 1, sender: "Pi Lalnunpuii", role: "Vice Principal", avatar: "LL", color: "bg-cyan-500", text: "Good morning team! Reminder: PTM is this Saturday at 9:00 AM.", time: "08:02 AM", read: true },
      { id: 2, sender: "Pu Vanlalruata", role: "Science HoD", avatar: "VR", color: "bg-emerald-500", text: "Noted. Science lab will be open for demo on Friday.", time: "08:15 AM", read: true },
      { id: 3, sender: "Pu Lalremthanga", role: "Principal", avatar: "PL", color: "bg-indigo-500", text: "Please ensure all term-end reports are submitted by Friday 5 PM.", time: "08:45 AM", read: false },
      { id: 4, sender: "Pi Lalmuanpuii", role: "Math Teacher", avatar: "LM", color: "bg-rose-500", text: "Understood, sir!", time: "08:47 AM", read: false },
    ]
  },
  {
    id: "ch_002", name: "academics-dept", type: "channel", icon: "Hash",
    description: "Academic department coordination",
    pinned: false, muted: false, unread: 0,
    members: ["Vice Principal", "Class Teachers", "HoDs"],
    messages: [
      { id: 1, sender: "Pi Lalnunpuii", role: "Vice Principal", avatar: "LL", color: "bg-cyan-500", text: "Class XII Science final exam timetable revised. Please check the noticeboard.", time: "Yesterday", read: true },
    ]
  },
  {
    id: "ch_003", name: "hostel-warden-desk", type: "channel", icon: "Hash",
    description: "Hostel management and warden communications",
    pinned: false, muted: true, unread: 0,
    members: ["Principal", "Warden", "Asst. Warden"],
    messages: [
      { id: 1, sender: "Pu Lalrammawia", role: "Warden", avatar: "LR", color: "bg-purple-500", text: "Room 12 bed repair scheduled for Monday 8 AM. Maintenance team informed.", time: "Mon", read: true },
    ]
  },
  {
    id: "dm_001", name: "Pu Vanlalruata", type: "dm", icon: "User",
    description: "Science HoD",
    pinned: false, muted: false, unread: 1,
    avatar: "VR", color: "bg-emerald-500", online: true,
    messages: [
      { id: 1, sender: "Pu Vanlalruata", role: "Science HoD", avatar: "VR", color: "bg-emerald-500", text: "Sir, can you approve the chemistry lab requisition?", time: "10:30 AM", read: false },
    ]
  },
  {
    id: "dm_002", name: "Pi Lalmuanpuii", type: "dm", icon: "User",
    description: "Math Teacher",
    pinned: false, muted: false, unread: 0,
    avatar: "LM", color: "bg-rose-500", online: false,
    messages: [
      { id: 1, sender: "Pi Lalmuanpuii", role: "Math Teacher", avatar: "LM", color: "bg-rose-500", text: "Thank you for the leave approval.", time: "Yesterday", read: true },
    ]
  },
];

const INITIAL_CHAT_CONFIG = {
  notificationsEnabled: true,
  desktopNotifications: true,
  soundEnabled: true,
  readReceiptsEnabled: true,
  typingIndicatorEnabled: true,
  retentionDays: 90,
  fileUploadEnabled: true,
  maxFileSizeMB: 25,
  allowDirectMessages: true,
  allowStudentMessages: false,
  autoArchiveDays: 365,
  encryptionEnabled: true,
};

export default function StaffChatView() {
  const { currentUser } = useAuth();
  const { triggerNativePush } = useSchool();
  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState("ch_001");
  const [activeTab, setActiveTab] = useState("chat");
  const [searchTerm, setSearchTerm] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const [toast, setToast] = useState(null);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: "", type: "channel", description: "" });
  const [chatConfig, setChatConfig] = useState(() => {
    try { const s = localStorage.getItem("zoxs_chat_config"); return s ? { ...INITIAL_CHAT_CONFIG, ...JSON.parse(s) } : INITIAL_CHAT_CONFIG; }
    catch { return INITIAL_CHAT_CONFIG; }
  });

  const messagesEndRef = useRef(null);

  const activeChannel = channels.find(c => c.id === activeChannelId);

  useEffect(() => { localStorage.setItem("zoxs_chat_config", JSON.stringify(chatConfig)); }, [chatConfig]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeChannelId, channels]);

  // Real-time Firestore synchronizer for staff chat messages
  useEffect(() => {
    if (!db) return;
    try {
      const q = query(collection(db, "staff_messages"), orderBy("timestamp", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const incomingByChannel = {};
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const chId = data.channelId || "ch_001";
            if (!incomingByChannel[chId]) incomingByChannel[chId] = [];
            incomingByChannel[chId].push({ id: docSnap.id, ...data });
          });

          setChannels(prev => prev.map(c => {
            const cloudMsgs = incomingByChannel[c.id];
            if (!cloudMsgs || cloudMsgs.length === 0) return c;
            
            const existingIds = new Set(c.messages.map(m => String(m.id)));
            const newOnes = cloudMsgs.filter(m => !existingIds.has(String(m.id)));
            if (newOnes.length === 0) return c;

            // Trigger notification for incoming messages from other staff
            newOnes.forEach(m => {
              if (m.sender !== (currentUser?.name || "Principal")) {
                if (triggerNativePush) {
                  triggerNativePush(`[Staff Chat: #${c.name}] ${m.sender}`, m.text);
                }
              }
            });

            return {
              ...c,
              messages: [...c.messages, ...newOnes],
              unread: c.id === activeChannelId ? 0 : (c.unread || 0) + newOnes.length
            };
          }));
        }
      }, (err) => {
        console.warn("Firestore staff_messages listener note:", err);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Staff chat listener setup note:", err);
    }
  }, [currentUser, activeChannelId]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSendMessage = () => {
    if (!newMsg.trim()) return;
    const msgId = Date.now();
    const msg = {
      id: msgId,
      channelId: activeChannelId,
      sender: currentUser?.name || "Principal",
      role: currentUser?.role || "principal",
      avatar: (currentUser?.name || "PR").slice(0, 2).toUpperCase(),
      color: "bg-indigo-500",
      text: newMsg.trim(),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      timestamp: msgId,
      read: true, 
      isMe: true,
    };

    setChannels(prev => prev.map(c => c.id === activeChannelId ? { ...c, messages: [...c.messages, msg], unread: 0 } : c));
    setNewMsg("");

    // Broadcast to Firestore real-time collection if connected
    if (db) {
      addDoc(collection(db, "staff_messages"), {
        channelId: activeChannelId,
        sender: msg.sender,
        role: msg.role,
        avatar: msg.avatar,
        color: msg.color,
        text: msg.text,
        time: msg.time,
        timestamp: msgId
      }).catch(err => {
        console.warn("Firestore staff message broadcast note:", err);
      });
    }
  };

  const handleSelectChannel = (id) => {
    setActiveChannelId(id);
    setChannels(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  const handleCreateChannel = () => {
    if (!newChannel.name.trim()) return;
    const ch = {
      id: `ch_${Date.now()}`,
      name: newChannel.name.toLowerCase().replace(/\s+/g, "-"),
      type: newChannel.type,
      icon: "Hash",
      description: newChannel.description,
      pinned: false, muted: false, unread: 0,
      members: [currentUser?.name || "Principal"],
      messages: [],
    };
    setChannels(prev => [...prev, ch]);
    setActiveChannelId(ch.id);
    setShowNewChannelModal(false);
    setNewChannel({ name: "", type: "channel", description: "" });
    showToast("Channel created!");
  };

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit'] flex items-center gap-2">
            <span className="text-3xl">💬</span> Staff Messaging Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">Encrypted internal messaging for teachers, staff & administration.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTab(activeTab === "config" ? "chat" : "config")} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${activeTab === "config" ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"}`}>
            <Sliders className="w-3.5 h-3.5" /> Settings
          </button>
          <button onClick={() => setShowNewChannelModal(true)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> New Channel
          </button>
        </div>
      </div>

      {toast && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

      {activeTab === "chat" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex h-[75vh] shadow-2xl">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-800 flex flex-col bg-slate-950/60 shrink-0">
            {/* Search */}
            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search channels..." className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-cyan-400" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
              {/* Channels */}
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 py-1.5">Channels</p>
              {filteredChannels.filter(c => c.type === "channel").map(ch => (
                <button key={ch.id} onClick={() => handleSelectChannel(ch.id)} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition group ${activeChannelId === ch.id ? "bg-cyan-500/15 text-cyan-300 font-semibold" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Hash className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{ch.name}</span>
                    {ch.muted && <BellOff className="w-3 h-3 text-slate-600 shrink-0" />}
                  </div>
                  {ch.unread > 0 && <span className="w-4 h-4 rounded-full bg-cyan-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">{ch.unread}</span>}
                </button>
              ))}

              {/* Direct Messages */}
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 py-1.5 pt-3">Direct Messages</p>
              {filteredChannels.filter(c => c.type === "dm").map(ch => (
                <button key={ch.id} onClick={() => handleSelectChannel(ch.id)} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition group ${activeChannelId === ch.id ? "bg-cyan-500/15 text-cyan-300 font-semibold" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                      <div className={`w-6 h-6 rounded-full ${ch.color} flex items-center justify-center text-[9px] font-bold text-white`}>{ch.avatar}</div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-950 ${ch.online ? "bg-emerald-400" : "bg-slate-600"}`} />
                    </div>
                    <span className="truncate">{ch.name.split(" ")[1] || ch.name}</span>
                  </div>
                  {ch.unread > 0 && <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">{ch.unread}</span>}
                </button>
              ))}
            </div>

            {/* Self Info */}
            <div className="p-3 border-t border-slate-800 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">{(currentUser?.name || "PR").slice(0, 2).toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentUser?.name || "Principal"}</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1"><Circle className="w-2 h-2 fill-current" />Online</p>
              </div>
              <Lock className="w-3.5 h-3.5 text-slate-600" />
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeChannel && (
              <>
                {/* Channel Header */}
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                  <div className="flex items-center gap-2.5">
                    {activeChannel.type === "channel" ? (
                      <Hash className="w-4 h-4 text-slate-400" />
                    ) : (
                      <div className="relative">
                        <div className={`w-7 h-7 rounded-full ${activeChannel.color} flex items-center justify-center text-[10px] font-bold text-white`}>{activeChannel.avatar}</div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${activeChannel.online ? "bg-emerald-400" : "bg-slate-600"}`} />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-sm">{activeChannel.name}</h4>
                      <p className="text-[10px] text-slate-400">{activeChannel.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeChannel.type === "dm" && (
                      <>
                        <button onClick={() => showToast("Initiating voice call...")} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"><Phone className="w-3.5 h-3.5" /></button>
                        <button onClick={() => showToast("Initiating video call...")} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"><Video className="w-3.5 h-3.5" /></button>
                      </>
                    )}
                    <button onClick={() => { setChannels(prev => prev.map(c => c.id === activeChannelId ? { ...c, muted: !c.muted } : c)); showToast(activeChannel.muted ? "Channel unmuted." : "Channel muted."); }} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
                      {activeChannel.muted ? <BellOff className="w-3.5 h-3.5 text-amber-400" /> : <Bell className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeChannel.messages.map((msg, i) => {
                    const isMe = msg.isMe;
                    return (
                      <div key={msg.id} className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                        <div className={`w-8 h-8 rounded-full ${msg.color} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>{msg.avatar}</div>
                        <div className={`max-w-xs sm:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                          {!isMe && <div className="flex items-center gap-2"><span className="text-xs font-bold text-white">{msg.sender.split(" ")[0]}</span><span className="text-[10px] text-slate-500">{msg.role}</span><span className="text-[10px] text-slate-600">{msg.time}</span></div>}
                          <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${isMe ? "bg-gradient-to-br from-cyan-500 to-indigo-600 text-white rounded-tr-sm" : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm"}`}>
                            {msg.text}
                          </div>
                          {isMe && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                              <span>{msg.time}</span>
                              <CheckCheck className="w-3 h-3 text-cyan-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-slate-800 flex items-center gap-2">
                  <button className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0"><Paperclip className="w-4 h-4" /></button>
                  <input
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    placeholder={`Message #${activeChannel.name}`}
                    className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-400"
                  />
                  <button onClick={handleSendMessage} className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shrink-0"><Send className="w-4 h-4" /></button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Config Tab */}
      {activeTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2"><Sliders className="w-4 h-4 text-cyan-400" /> Messaging Settings</h3>
            {[
              { key: "notificationsEnabled", label: "Push Notifications", desc: "Receive push notifications for new messages." },
              { key: "desktopNotifications", label: "Desktop Notifications", desc: "Show browser desktop notifications for messages." },
              { key: "soundEnabled", label: "Message Sound Alerts", desc: "Play sound for incoming messages." },
              { key: "readReceiptsEnabled", label: "Read Receipts", desc: "Show double-tick when messages are read." },
              { key: "typingIndicatorEnabled", label: "Typing Indicator", desc: 'Show "typing..." indicator when composing.' },
              { key: "fileUploadEnabled", label: "File & Image Uploads", desc: "Allow sending files and images in chat." },
              { key: "allowDirectMessages", label: "Allow Direct Messages", desc: "Staff can send private 1-on-1 DM to colleagues." },
              { key: "allowStudentMessages", label: "Allow Student Messages", desc: "Students can message teachers directly (monitored)." },
              { key: "encryptionEnabled", label: "End-to-End Encryption", desc: "All messages encrypted with AES-256 before storage." },
            ].map(item => (
              <label key={item.key} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-white text-xs">{item.label}</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <input type="checkbox" checked={chatConfig[item.key]} onChange={e => setChatConfig(p => ({ ...p, [item.key]: e.target.checked }))} className="w-4 h-4 rounded accent-cyan-500 ml-3 flex-shrink-0" />
              </label>
            ))}
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs h-fit">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Advanced Settings</h3>
            <div>
              <label className="text-slate-400 text-[11px] font-semibold block mb-1">Message Retention (days)</label>
              <select value={chatConfig.retentionDays} onChange={e => setChatConfig(p => ({ ...p, retentionDays: Number(e.target.value) }))} className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400">
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={180}>6 months</option>
                <option value={365}>1 year</option>
                <option value={0}>Forever</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-[11px] font-semibold block mb-1">Max File Upload Size (MB)</label>
              <select value={chatConfig.maxFileSizeMB} onChange={e => setChatConfig(p => ({ ...p, maxFileSizeMB: Number(e.target.value) }))} className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400">
                {[5, 10, 25, 50, 100].map(v => <option key={v} value={v}>{v} MB</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-[11px] font-semibold block mb-1">Auto-Archive Channels After (days)</label>
              <select value={chatConfig.autoArchiveDays} onChange={e => setChatConfig(p => ({ ...p, autoArchiveDays: Number(e.target.value) }))} className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400">
                <option value={90}>90 days of inactivity</option>
                <option value={180}>6 months of inactivity</option>
                <option value={365}>1 year of inactivity</option>
                <option value={0}>Never</option>
              </select>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => { showToast("Chat settings saved!"); setActiveTab("chat"); }} className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-400 transition">
                <Save className="w-3.5 h-3.5" /> Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Channel Modal */}
      {showNewChannelModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base font-['Outfit'] flex items-center gap-2"><Hash className="w-5 h-5 text-cyan-400" /> Create Channel</h3>
              <button onClick={() => setShowNewChannelModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">Channel Name *</label>
                <input value={newChannel.name} onChange={e => setNewChannel(p => ({ ...p, name: e.target.value }))} placeholder="e.g., exam-coordination" className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-400" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">Type</label>
                <select value={newChannel.type} onChange={e => setNewChannel(p => ({ ...p, type: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-400">
                  <option value="channel"># Public Channel (all staff)</option>
                  <option value="private_channel">Lock Private Channel</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">Description</label>
                <input value={newChannel.description} onChange={e => setNewChannel(p => ({ ...p, description: e.target.value }))} placeholder="What is this channel for?" className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-400" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowNewChannelModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700 transition">Cancel</button>
              <button onClick={handleCreateChannel} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-sm hover:opacity-90 transition">Create Channel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
