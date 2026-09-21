import React, { useState } from 'react';
import { 
  Megaphone, 
  ExternalLink, 
  Sparkles, 
  X, 
  ChevronRight, 
  Bell, 
  Calendar,
  Flame,
  Award
} from 'lucide-react';

export const PRESET_BANNER_GIFS = {
  megaphone: {
    id: 'megaphone',
    name: 'Megaphone / Announcement',
    url: 'https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif',
    fallbackEmoji: '📢'
  },
  celebration: {
    id: 'celebration',
    name: 'Celebration / Party Popper',
    url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
    fallbackEmoji: '🎉'
  },
  sparkles: {
    id: 'sparkles',
    name: 'Magic Sparkles / Star',
    url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    fallbackEmoji: '✨'
  },
  bell: {
    id: 'bell',
    name: 'Notification Bell',
    url: 'https://media.giphy.com/media/3o7bu3XilJ5BOiSGic/giphy.gif',
    fallbackEmoji: '🔔'
  },
  fire: {
    id: 'fire',
    name: 'Urgent / Hot Flame',
    url: 'https://media.giphy.com/media/l4pTfBQTLOecYTBAQ/giphy.gif',
    fallbackEmoji: '🔥'
  }
};

export const BANNER_THEMES = {
  gradient_fire: {
    id: 'gradient_fire',
    name: 'Ruby Fire Gradient (Amber / Rose)',
    containerClass: 'bg-gradient-to-r from-rose-950 via-orange-950 to-amber-950 border-b border-rose-500/40 text-rose-100',
    badgeClass: 'bg-rose-500 text-white shadow-sm shadow-rose-500/30',
    btnClass: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40'
  },
  gradient_indigo: {
    id: 'gradient_indigo',
    name: 'Electric Neon (Purple / Indigo / Blue)',
    containerClass: 'bg-gradient-to-r from-purple-950 via-indigo-950 to-blue-950 border-b border-purple-500/40 text-purple-100',
    badgeClass: 'bg-purple-500 text-white shadow-sm shadow-purple-500/30',
    btnClass: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40'
  },
  gradient_emerald: {
    id: 'gradient_emerald',
    name: 'Royal Emerald (Emerald / Cyan)',
    containerClass: 'bg-gradient-to-r from-emerald-950 via-teal-950 to-cyan-950 border-b border-emerald-500/40 text-emerald-100',
    badgeClass: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30',
    btnClass: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40'
  },
  golden_dark: {
    id: 'golden_dark',
    name: 'Golden Velvet (Dark Slate / Gold)',
    containerClass: 'bg-gradient-to-r from-yellow-950/90 via-slate-950 to-amber-950/90 border-b border-amber-500/40 text-amber-100',
    badgeClass: 'bg-amber-500 text-slate-950 font-black shadow-sm shadow-amber-500/30',
    btnClass: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40'
  },
  cyber_neon: {
    id: 'cyber_neon',
    name: 'Cyber Slate (Dark Glow / Cyan)',
    containerClass: 'bg-slate-950 border-b border-cyan-500/40 text-cyan-100 shadow-[0_4px_20px_rgba(6,182,212,0.15)]',
    badgeClass: 'bg-cyan-500 text-slate-950 font-black shadow-sm shadow-cyan-500/30',
    btnClass: 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40'
  },
  glass_minimal: {
    id: 'glass_minimal',
    name: 'Minimal Frosted Glass',
    containerClass: 'bg-slate-900/85 backdrop-blur-md border-b border-slate-700/60 text-slate-200',
    badgeClass: 'bg-slate-700 text-white',
    btnClass: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
  }
};

