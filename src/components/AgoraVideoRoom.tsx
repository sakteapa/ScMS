import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  Maximize2,
  Minimize2,
  Radio,
  Shield,
  Volume2
} from 'lucide-react';
import { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { agoraService, getStoredAgoraAppId } from '../services/agoraService';
import { db, collection, query, where, onSnapshot } from '../services/firebase';

export interface AgoraVideoRoomProps {
  channelName?: string;
  appId?: string;
  token?: string | null;
  userName?: string;
  userRole?: 'teacher' | 'student';
  classId?: string;
  onLeave?: () => void;
  isOverlay?: boolean;
}

/**
 * Single Remote Video Stream Tile
 */
function RemoteUserTile({ user }: { user: IAgoraRTCRemoteUser }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user.videoTrack && containerRef.current) {
      user.videoTrack.play(containerRef.current);
    }
    return () => {
      user.videoTrack?.stop();
    };
  }, [user, user.videoTrack]);

  return (
    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden aspect-video shadow-lg flex items-center justify-center group">
      <div ref={containerRef} className="w-full h-full object-cover" />
      
      {!user.hasVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-400 gap-2">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-base border border-slate-700">
            {String(user.uid).slice(-2).toUpperCase()}
          </div>
          <span className="text-xs font-semibold">Camera is Turned Off</span>
        </div>
      )}

      {/* Participant Tag */}
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-2 border border-white/10">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>User {String(user.uid).slice(-4)}</span>
        {user.hasAudio ? (
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <MicOff className="w-3.5 h-3.5 text-rose-400" />
        )}
      </div>
    </div>
  );
}

/**
 * 1. CORE AGORA VIDEO ROOM COMPONENT
 */
