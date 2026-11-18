import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { TabId } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import ogorekIconImg from '../assets/images/miekiszon_ogorek_icon_1795031756766.jpg';

interface HeaderProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isLiveActive: boolean;
  liveStatus?: 'idle' | 'connecting' | 'active' | 'error';
  onToggleLive: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isLiveActive,
  liveStatus = 'idle',
  onToggleLive,
}) => {
  const navItems: { id: TabId; label: string }[] = [
    { id: 'assistant', label: 'Asystent' },
    { id: 'food', label: 'Jedzenie' },
    { id: 'stays', label: 'Noclegi' },
    { id: 'transit', label: 'Przejazdy' },
  ];

  const isListeningOrConnecting = isLiveActive || liveStatus === 'connecting';

  return (
    <header className="relative sm:sticky sm:top-0 z-30 border-b border-[#191F18] bg-[#050505]/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-3 px-3 py-2 sm:flex-nowrap sm:gap-6 sm:px-6 sm:py-0">
        {/* Zone 1: Brand wordmark with compact cucumber photo */}
        <button
          type="button"
          onClick={() => onSelectTab('assistant')}
          className="inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-[#F3F5F2] transition-colors hover:text-[#84CC16] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <img
            src={ogorekIconImg}
            alt="Ogórek Miękiszon"
            referrerPolicy="no-referrer"
            className="h-8 w-8 rounded-full border border-[#2F4226] bg-[#090C08] object-cover object-center shrink-0"
          />
          <span>Miękiszon</span>
        </button>

        {/* Zone 2: 4 Clean Single-Line Text Navigation Links */}
        <nav
          aria-label="Nawigacja główna"
          className="hidden sm:flex items-center gap-7 text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-[#F3F5F2]'
                    : 'text-[#8C948A] hover:text-[#F3F5F2]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[#84CC16]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: PWA Install + Explicit Agent Stop/Start Action */}
        <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
          <PWAInstallButton />
          <button
            type="button"
            onClick={onToggleLive}
            title={
              isListeningOrConnecting
                ? 'Wyłącz agenta — zatrzymaj nasłuchiwanie mikrofonu'
                : 'Włącz agenta do rozmowy na żywo'
            }
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isListeningOrConnecting
                ? 'bg-[#DC2626] text-white hover:bg-[#EF4444]'
                : 'border border-[#2A3129] bg-[#101310] text-[#F3F5F2] hover:border-[#65A30D] hover:text-[#84CC16]'
            }`}
          >
            {isListeningOrConnecting ? (
              <>
                <MicOff className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Wyłącz agenta</span>
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
                <span>Włącz agenta</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile inline navigation row */}
      <nav
        aria-label="Nawigacja mobilna"
        className="flex sm:hidden border-t border-[#151815] px-2"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 min-h-[44px] text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'border-[#84CC16] text-[#F3F5F2]'
                  : 'border-transparent text-[#8C948A]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
