/**
 * Plays a base64-encoded WAV file returned from Gemini TTS (unary generateContent).
 */
export function playBase64Wav(base64Audio: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    try {
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
      };
      audio.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      audio
        .play()
        .then(() => resolve(audio))
        .catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Resamples Float32Array audio from hardware sampleRate (e.g. 48000 / 44100 Hz)
 * to exact 16000 Hz required by Gemini Live API.
 */
export function resampleFloat32(
  input: Float32Array,
  fromSampleRate: number,
  toSampleRate = 16000
): Float32Array {
  if (fromSampleRate === toSampleRate) {
    return input;
  }
  const ratio = fromSampleRate / toSampleRate;
  const newLength = Math.max(1, Math.round(input.length / ratio));
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const low = Math.floor(srcIndex);
    const high = Math.min(low + 1, input.length - 1);
    const frac = srcIndex - low;
    result[i] = input[low] * (1 - frac) + input[high] * frac;
  }
  return result;
}

/**
 * Converts Float32Array mic samples (at 16kHz) into base64-encoded 16-bit little-endian PCM.
 */
export function float32ToPcm16Base64(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/**
 * Computes normalized RMS audio level (0..1) for live microphone feedback.
 */
export function computeRmsLevel(float32: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < float32.length; i++) {
    sum += float32[i] * float32[i];
  }
  return Math.min(1, Math.sqrt(sum / Math.max(1, float32.length)) * 4);
}

export function createCompatAudioContext(preferredSampleRate?: number): AudioContext {
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) {
    throw new Error('Brak obsługi Web Audio API w tej przeglądarce.');
  }
  if (preferredSampleRate) {
    try {
      return new Ctor({ sampleRate: preferredSampleRate });
    } catch {
      return new Ctor();
    }
  }
  return new Ctor();
}

/**
 * Gapless 24kHz PCM player for Gemini Live API audio output.
 */
export class LivePcmPlayer {
  private ctx: AudioContext | null = null;
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private muted = false;

  public setMuted(isMuted: boolean): void {
    this.muted = isMuted;
    if (isMuted) {
      this.interrupt();
    }
  }

  public unlock(): void {
    try {
      void this.ensureContext();
    } catch {
      // Ignore if AudioContext cannot initialize before user interaction
    }
  }

  public resumeIfNeeded(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  private ensureContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = createCompatAudioContext(24000);
      this.nextStartTime = this.ctx.currentTime;
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public enqueuePcmBase64(base64Pcm: string): void {
    if (this.muted || !base64Pcm) return;
    try {
      const ctx = this.ensureContext();
      const binary = atob(base64Pcm);
      if (binary.length < 2) return;
      const evenLen = binary.length - (binary.length % 2);
      const bytes = new Uint8Array(evenLen);
      for (let i = 0; i < evenLen; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768;
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.copyToChannel(float32, 0);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      if (this.nextStartTime < now || this.nextStartTime > now + 8) {
        this.nextStartTime = now + 0.025;
      }
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) this.activeSources.splice(idx, 1);
      };
    } catch {
      // Ignore transient corrupt audio frame without crashing playback
    }
  }

  public interrupt(): void {
    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch {
        // Ignore already stopped sources
      }
    }
    this.activeSources = [];
    if (this.ctx) {
      this.nextStartTime = this.ctx.currentTime;
    }
  }

  public dispose(): void {
    this.interrupt();
    if (this.ctx && this.ctx.state !== 'closed') {
      void this.ctx.close();
    }
    this.ctx = null;
  }
}

export function playGentleChime(): void {
  try {
    const ctx = createCompatAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.16);
      gain.gain.setValueAtTime(0.001, now + idx * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.16 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.16);
      osc.stop(now + idx * 0.16 + 0.5);
    });
    setTimeout(() => {
      void ctx.close();
    }, 1500);
  } catch {
    // ignore audio block
  }
}

export function splitStoryIntoSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  const rawParts = cleaned
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Merge adjacent short sentences (~120-260 chars per segment) so TTS flows naturally with zero mid-thought cuts
  const chunks: string[] = [];
  let buffer = '';
  for (const part of rawParts) {
    if (!buffer) {
      buffer = part;
    } else if (buffer.length + 1 + part.length <= 240) {
      buffer = `${buffer} ${part}`;
    } else {
      chunks.push(buffer);
      buffer = part;
    }
  }
  if (buffer) chunks.push(buffer);
  return chunks.length > 0 ? chunks : [cleaned];
}

export type StoryPlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'finished';

export class StoryTtsPlayer {
  private ctx: AudioContext | null = null;
  private activeSource: AudioBufferSourceNode | null = null;
  private sentences: string[] = [];
  private currentIndex = 0;
  private voiceGender = 'female_kore';
  private language: 'pl' | 'de' = 'pl';
  private status: StoryPlaybackStatus = 'idle';
  private runId = 0;
  private bufferCache = new Map<number, Promise<AudioBuffer | null>>();
  private onStateChange?: (state: {
    status: StoryPlaybackStatus;
    currentIndex: number;
    total: number;
  }) => void;

