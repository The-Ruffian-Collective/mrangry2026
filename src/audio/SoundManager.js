/**
 * SoundManager - ZzFX-based procedural audio system
 *
 * Uses ZzFX (Zuper Zmall Zound Zynth) for retro-style procedural sound effects.
 * All sounds are generated in real-time, no audio files needed.
 */

// Minimal ZzFX implementation (MIT License)
// https://github.com/KilledByAPixel/ZzFX
const zzfxV = 0.3; // Master volume
let zzfxX; // Audio context

function zzfxInit() {
  if (!zzfxX) {
    zzfxX = new (window.AudioContext || window.webkitAudioContext)();
  }
  return zzfxX;
}

function zzfxP(...samples) {
  const ctx = zzfxInit();
  const buffer = ctx.createBuffer(samples.length, samples[0].length, ctx.sampleRate);
  samples.forEach((s, i) => buffer.getChannelData(i).set(s));
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
  return source;
}

function zzfxG(
  volume = 1,
  randomness = 0.05,
  frequency = 220,
  attack = 0,
  sustain = 0,
  release = 0.1,
  shape = 0,
  shapeCurve = 1,
  slide = 0,
  deltaSlide = 0,
  pitchJump = 0,
  pitchJumpTime = 0,
  repeatTime = 0,
  noise = 0,
  modulation = 0,
  bitCrush = 0,
  delay = 0,
  sustainVolume = 1,
  decay = 0,
  tremolo = 0
) {
  const ctx = zzfxInit();
  const sampleRate = ctx.sampleRate;
  const PI2 = Math.PI * 2;
  let startSlide = (slide *= (500 * PI2) / sampleRate / sampleRate);
  let startFrequency = (frequency *= ((1 + randomness * 2 * Math.random() - randomness) * PI2) / sampleRate);
  let b = [];
  let t = 0;
  let tm = 0;
  let i = 0;
  let j = 1;
  let r = 0;
  let c = 0;
  let s = 0;
  let f;
  let length;

  attack = 50 + ((attack * sampleRate) | 0);
  decay = ((decay * sampleRate) | 0);
  sustain = ((sustain * sampleRate) | 0);
  release = ((release * sampleRate) | 0);
  delay = ((delay * sampleRate) | 0);
  deltaSlide *= (500 * PI2) / sampleRate ** 3;
  modulation *= PI2 / sampleRate;
  pitchJump *= PI2 / sampleRate;
  pitchJumpTime = (pitchJumpTime * sampleRate) | 0;
  repeatTime = (repeatTime * sampleRate) | 0;
  length = attack + decay + sustain + release + delay;

  for (; i < length; b[i++] = s) {
    if (!(++c % ((bitCrush * 100) | 0))) {
      s = shape
        ? shape > 1
          ? shape > 2
            ? shape > 3
              ? Math.sin((t % PI2) ** 3)
              : Math.max(Math.min(Math.tan(t), 1), -1)
            : 1 - (((((2 * t) / PI2) % 2) + 2) % 2)
          : 1 - 4 * Math.abs(Math.round(t / PI2) - t / PI2)
        : Math.sin(t);

      s =
        (repeatTime
          ? 1 - tremolo + tremolo * Math.sin((PI2 * i) / repeatTime)
          : 1) *
        (s * (noise ? Math.max(0, Math.random() * 2 - 1) : 1)) *
        volume *
        zzfxV *
        (i < attack
          ? i / attack
          : i < attack + decay
          ? 1 - ((i - attack) / decay) * (1 - sustainVolume)
          : i < attack + decay + sustain
          ? sustainVolume
          : i < length - delay
          ? ((length - i - delay) / release) * sustainVolume
          : 0);

      s = delay
        ? s / 2 + (delay > i ? 0 : ((b[i - delay] | 0) / 2))
        : s;
    }

    f = (frequency += slide += deltaSlide) * Math.cos(modulation * tm++);
    t += f - f * noise * (1 - (((Math.sin(i) + 1) * 1e9) | 0) % 2);

    if (j && ++j > pitchJumpTime) {
      frequency += pitchJump;
      startFrequency += pitchJump;
      j = 0;
    }

    if (repeatTime && !(++r % repeatTime)) {
      frequency = startFrequency;
      slide = startSlide;
      j = j || 1;
    }
  }

  return b;
}

