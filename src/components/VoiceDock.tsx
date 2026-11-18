import React from 'react';
import {
  Mic,
  MicOff,
  Square,
  Volume2,
  VolumeX,
  Radio,
  AlarmClock,
  Bell,
  ExternalLink,
  Trash2,
  Camera,
  SwitchCamera,
  MonitorUp,
  VideoOff,
  AlertCircle,
  UserRound,
  BookOpen,
  Play,
  Pause,
  Calculator,
  NotebookPen,
} from 'lucide-react';
import type { StoryPlaybackStatus } from '../utils/audio';
import {
  AlarmItem,
  AssistantLanguage,
  CameraFacingMode,
  ExternalAppLaunch,
  LiveVideoMode,
  ReminderItem,
  VOICE_PROFILES,
  VoiceGender,
} from '../types';

interface VoiceDockProps {
  language: AssistantLanguage;
  onSelectLanguage: (lang: AssistantLanguage) => void;
  voiceGender: VoiceGender;
  onSelectVoiceGender: (gender: VoiceGender) => void;
  isLiveActive: boolean;
  liveStatus: 'idle' | 'connecting' | 'active' | 'error';
  micLevel: number;
  onToggleLive: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  videoMode: LiveVideoMode;
  cameraFacingMode: CameraFacingMode;
  videoError: string | null;
  videoPreviewRef: React.RefObject<HTMLVideoElement | null>;
  onToggleCamera: () => void;
  onSwitchCameraFacing: () => void;
  onToggleScreenShare: () => void;
  onStopVideo: () => void;
  assistantReply?: string;
  alarms: AlarmItem[];
  reminders: ReminderItem[];
  onRemoveAlarm: (id: string) => void;
  onRemoveReminder: (id: string) => void;
  lastLaunchedApp: ExternalAppLaunch | null;
  onDismissLaunchedApp: () => void;
  storyStatus?: StoryPlaybackStatus;
  storyProgress?: { currentIndex: number; total: number };
  onPauseStory?: () => void;
  onResumeStory?: () => void;
  onStopStory?: () => void;
  onOpenCalculator?: () => void;
  onOpenNotepad?: () => void;
  notesCount?: number;
}

