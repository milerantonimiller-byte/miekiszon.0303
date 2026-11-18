import React, { useState } from 'react';
import { Download, Smartphone, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // Hide completely when already running as an installed standalone PWA
  if (isInstalled) {
    return null;
  }

  // Native Chromium / Android one-tap install prompt
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        title="Zainstaluj aplikację Miękiszon na telefonie"
        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#3B5422] bg-[#131C0E] px-3 py-2 text-xs font-semibold text-[#C9F27B] transition-colors hover:border-[#84CC16] hover:bg-[#192612] whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
        <span>Zainstaluj</span>
      </button>
    );
  }

  // iOS Safari & fallback mobile browser install guide
  return (
    <>
      <button
        type="button"
        onClick={() => setShowGuide(true)}
        title="Zainstaluj Miękiszon na telefonie (Android / iPhone)"
        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#2A3129] bg-[#101310] px-3 py-2 text-xs font-semibold text-[#D6DDD4] transition-colors hover:border-[#84CC16] hover:text-[#84CC16] whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Smartphone className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
        <span>Zainstaluj na telefonie</span>
      </button>

      {showGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Instalacja aplikacji na telefonie"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#242C22] bg-[#0B0D0B] p-5 text-[#F3F5F2] shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-[#181E17] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2F4226] bg-[#12190F]">
                  <Smartphone className="h-4 w-4 text-[#84CC16]" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-[#F3F5F2]">
                    Zainstaluj Miękiszon na telefonie
                  </h2>
                  <p className="text-xs text-[#8C948A]">
                    Ikona aplikacji i pełny ekran bez paska przeglądarki
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Zamknij okno instalacji"
                className="rounded-lg p-1.5 text-[#8C948A] hover:bg-[#161B15] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-[#CFD7CD]">
              {isIOS ? (
                <div className="rounded-xl border border-[#1E261C] bg-[#080A08] p-3.5 space-y-2">
                  <p className="font-semibold text-[#84CC16]">iPhone / iPad (Safari):</p>
                  <p className="flex items-center gap-1.5">
                    <span>1. Dotknij przycisku</span>
                    <span className="inline-flex items-center gap-1 rounded border border-[#2C3629] bg-[#131812] px-1.5 py-0.5 font-semibold text-white">
                      <Share className="h-3 w-3 text-[#84CC16]" /> Udostępnij
                    </span>
                    <span>w dolnym pasku Safari.</span>
                  </p>
                  <p>
                    2. Przewiń listę i wybierz <strong>Do ekranu początkowego</strong>, a potem dotknij <strong>Dodaj</strong>.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-[#1E261C] bg-[#080A08] p-3.5 space-y-2">
                  <p className="font-semibold text-[#84CC16]">Android (Chrome / Edge / Samsung Internet):</p>
                  <p>
                    1. Jeśli przeglądasz w podglądzie osadzonym, otwórz najpierw link aplikacji bezpośrednio w <strong>Google Chrome</strong>.
                  </p>
                  <p>
                    2. Dotknij menu <strong>⋮</strong> w prawym górnym rogu Chrome i wybierz <strong>Zainstaluj aplikację</strong> lub <strong>Dodaj do ekranu głównego</strong>.
                  </p>
                </div>
              )}

              <p className="text-[11px] text-[#8C948A]">
                Wskazówka: Po otwarciu jako samodzielna aplikacja na telefonie mikrofon i głos działają płynniej w Chrome lub Safari.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-4 w-full min-h-[42px] rounded-xl bg-[#84CC16] py-2 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E] cursor-pointer"
            >
              Rozumiem
            </button>
          </div>
        </div>
      )}
    </>
  );
};
