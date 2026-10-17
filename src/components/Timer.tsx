"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { recordSession } from "@/lib/log";
import { TRACK_CODE, TRACK_COLOR, TRACK_LABEL, TRACKS, type Track } from "@/lib/tracks";

const DURATIONS: { minutes: number; label: string }[] = [
  { minutes: 30, label: "30分" },
  { minutes: 15, label: "15分" },
  { minutes: 5, label: "5分ブロック" },
];

function mmss(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

async function notifyDone(track: Track, minutes: number) {
  try {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const registration = await navigator.serviceWorker?.getRegistration();
    const body = `${TRACK_LABEL[track]} ${minutes}分、完了。記録しました。`;
    if (registration) {
      await registration.showNotification("おつかれさま", { body, icon: "/icons/icon-192.png" });
    } else {
      new Notification("おつかれさま", { body });
    }
  } catch {
    // 通知が出せなくてもタイマーの機能は損なわれない
  }
}

export default function Timer() {
  const [track, setTrack] = useState<Track>(TRACKS[0]);
  const [minutes, setMinutes] = useState(DURATIONS[0].minutes);
  const [remaining, setRemaining] = useState(DURATIONS[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  // 実時刻で終了時刻を持つ。setInterval の遅延が積み上がってもズレない。
  const endAtRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    setRunning(false);
    endAtRef.current = null;
  }, []);

  const select = (nextTrack: Track, nextMinutes: number) => {
    stop();
    setTrack(nextTrack);
    setMinutes(nextMinutes);
    setRemaining(nextMinutes * 60);
    setSaved(null);
  };

  const finish = useCallback(async () => {
    stop();
    setRemaining(0);
    try {
      await recordSession(track, minutes);
      setSaved(`${TRACK_LABEL[track]} ${minutes}分を記録しました`);
    } catch {
      setSaved("記録できませんでした（オフラインなら復帰時に同期されます）");
    }
    notifyDone(track, minutes);
  }, [minutes, stop, track]);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const endAt = endAtRef.current;
      if (endAt === null) return;
      const left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) void finish();
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [running, finish]);

  const start = () => {
    endAtRef.current = Date.now() + remaining * 1000;
    setSaved(null);
    setRunning(true);
  };

  const pause = () => {
    const endAt = endAtRef.current;
    if (endAt !== null) setRemaining(Math.max(0, Math.round((endAt - Date.now()) / 1000)));
    stop();
  };

  const reset = () => {
    stop();
    setRemaining(minutes * 60);
    setSaved(null);
  };

  const accent = TRACK_COLOR[track].text;
  const chip = (active: boolean) =>
    `rounded-lg border px-2 py-1.5 text-xs font-medium ${
      active ? "border-linestrong bg-surface2 text-ink" : "border-line bg-surface text-muted"
    }`;

  return (
    <section className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <p className="font-mono text-[11px] font-semibold tracking-widest text-faint uppercase">
          Timer
        </p>
        <span className={`font-mono text-[11px] font-semibold ${accent}`}>
          {TRACK_CODE[track]}
        </span>
      </div>

      <p className={`mt-2 font-mono text-5xl leading-none font-semibold tabular-nums ${accent}`}>
        {mmss(remaining)}
      </p>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {TRACKS.map((t) => (
          <button key={t} onClick={() => select(t, minutes)} className={chip(t === track)}>
            {TRACK_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-3 gap-1.5">
        {DURATIONS.map((d) => (
          <button
            key={d.minutes}
            onClick={() => select(track, d.minutes)}
            className={chip(d.minutes === minutes)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={running ? pause : start}
          disabled={remaining === 0}
          className="flex-1 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-bg disabled:opacity-40"
        >
          {running ? "一時停止" : "開始"}
        </button>
        <button
          onClick={reset}
          className="rounded-lg border border-line px-4 py-2.5 text-sm text-muted"
        >
          リセット
        </button>
      </div>

      {saved && <p className="mt-2 text-xs text-ok">{saved}</p>}
    </section>
  );
}
