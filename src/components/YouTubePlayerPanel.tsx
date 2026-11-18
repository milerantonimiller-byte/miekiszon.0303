import React from 'react';
import { ExternalLink, Loader2, Play, Shuffle, Youtube, X } from 'lucide-react';
import { AssistantLanguage, YoutubeVideoItem } from '../types';

interface YouTubePlayerPanelProps {
  language: AssistantLanguage;
  query: string;
  results: YoutubeVideoItem[];
  activeVideo: YoutubeVideoItem | null;
  isLoading: boolean;
  error: string | null;
  onSelectVideo: (video: YoutubeVideoItem) => void;
  onPlayAnother?: () => void;
  onClose: () => void;
}

export const YouTubePlayerPanel: React.FC<YouTubePlayerPanelProps> = ({
  language,
  query,
  results,
  activeVideo,
  isLoading,
  error,
  onSelectVideo,
  onPlayAnother,
  onClose,
}) => {
  const isDe = language === 'de';
  if (!isLoading && !error && results.length === 0 && !activeVideo) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[#281E1E] bg-[#090808] p-3.5 shadow-lg">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Youtube className="h-4 w-4 shrink-0 text-[#EF4444]" />
          <h3 className="truncate text-sm font-semibold text-white">
            YouTube {query ? `· ${query}` : ''}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onPlayAnother && results.length > 1 && (
            <button
              type="button"
              onClick={onPlayAnother}
              className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-[#2D362A] bg-[#111510] px-2.5 text-xs font-medium text-[#A3E635] hover:border-[#84CC16] cursor-pointer"
            >
              <Shuffle className="h-3 w-3" />
              <span>{isDe ? 'Anderer Titel' : 'Inny kawałek'}</span>
            </button>
          )}
          {activeVideo && (
            <a
              href={activeVideo.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-[#2D362A] bg-[#111510] px-2.5 text-xs font-medium text-[#D2DDD0] hover:text-white"
            >
              <span>{isDe ? 'App öffnen' : 'Otwórz w YouTube'}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={isDe ? 'YouTube schließen' : 'Zamknij YouTube'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#242020] text-[#9AA298] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-4 text-xs text-[#C6CEC4]">
          <Loader2 className="h-4 w-4 animate-spin text-[#84CC16]" />
          <span>{isDe ? 'Suche auf YouTube...' : 'Szukam utworów na YouTube...'}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-[#3B1D1D] bg-[#130A0A] px-3 py-2 text-xs text-[#FCA5A5]">
          {error}
        </div>
      )}

      {activeVideo && (
        <div className="mb-3 overflow-hidden rounded-xl border border-[#232722] bg-black">
          <div className="aspect-video w-full max-h-56">
            <iframe
              key={activeVideo.videoId}
              src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&rel=0`}
              title={activeVideo.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </div>
          <div className="flex items-center justify-between gap-2 bg-[#0D100D] px-3 py-2 text-xs">
            <span className="truncate font-semibold text-white">{activeVideo.title}</span>
            <span className="shrink-0 font-mono-tabular text-[#8C948A]">
              {activeVideo.channel} {activeVideo.duration ? `· ${activeVideo.duration}` : ''}
            </span>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {results.slice(0, 6).map((item, idx) => {
            const isPlaying = activeVideo?.videoId === item.videoId;
            return (
              <button
                key={item.videoId}
                type="button"
                onClick={() => onSelectVideo(item)}
                className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-colors cursor-pointer ${
                  isPlaying
                    ? 'border-[#84CC16] bg-[#141D10] text-white'
                    : 'border-[#1C221B] bg-[#0D100D] text-[#D2D8D0] hover:border-[#2E3A2C]'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-mono-tabular text-xs font-bold ${
                    isPlaying
                      ? 'bg-[#84CC16] text-[#050505]'
                      : 'bg-[#181E17] text-[#9EA79C]'
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{item.title}</div>
                  <div className="truncate text-[11px] text-[#7D867B]">
                    {item.channel} {item.duration ? `· ${item.duration}` : ''}
                  </div>
                </div>
                <Play
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isPlaying ? 'text-[#84CC16]' : 'text-[#6C756A]'
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
