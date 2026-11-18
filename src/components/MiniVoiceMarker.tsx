import React from 'react';
import { Volume2, VolumeX, Power, Mic } from 'lucide-react';

interface MiniVoiceMarkerProps {
  visible: boolean;
  isLiveActive: boolean;
  isSpeakingTts: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onStopChat: () => void;
  onExpandChat: () => void;
}

export const MiniVoiceMarker: React.FC<MiniVoiceMarkerProps> = ({
  visible,
  isLiveActive,
  isSpeakingTts,
  isMuted,
  onToggleMute,
  onStopChat,
  onExpandChat,
}) => {
  if (!visible) return null;

  return (
    <aside
      aria-label="Sterowanie czatem głosowym"
      className="fixed bottom-4 right-4 z-[60] flex items-center gap-1.5 rounded-xl border border-[#2A3329] bg-[#0B0E0B]/95 px-2.5 py-1.5 shadow-xl backdrop-blur-md"
    >
      <button
        type="button"
        onClick={onExpandChat}
        className="flex min-h-[32px] items-center gap-1.5 px-1.5 text-[11px] font-medium text-[#E5EAE4] hover:text-[#84CC16] cursor-pointer whitespace-nowrap"
        title="Pokaż panel czatu Miekiszona"
      >
        <Mic
          className={`h-3 w-3 ${isLiveActive ? 'text-[#84CC16]' : 'text-[#969F94]'}`}
          aria-hidden="true"
        />
        <span>
          {isMuted
            ? 'Wyciszona'
            : isSpeakingTts
              ? 'Mówi'
              : isLiveActive
                ? 'Nasłuchuje'
                : 'Czat'}
        </span>
      </button>

      <span aria-hidden="true" className="h-3.5 w-px bg-[#222821]" />

      <button
        type="button"
        onClick={onToggleMute}
        aria-label={isMuted ? 'Odcisz czat' : 'Wycisz czat'}
        title={isMuted ? 'Odcisz mikrofon i głos' : 'Wycisz mikrofon i głos'}
        className={`flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg transition-colors cursor-pointer ${
          isMuted
            ? 'bg-[#2A2212] text-[#FDE68A]'
            : 'text-[#B8C0B6] hover:bg-[#171C16] hover:text-white'
        }`}
      >
        {isMuted ? (
          <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>

      <button
        type="button"
        onClick={onStopChat}
        aria-label="Wyłącz asystenta i zatrzymaj mikrofon"
        title="Wyłącz asystenta i zatrzymaj mikrofon"
        className={`flex min-h-[32px] items-center gap-1 rounded-lg px-2 text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
          isLiveActive
            ? 'bg-[#DC2626] text-white hover:bg-[#EF4444]'
            : 'text-[#969F94] hover:bg-[#2A1515] hover:text-[#FCA5A5]'
        }`}
      >
        <Power className="h-3 w-3" aria-hidden="true" />
        <span>Wyłącz</span>
      </button>
    </aside>
  );
};
