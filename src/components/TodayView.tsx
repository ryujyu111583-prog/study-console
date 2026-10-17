"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Timer from "@/components/Timer";
import { dayKey, recentDayKeys, shortDate } from "@/lib/date";
import {
  nextState,
  setTrackState,
  stateLabel,
  streakFrom,
  subscribeLog,
  type LogMap,
} from "@/lib/log";
import { bucketOf, pickDrill, subscribeMistakes, type Mistake } from "@/lib/mistakes";
import {
  TRACK_CODE,
  TRACK_COLOR,
  TRACK_LABEL,
  TRACKS,
  trackState,
  type Track,
} from "@/lib/tracks";

export default function TodayView() {
  const [logs, setLogs] = useState<LogMap>({});
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const today = dayKey();

  useEffect(() => subscribeLog(60, setLogs), []);
  useEffect(() => subscribeMistakes(setMistakes), []);

  const streak = streakFrom(logs);
  const drill = pickDrill(mistakes);
  const days = recentDayKeys(14);

  const cycle = (track: Track) => {
    void setTrackState(today, track, nextState(trackState(logs[today], track)));
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 今日の記録 */}
      <section className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          {TRACKS.map((track) => {
            const state = trackState(logs[today], track);
            return (
              <button
                key={track}
                onClick={() => cycle(track)}
                className={`flex flex-col gap-2 rounded-xl border p-3 text-left ${
                  state === "full" ? "border-linestrong bg-surface2" : "border-line bg-surface"
                }`}
              >
                <span
                  className={`self-start rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider ${TRACK_COLOR[track].badge}`}
                >
                  {TRACK_CODE[track]}
                </span>
                <span className="text-sm font-medium">{TRACK_LABEL[track]}</span>
                <span
                  className={`font-mono text-xs ${state ? "text-ok" : "text-faint"}`}
                >
                  ● {stateLabel(state)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-line bg-surface">
          <p className="border-b border-line px-4 py-2.5 text-xs text-muted">
            連続 <b className="font-mono text-lg tabular-nums text-ink">{streak}</b> 日
            <span className="ml-2 text-faint">タップで 未 → フル → 最低ライン</span>
          </p>
          <div className="flex flex-col gap-1.5 p-3">
            {TRACKS.map((track) => (
              <div key={track} className="grid grid-cols-[32px_1fr] items-center gap-2">
                <span className="font-mono text-[10px] font-semibold tracking-wider text-faint">
                  {TRACK_CODE[track]}
                </span>
                <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-[3px]">
                  {days.map((key) => {
                    const value = trackState(logs[key], track);
                    const filled =
                      value === "full"
                        ? TRACK_COLOR[track].full
                        : value === "min"
                          ? TRACK_COLOR[track].min
                          : "bg-surface2 border-line";
                    return (
                      <span
                        key={key}
                        title={`${key} ${TRACK_LABEL[track]} ${stateLabel(value)}`}
                        className={`aspect-square rounded-sm border ${filled} ${
                          key === today ? "shadow-[0_0_0_1.5px_var(--ink)]" : ""
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <p className="flex justify-between font-mono text-[10px] tracking-wide text-faint">
              <span>{shortDate(days[0])}</span>
              <span>今日</span>
            </p>
          </div>
        </div>
      </section>

      <Timer />

      {/* 今日のセルフチェック */}
      <section className="rounded-xl border border-line bg-surface p-4">
        <p className="font-mono text-[11px] font-semibold tracking-widest text-faint uppercase">
          Self check
        </p>
        <h2 className="mt-0.5 text-sm font-bold">今日の口頭セルフチェック</h2>
        {drill.length === 0 ? (
          <p className="mt-2 text-xs leading-relaxed text-muted">
            台帳がまだ空です。間違えたものを
            <Link href="/mistakes" className="mx-1 underline">
              誤答台帳
            </Link>
            に入れると、翌日からここに出ます。
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {drill.map((m) => (
              <li key={m.id} className="border-t border-line pt-2 first:border-0 first:pt-0">
                <p className="text-sm font-medium">{m.concept}</p>
                <p className="font-mono text-[11px] text-faint">
                  {m.type} ・ 誤答{m.wrongCount}回
                  {bucketOf(m) === "recurring" && <span className="ml-1 text-ml">再発</span>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}