function zzfx(...params) {
  return zzfxP(zzfxG(...params));
}

/**
 * SoundManager class
 */
export class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.muted = false;
    this.initialized = false;

    // Sound effect definitions (ZzFX parameters)
    // Format: [volume, randomness, frequency, attack, sustain, release, shape, shapeCurve, slide, deltaSlide, pitchJump, pitchJumpTime, repeatTime, noise, modulation, bitCrush, delay, sustainVolume, decay, tremolo]
    this.sounds = {
      // Door opening - wooden creak
      door_open: [0.4, 0.05, 80, 0.02, 0.08, 0.15, 2, 0.5, 0, 0, 0, 0, 0, 0.3, 0, 0.1, 0, 1, 0, 0],

      // Item pickup - bright chime
      item_pickup: [0.5, 0.05, 600, 0.01, 0.05, 0.15, 0, 1, 100, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],

      // Player death - descending buzz
      death: [0.6, 0.1, 200, 0.02, 0.2, 0.3, 3, 2, -50, 0, 0, 0, 0, 0.5, 0, 0.2, 0, 0.5, 0.1, 0],

      // Mr. Angry awakening - dramatic burst
      mr_angry_wake: [0.8, 0.1, 150, 0.05, 0.2, 0.3, 3, 3, 0, 0, -100, 0.1, 0, 0.3, 0, 0.3, 0.1, 0.8, 0, 0],

      // Photograph flash - camera shutter + flash
      photograph: [0.5, 0.05, 1200, 0.01, 0.02, 0.08, 0, 1, -200, 0, 0, 0, 0, 0.2, 0, 0, 0, 1, 0, 0],

      // Timer warning beep - urgent short beep
      timer_warning: [0.4, 0, 800, 0, 0.05, 0.05, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],

      // Level complete - victory jingle
      level_complete: [0.5, 0.05, 400, 0.02, 0.1, 0.3, 0, 1, 50, 0, 200, 0.1, 0, 0, 0, 0, 0.1, 1, 0, 0],

      // Elevator movement - mechanical hum
      elevator: [0.2, 0.1, 60, 0.1, 0.3, 0.1, 2, 1, 0, 0, 0, 0, 0.02, 0.2, 0, 0.1, 0, 0.5, 0, 0.3],

      // Step sound - footstep
      step: [0.15, 0.2, 100, 0, 0.01, 0.02, 3, 1, 0, 0, 0, 0, 0, 0.5, 0, 0.2, 0, 1, 0, 0],

      // UI select - menu blip
      ui_select: [0.3, 0, 500, 0, 0.02, 0.05, 0, 1, 50, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],

      // Game over - sad descending tone
      game_over: [0.5, 0.1, 300, 0.05, 0.3, 0.5, 2, 1, -100, 0, 0, 0, 0, 0.2, 0, 0.1, 0.1, 0.3, 0.2, 0]
    };
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  init() {
    if (!this.initialized) {
      try {
        zzfxInit();
        this.initialized = true;
        console.log('SoundManager initialized');
      } catch (e) {
        console.warn('Failed to initialize audio:', e);
      }
    }
  }

  /**
   * Play a sound effect by name
   */
  play(soundName) {
    if (this.muted) {
      return;
    }

    // Ensure audio is initialized
    if (!this.initialized) {
      this.init();
    }

    const params = this.sounds[soundName];
    if (params) {
      try {
        zzfx(...params);
      } catch (e) {
        console.warn(`Failed to play sound "${soundName}":`, e);
      }
    } else {
      console.warn(`Unknown sound: ${soundName}`);
    }
  }

  /**
   * Play timer warning beep (repeating while in warning state)
   */
  playWarningBeep() {
    if (this.muted) return;
    this.play('timer_warning');
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  /**
   * Set mute state
   */
  setMuted(muted) {
    this.muted = muted;
  }

  /**
   * Check if muted
   */
  isMuted() {
    return this.muted;
  }
}