export default function PublicAnnouncementBanner({
  config,
  onOpenAdmissions,
  isPreview = false
}) {
  const [isDismissed, setIsDismissed] = useState(false);

  // If banner is disabled and not inside preview, do not render
  if ((!config || config.enabled === false) && !isPreview) {
    return null;
  }

  if (isDismissed && !isPreview) {
    return null;
  }

  const themeKey = config?.theme || 'gradient_fire';
  const theme = BANNER_THEMES[themeKey] || BANNER_THEMES.gradient_fire;

  const badgeText = config?.badgeText || 'ANNOUNCEMENT';
  const text = config?.text || 'Online Admissions for Academic Session 2026 - 2027 are now open! Limited seats available in Science, Arts & Commerce streams.';
  const linkText = config?.linkText || 'Apply Online';
  const linkType = config?.linkType || 'admission_portal';
  const linkUrl = config?.linkUrl || '';
  const scrollSpeed = config?.scrollSpeed || 'normal';
  const isStatic = scrollSpeed === 'static';
  const pauseOnHover = config?.pauseOnHover !== false;
  const clickableBanner = !!config?.clickableBanner;
  const showDismiss = config?.showDismiss !== false;

  // Resolve media (GIF / Image / Emoji)
  let mediaNode = null;
  const mediaType = config?.mediaType || 'preset_gif';
  if (mediaType === 'preset_gif') {
    const presetKey = config?.presetGif || 'celebration';
    const preset = PRESET_BANNER_GIFS[presetKey] || PRESET_BANNER_GIFS.celebration;
    mediaNode = (
      <img
        src={preset.url}
        alt={preset.name}
        className="w-5 h-5 sm:w-6 sm:h-6 object-contain rounded inline-block shrink-0 drop-shadow"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  } else if (mediaType === 'custom_url' && config?.customMediaUrl) {
    mediaNode = (
      <img
        src={config.customMediaUrl}
        alt="Announcement Media"
        className="w-5 h-5 sm:w-6 sm:h-6 object-contain rounded inline-block shrink-0 drop-shadow"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  } else if (mediaType === 'emoji' && config?.mediaEmoji) {
    mediaNode = <span className="text-sm sm:text-base leading-none shrink-0">{config.mediaEmoji}</span>;
  }

  const handleActionClick = (e) => {
    if (e) e.stopPropagation();

    if (isPreview) {
      alert(`[CMS Preview] Banner action clicked: ${linkType} ${linkUrl ? `(${linkUrl})` : ''}`);
      return;
    }

    if (linkType === 'admission_portal') {
      if (onOpenAdmissions) onOpenAdmissions();
    } else if (linkType === 'notices') {
      const noticeElem = document.getElementById('notices');
      if (noticeElem) {
        noticeElem.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (linkType === 'custom_url' && linkUrl) {
      if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
        window.open(linkUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = linkUrl;
      }
    }
  };

  const handleBannerClick = () => {
    if (clickableBanner && linkType !== 'none') {
      handleActionClick();
    }
  };

  // Speed mapping in seconds for CSS marquee duration
  const speedSeconds = {
    slow: '38s',
    normal: '22s',
    fast: '12s'
  }[scrollSpeed] || '22s';

  // Repeated Item in the ticker
  const renderItemContent = (key) => (
    <div key={key} className="flex items-center gap-2 sm:gap-3 shrink-0 px-3 sm:px-6">
      {/* Media: GIF / Image / Emoji */}
      {mediaNode}

      {/* Badge Tag */}
      {badgeText && (
        <span className={`text-[10px] sm:text-[11px] font-black tracking-wide uppercase px-2 sm:px-2.5 py-0.5 rounded-full shrink-0 font-mono ${theme.badgeClass}`}>
          {badgeText}
        </span>
      )}

      {/* Main Text Content */}
      <span className="text-xs sm:text-[13px] font-medium tracking-normal text-slate-100 flex items-center gap-1.5 whitespace-nowrap">
        {text}
      </span>

      {/* Action CTA Button */}
      {linkType !== 'none' && (
        <button
          type="button"
          onClick={handleActionClick}
          className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition flex items-center gap-1 shrink-0 shadow-sm cursor-pointer ${theme.btnClass}`}
        >
          <span>{linkText}</span>
          {linkType === 'custom_url' ? (
            <ExternalLink className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </button>
      )}

      {/* Subtle Separator Dot */}
      <span className="w-1.5 h-1.5 rounded-full bg-white/30 shrink-0 mx-1 sm:mx-2" />
    </div>
  );

  return (
    <div
      onClick={handleBannerClick}
      className={`relative w-full z-40 overflow-hidden select-none transition-all duration-300 ${theme.containerClass} ${
        clickableBanner && linkType !== 'none' ? 'cursor-pointer hover:brightness-105' : ''
      }`}
      style={{ minHeight: '38px' }}
    >
      <div className="flex items-center justify-between w-full h-full py-1 sm:py-1.5 px-2 sm:px-3">
        {/* Banner Content Container */}
        <div className="flex-1 overflow-hidden relative">
          {isStatic ? (
            // Static centered mode
            <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 text-center py-0.5">
              {mediaNode}
              {badgeText && (
                <span className={`text-[10px] sm:text-[11px] font-black tracking-wide uppercase px-2 sm:px-2.5 py-0.5 rounded-full font-mono ${theme.badgeClass}`}>
                  {badgeText}
                </span>
              )}
              <span className="text-xs sm:text-[13px] font-medium text-slate-100">
                {text}
              </span>
              {linkType !== 'none' && (
                <button
                  type="button"
                  onClick={handleActionClick}
                  className={`ml-1 sm:ml-2 px-2.5 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold transition inline-flex items-center gap-1 shrink-0 ${theme.btnClass}`}
                >
                  <span>{linkText}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            // Continuous Smooth Marquee Ticker
            <div
              className={`flex items-center w-max ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
              style={{
                animation: `marqueeTicker ${speedSeconds} linear infinite`,
              }}
            >
              {/* Render item duplicated 3 times for seamless wrapping */}
              {renderItemContent('item-1')}
              {renderItemContent('item-2')}
              {renderItemContent('item-3')}
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        {showDismiss && !isPreview && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-black/30 transition shrink-0 ml-2 z-10"
            title="Dismiss announcement banner"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Marquee Keyframes Inlined */}
      <style>{`
        @keyframes marqueeTicker {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333333%);
          }
        }
      `}</style>
    </div>
  );
}
