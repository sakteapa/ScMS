/**
 * ============================================================================
 * AGORA WEB SDK (agora-rtc-sdk-ng) VIDEO CALL & CONFERENCE SERVICE
 * ============================================================================
 * Handles joining, leaving, audio muting, and video camera toggling.
 */

import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
  ClientConfig
} from 'agora-rtc-sdk-ng';

// Default App ID fallback (can be overridden via param or localStorage)
export const DEFAULT_AGORA_APP_ID = "98a76bc43210ef891234567890abcdef";

export function getStoredAgoraAppId(): string {
  try {
    const s = localStorage.getItem('zoxs_gateway_config');
    if (s) {
      const parsed = JSON.parse(s);
      if (parsed.agoraAppId && parsed.agoraAppId.trim()) {
        return parsed.agoraAppId.trim();
      }
    }
  } catch {}
  return DEFAULT_AGORA_APP_ID;
}

export interface AgoraConnectionState {
  client: IAgoraRTCClient | null;
  localAudioTrack: IMicrophoneAudioTrack | null;
  localVideoTrack: ICameraVideoTrack | null;
  remoteUsers: IAgoraRTCRemoteUser[];
  isJoined: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
}

class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private remoteUsers: Map<string | number, IAgoraRTCRemoteUser> = new Map();
  private onRemoteUsersChangeCallback: ((users: IAgoraRTCRemoteUser[]) => void) | null = null;

  constructor() {
    // AgoraRTC initialization
  }

  /**
   * Get or create active Agora RTC Client
   */
  public getClient(config: ClientConfig = { mode: 'rtc', codec: 'vp8' }): IAgoraRTCClient {
    if (!this.client) {
      this.client = AgoraRTC.createClient(config);
      this.setupEventListeners();
    }
    return this.client;
  }

  /**
   * Listen for remote audio/video tracks and peer leaves
   */
  private setupEventListeners(): void {
    if (!this.client) return;

    this.client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      try {
        await this.client?.subscribe(user, mediaType);
        this.remoteUsers.set(user.uid, user);
        this.notifyRemoteUsersChanged();
      } catch (err) {
        console.error('[AgoraService] Failed to subscribe to remote user:', err);
      }
    });

    this.client.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      if (mediaType === 'video') {
        user.videoTrack?.stop();
      }
      if (mediaType === 'audio') {
        user.audioTrack?.stop();
      }
      this.notifyRemoteUsersChanged();
    });

    this.client.on('user-left', (user: IAgoraRTCRemoteUser) => {
      this.remoteUsers.delete(user.uid);
      this.notifyRemoteUsersChanged();
    });
  }

  private notifyRemoteUsersChanged(): void {
    if (this.onRemoteUsersChangeCallback) {
      this.onRemoteUsersChangeCallback(Array.from(this.remoteUsers.values()));
    }
  }

  public setOnRemoteUsersChange(callback: (users: IAgoraRTCRemoteUser[]) => void): void {
    this.onRemoteUsersChangeCallback = callback;
  }

  /**
   * 1. Join Agora Video Room Channel
   */
  public async joinChannel({
    appId = getStoredAgoraAppId(),
    channelName,
    token = null,
    uid = null,
    enableVideo = true,
    enableAudio = true
  }: {
    appId?: string;
    channelName: string;
    token?: string | null;
    uid?: string | number | null;
    enableVideo?: boolean;
    enableAudio?: boolean;
  }): Promise<{
    client: IAgoraRTCClient;
    localAudioTrack: IMicrophoneAudioTrack | null;
    localVideoTrack: ICameraVideoTrack | null;
  }> {
    const client = this.getClient();

    // Leave any prior session before joining a new one
    if (client.connectionState === 'CONNECTED' || client.connectionState === 'CONNECTING') {
      await this.leaveChannel();
    }

    // Join room
    await client.join(appId, channelName, token || null, uid || null);

    const tracksToPublish = [];

    // Initialize Camera and Mic tracks if requested
    try {
      if (enableAudio && enableVideo) {
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        this.localAudioTrack = audioTrack;
        this.localVideoTrack = videoTrack;
        tracksToPublish.push(audioTrack, videoTrack);
      } else if (enableAudio) {
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        tracksToPublish.push(this.localAudioTrack);
      } else if (enableVideo) {
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        tracksToPublish.push(this.localVideoTrack);
      }

      if (tracksToPublish.length > 0) {
        await client.publish(tracksToPublish);
      }
    } catch (deviceError) {
      console.warn('[AgoraService] Camera/Microphone access notice:', deviceError);
    }

    return {
      client,
      localAudioTrack: this.localAudioTrack,
      localVideoTrack: this.localVideoTrack
    };
  }

  /**
   * 2. Toggle Audio / Microphone (Mute / Unmute)
   */
  public async toggleMicrophone(enabled?: boolean): Promise<boolean> {
    if (!this.localAudioTrack) return false;
    const targetState = typeof enabled === 'boolean' ? enabled : !this.localAudioTrack.enabled;
    await this.localAudioTrack.setEnabled(targetState);
    return this.localAudioTrack.enabled;
  }

  /**
   * 3. Toggle Camera / Video (On / Off)
   */
  public async toggleCamera(enabled?: boolean): Promise<boolean> {
    if (!this.localVideoTrack) return false;
    const targetState = typeof enabled === 'boolean' ? enabled : !this.localVideoTrack.enabled;
    await this.localVideoTrack.setEnabled(targetState);
    return this.localVideoTrack.enabled;
  }

  /**
   * 4. Leave Channel & Release Tracks
   */
  public async leaveChannel(): Promise<void> {
    if (this.localAudioTrack) {
      this.localAudioTrack.stop();
      this.localAudioTrack.close();
      this.localAudioTrack = null;
    }

    if (this.localVideoTrack) {
      this.localVideoTrack.stop();
      this.localVideoTrack.close();
      this.localVideoTrack = null;
    }

    this.remoteUsers.clear();
    this.notifyRemoteUsersChanged();

    if (this.client) {
      try {
        await this.client.leave();
      } catch (e) {
        console.warn('[AgoraService] Error while leaving channel:', e);
      }
    }
  }

  public getLocalTracks() {
    return {
      audio: this.localAudioTrack,
      video: this.localVideoTrack
    };
  }

  public getRemoteUsers(): IAgoraRTCRemoteUser[] {
    return Array.from(this.remoteUsers.values());
  }
}

export const agoraService = new AgoraService();
export default agoraService;
