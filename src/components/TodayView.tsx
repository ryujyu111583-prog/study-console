"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Timer from "@/components/Timer";
import { dayKey, daysUntil, recentDayKeys, shortDate } from "@/lib/date";
import {
  nextState,
  setTrackState,
  stateLabel,
  streakFrom,
  subscribeLog,
  TRACK_CODE,
  TRACK_LABEL,
  type LogMap,
  type Track,
  type TrackState,
} from "@/lib/log";
import { bucketOf, pickDrill, subscribeMistakes, type Mistake } from "@/lib/mistakes";
import { currentWeek } from "@/lib/plan";
import { DEFAULT_SETTINGS, subscribeSettings, type Settings } from "@/lib/settings";

const TRACKS: Track[] = ["gk", "en"];
const TRACK_MENU: Record<Track, string> = { gk: "30分", en: "15分" };

export default function TodayView() {
  const [logs, setLogs] = useState<LogMap>({});
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const today = dayKey();

  useEffect(() => subscribeLog(60, setLogs), []);
  useEffect(() => subscribeSettings(setSettings), []);
  useEffect(() => subscribeMistakes(setMistakes), []);

  const left = daysUntil(settings.examDate);
  const streak = streakFrom(logs);
  const week = currentWeek();
  const drill = pickDrill(mistakes);
  const days = recentDayKeys(14);

  const cycle = (track: Track) => {
    const current = (logs[today]?.[track] ?? "") as TrackState;
    void setTrackState(today, track, nextState(current));
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 受験日 */}
      <section className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
        <p className="font-mono text-4xl leading-none font-semibold tabular-nums">
          {left === null ? "—" : left}
          <span className="ml-1 text-sm font-medium text-muted">日</span>
        </p>
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-semibold tracking-widest text-faint uppercase">
            G検定まで
          </p>
          <p className="truncate text-xs text-muted">{settings.examDate}</p>
        </div>
      </section>

      {/* 今日の記録 */}
      <section className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          {TRACKS.map((track) => {
            const state = (logs[today]?.[track] ?? "") as TrackState;
            const accent = track === "gk" ? "text-gk bg-gksoft" : "text-en bg-ensoft";
            return (
              <button
                key={track}
                onClick={() => cycle(track)}
                className={`flex flex-col gap-2 rounded-xl border p-3 text-left ${
                  state === "full" ? "border-linestrong bg-surface2" : "border-line bg-surface"
                }`}
              >
                <span
                  className={`self-start rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider ${accent}`}
                >
                  {TRACK_CODE[track]}
                </span>
                <span className="text-sm font-medium">
                  {TRACK_LABEL[track]}
                  <span className="block text-xs font-normal text-faint">{TRACK_MENU[track]}</span>
                </span>
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
              <div key={track} className="grid grid-cols-[26px_1fr] items-center gap-2">
                <span className="font-mono text-[10px] font-semibold tracking-wider text-faint">
                  {TRACK_CODE[track]}
                </span>
                <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-[3px]">
                  {days.map((key) => {
                    const value = logs[key]?.[track] ?? "";
                    const filled =
                      track === "gk"
                        ? value === "full"
                          ? "bg-gk border-gk"
                          : value === "min"
                            ? "bg-gksoft border-gk"
                            : "bg-surface2 border-line"
                        : value === "full"
                          ? "bg-en border-en"
                          : value === "min"
                            ? "bg-ensoft border-en"
                            : "bg-surface2 border-line";
                    return (
                      <span
                        key={key}
                        title={`${key} ${TRACK_LABEL[track]} ${stateLabel(value as TrackState)}`}
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
                  {bucketOf(m) === "recurring" && <span className="ml-1 text-gk">再発</span>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 今週 */}
      <section className="rounded-xl border border-line bg-surface p-4">
        <p className="font-mono text-[11px] font-semibold tracking-widest text-faint uppercase">
          This week
        </p>
        {week ? (
          <>
            <h2 className="mt-0.5 text-sm font-bold">
              <span className="font-mono text-gk">{week.code}</span> {week.topic}
            </h2>
            <p className="mt-1 text-xs text-muted">
              {week.span} ・ {week.bridge}
            </p>
            <p className="mt-3 border-t border-line pt-3 text-xs">
              <span className="font-mono text-[11px] text-faint">英語の素材</span>
              <br />
              {settings.materials[week.code] || (
                <span className="text-faint">未設定。木曜の最新回を入れる</span>
              )}
            </p>
          </>
        ) : (
          <p className="mt-1 text-xs text-muted">
            計画期間の外です。
            <Link href="/plan" className="mx-1 underline">
              計画
            </Link>
            で見直してください。
          </p>
        )}
      </section>
    </div>
  );
}
