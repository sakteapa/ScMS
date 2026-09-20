// Offline Synchronization & Local Persistence Service for Mizoram School System (zoxs-sms)

export interface QueuedOperation {
  id: string;
  timestamp: string;
  collection: string;
  action: 'create' | 'update' | 'delete';
  docId: string;
  data?: any;
  summary: string;
}

export interface NetworkState {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  effectiveOnline: boolean; // false if either real or simulated offline
  pendingCount: number;
  lastSyncedAt: string | null;
  storageStats: {
    cachedCollections: number;
    totalRecords: number;
    estimatedKb: number;
  };
}

const QUEUE_STORAGE_KEY = 'zoxs_offline_queue';
const SIMULATED_OFFLINE_KEY = 'zoxs_simulated_offline';
const LAST_SYNC_KEY = 'zoxs_last_synced_at';

type NetworkListener = (state: NetworkState) => void;
const listeners = new Set<NetworkListener>();

let isNativeOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
let isSimulatedOffline = typeof localStorage !== 'undefined' ? localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true' : false;
let lastSyncedAt = typeof localStorage !== 'undefined' ? localStorage.getItem(LAST_SYNC_KEY) || null : null;

export function getOfflineQueue(): QueuedOperation[] {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read offline queue', e);
    return [];
  }
}

export function saveOfflineQueue(queue: QueuedOperation[]) {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    notifyNetworkListeners();
  } catch (e) {
    console.error('Failed to save offline queue', e);
  }
}

export function addToOfflineQueue(operation: Omit<QueuedOperation, 'id' | 'timestamp'>): QueuedOperation {
  const queue = getOfflineQueue();
  const newOp: QueuedOperation = {
    ...operation,
    id: `sync-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };

  // If there is already an update for the same doc, merge or replace
  const existingIdx = queue.findIndex(
    (q) => q.collection === operation.collection && q.docId === operation.docId && q.action === operation.action
  );

  if (existingIdx >= 0 && operation.action === 'update') {
    queue[existingIdx] = {
      ...queue[existingIdx],
      data: { ...(queue[existingIdx].data || {}), ...(operation.data || {}) },
      timestamp: new Date().toISOString(),
      summary: operation.summary,
    };
  } else {
    queue.push(newOp);
  }

  saveOfflineQueue(queue);
  return newOp;
}

export function clearOfflineQueue() {
  saveOfflineQueue([]);
  lastSyncedAt = new Date().toISOString();
  try {
    localStorage.setItem(LAST_SYNC_KEY, lastSyncedAt);
  } catch (e) {
    // ignore
  }
  notifyNetworkListeners();
}

export function getStorageStats() {
  if (typeof localStorage === 'undefined') {
    return { cachedCollections: 0, totalRecords: 0, estimatedKb: 0 };
  }

  let totalRecords = 0;
  let cachedCollections = 0;
  let totalBytes = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('zoxs_')) {
      cachedCollections++;
      const val = localStorage.getItem(key) || '';
      totalBytes += val.length * 2; // rough UTF-16 bytes
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          totalRecords += parsed.length;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  return {
    cachedCollections,
    totalRecords,
    estimatedKb: Math.max(1, Math.round(totalBytes / 1024)),
  };
}

export function getNetworkState(): NetworkState {
  const queue = getOfflineQueue();
  const effectiveOnline = isNativeOnline && !isSimulatedOffline;

  return {
    isOnline: isNativeOnline,
    isSimulatedOffline,
    effectiveOnline,
    pendingCount: queue.length,
    lastSyncedAt,
    storageStats: getStorageStats(),
  };
}

function notifyNetworkListeners() {
  const state = getNetworkState();
  listeners.forEach((listener) => {
    try {
      listener(state);
    } catch (err) {
      console.error('Network listener error', err);
    }
  });
}

export function subscribeToNetworkState(listener: NetworkListener): () => void {
  listeners.add(listener);
  listener(getNetworkState());
  return () => {
    listeners.delete(listener);
  };
}

export function setSimulatedOffline(value: boolean) {
  isSimulatedOffline = value;
  try {
    localStorage.setItem(SIMULATED_OFFLINE_KEY, String(value));
  } catch (e) {
    // ignore
  }
  notifyNetworkListeners();
}

// Global browser event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isNativeOnline = true;
    notifyNetworkListeners();
  });

  window.addEventListener('offline', () => {
    isNativeOnline = false;
    notifyNetworkListeners();
  });
}
