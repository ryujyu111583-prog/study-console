"use client";

import Timer from "@/components/Timer";
import DailyPanel from "@/components/game/DailyPanel";
import InnPanel from "@/components/game/InnPanel";
import { useGame } from "@/components/game/GameProvider";
import { dayKey, recentDayKeys, shortDate } from "@/lib/date";
import { MEMBER_JOB, MEMBER_STEP, REWARD, levelProgress } from "@/lib/game/levels";
import { play } from "@/lib/game/sfx";
import { nextState, setTrackState, stateLabel } from "@/lib/log";
import { TRACK_COLOR, TRACK_LABEL, TRACKS, trackState, type Track } from "@/lib/tracks";

const MEMBER_COLOR: Record<Track, string> = {
  stat: "var(--stat)",
  inv: "var(--inv)",
  ml: "var(--ml)",
  en: "var(--en)",
  dsn: "var(--dsn)",
};

export default function TodayView() {
  const { logs, stats, say } = useGame();
  const today = dayKey();
  const days = recentDayKeys(14);

  const cycle = (track: Track) => {
    const current = trackState(logs[today], track);
    const next = nextState(current);
    void setTrackState(today, track, next);
    play(next === "" ? "select" : "coin");
    const who = `${TRACK_LABEL[track]}の${MEMBER_JOB[track]}`;
    if (next === "full") say([`${who}は しっかり修行した！`, `${REWARD.fullXp} の経験値と ${REWARD.fullGold}G を獲得！`]);
    else if (next === "min") say([`${who}は 最低ラインを守った。`, `経験値は ${REWARD.minXp} に（連続日数は守られる）`]);
    else say(`${who}の記録を取り消した。`);
  };

  return (
    <div className="flex flex-col gap-4">
      <InnPanel />
      <DailyPanel />

      <section className="grid grid-cols-5 gap-1.5" aria-label="仲間（今日の記録）">
        {TRACKS.map((track) => {
          const state = trackState(logs[today], track);
          const lv = levelProgress(stats.xp[track], MEMBER_STEP);
          return (
            <button
              key={track}
              type="button"
              onClick={() => cycle(track)}
              aria-label={`${TRACK_LABEL[track]}（${MEMBER_JOB[track]}）Lv${lv.level}、今日は${stateLabel(state)}`}
              className={`win flex flex-col items-center gap-0.5 px-1 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold ${
                state === "full" ? "border-ok" : state === "min" ? "border-gold" : ""
              }`}
            >
              <span className="font-dot text-base leading-tight" style={{ color: MEMBER_COLOR[track] }}>
                {TRACK_LABEL[track]}
              </span>
              <span className="font-dot text-[11px] text-gold">
                Lv{lv.level}
                {stats.sp[track] > 0 && <span className="ml-0.5 text-ok">+</span>}
              </span>
              <span
                className={`text-[11px] ${state === "full" ? "text-ok" : state === "min" ? "text-gold" : "text-faint"}`}
              >
                {state === "full" ? "フル" : state === "min" ? "最低" : "未"}
              </span>
              <span className="block h-1 w-full bg-surface2">
                <span className="block h-full" style={{ width: `${lv.ratio * 100}%`, background: MEMBER_COLOR[track] }} />
              </span>
            </button>
          );
        })}
      </section>
      <p className="-mt-2 text-center text-[11px] text-faint">仲間をタップ：未 → フル → 最低ライン（「+」はSPあり）</p>

      <div id="timer" className="scroll-mt-4">
        <Timer />
      </div>

      <section className="win flex flex-col gap-1.5 pt-4" aria-label="冒険の記録（直近14日）">
        <span className="win-label">冒険の記録（14日）</span>
        {TRACKS.map((track) => (
          <div key={track} className="grid grid-cols-[36px_1fr] items-center gap-2">
            <span className="text-xs" style={{ color: MEMBER_COLOR[track] }}>
              {TRACK_LABEL[track]}
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
                    className={`aspect-square border ${filled} ${key === today ? "outline outline-1 outline-ink" : ""}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <p className="flex justify-between text-[10px] text-faint">
          <span>{shortDate(days[0])}</span>
          <span>今日</span>
        </p>
      </section>

    </div>
  );
}
