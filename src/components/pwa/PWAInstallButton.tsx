import React, { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'sidebar';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = async () => {
    if (isInstalled) {
      setModalOpen(true);
      return;
    }

    if (isIOS) {
      setModalOpen(true);
      return;
    }

    // Try direct prompt first
    const handled = await installApp();
    if (!handled) {
      setModalOpen(true);
    }
  };

  if (isInstalled) {
    if (variant === 'sidebar') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-400/90 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">Installed PWA App</span>
        </div>
      );
    }
    return null;
  }

  if (variant === 'sidebar') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/30 rounded-xl transition-all group cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>Install Web App</span>
          </div>
          <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
            PWA
          </span>
        </button>

        <PWAInstallModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onInstall={installApp}
          isIOS={isIOS}
          isInstalled={isInstalled}
        />
      </>
    );
  }

  // Header or compact variant
  return (
    <>
      <button
        onClick={handleClick}
        title="Install Mizoram School System as native app on desktop or mobile"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/40 rounded-lg shadow-sm hover:shadow-indigo-500/10 transition-all cursor-pointer ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      <PWAInstallModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onInstall={installApp}
        isIOS={isIOS}
        isInstalled={isInstalled}
      />
    </>
  );
};