  constructor(
    onStateChange?: (state: {
      status: StoryPlaybackStatus;
      currentIndex: number;
      total: number;
    }) => void
  ) {
    this.onStateChange = onStateChange;
  }

  private emitState(): void {
    this.onStateChange?.({
      status: this.status,
      currentIndex: this.currentIndex,
      total: this.sentences.length,
    });
  }

  private ensureContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = createCompatAudioContext(24000);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public getStatus(): StoryPlaybackStatus {
    return this.status;
  }

  public hasStoryToContinue(): boolean {
    return (
      this.sentences.length > 0 &&
      this.currentIndex < this.sentences.length &&
      this.status === 'paused'
    );
  }

  public async startStory(
    fullText: string,
    voiceGender: string,
    language: 'pl' | 'de'
  ): Promise<void> {
    this.stopCurrentAudio();
    this.runId += 1;
    this.sentences = splitStoryIntoSentences(fullText);
    this.currentIndex = 0;
    this.voiceGender = voiceGender;
    this.language = language;
    this.bufferCache.clear();

    if (this.sentences.length === 0) {
      this.status = 'idle';
      this.emitState();
      return;
    }

    await this.playFrom(this.currentIndex, this.runId);
  }

  public async resume(): Promise<boolean> {
    if (this.sentences.length === 0 || this.currentIndex >= this.sentences.length) {
      return false;
    }
    if (this.status === 'playing' || this.status === 'loading') return true;
    this.runId += 1;
    await this.playFrom(this.currentIndex, this.runId);
    return true;
  }

  public updateVoiceOrLang(voiceGender: string, language: 'pl' | 'de'): void {
    if (this.voiceGender !== voiceGender || this.language !== language) {
      this.voiceGender = voiceGender;
      this.language = language;
      this.bufferCache.clear();
    }
  }

  public pause(): boolean {
    if (this.status !== 'playing' && this.status !== 'loading') return false;
    this.runId += 1;
    this.stopCurrentAudio();
    this.status = 'paused';
    this.emitState();
    return true;
  }

  public stop(): void {
    this.runId += 1;
    this.stopCurrentAudio();
    this.sentences = [];
    this.currentIndex = 0;
    this.bufferCache.clear();
    this.status = 'idle';
    this.emitState();
  }

  private stopCurrentAudio(): void {
    if (this.activeSource) {
      try {
        this.activeSource.onended = null;
        this.activeSource.stop();
      } catch {
        // already stopped
      }
      this.activeSource = null;
    }
  }

  private fetchDecodedSegment(index: number, runId: number): Promise<AudioBuffer | null> {
    if (index < 0 || index >= this.sentences.length) return Promise.resolve(null);
    const existing = this.bufferCache.get(index);
    if (existing) return existing;

    const task = (async (): Promise<AudioBuffer | null> => {
      try {
        const res = await fetch('/api/assistant/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: this.sentences[index],
            voiceGender: this.voiceGender,
            language: this.language,
          }),
        });
        if (!res.ok || runId !== this.runId) return null;
        const json = await res.json();
        if (!json?.audioBase64 || runId !== this.runId) return null;

        const binary = atob(json.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const ctx = this.ensureContext();
        return await ctx.decodeAudioData(bytes.buffer.slice(0));
      } catch {
        return null;
      }
    })();

    this.bufferCache.set(index, task);
    return task;
  }

  private async playFrom(startIndex: number, runId: number): Promise<void> {
    this.status = 'loading';
    this.emitState();

    for (let i = startIndex; i < this.sentences.length; i++) {
      if (runId !== this.runId) return;
      this.currentIndex = i;

      // Prefetch current + next 2 segments in parallel so transitions are gapless
      const curPromise = this.fetchDecodedSegment(i, runId);
      if (i + 1 < this.sentences.length) void this.fetchDecodedSegment(i + 1, runId);
      if (i + 2 < this.sentences.length) void this.fetchDecodedSegment(i + 2, runId);

      const audioBuffer = await curPromise;
      if (runId !== this.runId) return;
      if (!audioBuffer) continue;

      this.status = 'playing';
      this.emitState();

      await new Promise<void>((resolve) => {
        if (runId !== this.runId) {
          resolve();
          return;
        }
        try {
          const ctx = this.ensureContext();
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          this.activeSource = source;
          source.onended = () => {
            if (this.activeSource === source) {
              this.activeSource = null;
            }
            resolve();
          };
          source.start();
        } catch {
          resolve();
        }
      });

      this.bufferCache.delete(i);
      if (runId !== this.runId) return;
    }

    if (runId === this.runId) {
      this.currentIndex = this.sentences.length;
      this.status = 'finished';
      this.emitState();
    }
  }
}
