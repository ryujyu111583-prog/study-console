"use client";

/**
 * 8bit 風の効果音。音源ファイルは持たず、WebAudio の矩形波で鳴らす。
 * ON/OFF は端末ごとの好みなので localStorage に置く（消えても既定の ON に戻るだけ）。
 */
type Note = [freq: number, beats: number];

const SOUNDS: Record<string, { notes: Note[]; tempo: number; type?: OscillatorType }> = {
  select: { notes: [[880, 0.5]], tempo: 0.06 },
  hit: { notes: [[220, 1], [110, 1]], tempo: 0.05, type: "sawtooth" },
  miss: { notes: [[196, 1], [147, 2]], tempo: 0.08 },
  defeat: { notes: [[523, 1], [659, 1], [784, 1], [1047, 2]], tempo: 0.07 },
  coin: { notes: [[988, 1], [1319, 3]], tempo: 0.06 },
  chest: { notes: [[392, 1], [523, 1], [659, 1], [784, 1], [1047, 3]], tempo: 0.08 },
  levelUp: { notes: [[523, 1], [523, 1], [523, 1], [698, 3], [0, 1], [659, 1], [698, 1], [784, 4]], tempo: 0.09 },
  quest: { notes: [[659, 1], [784, 1], [1047, 2]], tempo: 0.08 },
};

export type Sound = keyof typeof SOUNDS;

const KEY = "sq-sfx";
let ctx: AudioContext | null = null;

export function sfxEnabled() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSfxEnabled(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // 保存できなくても、このページを開いている間は効く
  }
}

export function play(name: Sound) {
  if (typeof window === "undefined" || !sfxEnabled()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const { notes, tempo, type = "square" } = SOUNDS[name];
    let t = ctx.currentTime;
    for (const [freq, beats] of notes) {
      const len = beats * tempo;
      if (freq > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + len);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + len);
      }
      t += len;
    }
  } catch {
    // 音が出せない環境でも操作は止めない
  }
}
