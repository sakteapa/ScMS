import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Info,
  X,
  Layers,
  Clock,
} from 'lucide-react';
import {
  getNetworkState,
  subscribeToNetworkState,
  setSimulatedOffline,
  NetworkState,
  getOfflineQueue,
  QueuedOperation,
} from '../../lib/offlineSyncService';
import { syncPendingOfflineOperations } from '../../lib/firebase';

export const OfflineStatusBar: React.FC = () => {
  const [networkState, setNetworkState] = useState<NetworkState>(getNetworkState());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [queueItems, setQueueItems] = useState<QueuedOperation[]>([]);

  useEffect(() => {
    const unsub = subscribeToNetworkState((state) => {
      setNetworkState(state);
      setQueueItems(getOfflineQueue());
    });
    return unsub;
  }, []);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncPendingOfflineOperations();
      if (result.synced > 0) {
        setSyncResult({
          type: 'success',
          message: `Successfully synchronized ${result.synced} offline records to Firestore.`,
        });
      } else if (result.failed > 0) {
        setSyncResult({
          type: 'error',
          message: `${result.failed} records failed to sync. Will retry automatically.`,
        });
      } else {
        setSyncResult({
          type: 'info',
          message: 'All local records are currently up to date with Firestore.',
        });
      }
    } catch (e: any) {
      setSyncResult({
        type: 'error',
        message: e?.message || 'Sync encountered an error',
      });
    } finally {
      setIsSyncing(false);
      setQueueItems(getOfflineQueue());
    }
  };

  const isOffline = !networkState.effectiveOnline;

  return (
    <>
      {/* Top compact indicator badge (placed in headers or banners) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setQueueItems(getOfflineQueue());
            setIsDetailsOpen(true);
          }}
          title={
            isOffline
              ? 'Offline Mode Active - Local Storage & IndexedDB persisting data'
              : 'Online - Firestore connected & synchronized'
          }
          className={`group flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
            isOffline
              ? 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-900/50 shadow-sm shadow-amber-500/10'
              : networkState.pendingCount > 0
              ? 'bg-blue-950/40 text-blue-300 border-blue-500/40 hover:bg-blue-900/50'
              : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40'
          }`}
        >
          {isOffline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Offline Mode</span>
              {networkState.pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[10px] font-bold">
                  {networkState.pendingCount}
                </span>
              )}
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Online</span>
              {networkState.pendingCount > 0 ? (
                <span className="ml-1 px-1.5 py-0.2 bg-blue-500 text-slate-950 rounded-full text-[10px] font-bold">
                  {networkState.pendingCount} Queued
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </>
          )}
        </button>

        {/* Quick Sync Button if changes exist or offline */}
        {networkState.pendingCount > 0 && (
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Force Sync Offline Queue with Firestore"
          >
            <RefreshCw className={`w-3 h-3 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="text-[11px] hidden md:inline">Sync Now</span>
          </button>
        )}
      </div>

      {/* Offline Alert Strip if offline */}
      {isOffline && (
        <div className="w-full bg-gradient-to-r from-amber-950/80 via-amber-900/40 to-amber-950/80 border-b border-amber-500/30 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Mizoram Low-Connectivity Fallback Active:</strong> You can continue taking attendance, entering fees, and editing records. All changes are saved to local IndexedDB/cache and will automatically sync when connection returns.
            </span>
          </div>
          <div className="flex items-center gap-3">
            {networkState.pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/30 text-[11px] font-mono font-medium text-amber-300">
                {networkState.pendingCount} modification{networkState.pendingCount === 1 ? '' : 's'} queued
              </span>
            )}
            <button
              onClick={() => setSimulatedOffline(false)}
              className="text-[11px] underline hover:text-white font-medium cursor-pointer"
            >
              {networkState.isSimulatedOffline ? 'Disable Simulation' : 'Check Connectivity'}
            </button>
          </div>
        </div>
      )}

      {/* Detailed Offline & Persistence Status Modal */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  isOffline
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                    : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                }`}>
                  {isOffline ? <WifiOff className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Network & Offline Persistence</h3>
                  <p className="text-xs text-slate-400">Firebase Firestore Multi-Tab IndexedDB Cache</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="py-4 space-y-4 overflow-y-auto pr-1">
              {/* Sync feedback notification */}
              {syncResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    syncResult.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : syncResult.type === 'error'
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                  }`}
                >
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{syncResult.message}</span>
                </div>
              )}

              {/* Status Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Internet Connectivity</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${networkState.isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span className="text-sm font-semibold text-slate-200">
                      {networkState.isOnline ? 'Hardware Online' : 'No Connection'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Offline Simulation</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className={`text-xs font-semibold ${networkState.isSimulatedOffline ? 'text-amber-300' : 'text-slate-400'}`}>
                      {networkState.isSimulatedOffline ? 'Simulated Offline' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => setSimulatedOffline(!networkState.isSimulatedOffline)}
                      className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                        networkState.isSimulatedOffline
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {networkState.isSimulatedOffline ? 'Turn Off' : 'Simulate'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Storage Stats */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <HardDrive className="w-4 h-4 text-indigo-400" />
                    <span>Local IndexedDB & Storage Cache</span>
                  </div>
                  <span className="text-xs text-indigo-300 font-mono">
                    ~{networkState.storageStats.estimatedKb} KB
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[10px]">Cached Records</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {networkState.storageStats.totalRecords}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[10px]">Collections</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {networkState.storageStats.cachedCollections}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[10px]">Pending Sync</div>
                    <div className={`text-sm font-bold mt-0.5 ${networkState.pendingCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {networkState.pendingCount}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Students, attendance registers, MBSE marks, fee ledgers, and staff records are automatically mirrored locally so teachers in remote hill districts can work without interruption.
                </p>
              </div>

              {/* Offline Queue Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Pending Sync Queue ({queueItems.length})</span>
                  </div>
                  {queueItems.length > 0 && (
                    <button
                      onClick={handleSyncNow}
                      disabled={isSyncing || isOffline}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>Sync All</span>
                    </button>
                  )}
                </div>

                {queueItems.length === 0 ? (
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Queue is clean. All local modifications are synced with cloud database.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {queueItems.map((op) => (
                      <div
                        key={op.id}
                        className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs flex items-center justify-between gap-2"
                      >
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 bg-slate-800 text-[10px] font-mono rounded text-slate-300 uppercase">
                              {op.action}
                            </span>
                            <span className="font-medium text-slate-200 truncate">{op.summary}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(op.timestamp).toLocaleTimeString()}</span>
                            <span>•</span>
                            <span className="font-mono">{op.collection}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-auto">
              <span className="text-[11px] text-slate-500">
                {networkState.lastSyncedAt
                  ? `Last synced: ${new Date(networkState.lastSyncedAt).toLocaleTimeString()}`
                  : 'Sync active'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync to Cloud'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