export function AgoraVideoRoom({
  channelName = 'default_class_channel',
  appId = getStoredAgoraAppId(),
  token = null,
  userName = 'Student',
  userRole = 'student',
  onLeave,
  isOverlay = false
}: AgoraVideoRoomProps) {
  const localVideoRef = useRef<HTMLDivElement>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initRoom() {
      try {
        setIsConnecting(true);
        setErrorMsg(null);

        agoraService.setOnRemoteUsersChange((users) => {
          if (isMounted) setRemoteUsers(users);
        });

        const { localVideoTrack } = await agoraService.joinChannel({
          appId,
          channelName,
          token,
          enableAudio: true,
          enableVideo: true
        });

        if (isMounted) {
          setIsJoined(true);
          setIsConnecting(false);
          if (localVideoTrack && localVideoRef.current) {
            localVideoTrack.play(localVideoRef.current);
          }
        }
      } catch (err: any) {
        console.error('[AgoraVideoRoom] Connection failed:', err);
        if (isMounted) {
          setErrorMsg(err?.message || 'Failed to establish Agora RTC connection.');
          setIsConnecting(false);
        }
      }
    }

    initRoom();

    return () => {
      isMounted = false;
      agoraService.leaveChannel();
    };
  }, [channelName, appId, token]);

  const handleToggleMic = async () => {
    const active = await agoraService.toggleMicrophone();
    setIsAudioMuted(!active);
  };

  const handleToggleVideo = async () => {
    const active = await agoraService.toggleCamera();
    setIsVideoMuted(!active);
    if (active && localVideoRef.current) {
      const tracks = agoraService.getLocalTracks();
      tracks.video?.play(localVideoRef.current);
    }
  };

  const handleLeave = async () => {
    await agoraService.leaveChannel();
    setIsJoined(false);
    if (onLeave) onLeave();
  };

  return (
    <div className={`flex flex-col bg-slate-950 text-white rounded-2xl overflow-hidden shadow-2xl border border-slate-800 ${
      isOverlay ? 'w-full h-full max-h-[90vh]' : 'w-full min-h-[500px]'
    }`}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>LIVE CONFERENCE</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>{channelName}</span>
            </h4>
            <p className="text-[11px] text-slate-400">Agora RTC Web Gateway</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>{remoteUsers.length + 1} connected</span>
          </div>
        </div>
      </div>

      {/* Main Video Viewport Grid */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-950/80">
        {errorMsg ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 bg-slate-900/50 rounded-2xl border border-rose-500/30 text-rose-300">
            <p className="text-sm font-semibold">{errorMsg}</p>
            <p className="text-xs text-slate-400 mt-2">Please ensure your Agora App ID is valid in Super Admin settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* Local Video Stream */}
            <div className="relative bg-slate-900 border-2 border-indigo-500/50 rounded-2xl overflow-hidden aspect-video shadow-xl flex items-center justify-center group">
              <div ref={localVideoRef} className="w-full h-full object-cover" />
              
              {isVideoMuted && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-400 gap-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-900/50 border border-indigo-500/40 flex items-center justify-center text-indigo-200 font-bold text-base">
                    {userName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold">Your Camera is Off</span>
                </div>
              )}

              {/* Local Participant Tag */}
              <div className="absolute bottom-3 left-3 bg-indigo-600/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-2 border border-indigo-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-300" />
                <span>You ({userName})</span>
                {isAudioMuted ? (
                  <MicOff className="w-3.5 h-3.5 text-rose-300" />
                ) : (
                  <Mic className="w-3.5 h-3.5 text-emerald-300" />
                )}
              </div>
            </div>

            {/* Remote Participants Streams */}
            {remoteUsers.map((user) => (
              <RemoteUserTile key={user.uid} user={user} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Control Bar */}
      <div className="px-6 py-4 bg-slate-900/95 border-t border-slate-800 flex items-center justify-center gap-3 backdrop-blur-md">
        <button
          onClick={handleToggleMic}
          className={`p-3.5 rounded-2xl font-semibold transition flex items-center gap-2 shadow-lg ${
            isAudioMuted
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700'
          }`}
          title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={handleToggleVideo}
          className={`p-3.5 rounded-2xl font-semibold transition flex items-center gap-2 shadow-lg ${
            isVideoMuted
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700'
          }`}
          title={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        <button
          onClick={handleLeave}
          className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-xl shadow-rose-600/30 transition transform active:scale-95"
          title="Leave Live Session"
        >
          <PhoneOff className="w-5 h-5" />
          <span>Leave Session</span>
        </button>
      </div>
    </div>
  );
}

/**
 * 2. FIREBASE FIRESTORE REAL-TIME OVERLAY LISTENER
 * Listens to `classrooms` collection for `{ isLive: true, agoraChannelName: string }`.
 * When active, displays the AgoraVideoRoom over the student page automatically.
 * When teacher marks `isLive: false`, unmounts automatically.
 */
export function LiveClassroomStudentOverlay({
  classId,
  studentName = 'Student'
}: {
  classId?: string;
  studentName?: string;
}) {
  const [activeSession, setActiveSession] = useState<{
    id: string;
    isLive: boolean;
    agoraChannelName: string;
    subject?: string;
    teacherName?: string;
    token?: string | null;
  } | null>(null);

  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (!db) return;

    try {
      // Query classrooms collection
      const classroomsRef = collection(db, 'classrooms');
      const q = classId
        ? query(classroomsRef, where('classId', '==', classId), where('isLive', '==', true))
        : query(classroomsRef, where('isLive', '==', true));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          if (data && data.isLive && data.agoraChannelName) {
            setActiveSession({
              id: doc.id,
              isLive: Boolean(data.isLive),
              agoraChannelName: data.agoraChannelName,
              subject: data.subject || 'Live Class',
              teacherName: data.teacherName || 'Teacher',
              token: data.token || null
            });
            setIsDismissed(false);
            return;
          }
        }
        // Teacher has closed the class
        setActiveSession(null);
      }, (err) => {
        console.warn('[LiveClassroomOverlay] Firestore listener notice:', err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('[LiveClassroomOverlay] Setup notice:', e);
    }
  }, [classId]);

  // If no live classroom is active or dismissed by user
  if (!activeSession || !activeSession.isLive || isDismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl h-[85vh] flex flex-col">
        <AgoraVideoRoom
          channelName={activeSession.agoraChannelName}
          token={activeSession.token}
          userName={studentName}
          userRole="student"
          isOverlay={true}
          onLeave={() => setIsDismissed(true)}
        />
      </div>
    </div>
  );
}

export default AgoraVideoRoom;