export const VoiceDock: React.FC<VoiceDockProps> = ({
  language,
  onSelectLanguage,
  voiceGender,
  onSelectVoiceGender,
  isLiveActive,
  liveStatus,
  micLevel,
  onToggleLive,
  isMuted,
  onToggleMute,
  videoMode,
  cameraFacingMode,
  videoError,
  videoPreviewRef,
  onToggleCamera,
  onSwitchCameraFacing,
  onToggleScreenShare,
  onStopVideo,
  assistantReply = '',
  alarms,
  reminders,
  onRemoveAlarm,
  onRemoveReminder,
  lastLaunchedApp,
  onDismissLaunchedApp,
  storyStatus = 'idle',
  storyProgress = { currentIndex: 0, total: 0 },
  onPauseStory,
  onResumeStory,
  onStopStory,
  onOpenCalculator,
  onOpenNotepad,
  notesCount = 0,
}) => {

  const activeProfile =
    VOICE_PROFILES.find((v) => v.id === voiceGender) || VOICE_PROFILES[0];
  const femaleVoices = VOICE_PROFILES.filter((v) => v.gender === 'female');
  const maleVoices = VOICE_PROFILES.filter((v) => v.gender === 'male');

  const isDe = language === 'de';

  const activeVideoLabel =
    videoMode === 'screen'
      ? isDe
        ? 'Bildschirm wird geteilt'
        : 'Udostępniany ekran telefonu'
      : cameraFacingMode === 'environment'
        ? isDe
          ? 'Rückkamera aktiv'
          : 'Kamera tylna aktywna'
        : isDe
          ? 'Frontkamera aktiv'
          : 'Kamera przednia aktywna';

  const isListeningOrConnecting = isLiveActive || liveStatus === 'connecting';

  return (
    <section
      aria-label={isDe ? 'Gespräch mit dem Assistenten' : 'Rozmowa z asystentem'}
      className="flex flex-col gap-4 rounded-2xl border border-[#1B211A] bg-[#0B0D0B] p-4 sm:p-5"
    >
      {/* Top Control Header */}
      <div className="flex shrink-0 flex-col gap-3 border-b border-[#161B15] pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#F3F5F2]">
              {isDe ? 'Gespräch mit dem Assistenten' : 'Rozmowa z asystentem'}
            </h1>
            <span aria-hidden="true" className="text-[#4F574D]">
              ·
            </span>
            <span className="text-xs font-medium text-[#969F94]">
              {isDe ? 'Deutsch' : 'Polski'} · {activeProfile.voiceName} (
              {activeProfile.gender === 'male'
                ? isDe
                  ? 'männlich'
                  : 'męski'
                : isDe
                  ? 'weiblich'
                  : 'damski'}
              )
            </span>
          </div>

          {isListeningOrConnecting ? (
            <div className="flex items-center gap-2.5 text-xs text-[#84CC16]">
              <span className="font-medium">
                {liveStatus === 'connecting'
                  ? isDe
                    ? 'Live-Verbindung wird hergestellt...'
                    : 'Łączenie sesji na żywo...'
                  : isMuted
                    ? isDe
                      ? 'Mikrofon stumm — Assistent hört nicht zu'
                      : 'Mikrofon wyciszony — asystent nie słyszy'
                    : isDe
                      ? 'Live-Assistent aktiv — Mikrofon hört zu'
                      : 'Agent na żywo aktywny — nasłuchuje'}
              </span>
              {!isMuted && liveStatus === 'active' && (
                <div
                  aria-hidden="true"
                  className="h-1.5 w-24 overflow-hidden rounded-full bg-[#192117]"
                >
                  <div
                    className="h-full bg-[#84CC16] transition-transform duration-75 origin-left"
                    style={{
                      transform: `scaleX(${Math.max(0.08, micLevel)})`,
                    }}
                  />
                </div>
              )}
            </div>
          ) : liveStatus === 'error' ? (
            <div className="flex items-start gap-2 text-xs text-[#FCA5A5]">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#EF4444]" aria-hidden="true" />
              <span>
                {assistantReply ||
                  (isDe
                    ? 'Live-Verbindung fehlgeschlagen. Prüfe Mikrofonrechte oder öffne die App direkt in Chrome/Safari über HTTPS.'
                    : 'Połączenie z asystentem nie powiodło się. Sprawdź zgodę na mikrofon lub otwórz aplikację bezpośrednio w Chrome/Safari po HTTPS.')}
              </span>
            </div>
          ) : (
            <p className="text-xs text-[#8C948A]">
              {isDe
                ? 'Live-Mikrofon ist aus — kein Hintergrund-Abhören. Starte das Live-Gespräch, um mit dem Assistenten zu sprechen.'
                : 'Mikrofon wyłączony (brak podsłuchiwania). Włącz rozmowę na żywo, aby rozmawiać z asystentem.'}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Language Switcher */}
          <div
            role="group"
            aria-label={isDe ? 'Sprache' : 'Język rozmowy'}
            className="flex items-center rounded-xl border border-[#222921] bg-[#060706] p-1"
          >
            <button
              type="button"
              onClick={() => onSelectLanguage('pl')}
              className={`min-h-[34px] rounded-lg px-3 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                language === 'pl'
                  ? 'bg-[#84CC16] text-[#050505]'
                  : 'text-[#969F94] hover:text-white'
              }`}
            >
              Polski
            </button>
            <button
              type="button"
              onClick={() => onSelectLanguage('de')}
              className={`min-h-[34px] rounded-lg px-3 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                language === 'de'
                  ? 'bg-[#84CC16] text-[#050505]'
                  : 'text-[#969F94] hover:text-white'
              }`}
            >
              Deutsch
            </button>
          </div>

          {/* Mute toggle */}
          {isListeningOrConnecting && (
            <button
              type="button"
              onClick={onToggleMute}
              className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isMuted
                  ? 'border-[#54401B] bg-[#1E170B] text-[#FDE68A]'
                  : 'border-[#252D24] bg-[#121612] text-[#D1D7D0] hover:border-[#84CC16]'
              }`}
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isDe ? 'Stumm' : 'Wyciszony'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
                  <span>{isDe ? 'Mikrofon stumm' : 'Wycisz mikrofon'}</span>
                </>
              )}
            </button>
          )}

          {/* Primary Start / Stop Listening Button */}
          <button
            type="button"
            onClick={onToggleLive}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isListeningOrConnecting
                ? 'bg-[#DC2626] text-white hover:bg-[#EF4444]'
                : 'bg-[#84CC16] text-[#050505] hover:bg-[#9BE12E]'
            }`}
          >
            {isListeningOrConnecting ? (
              <>
                <MicOff className="h-4 w-4" aria-hidden="true" />
                <span>
                  {isDe ? 'Agent ausschalten' : 'Wyłącz agenta (Nie podsłuchuj)'}
                </span>
              </>
            ) : (
              <>
                <Radio className="h-4 w-4" aria-hidden="true" />
                <span>{isDe ? 'Live-Gespräch starten' : 'Włącz rozmowę na żywo'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 7-Voice Selector (3 Female Voices + 4 Male Voices including Massimo) */}
      <div className="grid shrink-0 grid-cols-1 gap-3 rounded-xl border border-[#171D16] bg-[#070907] p-3 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9FA89D]">
            <UserRound className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
            <span>{isDe ? 'Weibliche Stimmen (3)' : 'Głosy kobiece (3)'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {femaleVoices.map((voice) => {
              const selected = voiceGender === voice.id;
              return (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => onSelectVoiceGender(voice.id)}
                  className={`relative z-10 flex min-h-[54px] flex-col items-start justify-center rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer ${
                    selected
                      ? 'border-[#84CC16] bg-[#84CC16] text-[#050505]'
                      : 'border-[#20271F] bg-[#0E120E] text-[#E2E7E0] hover:border-[#84CC16]'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">
                    {isDe ? voice.labelDe : voice.labelPl}
                  </span>
                  <span
                    className={`mt-0.5 text-[10px] leading-tight ${
                      selected ? 'text-[#18220A]' : 'text-[#8C948A]'
                    }`}
                  >
                    {isDe ? voice.styleNoteDe : voice.styleNotePl}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 lg:col-span-7">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9FA89D]">
            <UserRound className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
            <span>{isDe ? 'Männliche Stimmen (4)' : 'Głosy męskie (4)'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {maleVoices.map((voice) => {
              const selected = voiceGender === voice.id;
              return (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => onSelectVoiceGender(voice.id)}
                  className={`relative z-10 flex min-h-[54px] flex-col items-start justify-center rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer ${
                    selected
                      ? 'border-[#84CC16] bg-[#84CC16] text-[#050505]'
                      : 'border-[#20271F] bg-[#0E120E] text-[#E2E7E0] hover:border-[#84CC16]'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">
                    {isDe ? voice.labelDe : voice.labelPl}
                  </span>
                  <span
                    className={`mt-0.5 text-[10px] leading-tight ${
                      selected ? 'text-[#18220A]' : 'text-[#8C948A]'
                    }`}
                  >
                    {isDe ? voice.styleNoteDe : voice.styleNotePl}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Camera & Screen Share Controls */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggleCamera}
          className={`inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            videoMode === 'camera'
              ? 'border-[#84CC16] bg-[#162212] text-[#D9F99D]'
              : 'border-[#242C22] bg-[#101410] text-[#E2E7E0] hover:border-[#84CC16]'
          }`}
        >
          <Camera className="h-4 w-4 text-[#84CC16]" aria-hidden="true" />
          <span>
            {videoMode === 'camera'
              ? cameraFacingMode === 'environment'
                ? isDe
                  ? 'Rückkamera (an)'
                  : 'Kamera tylna (wł.)'
                : isDe
                  ? 'Frontkamera (an)'
                  : 'Kamera przednia (wł.)'
              : isDe
                ? 'Kamera einschalten'
                : 'Włącz kamerę'}
          </span>
        </button>

        <button
          type="button"
          onClick={onSwitchCameraFacing}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-[#242C22] bg-[#101410] px-3.5 text-xs font-semibold text-[#E2E7E0] transition-colors hover:border-[#84CC16] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <SwitchCamera className="h-4 w-4 text-[#84CC16]" aria-hidden="true" />
          <span>
            {cameraFacingMode === 'environment'
              ? isDe
                ? 'Auf Frontkamera wechseln'
                : 'Przełącz na przednią'
              : isDe
                ? 'Auf Rückkamera wechseln'
                : 'Przełącz na tylną'}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleScreenShare}
          className={`inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            videoMode === 'screen'
              ? 'border-[#38BDF8] bg-[#0D1B24] text-[#BAE6FD]'
              : 'border-[#242C22] bg-[#101410] text-[#E2E7E0] hover:border-[#38BDF8]'
          }`}
        >
          <MonitorUp className="h-4 w-4 text-[#38BDF8]" aria-hidden="true" />
          <span>
            {videoMode === 'screen'
              ? isDe
                ? 'Freigabe beenden'
                : 'Zatrzymaj ekran'
              : isDe
                ? 'Bildschirm teilen'
                : 'Udostępnij ekran'}
          </span>
        </button>

        {videoMode !== 'none' && (
          <button
            type="button"
            onClick={onStopVideo}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#4C2424] bg-[#1A0D0D] px-3 text-xs font-medium text-[#FCA5A5] hover:bg-[#261212] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <VideoOff className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isDe ? 'Bild aus' : 'Wyłącz obraz'}</span>
          </button>
        )}

        {onOpenCalculator && (
          <button
            type="button"
            onClick={onOpenCalculator}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-[#242C22] bg-[#101410] px-3.5 text-xs font-semibold text-[#E2E7E0] transition-colors hover:border-[#84CC16] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Calculator className="h-4 w-4 text-[#84CC16]" aria-hidden="true" />
            <span>{isDe ? 'Rechner' : 'Kalkulator'}</span>
          </button>
        )}

        {onOpenNotepad && (
          <button
            type="button"
            onClick={onOpenNotepad}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-[#242C22] bg-[#101410] px-3.5 text-xs font-semibold text-[#E2E7E0] transition-colors hover:border-[#84CC16] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <NotebookPen className="h-4 w-4 text-[#84CC16]" aria-hidden="true" />
            <span>
              {isDe ? 'Notizen' : 'Notatnik'}
              {notesCount > 0 ? ` (${notesCount})` : ''}
            </span>
          </button>
        )}
      </div>

      {/* Story Narration Status & Interruption Resume Controls */}
      {(storyStatus === 'loading' || storyStatus === 'playing' || storyStatus === 'paused') && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-[#2B3925] bg-[#0D130B] px-3.5 py-2 text-xs">
          <div className="flex items-center gap-2 text-[#D9F99D]">
            <BookOpen className="h-4 w-4 text-[#84CC16]" aria-hidden="true" />
            <span className="font-semibold">
              {storyStatus === 'paused'
                ? isDe
                  ? 'Märchen pausiert'
                  : 'Bajka wstrzymana — powiedz „kontynuuj”'
                : storyStatus === 'loading'
                  ? isDe
                    ? 'Lade Märchen...'
                    : 'Przygotowuję płynną narrację bajki...'
                  : isDe
                    ? 'Märchen wird vorgelesen'
                    : 'Opowiadam bajkę od A do Z'}
            </span>
            {storyProgress.total > 0 && (
              <span className="font-mono-tabular text-[11px] text-[#95A391]">
                ({Math.min(storyProgress.currentIndex + 1, storyProgress.total)}/{storyProgress.total})
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {storyStatus === 'paused' ? (
              <button
                type="button"
                onClick={onResumeStory}
                className="inline-flex min-h-[30px] items-center gap-1 rounded-lg bg-[#84CC16] px-2.5 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E] cursor-pointer"
              >
                <Play className="h-3 w-3" />
                <span>{isDe ? 'Weiter' : 'Kontynuuj'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onPauseStory}
                className="inline-flex min-h-[30px] items-center gap-1 rounded-lg border border-[#354430] bg-[#141B12] px-2.5 text-xs font-medium text-[#E2E7E0] hover:border-[#84CC16] cursor-pointer"
              >
                <Pause className="h-3 w-3" />
                <span>{isDe ? 'Pause' : 'Wstrzymaj'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onStopStory}
              className="inline-flex min-h-[30px] items-center gap-1 rounded-lg border border-[#442222] bg-[#170C0C] px-2.5 text-xs font-medium text-[#FCA5A5] hover:bg-[#231010] cursor-pointer"
            >
              <Square className="h-3 w-3" />
              <span>{isDe ? 'Stopp' : 'Zakończ'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Inline Video/Screen Share Error */}
      {videoError && (
        <div className="flex shrink-0 items-start gap-2.5 rounded-xl border border-[#3B1D1D] bg-[#130A0A] px-3.5 py-2 text-xs text-[#FCA5A5]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" aria-hidden="true" />
          <span>{videoError}</span>
        </div>
      )}

      {/* Active Camera / Screen Share Live Preview */}
      {videoMode !== 'none' && (
        <div className="shrink-0 overflow-hidden rounded-xl border border-[#243021] bg-[#050605]">
          <div className="flex items-center justify-between border-b border-[#192017] px-3.5 py-1.5 text-xs">
            <span className="font-semibold text-[#84CC16]">{activeVideoLabel}</span>
            <span className="text-[11px] text-[#8C948A]">
              {isDe ? 'Live-Übertragung' : 'Obraz przesyłany na żywo'}
            </span>
          </div>
          <div className="relative flex max-h-40 w-full items-center justify-center bg-black sm:max-h-44">
            <video
              ref={videoPreviewRef}
              autoPlay
              muted
              playsInline
              className="max-h-40 w-full object-contain sm:max-h-44"
            />
          </div>
        </div>
      )}

      {/* External App Launch Fallback Notice */}
      {lastLaunchedApp && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2B3726] bg-[#0D130B] p-2.5 text-xs">
          <div>
            <span className="font-semibold text-[#84CC16]">
              {isDe ? 'Gestartet' : 'Uruchomiono'} ({lastLaunchedApp.appLabel}):
            </span>{' '}
            <span className="text-[#E2E7E0]">{lastLaunchedApp.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={lastLaunchedApp.fallbackUrl || lastLaunchedApp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#84CC16] px-3 text-xs font-semibold text-[#050505] hover:bg-[#9BE12E]"
            >
              <span>
                {isDe ? 'Öffnen' : 'Otwórz'} {lastLaunchedApp.appLabel}
              </span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={onDismissLaunchedApp}
              className="min-h-[36px] rounded-lg border border-[#232B21] px-2.5 text-xs text-[#969F94] hover:text-white cursor-pointer"
            >
              {isDe ? 'Schließen' : 'Zamknij'}
            </button>
          </div>
        </div>
      )}

      {/* Active Alarms & Reminders */}
      {(alarms.length > 0 || reminders.length > 0) && (
        <div className="flex shrink-0 flex-wrap gap-2">
          {alarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                alarm.triggered
                  ? 'border-[#84CC16] bg-[#162010] text-[#D9F99D]'
                  : 'border-[#20271F] bg-[#070907] text-[#D1D7D0]'
              }`}
            >
              <AlarmClock className="h-3.5 w-3.5 text-[#84CC16]" />
              <span className="font-mono-tabular font-semibold">{alarm.time}</span>
              <span>{alarm.label}</span>
              <button
                type="button"
                onClick={() => onRemoveAlarm(alarm.id)}
                aria-label="Usuń budzik"
                className="ml-1 text-[#7D857B] hover:text-[#FCA5A5] cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                rem.triggered
                  ? 'border-[#84CC16] bg-[#162010] text-[#D9F99D]'
                  : 'border-[#20271F] bg-[#070907] text-[#D1D7D0]'
              }`}
            >
              <Bell className="h-3.5 w-3.5 text-[#84CC16]" />
              <span className="font-mono-tabular font-semibold">{rem.displayTime}</span>
              <span>{rem.text}</span>
              <button
                type="button"
                onClick={() => onRemoveReminder(rem.id)}
                aria-label="Usuń powiadomienie"
                className="ml-1 text-[#7D857B] hover:text-[#FCA5A5] cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
